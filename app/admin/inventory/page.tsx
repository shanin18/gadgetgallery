import { AdminSearch } from "@/components/admin/AdminSearch";
import { db } from "@/lib/db";

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const products = await db.product.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } },
            { brand: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } }
          ]
        }
      : undefined,
    orderBy: [{ stock: "asc" }, { name: "asc" }],
    include: { category: true }
  });

  return (
    <div className="min-w-0 md:bg-card md:p-5">
      <p className="text-sm font-bold uppercase text-primary">Stock control</p>
      <h2 className="font-display text-2xl font-extrabold">Inventory</h2>
      <div className="mt-5">
        <AdminSearch initialValue={query} placeholder="Search inventory" />
      </div>
      <div className="mt-5 grid gap-3">
        {products.map((product) => {
          const low = product.stock <= 10;
          return (
            <div key={product.id} className="grid min-w-0 gap-3 rounded-xl bg-card p-3 sm:grid-cols-[1fr_auto] sm:items-center sm:p-4 md:bg-background">
              <div className="min-w-0">
                <p className="truncate font-extrabold">{product.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">{product.category.name}</p>
              </div>
              <div className="grid gap-2 min-[420px]:flex min-[420px]:items-center min-[420px]:gap-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted min-[420px]:w-32">
                  <div className={low ? "h-full bg-destructive" : "h-full bg-primary"} style={{ width: `${Math.min(product.stock, 100)}%` }} />
                </div>
                <span className={low ? "font-extrabold text-destructive" : "font-extrabold"}>{product.stock} units</span>
              </div>
            </div>
          );
        })}
        {!products.length ? <p className="rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No inventory items found.</p> : null}
      </div>
    </div>
  );
}
