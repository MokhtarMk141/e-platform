import { z } from "zod";

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(1).max(2000).optional(),
});

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
