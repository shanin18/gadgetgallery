"use client";

import { ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Product, SelectedProductOption } from "@/lib/catalog";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({ product, quantity = 1, className, compact = false, selectedOptions = [] }: { product: Product; quantity?: number; className?: string; compact?: boolean; selectedOptions?: SelectedProductOption[] }) {
  const addItem = useCartStore((state) => state.addItem);
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";
  return (
    <Button className={className} onClick={() => addItem(product, quantity, selectedOptions)} disabled={sessionLoading || isAdmin || product.stock <= 0}>
      <ShoppingCart size={16} />
      <span className={compact ? "hidden sm:inline" : undefined}>{sessionLoading ? "Loading" : isAdmin ? "Admin only" : "Add to cart"}</span>
    </Button>
  );
}
