import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { db } from "@/lib/db";
import { formatBDT } from "@/lib/utils";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
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
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }], take: 1 }
    }
  });

  return (
    <div className="min-w-0 md:bg-card md:p-5">
      <div>
        <div>
          <p className="text-sm font-bold uppercase text-primary">Catalog</p>
          <h2 className="font-display text-2xl font-extrabold">Products</h2>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_44px] gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <AdminSearch initialValue={query} placeholder="Search products" />
        <Link href="/admin/products/new" className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-bold text-primary-foreground sm:px-4">
          <Plus size={17} />
          <span className="sr-only sm:not-sr-only">Add product</span>
        </Link>
      </div>

      <div className="mt-5 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-3">Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length ? products.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                      {product.images[0]?.url ? <Image src={product.images[0].url} alt={product.name} fill sizes="48px" className="object-cover" /> : null}
                    </div>
                    <div>
                      <p className="font-extrabold">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td>{product.category.name}</td>
                <td>{formatBDT(Number(product.price))}</td>
                <td>{product.stock}</td>
                <td><span className="rounded-md bg-muted px-2 py-1 text-xs font-extrabold">{product.featured ? "Featured" : "Standard"}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${product.id}/edit`} className="rounded-md px-2 py-1 font-bold text-primary hover:bg-muted">Edit</Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm font-semibold text-muted-foreground">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid min-w-0 gap-3 md:hidden">
        {products.map((product) => (
          <div key={product.id} className="min-w-0 rounded-xl bg-card p-3">
            <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-3">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                {product.images[0]?.url ? <Image src={product.images[0].url} alt={product.name} fill sizes="64px" className="object-cover" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="block w-full truncate font-extrabold leading-5">{product.name}</p>
                <p className="mt-1 block w-full truncate text-sm text-muted-foreground">{product.category.name}</p>
                <div className="mt-3 flex min-w-0 flex-wrap items-center gap-2 text-sm">
                  <span className="font-display font-extrabold leading-none">{formatBDT(Number(product.price))}</span>
                  <span className="w-fit rounded-md bg-muted px-2 py-1 text-xs font-bold">{product.stock} in stock</span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2">
              <Link href={`/admin/products/${product.id}/edit`} className="inline-flex h-9 min-w-0 items-center justify-center rounded-md bg-muted text-sm font-bold hover:bg-border">
                Edit
              </Link>
              <DeleteProductButton productId={product.id} productName={product.name} />
            </div>
          </div>
        ))}
        {!products.length ? <p className="rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground">No products found.</p> : null}
      </div>
    </div>
  );
}
