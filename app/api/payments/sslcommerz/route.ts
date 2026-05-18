import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.SSLCOMMERZ_STORE_ID || !process.env.SSLCOMMERZ_STORE_PASSWORD) {
    return NextResponse.json({ error: "Online payment is not available right now." }, { status: 503 });
  }

  return NextResponse.json({ error: "SSLCommerz checkout is not enabled yet." }, { status: 501 });
}
