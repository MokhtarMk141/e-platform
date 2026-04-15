import { Router } from "express";
import { HomepageConfigController } from "./homepage-config.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();
const controller = new HomepageConfigController();

// Public: anyone can read the homepage config
router.get("/", controller.getConfig);

// Admin only: upload a hero image
router.post(
  "/upload-hero-image",
  authMiddleware,
  checkRole(["ADMIN"]),
  controller.uploadHeroImage
);

// Admin only: update homepage config
router.put(
  "/",
  authMiddleware,
  checkRole(["ADMIN"]),
  controller.updateConfig
);

export default router;
