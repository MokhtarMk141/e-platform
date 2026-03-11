import { z } from "zod";

export const addItemSchema = z.object({
    productId: z.string().cuid(),
    quantity: z.number().int().min(1).default(1),
});

export type AddItemDto = z.infer<typeof addItemSchema>;

export const updateItemQuantitySchema = z.object({
    quantity: z.number().int().min(0),
});

export type UpdateItemQuantityDto = z.infer<typeof updateItemQuantitySchema>;
