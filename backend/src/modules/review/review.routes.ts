import { Router } from "express";
import { ReviewController } from "./review.controller";
import { authMiddleware } from "../auth/auth.middleware";

const router = Router();
const controller = new ReviewController();

// Public routes
router.get("/top-rated", controller.getTopRated);
router.get("/product/:productId", controller.getProductReviews);

// Authenticated routes
router.post("/product/:productId", authMiddleware, controller.createReview);
router.put("/:id", authMiddleware, controller.updateReview);
router.delete("/:id", authMiddleware, controller.deleteReview);

export default router;
