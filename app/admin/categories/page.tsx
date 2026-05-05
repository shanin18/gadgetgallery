import { categories } from "@/lib/catalog";

export default function AdminCategoriesPage() {
  return <div className="rounded-lg border bg-card p-5"><h2 className="font-display text-2xl font-extrabold">Categories</h2><div className="mt-4 grid gap-2">{categories.map((category) => <p key={category.slug} className="rounded-md bg-muted p-3 font-semibold">{category.name}</p>)}</div></div>;
}
