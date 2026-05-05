"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { formatBDT } from "@/lib/utils";
import { cartTotals, useCartStore } from "@/store/cart-store";

export function CartDrawer() {
  const { items, open, toggle, removeItem, setQuantity } = useCartStore();
  const totals = cartTotals(items);

  return (
    <>
      {open ? <div className="fixed inset-0 z-40 bg-black/35" onClick={() => toggle(false)} /> : null}
      <aside className={`fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background shadow-soft transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b px-5">
          <h2 className="font-display text-lg font-bold">Cart</h2>
          <button className="rounded-md p-2 hover:bg-muted" onClick={() => toggle(false)} aria-label="Close cart"><X size={20} /></button>
        </div>
        <div className="flex h-[calc(100%-4rem)] flex-col">
          <div className="flex-1 space-y-4 overflow-auto p-5">
            {items.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">Your cart is waiting for something useful.</p> : null}
            {items.map((item) => (
              <div key={item.product.id} className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border bg-card p-3">
                <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <Image src={item.product.image} alt={item.product.name} fill sizes="72px" className="object-cover" />
                </div>
                <div>
                  <div className="flex gap-2">
                    <p className="flex-1 text-sm font-semibold">{item.product.name}</p>
                    <button onClick={() => removeItem(item.product.id)} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive" aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-bold">{formatBDT(item.product.price)}</p>
                  <div className="mt-3 inline-flex items-center rounded-md border">
                    <button className="p-2" onClick={() => setQuantity(item.product.id, item.quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button className="p-2" onClick={() => setQuantity(item.product.id, item.quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t p-5">
            <div className="mb-4 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatBDT(totals.total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/cart" onClick={() => toggle(false)} className="inline-flex h-10 items-center justify-center rounded-md border text-sm font-semibold">View cart</Link>
              <LinkButton href="/checkout" onClick={() => toggle(false)}>
                Checkout
              </LinkButton>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
