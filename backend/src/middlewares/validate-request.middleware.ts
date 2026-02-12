import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: parsed.error.flatten().fieldErrors,
      });
    }

    req.body = parsed.data;
    next();
  };
}
