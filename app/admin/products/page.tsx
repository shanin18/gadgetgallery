import Link from "next/link";
import { products } from "@/lib/catalog";
import { formatBDT } from "@/lib/utils";

export default function AdminProductsPage() {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-extrabold">Products</h2>
        <Link href="/admin/products/new" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Add product</Link>
      </div>
      <div className="mt-5 overflow-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="border-b text-muted-foreground"><tr><th className="py-3">Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="py-4 font-bold">{product.name}</td>
                <td>{product.category}</td>
                <td>{formatBDT(product.price)}</td>
                <td>{product.stock}</td>
                <td><Link href={`/admin/products/${product.id}/edit`} className="font-bold text-primary">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
