import type { Prisma } from "@prisma/client";
import type { Product } from "@/lib/catalog";

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
  const primaryImage = imageUrls[0] ?? "/placeholder.svg";

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
    specs: toSpecs(product.specs)
  };
}
