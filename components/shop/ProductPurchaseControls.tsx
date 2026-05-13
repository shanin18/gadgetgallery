"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Product, SelectedProductOption } from "@/lib/catalog";
import { formatBDT } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

export function ProductPurchaseControls({ product }: { product: Product }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const addItem = useCartStore((state) => state.addItem);
  const sessionLoading = status === "loading";
  const isAdmin = session?.user?.role === "ADMIN";
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.options.map((group) => [group.name, group.values[0]?.label ?? ""]))
  );

  const selectedOptions = useMemo<SelectedProductOption[]>(() => product.options.map((group) => {
    const value = group.values.find((item) => item.label === selected[group.name]) ?? group.values[0];
    return { name: group.name, value: value?.label ?? "", priceDelta: value?.priceDelta ?? 0 };
  }).filter((option) => option.value), [product.options, selected]);

  const displayPrice = product.price + selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0);

  function buyNow() {
    if (sessionLoading || isAdmin) return;
    addItem(product, 1, selectedOptions);
    router.push("/checkout");
  }

  return (
    <div className="mt-6 sm:mt-7">
      {product.options.length ? (
        <div className="mb-5 grid gap-4 rounded-lg border bg-card p-4">
          {product.options.map((group) => (
            <div key={group.name}>
              <p className="text-sm font-extrabold">{group.name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.values.map((value) => {
                  const active = selected[group.name] === value.label;
                  return (
                    <button
                      key={value.label}
                      type="button"
                      onClick={() => setSelected((current) => ({ ...current, [group.name]: value.label }))}
                      className={`rounded-md border px-3 py-2 text-sm font-bold transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                    >
                      {value.label}
                      {value.priceDelta ? <span className="ml-1 text-xs opacity-80">{value.priceDelta > 0 ? "+" : ""}{formatBDT(value.priceDelta)}</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-sm font-bold text-muted-foreground">Selected price: <span className="text-foreground">{formatBDT(displayPrice)}</span></p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <AddToCartButton product={product} selectedOptions={selectedOptions} className="min-w-40 sm:min-w-44" />
        <button type="button" onClick={buyNow} disabled={sessionLoading || isAdmin || product.stock <= 0} className="inline-flex h-10 min-w-36 items-center justify-center rounded-md bg-accent px-4 text-sm font-extrabold text-accent-foreground transition hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground">
          {sessionLoading ? "Loading" : isAdmin ? "Admin only" : "Buy now"}
        </button>
      </div>
    </div>
  );
}
