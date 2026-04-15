import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";
import { PromotionController } from "./promotion.controller";

const router = Router();
const controller = new PromotionController();

router.get("/active", controller.getActivePromotions);
router.post("/coupons/validate", authMiddleware, controller.validateCoupon);

router.get("/product-discounts", authMiddleware, checkRole(["ADMIN"]), controller.listProductDiscounts);
router.get("/product-discounts/:id", authMiddleware, checkRole(["ADMIN"]), controller.getProductDiscount);
router.post("/product-discounts", authMiddleware, checkRole(["ADMIN"]), controller.createProductDiscount);
router.put("/product-discounts/:id", authMiddleware, checkRole(["ADMIN"]), controller.updateProductDiscount);
router.delete("/product-discounts/:id", authMiddleware, checkRole(["ADMIN"]), controller.deleteProductDiscount);

router.get("/category-discounts", authMiddleware, checkRole(["ADMIN"]), controller.listCategoryDiscounts);
router.get("/category-discounts/:id", authMiddleware, checkRole(["ADMIN"]), controller.getCategoryDiscount);
router.post("/category-discounts", authMiddleware, checkRole(["ADMIN"]), controller.createCategoryDiscount);
router.put("/category-discounts/:id", authMiddleware, checkRole(["ADMIN"]), controller.updateCategoryDiscount);
router.delete("/category-discounts/:id", authMiddleware, checkRole(["ADMIN"]), controller.deleteCategoryDiscount);

router.get("/flash-sales", authMiddleware, checkRole(["ADMIN"]), controller.listFlashSales);
router.get("/flash-sales/:id", authMiddleware, checkRole(["ADMIN"]), controller.getFlashSale);
router.post("/flash-sales", authMiddleware, checkRole(["ADMIN"]), controller.createFlashSale);
router.put("/flash-sales/:id", authMiddleware, checkRole(["ADMIN"]), controller.updateFlashSale);
router.delete("/flash-sales/:id", authMiddleware, checkRole(["ADMIN"]), controller.deleteFlashSale);

router.get("/coupons", authMiddleware, checkRole(["ADMIN"]), controller.listCoupons);
router.get("/coupons/:id", authMiddleware, checkRole(["ADMIN"]), controller.getCoupon);
router.post("/coupons", authMiddleware, checkRole(["ADMIN"]), controller.createCoupon);
router.put("/coupons/:id", authMiddleware, checkRole(["ADMIN"]), controller.updateCoupon);
router.delete("/coupons/:id", authMiddleware, checkRole(["ADMIN"]), controller.deleteCoupon);

export default router;
