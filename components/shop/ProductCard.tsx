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
    <article className="group overflow-hidden rounded-lg border bg-card shadow-sm transition active:scale-[0.99] hover:-translate-y-1 hover:shadow-soft">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image src={product.image} alt={product.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
          {product.comparePrice ? <span className="absolute left-3 top-3 rounded bg-accent px-2 py-1 text-xs font-bold text-accent-foreground">Deal</span> : null}
          {showWishlistBadge ? <WishlistBadge productSlug={product.slug} /> : null}
        </div>
      </Link>
      <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">{product.category}</p>
          <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 min-h-[40px] font-display text-sm font-bold leading-5 hover:text-primary sm:text-base">
            {product.name}
          </Link>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground sm:gap-2 sm:text-sm">
          <Star size={14} className="fill-accent text-accent sm:size-[15px]" />
          <span>{product.rating}</span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="grid gap-2 sm:flex sm:items-end sm:justify-between sm:gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-base font-extrabold sm:text-lg">{formatBDT(product.price)}</p>
            {product.comparePrice ? <p className="truncate text-xs text-muted-foreground line-through sm:text-sm">{formatBDT(product.comparePrice)}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <AddToCartButton product={product} compact className="h-10 min-w-0 flex-1 px-3 sm:h-9 sm:flex-none" />
            {action}
          </div>
        </div>
      </div>
    </article>
  );
}
