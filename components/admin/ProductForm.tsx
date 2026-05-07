"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Button } from "@/components/ui/Button";

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormValue = {
  id?: string;
  name: string;
  slug: string;
  brand: string;
  categoryId: string;
  price: string;
  comparePrice: string;
  stock: string;
  imageUrl: string;
  description: string;
};

const emptyProduct: ProductFormValue = {
  name: "",
  slug: "",
  brand: "",
  categoryId: "",
  price: "",
  comparePrice: "",
  stock: "0",
  imageUrl: "",
  description: ""
};

export function ProductForm({ title, categories, product }: { title: string; categories: CategoryOption[]; product?: ProductFormValue }) {
  const router = useRouter();
  const [form, setForm] = useState(product ?? { ...emptyProduct, categoryId: categories[0]?.id ?? "" });
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof ProductFormValue, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const payload = {
        name: form.name,
        slug: form.slug,
        brand: form.brand || undefined,
        categoryId: form.categoryId,
        price: form.price,
        comparePrice: form.comparePrice || undefined,
        stock: form.stock,
        description: form.description,
        images: form.imageUrl ? [form.imageUrl] : []
      };
      const res = await fetch(product?.id ? `/api/products/${product.id}` : "/api/products", {
        method: product?.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data.error ? "Could not save product. Check the form values." : "Could not save product.");
        return;
      }

      setMessage("Product saved.");
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form className="rounded-lg border bg-card p-5 shadow-sm" onSubmit={submit}>
      <p className="text-sm font-bold uppercase text-primary">Catalog</p>
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Name
          <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Slug
          <input value={form.slug} onChange={(event) => updateField("slug", event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Brand
          <input value={form.brand} onChange={(event) => updateField("brand", event.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Category
          <select value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} required className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Price
          <input value={form.price} onChange={(event) => updateField("price", event.target.value)} required min={0} type="number" step="0.01" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Compare price
          <input value={form.comparePrice} onChange={(event) => updateField("comparePrice", event.target.value)} min={0} type="number" step="0.01" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Stock
          <input value={form.stock} onChange={(event) => updateField("stock", event.target.value)} required min={0} type="number" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <ImageUploadField label="Product image" value={form.imageUrl} onChange={(url) => updateField("imageUrl", url)} />
        <label className="block text-sm font-semibold sm:col-span-2">
          Description
          <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required minLength={10} className="mt-2 min-h-32 w-full rounded-md border bg-background p-3 outline-none focus:border-primary" />
        </label>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : <span />}
        <Button className="min-w-36" disabled={isPending}>
          <Save size={17} />
          {isPending ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}
