import { z } from "zod";

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginDtoType = z.infer<typeof LoginDto>;
