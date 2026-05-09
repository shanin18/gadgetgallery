"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const confirmationOptions = [
  { value: "", label: "Order status" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" }
];

const deliveryOptions = [
  { value: "", label: "Delivery status" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Sent" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" }
];

export function AdminOrderFilters({ confirmation, delivery }: { confirmation: string; delivery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="grid min-w-0 gap-3 grid-cols-2">
      <select
        value={confirmation}
        onChange={(event) => updateFilter("confirmation", event.target.value)}
        className="h-11 min-w-0 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary"
        aria-label="Filter by confirmation status"
      >
        {confirmationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <select
        value={delivery}
        onChange={(event) => updateFilter("delivery", event.target.value)}
        className="h-11 min-w-0 rounded-md border bg-background px-3 text-sm font-bold outline-none focus:border-primary"
        aria-label="Filter by delivery status"
      >
        {deliveryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}
