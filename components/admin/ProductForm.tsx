import { Button } from "@/components/ui/Button";

export function ProductForm({ title, productId }: { title: string; productId?: string }) {
  return (
    <form className="rounded-lg border bg-card p-5">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {productId ? <p className="mt-1 text-sm text-muted-foreground">Product ID: {productId}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {["Name", "Slug", "Brand", "Category ID", "Price", "Compare price", "Stock", "Image URL"].map((label) => (
          <label key={label} className="block text-sm font-semibold">
            {label}
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 outline-none focus:border-primary" />
          </label>
        ))}
        <label className="block text-sm font-semibold sm:col-span-2">
          Description
          <textarea className="mt-2 min-h-32 w-full rounded-md border bg-background p-3 outline-none focus:border-primary" />
        </label>
      </div>
      <Button className="mt-5">Save product</Button>
    </form>
  );
}
