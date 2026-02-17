import { Router } from "express";
import { ProductController } from "./product.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();
const controller = new ProductController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/", authMiddleware, controller.create);
router.put("/:id", authMiddleware, controller.update);
router.delete("/:id", authMiddleware, controller.delete);

export default router;