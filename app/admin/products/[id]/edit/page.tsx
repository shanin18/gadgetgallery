import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, product] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: [{ isPrimary: "desc" }, { id: "asc" }] } }
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
        featured: product.featured,
        specs: product.specs && typeof product.specs === "object" && !Array.isArray(product.specs) ? Object.entries(product.specs).map(([key, value]) => ({ key, value: String(value) })) : [],
        imageUrls: product.images.map((image) => image.url),
        description: product.description
      }}
    />
  );
}
