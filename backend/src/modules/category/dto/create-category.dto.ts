import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9-]+$/, "Slug must be in kebab-case (a-z, 0-9, -)"),
  description: z.string().optional(),
  parentId: z.string().optional().nullable(),
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
