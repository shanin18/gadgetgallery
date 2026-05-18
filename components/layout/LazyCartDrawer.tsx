"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

const CartDrawer = dynamic(() => import("@/components/layout/CartDrawer").then((mod) => mod.CartDrawer), {
  ssr: false
});

export function LazyCartDrawer() {
  const [shouldLoad, setShouldLoad] = useState(() => useCartStore.getState().open);

  useEffect(() => {
    return useCartStore.subscribe((state) => {
      if (state.open) setShouldLoad(true);
    });
  }, []);

  return shouldLoad ? <CartDrawer /> : null;
}
