"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type CategoryOption = {
  name: string;
  slug: string;
};

type FilterValues = {
  q?: string;
  category?: string;
  min?: string;
  max?: string;
  sort?: string;
};

export function ShopMobileFilters({ categories, initialValues }: { categories: CategoryOption[]; initialValues: FilterValues }) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-10 items-center gap-2 rounded-md border bg-card px-3 text-sm font-extrabold shadow-sm lg:hidden"
      >
        <SlidersHorizontal size={16} />
        Filters
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] bg-foreground/35 backdrop-blur-sm lg:hidden" onMouseDown={(event) => {
          if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) setOpen(false);
        }}>
          <div
            ref={sheetRef}
            className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-2xl border bg-card shadow-soft animate-in"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="font-display text-xl font-extrabold">Filters</p>
                <p className="text-xs font-semibold text-muted-foreground">Refine products without losing your place.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-md border hover:bg-muted" aria-label="Close filters">
                <X size={18} />
              </button>
            </div>
            <form className="max-h-[calc(86vh-73px)] space-y-5 overflow-y-auto px-4 py-5 pb-24">
              <label className="block text-sm font-semibold">
                Search
                <input name="q" defaultValue={initialValues.q} className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm font-semibold">
                Category
                <select name="category" defaultValue={initialValues.category ?? ""} className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm font-semibold">
                  Min
                  <input name="min" type="number" defaultValue={initialValues.min} className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
                </label>
                <label className="block text-sm font-semibold">
                  Max
                  <input name="max" type="number" defaultValue={initialValues.max} className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
                </label>
              </div>
              <label className="block text-sm font-semibold">
                Sort
                <select name="sort" defaultValue={initialValues.sort ?? ""} className="mt-2 h-11 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
                  <option value="">Recommended</option>
                  <option value="price-asc">Price low to high</option>
                  <option value="price-desc">Price high to low</option>
                  <option value="rating">Rating</option>
                  <option value="newest">Newest</option>
                </select>
              </label>
              <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-card p-4">
                <button className="h-11 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">Apply filters</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
