"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react";

export function ConfirmDeleteButton({
  endpoint,
  itemName,
  label = "Delete"
}: {
  endpoint: string;
  itemName: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    setError("");

    startTransition(async () => {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not delete this item.");
        return;
      }

      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2 text-sm font-bold text-destructive transition hover:bg-destructive/10"
        onClick={() => setOpen(true)}
      >
        <Trash2 size={15} />
        {label}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-foreground/25 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card shadow-soft">
            <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3 border-b p-5 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
                <AlertTriangle size={20} />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-extrabold">Delete item?</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  This will permanently delete <span className="font-bold text-foreground">{itemName}</span>. This action cannot be undone.
                </p>
              </div>
              <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => setOpen(false)} aria-label="Close confirmation">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              {error ? <p className="mb-4 rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" className="h-10 rounded-md border px-4 text-sm font-bold hover:bg-muted" onClick={() => setOpen(false)} disabled={isPending}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-destructive px-4 text-sm font-bold text-white disabled:pointer-events-none disabled:opacity-60"
                  onClick={confirmDelete}
                  disabled={isPending}
                >
                  {isPending ? <Loader2 className="animate-spin" size={17} /> : <Trash2 size={17} />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
