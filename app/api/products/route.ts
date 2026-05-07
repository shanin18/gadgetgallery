import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { filterProducts } from "@/lib/catalog";
import { db } from "@/lib/db";
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
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const product = await db.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      price: parsed.data.price,
      comparePrice: parsed.data.comparePrice,
      stock: parsed.data.stock,
      brand: parsed.data.brand,
      categoryId: parsed.data.categoryId,
      images: {
        create: parsed.data.images.map((url, index) => ({ url, alt: parsed.data.name, isPrimary: index === 0 }))
      }
    }
  });

  return NextResponse.json({ product }, { status: 201 });
}
