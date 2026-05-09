import Image from "next/image";
import { AdminSearch } from "@/components/admin/AdminSearch";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { EditCategoryButton } from "@/components/admin/EditCategoryButton";
import { db } from "@/lib/db";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const queryValue = params.q;
  const query = (Array.isArray(queryValue) ? queryValue[0] : queryValue)?.trim() ?? "";
  const categories = await db.category.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { slug: { contains: query, mode: "insensitive" } }
          ]
        }
      : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true, children: true } } }
  });

  return (
    <div className="min-w-0 md:bg-card md:p-5">
      <p className="text-sm font-bold uppercase text-primary">Catalog structure</p>
      <h2 className="font-display text-2xl font-extrabold">Categories</h2>
      <div className="mt-5 grid gap-4">
        <CategoryForm />
        <AdminSearch initialValue={query} placeholder="Search categories" />
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="flex min-w-0 gap-3 rounded-xl bg-card p-3 sm:p-4 md:bg-background">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
              {category.image ? <Image src={category.image} alt={category.name} fill sizes="64px" className="object-cover" /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold">{category.name}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{category.slug}</p>
              <div className="mt-3 grid gap-2">
                <p className="text-sm font-semibold">{category._count.products} products</p>
                <div className="grid grid-cols-2 gap-2">
                  <EditCategoryButton category={{ id: category.id, name: category.name, image: category.image }} />
                  <ConfirmDeleteButton endpoint={`/api/categories/${category.id}`} itemName={category.name} />
                </div>
              </div>
            </div>
          </div>
        ))}
        {!categories.length ? <p className="rounded-md bg-muted p-4 text-sm font-semibold text-muted-foreground sm:col-span-2 xl:col-span-3">No categories found.</p> : null}
      </div>
    </div>
  );
}
