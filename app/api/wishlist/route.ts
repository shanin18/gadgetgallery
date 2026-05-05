import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ products: [] });
}

export async function POST(request: Request) {
  return NextResponse.json({ wishlist: await request.json() }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { productId } = await request.json();
  return NextResponse.json({ removed: productId });
}
