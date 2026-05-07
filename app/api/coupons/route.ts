import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function generateCode() {
  return `GG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const couponSchema = z.object({
  code: z.string().trim().min(3).max(40).optional(),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  discount: z.coerce.number().positive(),
  minOrder: z.coerce.number().nonnegative().optional(),
  maxUses: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = couponSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coupon details." }, { status: 400 });
  }

  const code = (parsed.data.code || generateCode()).toUpperCase();

  try {
    const coupon = await db.coupon.create({
      data: {
        code,
        type: parsed.data.type,
        discount: parsed.data.discount,
        minOrder: parsed.data.minOrder,
        maxUses: parsed.data.maxUses,
        expiresAt: parsed.data.expiresAt ? new Date(`${parsed.data.expiresAt}T23:59:59`) : null
      }
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Coupon code already exists." }, { status: 409 });
  }
}
