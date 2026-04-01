import { Router } from "express";
import { OrderController } from "./order.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();
const controller = new OrderController();

router.post("/checkout", authMiddleware, controller.checkout);
router.get("/me", authMiddleware, controller.getMyOrders);
router.get("/", authMiddleware, checkRole(["ADMIN"]), controller.getAllOrders);
router.patch("/:id/status", authMiddleware, checkRole(["ADMIN"]), controller.updateStatus);

export default router;
