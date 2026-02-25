import { Router } from "express";
import { UserController } from "./user.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

import { validateRequest } from "../../middlewares/validate-request.middleware";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

const router = Router();
const controller = new UserController();

// Publicly accessible if we want (already handled by /api/auth/register)
router.post(
  "/",
  authMiddleware,
  checkRole(["ADMIN"]),
  validateRequest(CreateUserDto),
  controller.create
);

// Restricted routes
router.get("/me", authMiddleware, controller.getMe);
router.get("/", authMiddleware, checkRole(["ADMIN"]), controller.findAll);
router.get("/:id", authMiddleware, checkRole(["ADMIN"]), controller.findOne);

// Update user route
router.patch(
  "/me",
  authMiddleware,
  validateRequest(UpdateUserDto),
  controller.updateMe
);

export default router;
