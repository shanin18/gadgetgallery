"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: image || undefined })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error ?? "Could not create category.");
        return;
      }

      setName("");
      setImage("");
      setMessage("Category created.");
      router.refresh();
    });
  }

  return (
    <form className="rounded-lg border bg-background p-4" onSubmit={submit}>
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
        <label className="block text-sm font-semibold">
          Category name
          <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-card px-3 outline-none focus:border-primary" />
        </label>
        <ImageUploadField label="Category image" value={image} onChange={setImage} />
        <Button className="min-w-32" disabled={isPending}>
          {isPending ? <Loader2 className="animate-spin" size={17} /> : <Plus size={17} />}
          Add
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm font-semibold text-muted-foreground">{message}</p> : null}
    </form>
  );
}
