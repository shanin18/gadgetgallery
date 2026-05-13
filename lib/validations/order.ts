import { z } from "zod";

export const checkoutSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    productSlug: z.string().optional(),
    quantity: z.number().int().positive(),
    options: z.array(z.object({
      name: z.string(),
      value: z.string(),
      priceDelta: z.coerce.number().default(0)
    })).default([])
  })).min(1),
  couponCode: z.string().trim().min(3).max(40).optional(),
  paymentMethod: z.enum(["STRIPE", "PAYPAL", "SSLCOMMERZ", "COD"]),
  shippingAddress: z.object({
    name: z.string().min(2),
    phone: z.string().min(6),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().default("Bangladesh")
  })
});
