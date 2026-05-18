import type { Prisma } from "@prisma/client";
import type { Product, ProductOptionGroup } from "@/lib/catalog";

type ProductWithCatalogFields = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Prisma.Decimal | number;
  comparePrice: Prisma.Decimal | number | null;
  stock: number;
  brand: string | null;
  rating: number;
  reviewCount: number;
  featured: boolean;
  specs: Prisma.JsonValue | null;
  options?: Prisma.JsonValue | null;
  category: {
    name: string;
    slug: string;
  };
  images: {
    url: string;
  }[];
};

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value == null) return undefined;
  return Number(value);
}

function toOptions(value: Prisma.JsonValue | null | undefined): ProductOptionGroup[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((group) => {
      if (!group || typeof group !== "object" || Array.isArray(group)) return null;
      const record = group as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const values = Array.isArray(record.values)
        ? record.values
            .map((item) => {
              if (!item || typeof item !== "object" || Array.isArray(item)) return null;
              const valueRecord = item as Record<string, unknown>;
              const label = typeof valueRecord.label === "string" ? valueRecord.label.trim() : "";
              const priceDelta = Number(valueRecord.priceDelta ?? 0);
              return label ? { label, priceDelta: Number.isFinite(priceDelta) ? priceDelta : 0 } : null;
            })
            .filter((item): item is { label: string; priceDelta: number } => Boolean(item))
        : [];

      return name && values.length ? { name, values } : null;
    })
    .filter((group): group is ProductOptionGroup => Boolean(group));
}

function toSpecs(value: Prisma.JsonValue | null): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string | number | boolean] => ["string", "number", "boolean"].includes(typeof entry[1]))
      .map(([key, specValue]) => [key, String(specValue)])
  );
}

export function mapDbProduct(product: ProductWithCatalogFields): Product {
  const imageUrls = product.images.map((image) => image.url).filter(Boolean);
  const primaryImage = imageUrls[0] ?? "/brand/gadget-gallery-logo.png";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    comparePrice: toNumber(product.comparePrice),
    stock: product.stock,
    brand: product.brand ?? "",
    category: product.category.name,
    categorySlug: product.category.slug,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
    image: primaryImage,
    images: imageUrls,
    specs: toSpecs(product.specs),
    options: toOptions(product.options)
  };
}
