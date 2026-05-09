import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }

  const reviews = await db.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, image: true } }
    }
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to review this product." }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review details." }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const review = await db.review.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: parsed.data.productId
      }
    },
    update: {
      rating: parsed.data.rating,
      comment: parsed.data.comment || null
    },
    create: {
      userId: session.user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null
    }
  });

  const aggregate = await db.review.aggregate({
    where: { productId: parsed.data.productId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await db.product.update({
    where: { id: parsed.data.productId },
    data: {
      rating: Number((aggregate._avg.rating ?? 0).toFixed(1)),
      reviewCount: aggregate._count.rating
    }
  });

  return NextResponse.json({ review }, { status: 201 });
}
