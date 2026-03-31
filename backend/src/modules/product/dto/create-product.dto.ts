import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: optionalString,
  price: z.number().positive("Price must be positive"),
  sku: z.string().min(1, "SKU is required").max(100),
  stock: z.number().int().min(0, "Stock cannot be negative").default(0),
  imageUrl: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().url("Must be a valid URL").optional()),
  categoryId: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().cuid("Must be a valid category ID").optional()),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
