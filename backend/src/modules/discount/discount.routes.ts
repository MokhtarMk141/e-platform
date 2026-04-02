import { Router } from "express";
import { DiscountController } from "./discount.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();

// Allow customers to fetch active discounts or validate codes (optional extension), but for now protect everything for admin or just keep getAll open
router.get("/", authMiddleware, checkRole(["ADMIN"]), DiscountController.getAllDiscounts);
router.post("/validate", authMiddleware, DiscountController.validateDiscount);
router.get("/:id", authMiddleware, checkRole(["ADMIN"]), DiscountController.getDiscount);

// Write operations restricted to ADMIN
router.post("/", authMiddleware, checkRole(["ADMIN"]), DiscountController.createDiscount);
router.put("/:id", authMiddleware, checkRole(["ADMIN"]), DiscountController.updateDiscount);
router.delete("/:id", authMiddleware, checkRole(["ADMIN"]), DiscountController.deleteDiscount);

export default router;
