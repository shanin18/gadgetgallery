import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyEmailOtp } from "@/lib/email-verification";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code.")
});

export async function POST(request: Request) {
  const parsed = verifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid verification code." }, { status: 400 });
  }

  const verified = await verifyEmailOtp(parsed.data.email, parsed.data.otp);
  if (!verified) {
    return NextResponse.json({ error: "Code is invalid or expired." }, { status: 400 });
  }

  return NextResponse.json({ verified: true });
}
