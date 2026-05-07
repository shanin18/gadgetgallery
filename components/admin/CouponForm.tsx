"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

function generateCode() {
  return `GG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function CouponForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code || undefined,
          type: formData.get("type"),
          discount: formData.get("discount"),
          minOrder: formData.get("minOrder") || undefined,
          maxUses: formData.get("maxUses") || undefined,
          expiresAt: formData.get("expiresAt") || undefined
        })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error ?? "Could not create coupon.");
        return;
      }

      setCode("");
      event.currentTarget.reset();
      setMessage("Coupon created.");
      router.refresh();
    });
  }

  return (
    <form className="rounded-lg border bg-background p-4" onSubmit={submit}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] xl:items-end">
        <label className="block text-sm font-semibold">
          Code
          <div className="mt-2 flex h-10 rounded-md border bg-card">
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} name="code" className="min-w-0 flex-1 bg-transparent px-3 outline-none" />
            <button type="button" onClick={() => setCode(generateCode())} className="grid w-10 place-items-center border-l text-primary hover:bg-muted" aria-label="Generate coupon code">
              <Wand2 size={17} />
            </button>
          </div>
        </label>
        <label className="block text-sm font-semibold">
          Type
          <select name="type" className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary">
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Discount
          <input name="discount" required min="0.01" step="0.01" type="number" className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Min order
          <input name="minOrder" min="0" step="0.01" type="number" className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Max uses
          <input name="maxUses" min="1" type="number" className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Expiry
          <input name="expiresAt" type="date" className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary" />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : <span />}
        <Button className="min-w-36" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
          Add coupon
        </Button>
      </div>
    </form>
  );
}
