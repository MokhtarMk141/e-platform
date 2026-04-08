import { z } from "zod";

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

export const generateProductContentSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255),
  sku: optionalTrimmedString,
  categoryName: optionalTrimmedString,
  subcategoryName: optionalTrimmedString,
  brandName: optionalTrimmedString,
  price: z.number().positive("Price must be positive").optional(),
  stock: z.number().int().min(0, "Stock cannot be negative").optional(),
});

export type GenerateProductContentDto = z.infer<
  typeof generateProductContentSchema
>;
