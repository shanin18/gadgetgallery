import { NextResponse } from "next/server";
import { z } from "zod";
import { createEmailOtp, sendEmailOtp } from "@/lib/email-verification";
import { db } from "@/lib/db";

const resendSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const parsed = resendSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "No account exists with this email." }, { status: 404 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ error: "This email is already verified." }, { status: 409 });
  }

  const { otp, expires } = await createEmailOtp(email);
  const delivery = await sendEmailOtp(email, otp);
  if (!delivery.sent) {
    return NextResponse.json(
      {
        expires,
        error: "OTP email could not be sent. Check SMTP/Resend settings.",
        reason: delivery.reason
      },
      { status: 503 }
    );
  }

  return NextResponse.json({
    expires,
    message: `Verification code sent to your email via ${delivery.provider}.`
  });
}
