import { Router } from "express";
import { CategoryController } from "./category.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();
const controller = new CategoryController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);

// Write operations restricted to ADMIN
router.post("/", authMiddleware, checkRole(["ADMIN"]), controller.create);
router.put("/:id", authMiddleware, checkRole(["ADMIN"]), controller.update);
router.delete("/:id", authMiddleware, checkRole(["ADMIN"]), controller.delete);

export default router;