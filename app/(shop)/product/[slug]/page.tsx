import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { db } from "@/lib/db";
import { mapDbProduct } from "@/lib/product-mapper";
import { formatBDT } from "@/lib/utils";

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
    <div className="container-page py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr]">
        <ProductGallery name={product.name} images={product.images} />
        <section>
          <p className="text-sm font-bold uppercase text-primary">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold">{product.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1 font-semibold"><Star size={16} className="fill-accent text-accent" /> {product.rating}</span>
            <span className="text-muted-foreground">{product.reviewCount} reviews</span>
            <span className="rounded bg-muted px-2 py-1 font-semibold">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
          </div>
          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-3xl font-extrabold">{formatBDT(product.price)}</p>
            {product.comparePrice ? <p className="text-lg text-muted-foreground line-through">{formatBDT(product.comparePrice)}</p> : null}
          </div>
          <p className="mt-5 leading-7 text-muted-foreground">{product.description}</p>
          <div className="mt-7 flex gap-3">
            <AddToCartButton product={product} className="min-w-44" />
            <WishlistButton productSlug={product.slug} />
          </div>
          {Object.keys(product.specs).length ? (
            <div className="mt-8 rounded-lg border bg-card p-5">
              <h2 className="font-display text-xl font-bold">Specifications</h2>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="rounded-md bg-muted p-3">
                    <dt className="text-xs font-bold uppercase text-muted-foreground">{key}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </section>
      </div>
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
