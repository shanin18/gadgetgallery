import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { categories, filterProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop Gadgets",
  description: "Browse GadgetGallery gadgets and accessories."
};

export default function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <ShopContent searchParams={searchParams} />;
}

async function ShopContent({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const get = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const result = filterProducts({
    q: get("q"),
    category: get("category"),
    min: Number(get("min")) || undefined,
    max: Number(get("max")) || undefined,
    sort: get("sort")
  });

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-lg border bg-card p-5">
        <h1 className="font-display text-2xl font-extrabold">Shop</h1>
        <form className="mt-5 space-y-5">
          <label className="block text-sm font-semibold">
            Search
            <input name="q" defaultValue={get("q")} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold">
            Category
            <select name="category" defaultValue={get("category") ?? ""} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
              <option value="">All categories</option>
              {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold">
              Min
              <input name="min" type="number" defaultValue={get("min")} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
            </label>
            <label className="block text-sm font-semibold">
              Max
              <input name="max" type="number" defaultValue={get("max")} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
            </label>
          </div>
          <label className="block text-sm font-semibold">
            Sort
            <select name="sort" defaultValue={get("sort") ?? ""} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
              <option value="">Recommended</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </label>
          <button className="h-10 w-full rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground">Apply filters</button>
        </form>
      </aside>
      <section>
        <div className="mb-5 flex items-center justify-between">
          <p className="font-semibold">{result.length} products</p>
          <p className="text-sm text-muted-foreground">Server-side URL filters</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {result.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}
