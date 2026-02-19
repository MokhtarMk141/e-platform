import { Request, Response, NextFunction } from "express";
import { AppError } from "../exceptions/app-error";

export function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      error: err.details ?? err.message,
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: "Internal Server Error",
  });
}
