import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import type { Product } from "@/lib/catalog";
import { formatBDT } from "@/lib/utils";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { WishlistBadge } from "@/components/shop/WishlistBadge";

export function ProductCard({ product, showWishlistBadge = true, action }: { product: Product; showWishlistBadge?: boolean; action?: ReactNode }) {
  return (
    <article className="group overflow-hidden rounded-lg border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
          {product.comparePrice ? <span className="absolute left-3 top-3 rounded bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">Deal</span> : null}
          {showWishlistBadge ? <WishlistBadge productSlug={product.slug} /> : null}
        </div>
      </Link>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{product.category}</p>
          <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 font-display text-base font-bold hover:text-primary">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star size={15} className="fill-accent text-accent" />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-lg font-extrabold">{formatBDT(product.price)}</p>
            {product.comparePrice ? <p className="text-sm text-muted-foreground line-through">{formatBDT(product.comparePrice)}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <AddToCartButton product={product} className="h-9 px-3" />
            {action}
          </div>
        </div>
      </div>
    </article>
  );
}
