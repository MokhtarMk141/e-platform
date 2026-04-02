import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

export const createBrandSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: optionalString,
  logoUrl: z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  }, z.string().optional()),
});

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
