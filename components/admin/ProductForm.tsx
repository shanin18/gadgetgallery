"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ImageUp, Loader2, Plus, Save, Star, Trash2, X } from "lucide-react";
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
  featured: boolean;
  specs: { key: string; value: string }[];
  imageUrls: string[];
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
  featured: false,
  specs: [],
  imageUrls: [],
  description: ""
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ title, categories, product }: { title: string; categories: CategoryOption[]; product?: ProductFormValue }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(product ?? emptyProduct);
  const [slugTouched, setSlugTouched] = useState(Boolean(product?.slug));
  const [dealEnabled, setDealEnabled] = useState(Boolean(product?.comparePrice));
  const [message, setMessage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateField(field: keyof ProductFormValue, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateFeatured(value: boolean) {
    setForm((current) => ({ ...current, featured: value }));
  }

  function addSpec() {
    setForm((current) => ({ ...current, specs: [...current.specs, { key: "", value: "" }] }));
  }

  function updateSpec(index: number, field: "key" | "value", value: string) {
    setForm((current) => ({
      ...current,
      specs: current.specs.map((spec, specIndex) => (specIndex === index ? { ...spec, [field]: value } : spec))
    }));
  }

  function removeSpec(index: number) {
    setForm((current) => ({ ...current, specs: current.specs.filter((_, specIndex) => specIndex !== index) }));
  }

  function updateName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugTouched ? current.slug : slugify(value)
    }));
  }

  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;

    setMessage(null);
    setIsUploading(true);

    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const dataUrl = await fileToDataUrl(file);
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: dataUrl })
          });
          const data = await res.json();

          if (!res.ok || !data.url) {
            throw new Error(data.error ?? "Image upload failed.");
          }

          return data.url as string;
        })
      );

      setForm((current) => ({ ...current, imageUrls: [...current.imageUrls, ...uploadedUrls] }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(index: number) {
    setForm((current) => ({ ...current, imageUrls: current.imageUrls.filter((_, itemIndex) => itemIndex !== index) }));
  }

  function setThumbnail(index: number) {
    setForm((current) => {
      const nextImages = [...current.imageUrls];
      const [selectedImage] = nextImages.splice(index, 1);
      return { ...current, imageUrls: [selectedImage, ...nextImages] };
    });
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
        comparePrice: dealEnabled && form.comparePrice ? form.comparePrice : null,
        stock: form.stock,
        featured: form.featured,
        specs: Object.fromEntries(form.specs.filter((spec) => spec.key.trim() && spec.value.trim()).map((spec) => [spec.key.trim(), spec.value.trim()])),
        description: form.description,
        images: form.imageUrls
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
    <form className="min-w-0 md:bg-card md:p-5" onSubmit={submit}>
      <p className="text-sm font-bold uppercase text-primary">Catalog</p>
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold">
          Name
          <input value={form.name} onChange={(event) => updateName(event.target.value)} required minLength={2} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Slug
          <input
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              updateField("slug", slugify(event.target.value));
            }}
            required
            minLength={2}
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary"
          />
        </label>
        <label className="block text-sm font-semibold">
          Brand
          <input value={form.brand} onChange={(event) => updateField("brand", event.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <label className="block text-sm font-semibold">
          Category
          <select value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)} required className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
            <option value="" disabled>Select category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Price
          <input value={form.price} onChange={(event) => updateField("price", event.target.value)} required min={0} type="number" step="0.01" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <div className="block text-sm font-semibold">
          Compare price
          <input
            value={form.comparePrice}
            onChange={(event) => {
              updateField("comparePrice", event.target.value);
              if (event.target.value) setDealEnabled(true);
            }}
            min={0}
            type="number"
            step="0.01"
            disabled={!dealEnabled}
            className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary disabled:bg-muted disabled:text-muted-foreground"
          />
        </div>
        <label className="block text-sm font-semibold">
          Stock
          <input value={form.stock} onChange={(event) => updateField("stock", event.target.value)} required min={0} type="number" className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
        </label>
        <div className="rounded-xl bg-card p-3 sm:col-span-2 sm:p-4 md:bg-background">
          <p className="text-sm font-extrabold">Badges</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-10 items-center gap-3 rounded-md border px-3 text-sm font-semibold">
              <input type="checkbox" checked={form.featured} onChange={(event) => updateFeatured(event.target.checked)} className="h-4 w-4 accent-primary" />
              Featured product
            </label>
            <label className="flex min-h-10 items-center gap-3 rounded-md border px-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={dealEnabled}
                onChange={(event) => {
                  setDealEnabled(event.target.checked);
                  if (!event.target.checked) updateField("comparePrice", "");
                }}
                className="h-4 w-4 accent-primary"
              />
              Deal badge
            </label>
          </div>
        </div>
        <div className="block text-sm font-semibold">
          Product images
          <button
            type="button"
            className="mt-2 flex h-10 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border bg-background px-3 text-left outline-none transition hover:bg-muted disabled:opacity-60"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="shrink-0 animate-spin text-primary" size={17} /> : <ImageUp className="shrink-0 text-primary" size={17} />}
            <span className="block min-w-0 flex-1 truncate text-sm font-semibold text-muted-foreground">
              {isUploading ? "Uploading images..." : "Upload images"}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => {
              uploadImages(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
        {form.imageUrls.length ? (
          <div className="grid gap-3 sm:col-span-2 min-[420px]:grid-cols-2 lg:grid-cols-4">
            {form.imageUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border bg-background">
                <div className="relative aspect-square bg-muted">
                  <Image src={url} alt={`${form.name || "Product"} image ${index + 1}`} fill sizes="(min-width: 1024px) 180px, 50vw" className="object-cover" />
                  {index === 0 ? <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-extrabold text-primary-foreground">Thumbnail</span> : null}
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-bold hover:bg-muted disabled:cursor-default disabled:opacity-60"
                    onClick={() => setThumbnail(index)}
                    disabled={index === 0}
                  >
                    <Star size={14} />
                    Primary
                  </button>
                  <button type="button" className="inline-flex h-9 items-center justify-center gap-1 rounded-md border text-xs font-bold text-destructive hover:bg-destructive/10" onClick={() => removeImage(index)}>
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <label className="block text-sm font-semibold sm:col-span-2">
          Description
          <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} required minLength={10} className="mt-2 min-h-32 w-full rounded-md border bg-background p-3 outline-none focus:border-primary" />
        </label>
        <div className="rounded-xl bg-card p-3 sm:col-span-2 sm:p-4 md:bg-background">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold">Specifications</p>
              <p className="mt-1 text-xs font-semibold text-muted-foreground">Add details like material, fit, warranty, battery, or size.</p>
            </div>
            <button type="button" onClick={addSpec} className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold hover:bg-muted sm:w-auto">
              <Plus size={16} />
              Add spec
            </button>
          </div>
          <div className="mt-4 grid gap-3">
            {form.specs.map((spec, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={spec.key} onChange={(event) => updateSpec(index, "key", event.target.value)} placeholder="Name" className="h-10 rounded-md border bg-card px-3 text-sm font-semibold outline-none focus:border-primary" />
                <input value={spec.value} onChange={(event) => updateSpec(index, "value", event.target.value)} placeholder="Value" className="h-10 rounded-md border bg-card px-3 text-sm font-semibold outline-none focus:border-primary" />
                <button type="button" onClick={() => removeSpec(index)} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold text-destructive hover:bg-destructive/10">
                  <X size={16} />
                  Remove
                </button>
              </div>
            ))}
            {!form.specs.length ? <p className="rounded-md bg-muted p-3 text-sm font-semibold text-muted-foreground">No specifications added.</p> : null}
          </div>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : <span />}
        <Button className="w-full min-w-36 sm:w-auto" disabled={isPending}>
          <Save size={17} />
          {isPending ? "Saving..." : "Save product"}
        </Button>
      </div>
    </form>
  );
}
