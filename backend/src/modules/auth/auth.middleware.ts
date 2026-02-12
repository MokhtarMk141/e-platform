import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../../exceptions/app-error";

export interface AuthRequest extends Request {
  user?: any;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    throw new AppError("Unauthorized", 401);
  }

  const token = header.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret");
    req.user = payload;
    next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
}
