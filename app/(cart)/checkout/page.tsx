"use client";

import { CreditCard, HandCoins, Landmark, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatBDT } from "@/lib/utils";
import { cartTotals, useCartStore } from "@/store/cart-store";

const methods = [
  { id: "STRIPE", label: "Credit/Debit Card", icon: CreditCard, visible: false },
  { id: "PAYPAL", label: "PayPal", icon: Landmark, visible: false },
  { id: "SSLCOMMERZ", label: "SSLCommerz", icon: PackageCheck, visible: false },
  { id: "COD", label: "Cash on Delivery", icon: HandCoins, visible: true }
];

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const totals = cartTotals(items);

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Step 1</p>
          <h1 className="font-display text-3xl font-extrabold">Shipping address</h1>
        </div>
        <div className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-2">
          {["Full name", "Phone", "Street address", "City", "Postal code", "Country"].map((label) => (
            <label key={label} className="block text-sm font-semibold">
              {label}
              <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" defaultValue={label === "Country" ? "Bangladesh" : ""} />
            </label>
          ))}
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-primary">Step 2</p>
          <h2 className="font-display text-2xl font-extrabold">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {methods.filter((method) => method.visible).map((method) => {
              const Icon = method.icon;
              return (
                <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                  <input type="radio" name="payment" defaultChecked={method.id === "COD"} className="accent-primary" />
                  <Icon size={20} />
                  <span className="font-semibold">{method.label}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-primary">Step 3</p>
          <h2 className="font-display text-2xl font-extrabold">Review and confirm</h2>
          <Button className="mt-4" disabled={!items.length} onClick={clear}>Place order</Button>
        </div>
      </section>
      <aside className="h-fit rounded-lg border bg-card p-5">
        <h2 className="font-display text-xl font-bold">Checkout total</h2>
        <div className="mt-5 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between gap-4">
              <span>{item.product.name} x {item.quantity}</span>
              <span>{formatBDT(item.product.price * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-3"><span>Shipping</span><span>{formatBDT(totals.shipping)}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatBDT(totals.tax)}</span></div>
          <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span>{formatBDT(totals.total)}</span></div>
        </div>
      </aside>
    </div>
  );
}
