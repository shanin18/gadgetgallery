import type { Metadata } from "next";
import { ProductCard } from "@/components/shop/ProductCard";
import { ShopMobileFilters } from "@/components/shop/ShopMobileFilters";
import { db } from "@/lib/db";
import { mapDbProduct } from "@/lib/product-mapper";

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
  const query = get("q")?.trim();
  const category = get("category");
  const min = Number(get("min")) || undefined;
  const max = Number(get("max")) || undefined;
  const sort = get("sort");
  const [categories, products] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    db.product.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
                { brand: { contains: query, mode: "insensitive" } }
              ]
            }
          : {}),
        ...(category ? { category: { slug: category } } : {}),
        ...(min || max ? { price: { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) } } : {})
      },
      orderBy:
        sort === "price-asc"
          ? { price: "asc" }
          : sort === "price-desc"
            ? { price: "desc" }
            : sort === "rating"
              ? { rating: "desc" }
              : sort === "newest"
                ? { createdAt: "desc" }
                : { featured: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] }
      }
    })
  ]);
  const result = products.map(mapDbProduct);

  const filterForm = (
    <form className="space-y-5">
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
  );

  return (
    <div className="container-page grid gap-8 py-6 lg:grid-cols-[260px_1fr] lg:py-10">
      <aside className="hidden h-fit rounded-lg border bg-card p-5 lg:block">
        <h1 className="font-display text-2xl font-extrabold">Shop</h1>
        <div className="mt-5">{filterForm}</div>
      </aside>
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold lg:hidden">Shop</h1>
            <p className="mt-1 font-semibold lg:mt-0">{result.length} products</p>
          </div>
          <ShopMobileFilters categories={categories} initialValues={{ q: get("q"), category: get("category"), min: get("min"), max: get("max"), sort: get("sort") }} />
          <p className="hidden text-sm text-muted-foreground lg:block">Server-side URL filters</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
          {result.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
        {!result.length ? <p className="rounded-lg border bg-card p-5 text-sm font-semibold text-muted-foreground">No products found.</p> : null}
      </section>
    </div>
  );
}
