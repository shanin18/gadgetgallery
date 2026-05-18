import type { Prisma } from "@prisma/client";

export const PRODUCT_PAGE_SIZE = 8;
export const PRODUCT_PAGE_WINDOW = 48;

type ProductFilters = {
  q?: string;
  category?: string;
  brand?: string;
  min?: number;
  max?: number;
  sort?: string;
};

export function productWhere({ q, category, brand, min, max }: ProductFilters): Prisma.ProductWhereInput {
  return {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { brand: { contains: q, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(category ? { category: { slug: category } } : {}),
    ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
    ...(min || max ? { price: { ...(min ? { gte: min } : {}), ...(max ? { lte: max } : {}) } } : {})
  };
}

export function productOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput[] {
  if (sort === "price-asc") return [{ price: "asc" }, { createdAt: "desc" }, { id: "asc" }];
  if (sort === "price-desc") return [{ price: "desc" }, { createdAt: "desc" }, { id: "asc" }];
  if (sort === "rating") return [{ rating: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }, { id: "asc" }];
  if (sort === "newest") return [{ createdAt: "desc" }, { id: "asc" }];
  return [{ featured: "desc" }, { createdAt: "desc" }, { id: "asc" }];
}

export const productListInclude = {
  category: { select: { name: true, slug: true } },
  images: { orderBy: [{ isPrimary: "desc" as const }, { id: "asc" as const }], take: 1 }
};
