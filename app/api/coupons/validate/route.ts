import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { code } = await request.json();
  if (String(code).toUpperCase() === "WELCOME10") {
    return NextResponse.json({ valid: true, type: "PERCENTAGE", discount: 10 });
  }
  return NextResponse.json({ valid: false, error: "Coupon is not valid." }, { status: 404 });
}
