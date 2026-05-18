"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type WishlistContextValue = {
  slugs: Set<string>;
  setWishlisted: (slug: string, wishlisted: boolean) => void;
};

const WishlistContext = createContext<WishlistContextValue>({
  slugs: new Set<string>(),
  setWishlisted: () => {}
});

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [slugs, setSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    let abortController: AbortController | null = null;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function loadWishlist() {
      if (status === "loading") return;

      if (status !== "authenticated") {
        setSlugs(new Set());
        return;
      }

      abortController = new AbortController();
      const res = await fetch("/api/wishlist", { cache: "no-store", signal: abortController.signal });
      if (!active || !res.ok) return;

      const data = await res.json();
      const products = Array.isArray(data.products) ? data.products : [];
      setSlugs(new Set(products.map((product: { slug?: string }) => product.slug).filter(Boolean)));
    }

    if (status === "authenticated") {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(() => {
          loadWishlist().catch(() => undefined);
        }, { timeout: 1800 });
      } else {
        timeoutId = globalThis.setTimeout(() => {
          loadWishlist().catch(() => undefined);
        }, 450);
      }
    } else {
      loadWishlist().catch(() => undefined);
    }

    return () => {
      active = false;
      abortController?.abort();
      if (idleId !== null && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
    };
  }, [status]);

  const value = useMemo<WishlistContextValue>(() => ({
    slugs,
    setWishlisted(slug, wishlisted) {
      setSlugs((current) => {
        const next = new Set(current);
        if (wishlisted) {
          next.add(slug);
        } else {
          next.delete(slug);
        }
        return next;
      });
    }
  }), [slugs]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
