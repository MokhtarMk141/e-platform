import { Router } from "express";
import { HomepageConfigController } from "./homepage-config.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();

// Public: anyone can read the homepage config
router.get("/", HomepageConfigController.getConfig);

// Admin only: update homepage config
router.put(
  "/",
  authMiddleware,
  checkRole(["ADMIN"]),
  HomepageConfigController.updateConfig
);

export default router;
