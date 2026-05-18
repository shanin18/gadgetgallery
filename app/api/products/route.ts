import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PRODUCT_PAGE_SIZE, productListInclude, productOrderBy, productWhere } from "@/lib/product-listing";
import { mapDbProduct } from "@/lib/product-mapper";
import { productSchema } from "@/lib/validations/product";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const category = searchParams.get("category") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const min = Number(searchParams.get("min")) || undefined;
  const max = Number(searchParams.get("max")) || undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);
  const limit = Math.min(Math.max(Number(searchParams.get("limit")) || PRODUCT_PAGE_SIZE, 1), 24);
  const products = await db.product.findMany({
    where: productWhere({ q: query, category, brand, min, max }),
    orderBy: productOrderBy(sort),
    skip: offset,
    take: limit + 1,
    include: productListInclude
  });
  const pageProducts = products.slice(0, limit);

  return NextResponse.json({
    products: pageProducts.map(mapDbProduct),
    nextOffset: offset + pageProducts.length,
    hasMore: products.length > limit
  });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, { name: "admin-product-create", limit: 30, windowMs: 60_000 });
  if (limited) return limited;

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

  await db.$executeRaw`
    UPDATE "Product"
    SET "options" = ${JSON.stringify(parsed.data.options)}::jsonb
    WHERE "id" = ${product.id}
  `;

  return NextResponse.json({ product }, { status: 201 });
}
