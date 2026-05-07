import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }], take: 1 } }
    })
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      title="Edit product"
      categories={categories}
      product={{
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand ?? "",
        categoryId: product.categoryId,
        price: String(product.price),
        comparePrice: product.comparePrice ? String(product.comparePrice) : "",
        stock: String(product.stock),
        imageUrl: product.images[0]?.url ?? "",
        description: product.description
      }}
    />
  );
}
