"use client";

import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({ product, quantity = 1, className, compact = false }: { product: Product; quantity?: number; className?: string; compact?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <Button className={className} onClick={() => addItem(product, quantity)}>
      <ShoppingCart size={16} />
      <span className={compact ? "hidden sm:inline" : undefined}>Add to cart</span>
    </Button>
  );
}
