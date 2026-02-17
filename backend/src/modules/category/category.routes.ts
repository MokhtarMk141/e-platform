import { Router } from "express";
import { CategoryController } from "./category.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();
const controller = new CategoryController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", authMiddleware, controller.create);
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.delete);

export default router;