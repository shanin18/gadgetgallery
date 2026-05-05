import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailOtp, sendEmailOtp } from "@/lib/email-verification";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().min(6, "Enter a valid phone number.").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid registration details." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing?.emailVerified) {
    return NextResponse.json({ error: "An account already exists with this email." }, { status: 409 });
  }

  await db.user.upsert({
    where: { email },
    update: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    },
    create: {
      name: parsed.data.name,
      email,
      phone: parsed.data.phone || null,
      passwordHash: await bcrypt.hash(parsed.data.password, 12)
    }
  });

  const { otp, expires } = await createEmailOtp(email);
  const delivery = await sendEmailOtp(email, otp);
  if (!delivery.sent) {
    return NextResponse.json(
      {
        email,
        expires,
        error: "Account was created as pending, but the OTP email could not be sent. Check SMTP/Resend settings and use resend code.",
        reason: delivery.reason
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    email,
    expires,
    message: `Verification code sent to your email via ${delivery.provider}.`
  }, { status: 201 });
}
