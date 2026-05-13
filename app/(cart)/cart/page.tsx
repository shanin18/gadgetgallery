"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { LinkButton } from "@/components/ui/Button";
import { formatBDT } from "@/lib/utils";
import { cartTotals, useCartStore } from "@/store/cart-store";

export default function CartPage() {
  const { items, removeItem, setQuantity } = useCartStore();
  const { data: session, status } = useSession();
  const sessionLoading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";
  const totals = cartTotals(items);

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="font-display text-3xl font-extrabold">Cart</h1>
        <div className="mt-6 space-y-4">
          {items.length === 0 ? <p className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">Your cart is empty.</p> : null}
          {items.map((item) => (
            <div key={item.id} className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-[112px_1fr_auto]">
              <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                <Image src={item.product.image} alt={item.product.name} fill sizes="112px" className="object-cover" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold">{item.product.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.product.category}</p>
                {item.selectedOptions.length ? <p className="mt-2 text-sm font-semibold text-muted-foreground">{item.selectedOptions.map((option) => `${option.name}: ${option.value}`).join(", ")}</p> : null}
                <p className="mt-3 font-bold">{formatBDT(item.unitPrice)}</p>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                <div className="inline-flex items-center rounded-md border">
                  <button className="p-2" onClick={() => setQuantity(item.id, item.quantity - 1)}><Minus size={14} /></button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button className="p-2" onClick={() => setQuantity(item.id, item.quantity + 1)}><Plus size={14} /></button>
                </div>
                <button className="inline-flex items-center gap-2 text-sm font-semibold text-destructive" onClick={() => removeItem(item.id)}><Trash2 size={15} /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <aside className="h-fit rounded-lg border bg-card p-5">
        <h2 className="font-display text-xl font-bold">Order summary</h2>
        <label className="mt-5 block text-sm font-semibold">
          Promo code
          <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" placeholder="WELCOME10" />
        </label>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatBDT(totals.subtotal)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{formatBDT(totals.shipping)}</span></div>
          <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span>{formatBDT(totals.total)}</span></div>
        </div>
        {sessionLoading ? (
          <p className="mt-6 rounded-md bg-muted p-3 text-sm font-semibold text-muted-foreground">Loading account...</p>
        ) : isAdmin ? (
          <p className="mt-6 rounded-md bg-muted p-3 text-sm font-semibold text-muted-foreground">Admin accounts cannot place customer orders.</p>
        ) : (
          <LinkButton href="/checkout" className="mt-6 w-full">Checkout</LinkButton>
        )}
      </aside>
    </div>
  );
}
