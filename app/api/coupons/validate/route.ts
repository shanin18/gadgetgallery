import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

function calculateDiscount(type: string, discount: number, subtotal: number) {
  const value = type === "PERCENTAGE" ? Math.round((subtotal * discount) / 100) : discount;
  return Math.min(Math.max(value, 0), subtotal);
}

export async function POST(request: Request) {
  const limited = rateLimit(request, { name: "coupon-validate", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotal = Number(body.subtotal ?? 0);

  if (!code) {
    return NextResponse.json({ valid: false, error: "Enter a coupon code." }, { status: 400 });
  }

  const coupon = await db.coupon.findUnique({ where: { code } });

  if (!coupon) {
    return NextResponse.json({ valid: false, error: "Coupon is not valid." }, { status: 404 });
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Coupon has expired." }, { status: 400 });
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ valid: false, error: "Coupon usage limit reached." }, { status: 400 });
  }

  if (coupon.minOrder && subtotal < Number(coupon.minOrder)) {
    return NextResponse.json({ valid: false, error: `Minimum order amount is BDT ${Number(coupon.minOrder).toLocaleString("en-BD")}.` }, { status: 400 });
  }

  const discountAmount = calculateDiscount(coupon.type, Number(coupon.discount), subtotal);

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    discount: Number(coupon.discount),
    discountAmount
  });
}
