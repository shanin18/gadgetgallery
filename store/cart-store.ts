"use client";

import { create } from "zustand";
import type { Product } from "@/lib/catalog";

export type CartLine = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartLine[];
  open: boolean;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  toggle: (open?: boolean) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  open: false,
  addItem: (product, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item
          ),
          open: true
        };
      }
      return { items: [...state.items, { product, quantity }], open: true };
    }),
  removeItem: (productId) => set((state) => ({ items: state.items.filter((item) => item.product.id !== productId) })),
  setQuantity: (productId, quantity) =>
    set((state) => ({
      items: state.items.map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
    })),
  clear: () => set({ items: [] }),
  toggle: (open) => set((state) => ({ open: open ?? !state.open }))
}));

export function cartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal > 3000 || subtotal === 0 ? 0 : 120;
  const tax = Math.round(subtotal * 0.05);
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
