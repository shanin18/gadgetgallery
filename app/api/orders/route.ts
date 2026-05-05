import { NextResponse } from "next/server";
import { products } from "@/lib/catalog";
import { orderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validations/order";

export async function GET() {
  return NextResponse.json({ orders: [] });
}

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const subtotal = parsed.data.items.reduce((sum, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shipping = subtotal > 3000 ? 0 : 120;
  const tax = Math.round(subtotal * 0.05);
  return NextResponse.json({
    order: {
      orderNumber: orderNumber(),
      status: "PENDING",
      paymentStatus: parsed.data.paymentMethod === "COD" ? "PENDING" : "PAID",
      total: subtotal + shipping + tax
    }
  }, { status: 201 });
}
