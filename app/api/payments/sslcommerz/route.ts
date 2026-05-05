import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    provider: "sslcommerz",
    mode: process.env.SSLCOMMERZ_STORE_ID ? "sandbox-ready" : "stub",
    gatewayUrl: "/checkout?sslcommerz=stub"
  });
}
