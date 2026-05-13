"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/catalog";
import { cn, formatBDT } from "@/lib/utils";
import { useWishlist } from "@/components/shop/WishlistProvider";
import { useCartStore } from "@/store/cart-store";

export function HomeProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const { data: session, status } = useSession();
  const { slugs, setWishlisted } = useWishlist();
  const [isPending, startTransition] = useTransition();
  const wishlisted = slugs.has(product.slug);
  const sessionLoading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";
  const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
  const inStock = product.stock > 0;

  function toggleWishlist() {
    startTransition(async () => {
      const nextWishlisted = !wishlisted;
      const res = await fetch("/api/wishlist", {
        method: nextWishlisted ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug })
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (res.ok) {
        setWishlisted(product.slug, nextWishlisted);
      }
    });
  }

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
        <button
          type="button"
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          disabled={isPending}
          onClick={toggleWishlist}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full border border-white/70 bg-card/95 shadow-sm transition hover:bg-background disabled:opacity-60 sm:bottom-2 sm:top-auto"
        >
          <Heart size={15} className={wishlisted ? "fill-destructive text-destructive" : ""} />
        </button>
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
          <button
            type="button"
            disabled={!inStock || sessionLoading || isAdmin}
            onClick={() => addItem(product)}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-2 text-xs font-extrabold text-primary-foreground transition hover:brightness-95 disabled:bg-muted disabled:text-muted-foreground sm:h-9 sm:text-sm"
          >
            <ShoppingCart size={15} />
            <span className="sm:inline">{sessionLoading ? "..." : isAdmin ? "Admin" : "Add"}</span>
          </button>
          <Link href={`/product/${product.slug}`} className="hidden h-9 items-center justify-center rounded-md border px-3 text-sm font-extrabold transition hover:bg-muted sm:inline-flex">
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
