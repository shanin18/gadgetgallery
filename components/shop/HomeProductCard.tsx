import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { cn, formatBDT } from "@/lib/utils";
import { HomeProductActions } from "@/components/shop/HomeProductActions";

export function HomeProductCard({ product }: { product: Product }) {
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const inStock = product.stock > 0;

  return (
    <article className="group overflow-hidden rounded-lg border bg-card shadow-sm transition active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-soft">
      <div className="relative aspect-square overflow-hidden bg-muted sm:aspect-[4/3]">
        <Link href={`/product/${product.slug}`} className="block h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>
        {discount ? <span className="absolute left-2 top-2 rounded bg-accent px-2 py-1 text-[10px] font-extrabold text-accent-foreground sm:text-xs">{discount}% off</span> : null}
        <span className={cn("absolute right-2 top-2 hidden rounded px-2 py-1 text-[10px] font-extrabold shadow-sm sm:inline-flex", inStock ? "bg-card/95 text-primary" : "bg-destructive text-destructive-foreground")}>
          {inStock ? "In stock" : "Out of stock"}
        </span>
        <HomeProductActions product={product} placement="badge" />
      </div>

      <div className="p-2.5 sm:p-4">
        <p className="hidden text-xs font-bold uppercase text-muted-foreground sm:block">{product.category}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 block min-h-[34px] text-xs font-extrabold leading-[17px] hover:text-primary sm:text-base sm:leading-5">
          {product.name}
        </Link>
        <div className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground sm:text-sm">
          <Star size={13} className="fill-accent text-accent" />
          <span>{product.rating}</span>
          <span className="hidden sm:inline">({product.reviewCount})</span>
        </div>
        <div className="mt-2">
          <p className="font-display text-sm font-extrabold sm:text-lg">{formatBDT(product.price)}</p>
          {product.comparePrice ? <p className="text-[11px] text-muted-foreground line-through sm:text-sm">{formatBDT(product.comparePrice)}</p> : null}
        </div>
        <div className="mt-3 flex gap-2">
          <HomeProductActions product={product} placement="cart" />
          <Link href={`/product/${product.slug}`} className="hidden h-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition hover:bg-muted sm:inline-flex">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
