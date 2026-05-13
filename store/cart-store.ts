"use client";

import { create } from "zustand";
import type { Product, SelectedProductOption } from "@/lib/catalog";

export type CartLine = {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions: SelectedProductOption[];
  unitPrice: number;
};

type CartState = {
  items: CartLine[];
  open: boolean;
  addItem: (product: Product, quantity?: number, selectedOptions?: SelectedProductOption[]) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
  toggle: (open?: boolean) => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  open: false,
  addItem: (product, quantity = 1, selectedOptions = []) =>
    set((state) => {
      const optionKey = selectedOptions.map((option) => `${option.name}:${option.value}:${option.priceDelta}`).sort().join("|");
      const lineId = `${product.id}::${optionKey}`;
      const unitPrice = product.price + selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0);
      const existing = state.items.find((item) => item.id === lineId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === lineId ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) } : item
          ),
          open: true
        };
      }
      return { items: [...state.items, { id: lineId, product, quantity, selectedOptions, unitPrice }], open: true };
    }),
  removeItem: (lineId) => set((state) => ({ items: state.items.filter((item) => item.id !== lineId) })),
  setQuantity: (lineId, quantity) =>
    set((state) => ({
      items: state.items.map((item) => (item.id === lineId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.product.stock)) } : item))
    })),
  clear: () => set({ items: [] }),
  toggle: (open) => set((state) => ({ open: open ?? !state.open }))
}));

export function cartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = subtotal === 0 ? 0 : 120;
  const tax = 0;
  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}
