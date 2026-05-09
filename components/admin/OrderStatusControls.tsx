"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const options = {
  confirmation: [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "CANCELLED", label: "Cancelled" }
  ],
  delivery: [
    { value: "PENDING", label: "Not started" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" }
  ]
};

export function OrderStatusSelect({
  orderId,
  type,
  value,
  showLabel = true
}: {
  orderId: string;
  type: "confirmation" | "delivery";
  value: string;
  showLabel?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const label = type === "confirmation" ? "Confirmation" : "Delivery";

  function updateOrder(nextValue: string) {
    setError("");

    startTransition(async () => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(type === "confirmation" ? { confirmationStatus: nextValue } : { deliveryStatus: nextValue })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not update.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="grid w-full min-w-0 gap-1">
      {showLabel ? (
        <label className="text-[11px] font-bold text-muted-foreground" htmlFor={`${type}-${orderId}`}>
          {label}
        </label>
      ) : null}
      <select
        id={`${type}-${orderId}`}
        value={value}
        onChange={(event) => updateOrder(event.target.value)}
        disabled={isPending}
        className="h-8 w-full rounded-md border bg-background px-2 text-xs font-bold text-foreground outline-none focus:border-primary disabled:opacity-60"
      >
        {options[type].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {isPending ? <p className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"><Loader2 className="animate-spin" size={12} /> Updating</p> : null}
      {error ? <p className="text-[11px] font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}
