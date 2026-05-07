import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  return <ProductForm title="Add product" categories={categories} />;
}
