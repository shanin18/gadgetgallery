import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mapDbProduct } from "@/lib/product-mapper";
import { productSchema } from "@/lib/validations/product";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const category = searchParams.get("category") ?? undefined;
  const min = Number(searchParams.get("min")) || undefined;
  const max = Number(searchParams.get("max")) || undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const products = await db.product.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } }
            ]
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(min || max ? { price: { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) } } : {})
    },
    orderBy:
      sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : sort === "newest"
              ? { createdAt: "desc" }
              : { featured: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
    }
  });

  return NextResponse.json({
    products: products.map(mapDbProduct)
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
      featured: parsed.data.featured,
      specs: parsed.data.specs,
      categoryId: parsed.data.categoryId,
      images: {
        create: parsed.data.images.map((url, index) => ({ url, alt: parsed.data.name, isPrimary: index === 0 }))
      }
    }
  });

  return NextResponse.json({ product }, { status: 201 });
}
