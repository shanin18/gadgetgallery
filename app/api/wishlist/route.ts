import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productSlug = searchParams.get("productSlug");

  if (productSlug) {
    const wishlist = await db.wishlist.findFirst({
      where: {
        userId: session.user.id,
        products: { some: { slug: productSlug } }
      },
      select: { id: true }
    });

    return NextResponse.json({ wishlisted: Boolean(wishlist) });
  }

  const wishlist = await db.wishlist.findUnique({
    where: { userId: session.user.id },
    include: {
      products: {
        include: {
          category: true,
          images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
        }
      }
    }
  });

  return NextResponse.json({ products: wishlist?.products ?? [] });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productSlug } = await request.json();

  if (typeof productSlug !== "string") {
    return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { slug: productSlug } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const wishlist = await db.wishlist.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      products: { connect: { id: product.id } }
    },
    update: {
      products: { connect: { id: product.id } }
    },
    include: { products: true }
  });

  return NextResponse.json({ wishlist, wishlisted: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productSlug } = await request.json();

  if (typeof productSlug !== "string") {
    return NextResponse.json({ error: "Product slug is required." }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { slug: productSlug } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const wishlist = await db.wishlist.findUnique({ where: { userId: session.user.id } });
  if (!wishlist) {
    return NextResponse.json({ removed: product.id, wishlisted: false });
  }

  await db.wishlist.update({
    where: { userId: session.user.id },
    data: {
      products: { disconnect: { id: product.id } }
    }
  });

  return NextResponse.json({ removed: product.id, wishlisted: false });
}
