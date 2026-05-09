"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, Loader2, Plus, X, XCircle } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setToast(null);

    startTransition(async () => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: image || undefined })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setToast({ type: "error", message: data.error ?? "Could not create category." });
        return;
      }

      setName("");
      setImage("");
      setImageFileName("");
      setToast({ type: "success", message: "Category created." });
      router.refresh();
    });
  }

  return (
    <form className="rounded-xl bg-card p-3 sm:p-4 md:bg-background" onSubmit={submit}>
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block text-sm font-semibold">
          Category name
          <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary" />
        </label>
        <ImageUploadField
          label="Category image"
          value={image}
          fileName={imageFileName}
          onChange={(url, fileName) => {
            setImage(url);
            setImageFileName(fileName);
          }}
        />
        <Button className="w-full min-w-32 lg:w-auto" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
          Add
        </Button>
      </div>
      {toast ? (
        <div className="fixed bottom-24 right-4 z-[80] w-[min(360px,calc(100vw-32px))] rounded-lg border bg-card p-4 shadow-soft sm:bottom-5 sm:right-5">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 ${toast.type === "success" ? "text-primary" : "text-destructive"}`}>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
            </span>
            <p className="flex-1 text-sm font-semibold">{toast.message}</p>
            <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-muted" onClick={() => setToast(null)} aria-label="Close notification">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
