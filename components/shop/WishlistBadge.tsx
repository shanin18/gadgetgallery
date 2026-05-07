"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/components/shop/WishlistProvider";

export function WishlistBadge({ productSlug }: { productSlug: string }) {
  const { slugs } = useWishlist();

  if (!slugs.has(productSlug)) {
    return null;
  }

  return (
    <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-card/95 text-destructive shadow-sm">
      <Heart size={17} className="fill-destructive" />
    </span>
  );
}
