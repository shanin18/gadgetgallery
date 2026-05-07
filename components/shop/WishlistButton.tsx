"use client";

import { useTransition } from "react";
import { Heart, Loader2 } from "lucide-react";
import { useWishlist } from "@/components/shop/WishlistProvider";

export function WishlistButton({ productSlug, initialWishlisted = false }: { productSlug: string; initialWishlisted?: boolean }) {
  const { slugs, setWishlisted } = useWishlist();
  const wishlisted = slugs.has(productSlug) || initialWishlisted;
  const [isPending, startTransition] = useTransition();

  function toggleWishlist() {
    startTransition(async () => {
      const nextWishlisted = !wishlisted;
      const res = await fetch("/api/wishlist", {
        method: nextWishlisted ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug })
      });

      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        console.error("Wishlist update failed", await res.json().catch(() => null));
        return;
      }

      setWishlisted(productSlug, nextWishlisted);
    });
  }

  return (
    <button
      type="button"
      className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold transition hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
      onClick={toggleWishlist}
      disabled={isPending}
      aria-pressed={wishlisted}
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Heart size={16} className={wishlisted ? "fill-destructive text-destructive" : ""} />
      )}
      {wishlisted ? "Wishlisted" : "Wishlist"}
    </button>
  );
}
