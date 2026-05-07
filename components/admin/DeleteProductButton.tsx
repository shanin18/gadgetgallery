"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function deleteProduct() {
    if (!window.confirm(`Delete ${productName}? This cannot be undone.`)) return;
    setError("");

    startTransition(async () => {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
        return;
      }
      setError(data.error ?? "Product could not be deleted.");
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2 text-sm font-bold text-destructive transition hover:bg-destructive/10 disabled:pointer-events-none disabled:opacity-60"
        onClick={deleteProduct}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="animate-spin" size={15} /> : <Trash2 size={15} />}
        Delete
      </button>
      {error ? <span className="max-w-56 text-right text-xs font-semibold text-destructive">{error}</span> : null}
    </span>
  );
}
