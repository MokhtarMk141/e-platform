import { AppError } from "../exceptions/app-error";
import { AuthRequest } from "../modules/auth/auth.middleware";

export function getAuthenticatedUserId(req: AuthRequest): string {
  const userId = req.user?.sub;

  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  return userId;
}
