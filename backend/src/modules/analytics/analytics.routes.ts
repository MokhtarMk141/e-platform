import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();
const controller = new AnalyticsController();

router.get("/overview", authMiddleware, checkRole(["ADMIN"]), controller.getOverview);

export default router;
