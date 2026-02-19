import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();
const controller = new UserController();

// Publicly accessible if we want (already handled by /api/auth/register)
// router.post("/", controller.create); 

// Restricted routes
router.get("/me", authMiddleware, controller.getMe);
router.get("/", authMiddleware, checkRole(["ADMIN"]), controller.findAll);
router.get("/:id", authMiddleware, checkRole(["ADMIN"]), controller.findOne);

export default router;
