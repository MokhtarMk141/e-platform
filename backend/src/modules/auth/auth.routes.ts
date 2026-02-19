import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { authMiddleware } from "./auth.middleware";

const router = Router();
const controller = new AuthController();

// Rate limiters for auth routes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 3 registrations per window
  message: { error: "Too many registration attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 refresh attempts per window
  message: { error: "Too many refresh attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});






router.post("/register", registerLimiter, validateRequest(RegisterDto), controller.register);
router.post("/login", loginLimiter, validateRequest(LoginDto), controller.login);
router.post("/refresh", refreshLimiter, controller.refresh);
router.post("/logout", controller.logout);
router.post("/logout-all", authMiddleware, controller.logoutAll);

export default router;