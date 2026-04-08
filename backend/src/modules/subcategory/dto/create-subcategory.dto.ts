import { z } from "zod";

export const createSubcategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  categoryId: z.string().cuid("Must be a valid category ID"),
});

export type CreateSubcategoryDto = z.infer<typeof createSubcategorySchema>;
