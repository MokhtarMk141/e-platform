import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validate-request.middleware";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { authMiddleware } from "./auth.middleware";

const router = Router();
const controller = new AuthController();

router.post("/register", validateRequest(RegisterDto), controller.register);
router.post("/login", validateRequest(LoginDto), controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post("/logout-all", authMiddleware, controller.logoutAll);

export default router; // ← this was missing