import { NextResponse } from "next/server";
import { filterProducts, products } from "@/lib/catalog";
import { productSchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json({
    products: filterProducts({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      min: Number(searchParams.get("min")) || undefined,
      max: Number(searchParams.get("max")) || undefined,
      sort: searchParams.get("sort") ?? undefined
    })
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  return NextResponse.json({ product: { id: `draft-${products.length + 1}`, ...parsed.data } }, { status: 201 });
}
