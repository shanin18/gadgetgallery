import { NextResponse } from "next/server";
import { products } from "@/lib/catalog";
import { sendAdminOrderEmail } from "@/lib/order-email";
import { orderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations/order";

export async function GET() {
  return NextResponse.json({ orders: [] });
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const orderItems = parsed.data.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return {
      productId: item.productId,
      name: product?.name ?? "Unknown product",
      quantity: item.quantity,
      price: product?.price ?? 0
    };
  });
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 3000 ? 0 : 120;
  const tax = Math.round(subtotal * 0.05);
  const number = orderNumber();
  const total = subtotal + shipping + tax;
  const adminEmail = await sendAdminOrderEmail({
    orderNumber: number,
    paymentMethod: parsed.data.paymentMethod,
    subtotal,
    shipping,
    tax,
    total,
    shippingAddress: parsed.data.shippingAddress,
    items: orderItems.map(({ name, quantity, price }) => ({ name, quantity, price }))
  });

  return NextResponse.json({
    order: {
      orderNumber: number,
      status: "PENDING",
      paymentStatus: parsed.data.paymentMethod === "COD" ? "PENDING" : "PAID",
      total
    },
    adminEmail
  }, { status: 201 });
}
