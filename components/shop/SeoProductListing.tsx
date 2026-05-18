import { ShopMobileFilters } from "@/components/shop/ShopMobileFilters";
import { ShopProductGrid } from "@/components/shop/ShopProductGrid";
import { db } from "@/lib/db";
import { PRODUCT_PAGE_SIZE, PRODUCT_PAGE_WINDOW, productListInclude, productOrderBy, productWhere } from "@/lib/product-listing";
import { mapDbProduct } from "@/lib/product-mapper";

type SeoProductListingProps = {
  heading: string;
  description: string;
  searchParams: Record<string, string | string[] | undefined>;
  fixedCategory?: string;
  fixedBrand?: string;
  showFilters?: boolean;
};

function getParam(params: Record<string, string | string[] | undefined>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function SeoProductListing({ heading, description, searchParams, fixedCategory, fixedBrand, showFilters = true }: SeoProductListingProps) {
  const query = getParam(searchParams, "q")?.trim();
  const category = fixedCategory ?? getParam(searchParams, "category");
  const min = Number(getParam(searchParams, "min")) || undefined;
  const max = Number(getParam(searchParams, "max")) || undefined;
  const sort = getParam(searchParams, "sort");
  const page = Math.max(Number(getParam(searchParams, "page")) || 1, 1);
  const pageStart = (page - 1) * PRODUCT_PAGE_WINDOW;
  const productQueryString = new URLSearchParams();
  if (query) productQueryString.set("q", query);
  if (category) productQueryString.set("category", category);
  if (fixedBrand) productQueryString.set("brand", fixedBrand);
  if (getParam(searchParams, "min")) productQueryString.set("min", getParam(searchParams, "min")!);
  if (getParam(searchParams, "max")) productQueryString.set("max", getParam(searchParams, "max")!);
  if (sort) productQueryString.set("sort", sort);

  const where = productWhere({ q: query, category, brand: fixedBrand, min, max });
  const [categories, products, totalProducts] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    db.product.findMany({
      where,
      orderBy: productOrderBy(sort),
      skip: pageStart,
      take: PRODUCT_PAGE_SIZE + 1,
      include: productListInclude
    }),
    db.product.count({ where })
  ]);
  const initialProducts = products.slice(0, PRODUCT_PAGE_SIZE).map(mapDbProduct);
  const pageEnd = Math.min(pageStart + PRODUCT_PAGE_WINDOW, totalProducts);
  const hasMore = pageStart + initialProducts.length < pageEnd;
  const totalPages = Math.max(Math.ceil(totalProducts / PRODUCT_PAGE_WINDOW), 1);

  return (
    <div className="container-page grid gap-8 py-6 lg:grid-cols-[260px_1fr] lg:py-10">
      {showFilters ? (
        <aside className="hidden h-fit rounded-lg border bg-card p-5 lg:block">
          <h1 className="font-display text-2xl font-extrabold">Shop</h1>
          <form className="mt-5 space-y-5">
            <label className="block text-sm font-semibold">
              Search
              <input name="q" defaultValue={getParam(searchParams, "q")} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
            </label>
            {!fixedCategory ? (
              <label className="block text-sm font-semibold">
                Category
                <select name="category" defaultValue={getParam(searchParams, "category") ?? ""} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
                  <option value="">All categories</option>
                  {categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                </select>
              </label>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">
                Min
                <input name="min" type="number" defaultValue={getParam(searchParams, "min")} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
              </label>
              <label className="block text-sm font-semibold">
                Max
                <input name="max" type="number" defaultValue={getParam(searchParams, "max")} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
              </label>
            </div>
            <label className="block text-sm font-semibold">
              Sort
              <select name="sort" defaultValue={getParam(searchParams, "sort") ?? ""} className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary">
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
      ) : null}
      <section className={showFilters ? undefined : "lg:col-span-2"}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{heading}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {showFilters ? <ShopMobileFilters categories={categories} initialValues={{ q: getParam(searchParams, "q"), category: getParam(searchParams, "category"), min: getParam(searchParams, "min"), max: getParam(searchParams, "max"), sort: getParam(searchParams, "sort") }} /> : null}
        </div>
        <ShopProductGrid
          key={`${productQueryString.toString()}-${page}`}
          initialProducts={initialProducts}
          initialHasMore={hasMore}
          queryString={productQueryString.toString()}
          initialOffset={pageStart + initialProducts.length}
          pageEndOffset={pageEnd}
          currentPage={page}
          totalPages={totalPages}
        />
      </section>
    </div>
  );
}
