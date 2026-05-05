"use client";

import { CheckCircle2, CreditCard, HandCoins, Landmark, PackageCheck } from "lucide-react";
import { useMemo, useState } from "react";
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
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Bangladesh"
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  const [error, setError] = useState("");
  const visibleMethods = methods.filter((method) => method.visible);
  const formIsValid = useMemo(() => {
    return (
      items.length > 0 &&
      shippingAddress.name.trim().length >= 2 &&
      shippingAddress.phone.trim().length >= 6 &&
      shippingAddress.street.trim().length >= 5 &&
      shippingAddress.city.trim().length >= 2 &&
      shippingAddress.country.trim().length >= 2 &&
      Boolean(paymentMethod)
    );
  }, [items.length, paymentMethod, shippingAddress]);

  function updateAddress(field: keyof typeof shippingAddress, value: string) {
    setShippingAddress((current) => ({ ...current, [field]: value }));
  }

  async function placeOrder() {
    if (!formIsValid || isSubmitting) return;

    setIsSubmitting(true);
    setError("");
    setConfirmedOrder(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          paymentMethod,
          shippingAddress
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError("Could not place order. Please check your details and try again.");
        return;
      }

      clear();
      setConfirmedOrder({ orderNumber: data.order.orderNumber, total: data.order.total });
    } catch {
      setError("Could not place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_360px]">
      <section className="space-y-5">
        <div>
          <p className="text-sm font-bold uppercase text-primary">Step 1</p>
          <h1 className="font-display text-3xl font-extrabold">Shipping address</h1>
        </div>
        <div className="grid gap-4 rounded-lg border bg-card p-5 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Full name
            <input value={shippingAddress.name} onChange={(event) => updateAddress("name", event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            Phone
            <input value={shippingAddress.phone} onChange={(event) => updateAddress("phone", event.target.value)} required minLength={6} inputMode="tel" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            Street address
            <input value={shippingAddress.street} onChange={(event) => updateAddress("street", event.target.value)} required minLength={5} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            City
            <input value={shippingAddress.city} onChange={(event) => updateAddress("city", event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            Postal code
            <input value={shippingAddress.postalCode} onChange={(event) => updateAddress("postalCode", event.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            Country
            <input value={shippingAddress.country} onChange={(event) => updateAddress("country", event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-primary">Step 2</p>
          <h2 className="font-display text-2xl font-extrabold">Payment method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {visibleMethods.map((method) => {
              const Icon = method.icon;
              return (
                <label key={method.id} className="flex cursor-pointer items-center gap-3 rounded-lg border bg-card p-4 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} className="accent-primary" />
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
          {confirmedOrder ? (
            <div className="mt-4 rounded-lg border border-primary/25 bg-primary/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-primary" size={22} />
                <div>
                  <h3 className="font-display text-lg font-extrabold text-primary">Order confirmed</h3>
                  <p className="mt-1 text-sm leading-6 text-foreground">
                    Thanks for shopping with GadgetGallery. Your order reference is <strong>{confirmedOrder.orderNumber}</strong>.
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We will contact you shortly to confirm delivery details. Total payable on delivery: <strong className="text-foreground">{formatBDT(confirmedOrder.total)}</strong>.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
          {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
          <Button className="mt-4" disabled={!formIsValid || isSubmitting} onClick={placeOrder}>
            {isSubmitting ? "Placing order..." : "Place order"}
          </Button>
          {!formIsValid ? <p className="mt-2 text-sm text-muted-foreground">Fill shipping details, select payment, and keep at least one cart item to place an order.</p> : null}
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
