import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL ?? "https://gadgetgallery-alpha.vercel.app";
  const [categories, products, brands] = await Promise.all([
    db.category.findMany({ select: { slug: true, createdAt: true } }),
    db.product.findMany({ select: { slug: true, updatedAt: true } }),
    db.product.findMany({
      where: { brand: { not: null } },
      select: { brand: true, updatedAt: true },
      distinct: ["brand"]
    })
  ]);

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/shop`, lastModified: new Date() },
    ...categories.map((category) => ({
      url: `${base}/category/${category.slug}`,
      lastModified: category.createdAt
    })),
    ...brands
      .filter((product): product is { brand: string; updatedAt: Date } => Boolean(product.brand))
      .map((product) => ({
        url: `${base}/brand/${slugify(product.brand)}`,
        lastModified: product.updatedAt
      })),
    ...products.map((product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: product.updatedAt
    }))
  ];
}
