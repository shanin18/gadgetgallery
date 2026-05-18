import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mapDbProduct } from "@/lib/product-mapper";
import { productSchema } from "@/lib/validations/product";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await db.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
    }
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ product: mapDbProduct(product) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, { name: "admin-product-update", limit: 40, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const parsed = productSchema.partial().safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const product = await db.product.update({
    where: { id },
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
      ...(parsed.data.images
        ? {
            images: {
              deleteMany: {},
              create: parsed.data.images.map((url, index) => ({ url, alt: parsed.data.name, isPrimary: index === 0 }))
            }
          }
        : {})
    }
  });

  if (parsed.data.options) {
    await db.$executeRaw`
      UPDATE "Product"
      SET "options" = ${JSON.stringify(parsed.data.options)}::jsonb
      WHERE "id" = ${product.id}
    `;
  }

  return NextResponse.json({ product });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const limited = rateLimit(request, { name: "admin-product-delete", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await db.product.delete({ where: { id } });
    return NextResponse.json({ deleted: id });
  } catch (error) {
    console.error("Product delete failed.", error);
    return NextResponse.json({ error: "Product could not be deleted because it may be linked to orders, carts, reviews, or wishlists." }, { status: 409 });
  }
}
