"use client";

import { ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import type { Product } from "@/lib/catalog";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/store/cart-store";

export function AddToCartButton({ product, quantity = 1, className, compact = false }: { product: Product; quantity?: number; className?: string; compact?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  return (
    <Button className={className} onClick={() => addItem(product, quantity)} disabled={isAdmin}>
      <ShoppingCart size={16} />
      <span className={compact ? "hidden sm:inline" : undefined}>{isAdmin ? "Admin only" : "Add to cart"}</span>
    </Button>
  );
}
