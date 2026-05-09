import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendAdminOrderEmail } from "@/lib/order-email";
import { orderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations/order";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ orders: [] });
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in before placing an order." }, { status: 401 });
  }

  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const productIds = parsed.data.items.map((item) => item.productId);
  const productSlugs = parsed.data.items.map((item) => item.productSlug).filter((slug): slug is string => Boolean(slug));
  const products = await db.product.findMany({
    where: {
      OR: [
        { id: { in: productIds } },
        ...(productSlugs.length ? [{ slug: { in: productSlugs } }] : [])
      ]
    },
    select: { id: true, slug: true, name: true, price: true, stock: true }
  });
  const productById = new Map(products.map((product) => [product.id, product]));
  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const resolveProduct = (item: (typeof parsed.data.items)[number]) => productById.get(item.productId) ?? (item.productSlug ? productBySlug.get(item.productSlug) : undefined);
  const missingItem = parsed.data.items.find((item) => !resolveProduct(item));

  if (missingItem) {
    return NextResponse.json({ error: "One or more products in your cart are no longer available." }, { status: 400 });
  }

  const orderItems = parsed.data.items.map((item) => {
    const product = resolveProduct(item)!;

    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      price: Number(product.price)
    };
  });
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
  const shipping = discountedSubtotal > 3000 ? 0 : 120;
  const tax = Math.round(discountedSubtotal * 0.05);
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
          price: item.price
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
  const adminEmail = await sendAdminOrderEmail({
    orderNumber: order.orderNumber,
    paymentMethod: order.paymentMethod,
    subtotal: Number(order.subtotal),
    discount,
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    shippingAddress: parsed.data.shippingAddress,
    items: order.items.map((item) => ({ name: item.product.name, quantity: item.quantity, price: Number(item.price) }))
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
