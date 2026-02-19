import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions/app-error";

export function validateRequest(schema: ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return next(
        new AppError("Validation failed", 400, parsed.error.flatten().fieldErrors)
      );
    }

    req.body = parsed.data;
    next();
  };
}
