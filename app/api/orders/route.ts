import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNotification, orderPlacedMessage } from "@/lib/notifications";
import { sendAdminOrderEmail } from "@/lib/order-email";
import { rateLimit } from "@/lib/rate-limit";
import { orderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations/order";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ orders: [] });
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Admins do not have customer order history." }, { status: 403 });
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { select: { name: true, slug: true } }
        }
      }
    }
  });

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, { name: "orders", limit: 8, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in before placing an order." }, { status: 401 });
  }

  if (session.user.role === "ADMIN") {
    return NextResponse.json({ error: "Admin accounts cannot place customer orders." }, { status: 403 });
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.paymentMethod !== "COD") {
    return NextResponse.json({ error: "Only cash on delivery is available right now." }, { status: 400 });
  }

  const productIds = parsed.data.items.map((item) => item.productId);
  const productSlugs = parsed.data.items.map((item) => item.productSlug).filter((slug): slug is string => Boolean(slug));
  const products = await db.product.findMany({
    where: {
      OR: [
        { id: { in: productIds } },
        ...(productSlugs.length ? [{ slug: { in: productSlugs } }] : [])
      ]
    },
    select: { id: true, slug: true, name: true, price: true, stock: true, options: true }
  });
  const productById = new Map(products.map((product) => [product.id, product]));
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const resolveProduct = (item: (typeof parsed.data.items)[number]) => productById.get(item.productId) ?? (item.productSlug ? productBySlug.get(item.productSlug) : undefined);
  const missingItem = parsed.data.items.find((item) => !resolveProduct(item));

  if (missingItem) {
    return NextResponse.json({ error: "One or more products in your cart are no longer available." }, { status: 400 });
  }

  const requestedQuantityByProduct = new Map<string, number>();
  for (const item of parsed.data.items) {
    const product = resolveProduct(item)!;
    requestedQuantityByProduct.set(product.id, (requestedQuantityByProduct.get(product.id) ?? 0) + item.quantity);
  }

  const insufficientStock = products.find((product) => (requestedQuantityByProduct.get(product.id) ?? 0) > product.stock);
  if (insufficientStock) {
    return NextResponse.json({ error: `${insufficientStock.name} does not have enough stock for the requested quantity.` }, { status: 400 });
  }

  function normalizeOptions(productOptions: unknown, selectedOptions: { name: string; value: string; priceDelta: number }[]) {
    if (!selectedOptions.length) return [];
    if (!Array.isArray(productOptions)) return [];

    return selectedOptions.map((selected) => {
      const group = productOptions.find((item) => item && typeof item === "object" && !Array.isArray(item) && (item as Record<string, unknown>).name === selected.name) as Record<string, unknown> | undefined;
      const values = Array.isArray(group?.values) ? group.values : [];
      const value = values.find((item) => item && typeof item === "object" && !Array.isArray(item) && (item as Record<string, unknown>).label === selected.value) as Record<string, unknown> | undefined;

      if (!group || !value) {
        throw new Error("Invalid product option selected.");
      }

      return {
        name: selected.name,
        value: selected.value,
        priceDelta: Number(value.priceDelta ?? 0) || 0
      };
    });
  }

  let orderItems: { productId: string; name: string; quantity: number; price: number; options: { name: string; value: string; priceDelta: number }[] }[];
  try {
    orderItems = parsed.data.items.map((item) => {
      const product = resolveProduct(item)!;
      const selectedOptions = normalizeOptions(product.options, item.options);
      const optionDelta = selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0);

      return {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: Number(product.price) + optionDelta,
        options: selectedOptions
      };
    });
  } catch {
    return NextResponse.json({ error: "One or more selected product options are no longer available." }, { status: 400 });
  }
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let discount = 0;
  let couponCode: string | null = null;

  if (parsed.data.couponCode) {
    const code = parsed.data.couponCode.trim().toUpperCase();
    const coupon = await db.coupon.findUnique({ where: { code } });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon is not valid." }, { status: 400 });
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached." }, { status: 400 });
    }

    if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
      return NextResponse.json({ error: `Minimum order amount is BDT ${Number(coupon.minOrder).toLocaleString("en-BD")}.` }, { status: 400 });
    }

    const rawDiscount = coupon.type === "PERCENTAGE" ? Math.round((subtotal * Number(coupon.discount)) / 100) : Number(coupon.discount);
    discount = Math.min(Math.max(rawDiscount, 0), subtotal);
    couponCode = coupon.code;
  }

  const discountedSubtotal = subtotal - discount;
  const city = parsed.data.shippingAddress.city.trim().toLowerCase();
  const shipping = discountedSubtotal === 0 ? 0 : city === "dhaka" ? 60 : 120;
  const tax = 0;
  const number = orderNumber();
  const total = discountedSubtotal + shipping + tax;
  const order = await db.order.create({
    data: {
      orderNumber: number,
      userId: session.user.id,
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: parsed.data.paymentMethod === "COD" ? "PENDING" : "PAID",
      subtotal,
      discount,
      couponCode,
      shipping,
      tax,
      total,
      shippingAddress: parsed.data.shippingAddress,
      items: {
        create: orderItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          options: item.options
        }))
      }
    },
    include: {
      items: {
        include: {
          product: { select: { name: true } }
        }
      }
    }
  });
  if (couponCode) {
    await db.coupon.update({ where: { code: couponCode }, data: { usedCount: { increment: 1 } } });
  }
  await createNotification({
    userId: session.user.id,
    type: "ORDER_PLACED",
    message: orderPlacedMessage(order.orderNumber)
  });
  const adminEmail = await sendAdminOrderEmail({
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    discount,
    shipping: Number(order.shipping),
    total: Number(order.total),
    shippingAddress: parsed.data.shippingAddress,
    items: order.items.map((item) => {
      const options = Array.isArray(item.options)
        ? item.options
            .map((option) => option && typeof option === "object" && !Array.isArray(option) ? option as Record<string, unknown> : null)
            .filter((option): option is Record<string, unknown> => Boolean(option))
            .map((option) => typeof option.name === "string" && typeof option.value === "string" ? `${option.name}: ${option.value}` : "")
            .filter(Boolean)
            .join(", ")
        : "";
      return { name: options ? `${item.product.name} (${options})` : item.product.name, quantity: item.quantity, price: Number(item.price) };
    })
  });

  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      total: Number(order.total)
    },
    adminEmail
  }, { status: 201 });
}
