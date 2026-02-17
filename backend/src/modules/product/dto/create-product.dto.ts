import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  sku: z.string().min(1, "SKU is required").max(100),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  imageUrl: z.string().url("Must be a valid URL").optional(),
  categoryId: z.string().cuid("Must be a valid category ID").optional(),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;