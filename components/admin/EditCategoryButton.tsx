"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

type EditCategoryButtonProps = {
  category: {
    id: string;
    name: string;
    image: string | null;
  };
};

function imageNameFromUrl(url: string | null) {
  if (!url) return "";
  const fileName = url.split("/").pop()?.split("?")[0] ?? "";
  return decodeURIComponent(fileName);
}

export function EditCategoryButton({ category }: EditCategoryButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [image, setImage] = useState(category.image ?? "");
  const [imageFileName, setImageFileName] = useState(imageNameFromUrl(category.image));
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  function openModal() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setMounted(true);
    window.requestAnimationFrame(() => setOpen(true));
  }

  function closeModal() {
    setOpen(false);
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setMounted(false);
      setError("");
      setName(category.name);
      setImage(category.image ?? "");
      setImageFileName(imageNameFromUrl(category.image));
    }, 220);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: image || null })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? "Could not update category.");
        return;
      }

      closeModal();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md bg-muted px-2 text-sm font-bold transition hover:bg-border md:w-auto"
      >
        <Pencil size={15} />
        Edit
      </button>
      {mounted ? (
        <div className={`fixed inset-0 z-[100] grid place-items-end bg-foreground/25 p-0 backdrop-blur-sm transition-opacity duration-200 sm:place-items-center sm:p-4 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}>
          <form
            onSubmit={submit}
            className={`w-full max-w-md rounded-t-xl border bg-card shadow-soft transition duration-200 ease-out sm:rounded-lg ${
              open ? "translate-y-0 scale-100 opacity-100" : "translate-y-full scale-[0.98] opacity-0 sm:translate-y-2"
            }`}
          >
            <div className="flex items-start justify-between gap-3 border-b p-4 sm:p-5">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-primary">Category</p>
                <h2 className="font-display text-xl font-extrabold">Edit category</h2>
              </div>
              <button type="button" onClick={closeModal} className="grid h-9 w-9 place-items-center rounded-md hover:bg-muted" aria-label="Close edit category">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 p-4 sm:p-5">
              <label className="block text-sm font-semibold">
                Category name
                <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
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
              {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm font-semibold text-destructive">{error}</p> : null}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t p-4 sm:flex-row sm:justify-end sm:p-5">
              <button type="button" onClick={closeModal} disabled={isPending} className="h-10 rounded-md border px-4 text-sm font-bold hover:bg-muted">
                Cancel
              </button>
              <button type="submit" disabled={isPending} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground disabled:pointer-events-none disabled:opacity-60">
                {isPending ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                Save changes
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
