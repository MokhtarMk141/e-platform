import { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions/app-error";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
  });
}
