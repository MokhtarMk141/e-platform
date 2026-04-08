import { z } from "zod";
import { createSubcategorySchema } from "./create-subcategory.dto";

export const updateSubcategorySchema = createSubcategorySchema.partial();

export type UpdateSubcategoryDto = z.infer<typeof updateSubcategorySchema>;
