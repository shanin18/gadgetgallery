"use client";

import { ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({ product, quantity = 1, className }: { product: Product; quantity?: number; className?: string }) {
  const addItem = useCartStore((state) => state.addItem);
  return (
    <Button className={className} onClick={() => addItem(product, quantity)}>
      <ShoppingCart size={16} />
      Add to cart
    </Button>
  );
}
