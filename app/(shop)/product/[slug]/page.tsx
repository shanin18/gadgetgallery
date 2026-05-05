import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProduct, products } from "@/lib/catalog";
import { formatBDT } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.image]
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const related = products.filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id).slice(0, 3);
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
        <div className="grid gap-3 md:grid-cols-[88px_1fr]">
          <div className="hidden gap-3 md:grid">
            {product.images.map((image) => (
              <div key={image} className="relative aspect-square overflow-hidden rounded-md border bg-muted">
                <Image src={image} alt={product.name} fill sizes="88px" className="object-cover" />
              </div>
            ))}
          </div>
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image src={product.image} alt={product.name} fill priority sizes="50vw" className="object-cover" />
          </div>
        </div>
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
            <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold hover:bg-muted"><Heart size={16} /> Wishlist</button>
          </div>
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
        </section>
      </div>
      <section className="mt-14">
        <h2 className="font-display text-2xl font-extrabold">Related products</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((item) => <ProductCard key={item.id} product={item} />)}
        </div>
      </section>
    </div>
  );
}
