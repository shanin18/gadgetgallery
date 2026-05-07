"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { useWishlist } from "@/components/shop/WishlistProvider";

export function WishlistRemoveButton({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const { setWishlisted } = useWishlist();
  const [isPending, startTransition] = useTransition();

  function removeFromWishlist() {
    startTransition(async () => {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug })
      });

      if (res.ok) {
        setWishlisted(productSlug, false);
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-md border text-destructive transition hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
      onClick={removeFromWishlist}
      disabled={isPending}
      aria-label="Remove from wishlist"
      title="Remove from wishlist"
    >
      {isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
    </button>
  );
}
