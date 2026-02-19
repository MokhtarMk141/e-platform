import { Response, NextFunction } from "express";
import { AuthRequest } from "../modules/auth/auth.middleware";
import { AppError } from "../exceptions/app-error";

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * Must be used AFTER authMiddleware.
 */
export const checkRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("User not authenticated", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};
