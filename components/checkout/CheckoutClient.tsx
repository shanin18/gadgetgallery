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

export function CheckoutClient() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);
  const baseTotals = cartTotals(items);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "Bangladesh"
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{ orderNumber: string; total: number } | null>(null);
  const [error, setError] = useState("");
  const visibleMethods = methods.filter((method) => method.visible);
  const discountedSubtotal = Math.max(baseTotals.subtotal - (appliedCoupon?.discountAmount ?? 0), 0);
  const deliveryCharge = discountedSubtotal === 0 ? 0 : shippingAddress.city.trim().toLowerCase() === "dhaka" ? 60 : 120;
  const totals = {
    subtotal: baseTotals.subtotal,
    discount: appliedCoupon?.discountAmount ?? 0,
    shipping: deliveryCharge,
    tax: 0,
    total: discountedSubtotal + deliveryCharge
  };
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
          items: items.map((item) => ({ productId: item.product.id, productSlug: item.product.slug, quantity: item.quantity, options: item.selectedOptions })),
          couponCode: appliedCoupon?.code,
          paymentMethod,
          shippingAddress
        })
      });
      const data = await response.json();

      if (!response.ok) {
        setError(typeof data.error === "string" ? data.error : "Could not place order. Please check your details and try again.");
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

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code || isApplyingCoupon) return;

    setIsApplyingCoupon(true);
    setCouponMessage("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal: baseTotals.subtotal })
      });
      const data = await response.json();

      if (!response.ok) {
        setAppliedCoupon(null);
        setCouponMessage(data.error ?? "Coupon could not be applied.");
        return;
      }

      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount });
      setCouponCode(data.code);
      setCouponMessage(`${data.code} applied.`);
    } catch {
      setCouponMessage("Coupon could not be applied.");
    } finally {
      setIsApplyingCoupon(false);
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
        {confirmedOrder ? (
          <div className="rounded-lg border border-primary/25 bg-primary/10 p-5">
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
      </section>
      <aside className="h-fit rounded-lg border bg-card p-5 lg:sticky lg:top-24">
        <p className="text-sm font-bold uppercase text-primary">Step 3</p>
        <h2 className="font-display text-2xl font-extrabold">Review and confirm</h2>
        <div className="mt-5 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.product.id} className="flex justify-between gap-4">
              <span>{item.product.name} x {item.quantity}</span>
              <span>{formatBDT(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-4">
            <label className="text-sm font-semibold">
              Coupon
              <div className="mt-2 flex h-10 rounded-md border bg-background">
                <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} className="min-w-0 flex-1 rounded-l-md bg-transparent px-3 outline-none" placeholder="Enter code" />
                <button type="button" onClick={applyCoupon} disabled={isApplyingCoupon || !couponCode.trim() || !items.length} className="border-l px-3 text-sm font-bold text-primary disabled:text-muted-foreground">
                  {isApplyingCoupon ? "..." : "Apply"}
                </button>
              </div>
            </label>
            {couponMessage ? <p className={`mt-2 text-xs font-semibold ${appliedCoupon ? "text-primary" : "text-destructive"}`}>{couponMessage}</p> : null}
          </div>
          <div className="flex justify-between border-t pt-3"><span>Subtotal</span><span>{formatBDT(totals.subtotal)}</span></div>
          {totals.discount ? <div className="flex justify-between text-primary"><span>Discount</span><span>-{formatBDT(totals.discount)}</span></div> : null}
          <div className="flex justify-between border-t pt-3"><span>Delivery charge</span><span>{formatBDT(totals.shipping)}</span></div>
          <div className="flex justify-between border-t pt-3 text-base font-bold"><span>Total</span><span>{formatBDT(totals.total)}</span></div>
        </div>
        {error ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
        <Button className="mt-5 h-11 w-full" disabled={!formIsValid || isSubmitting} onClick={placeOrder}>
          {isSubmitting ? "Placing order..." : "Place order"}
        </Button>
        {!formIsValid ? <p className="mt-3 text-sm leading-5 text-muted-foreground">Fill shipping details, select payment, and keep at least one cart item to place an order.</p> : null}
      </aside>
    </div>
  );
}
