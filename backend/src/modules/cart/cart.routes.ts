import { Router } from "express";
import { CartController } from "./cart.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();
const controller = new CartController();

// All cart routes require authentication
router.use(authMiddleware);

router.get("/", controller.getCart);
router.post("/items", controller.addItem);
router.patch("/items/:itemId", controller.updateQuantity);
router.delete("/items/:itemId", controller.removeItem);
router.delete("/", controller.clearCart);

export default router;
