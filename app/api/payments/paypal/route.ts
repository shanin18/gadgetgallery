import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json({ error: "PayPal payment is not available right now." }, { status: 503 });
  }

  return NextResponse.json({ error: "PayPal checkout is not enabled yet." }, { status: 501 });
}
