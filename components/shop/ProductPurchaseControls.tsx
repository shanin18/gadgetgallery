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
    <>
      <div className="mt-5 flex items-end gap-2 sm:mt-6 sm:gap-3">
        <p className="font-display text-2xl font-extrabold sm:text-3xl">{formatBDT(displayPrice)}</p>
        {product.comparePrice ? <p className="text-sm text-muted-foreground line-through sm:text-lg">{formatBDT(product.comparePrice)}</p> : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground sm:mt-5 sm:text-base sm:leading-7">{product.description}</p>
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
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <AddToCartButton product={product} selectedOptions={selectedOptions} className="min-w-40 sm:min-w-44" />
        <button type="button" onClick={buyNow} disabled={sessionLoading || isAdmin || product.stock <= 0} className="inline-flex h-10 min-w-36 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:bg-muted disabled:text-muted-foreground">
          {sessionLoading ? "Loading" : isAdmin ? "Admin only" : "Buy now"}
        </button>
      </div>
    </div>
    </>
  );
}
