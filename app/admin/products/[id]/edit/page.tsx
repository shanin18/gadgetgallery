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
        options: Array.isArray(product.options)
          ? product.options
              .map((group) => {
                if (!group || typeof group !== "object" || Array.isArray(group)) return null;
                const record = group as Record<string, unknown>;
                return {
                  name: typeof record.name === "string" ? record.name : "",
                  values: Array.isArray(record.values)
                    ? record.values.map((value) => {
                        const valueRecord = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
                        return {
                          label: typeof valueRecord.label === "string" ? valueRecord.label : "",
                          priceDelta: String(valueRecord.priceDelta ?? "0")
                        };
                      })
                    : []
                };
              })
              .filter((group): group is { name: string; values: { label: string; priceDelta: string }[] } => Boolean(group))
          : [],
        imageUrls: product.images.map((image) => image.url),
        description: product.description
      }}
    />
  );
}
