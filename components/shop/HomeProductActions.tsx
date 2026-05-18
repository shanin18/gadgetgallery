"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { useTransition } from "react";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/catalog";
import { useWishlist } from "@/components/shop/WishlistProvider";
import { useCartStore } from "@/store/cart-store";

export function HomeProductActions({ product, placement }: { product: Product; placement: "badge" | "cart" }) {
  const addItem = useCartStore((state) => state.addItem);
  const { data: session, status } = useSession();
  const { slugs, setWishlisted } = useWishlist();
  const [isPending, startTransition] = useTransition();
  const wishlisted = slugs.has(product.slug);
  const sessionLoading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";
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

  if (placement === "badge") {
    return (
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
    );
  }

  return (
    <button
      type="button"
      disabled={!inStock || sessionLoading || isAdmin}
      onClick={() => addItem(product)}
      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-2 text-xs font-semibold text-primary-foreground transition hover:brightness-95 disabled:bg-muted disabled:text-muted-foreground sm:h-9 sm:text-sm"
    >
      <ShoppingCart size={15} />
      <span className="sm:inline">{sessionLoading ? "..." : isAdmin ? "Admin" : "Add"}</span>
    </button>
  );
}
