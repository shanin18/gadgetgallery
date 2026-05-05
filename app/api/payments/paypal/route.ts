import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    provider: "paypal",
    mode: process.env.PAYPAL_CLIENT_ID ? "sandbox-ready" : "stub",
    orderId: `PAYPAL-${Date.now()}`
  });
}
