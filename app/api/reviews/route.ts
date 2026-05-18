import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  images: z.array(z.string().trim().min(1)).max(6).default([])
});

const deleteReviewSchema = z.object({
  reviewId: z.string().min(1),
  productId: z.string().min(1)
});

async function updateProductReviewStats(productId: string) {
  const aggregate = await db.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await db.product.update({
    where: { id: productId },
    data: {
      rating: Number((aggregate._avg.rating ?? 0).toFixed(1)),
      reviewCount: aggregate._count.rating
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required." }, { status: 400 });
  }

  const rows = await db.$queryRaw<{
    id: string;
    rating: number;
    comment: string | null;
    images: unknown;
    createdAt: Date;
    userId: string;
    userName: string | null;
    userImage: string | null;
  }[]>`
    SELECT r."id", r."rating", r."comment", r."images", r."createdAt", r."userId", u."name" AS "userName", u."image" AS "userImage"
    FROM "Review" r
    INNER JOIN "User" u ON u."id" = r."userId"
    WHERE r."productId" = ${productId}
    ORDER BY r."createdAt" DESC
  `;

  const reviews = rows.map((row) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    images: Array.isArray(row.images) ? row.images.filter((image): image is string => typeof image === "string") : [],
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.userName,
      image: row.userImage
    }
  }));

  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  const limited = rateLimit(request, { name: "reviews", limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to review this product." }, { status: 401 });
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid review details." }, { status: 400 });
  }

  const product = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  try {
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

    await db.$executeRaw`
      UPDATE "Review"
      SET "images" = ${JSON.stringify(parsed.data.images)}::jsonb
      WHERE "id" = ${review.id}
    `;

    await updateProductReviewStats(parsed.data.productId);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review save failed.", error);
    return NextResponse.json({ error: "Review could not be saved. Please refresh and try again." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const limited = rateLimit(request, { name: "review-delete", limit: 20, windowMs: 60_000 });
  if (limited) return limited;

  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please log in to delete this review." }, { status: 401 });
  }

  const parsed = deleteReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review details." }, { status: 400 });
  }

  const deleted = await db.review.deleteMany({
    where: {
      id: parsed.data.reviewId,
      productId: parsed.data.productId,
      userId: session.user.id
    }
  });

  if (!deleted.count) {
    return NextResponse.json({ error: "Review not found or you do not have permission." }, { status: 404 });
  }

  await updateProductReviewStats(parsed.data.productId);

  return NextResponse.json({ ok: true });
}
