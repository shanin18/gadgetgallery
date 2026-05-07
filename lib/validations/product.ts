import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.coerce.number().positive(),
  comparePrice: z.union([z.coerce.number().positive(), z.null()]).optional(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1),
  brand: z.string().optional(),
  featured: z.coerce.boolean().default(false),
  specs: z.record(z.string(), z.string()).default({}),
  images: z.array(z.string().url()).default([])
});
