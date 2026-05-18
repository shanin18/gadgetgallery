import { z } from "zod";

const allowedImageHosts = new Set([
  "images.unsplash.com",
  "res.cloudinary.com",
  "img.drz.lazcdn.com",
  "lh3.googleusercontent.com"
]);

const safeImageUrl = z.string().url().refine((value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedImageHosts.has(url.hostname);
  } catch {
    return false;
  }
}, "Use a secure image URL from an approved image host.");

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug."),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().positive().max(10_000_000),
  comparePrice: z.union([z.coerce.number().positive().max(10_000_000), z.null()]).optional(),
  stock: z.coerce.number().int().min(0).max(1_000_000),
  categoryId: z.string().min(1),
  brand: z.string().trim().max(80).optional(),
  featured: z.coerce.boolean().default(false),
  specs: z.record(z.string().trim().max(60), z.string().trim().max(240)).default({}),
  options: z.array(z.object({
    name: z.string().trim().min(1).max(60),
    values: z.array(z.object({
      label: z.string().trim().min(1).max(80),
      priceDelta: z.coerce.number().min(-10_000_000).max(10_000_000).default(0)
    })).min(1)
  })).max(12).default([]),
  images: z.array(safeImageUrl).max(12).default([])
});
