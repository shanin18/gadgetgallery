import { products } from "@/lib/catalog";

export default function AdminInventoryPage() {
  return <div className="rounded-lg border bg-card p-5"><h2 className="font-display text-2xl font-extrabold">Inventory</h2><div className="mt-4 grid gap-2">{products.map((product) => <p key={product.id} className="flex justify-between rounded-md bg-muted p-3 text-sm font-semibold"><span>{product.name}</span><span>{product.stock} units</span></p>)}</div></div>;
}
