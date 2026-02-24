import { z } from "zod";

export const UpdateUserDto = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email").optional(),
});

export type UpdateUserDtoType = z.infer<typeof UpdateUserDto>;
