import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { authMiddleware } from "./auth.middleware";
import { AppError } from "../../exceptions/app-error";

const router = Router();
const controller = new AuthController();

const createRateLimitHandler =
  (message: string) => (_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(message, 429));
  };

// Rate limiters for auth routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  handler: createRateLimitHandler(
    "Too many login attempts, please try again after 15 minutes"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per window
  handler: createRateLimitHandler(
    "Too many registration attempts, please try again later"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 refresh attempts per window
  handler: createRateLimitHandler(
    "Too many refresh attempts, please try again later"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // 10 requests per window
  handler: createRateLimitHandler(
    "Too many password reset requests, please try again after 10 minutes"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  handler: createRateLimitHandler(
    "Too many password reset attempts, please try again later"
  ),
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", registerLimiter, validateRequest(RegisterDto), controller.register);
router.post("/login", loginLimiter, validateRequest(LoginDto), controller.login);
router.post("/refresh", refreshLimiter, controller.refresh);
router.post("/logout", controller.logout);
router.post("/logout-all", authMiddleware, controller.logoutAll);
router.post("/forgot-password", forgotPasswordLimiter, validateRequest(ForgotPasswordDto), controller.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validateRequest(ResetPasswordDto), controller.resetPassword);
router.post("/change-password", authMiddleware, validateRequest(ChangePasswordDto), controller.changePassword);

export default router;
