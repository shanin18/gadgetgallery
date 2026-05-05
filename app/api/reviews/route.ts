import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ reviews: [] });
}

export async function POST(request: Request) {
  return NextResponse.json({ review: await request.json() }, { status: 201 });
}
