import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ProductPurchaseControls } from "@/components/shop/ProductPurchaseControls";
import { ProductReviews } from "@/components/shop/ProductReviews";
import { RatingStars } from "@/components/shop/RatingStars";
import { db } from "@/lib/db";
import { mapDbProduct } from "@/lib/product-mapper";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
    }
  });
  if (!product) return {};
  const mappedProduct = mapDbProduct(product);
  return {
    title: mappedProduct.name,
    description: mappedProduct.description,
    openGraph: {
      title: mappedProduct.name,
      description: mappedProduct.description,
      images: [mappedProduct.image]
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const productRecord = await db.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
    }
  });
  if (!productRecord) notFound();
  const product = mapDbProduct(productRecord);
  const relatedRecords = await db.product.findMany({
    where: { categoryId: productRecord.categoryId, id: { not: productRecord.id } },
    take: 3,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
    }
  });
  const reviews = await db.$queryRaw<{
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
    WHERE r."productId" = ${productRecord.id}
    ORDER BY r."createdAt" DESC
  `;
  const related = relatedRecords.map(mapDbProduct);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: product.brand,
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount },
    offers: { "@type": "Offer", priceCurrency: "BDT", price: product.price, availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" }
  };

  return (
    <div className="container-page py-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <ProductGallery name={product.name} images={product.images} />
        <section>
          <p className="text-xs font-bold uppercase text-primary sm:text-sm">{product.brand || "GadgetGallery"}</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs sm:mt-4 sm:gap-3 sm:text-sm">
            <span className="inline-flex items-center gap-1 font-semibold"><RatingStars rating={product.rating} size={16} /> {product.rating}</span>
            <span className="text-muted-foreground">{product.reviewCount} reviews</span>
            <span className="rounded bg-muted px-2 py-1 font-semibold">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>
          <ProductPurchaseControls product={product} />
          <div className="mt-3 flex gap-3">
            <WishlistButton productSlug={product.slug} />
          </div>
          {Object.keys(product.specs).length ? (
            <div className="mt-7 sm:mt-8 sm:rounded-lg sm:border sm:bg-card sm:p-5">
              <h2 className="font-display text-lg font-bold sm:text-xl">Specifications</h2>
              <dl className="mt-3 divide-y sm:mt-4 sm:grid sm:gap-3 sm:divide-y-0 sm:grid-cols-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-[0.8fr_1fr] gap-3 py-2.5 sm:block sm:rounded-md sm:bg-muted sm:p-3">
                    <dt className="text-[11px] font-bold uppercase text-muted-foreground sm:text-xs">{key}</dt>
                    <dd className="text-right text-sm font-semibold leading-5 sm:mt-1 sm:text-left sm:text-base">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      </div>
      <ProductReviews
        productId={product.id}
        initialReviews={reviews.map((review) => ({
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          images: Array.isArray(review.images) ? review.images.filter((image): image is string => typeof image === "string") : [],
          createdAt: review.createdAt.toISOString(),
          user: {
            id: review.userId,
            name: review.userName,
            image: review.userImage
          }
        }))}
      />
      <section className="mt-14">
        {related.length ? (
          <>
            <h2 className="font-display text-2xl font-extrabold">Related products</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => <ProductCard key={item.id} product={item} />)}
            </div>
          </>
        ) : (
          <p className="rounded-lg border bg-card p-5 text-sm font-semibold text-muted-foreground">No related products.</p>
        )}
      </section>
    </div>
  );
}
