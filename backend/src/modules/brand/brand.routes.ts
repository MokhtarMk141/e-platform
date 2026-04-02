import { Router } from "express";
import { BrandController } from "./brand.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { checkRole } from "../../middlewares/role.middleware";

const router = Router();
const controller = new BrandController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/upload-logo", authMiddleware, checkRole(["ADMIN"]), controller.uploadLogo);

router.post("/", authMiddleware, checkRole(["ADMIN"]), controller.create);
router.put("/:id", authMiddleware, checkRole(["ADMIN"]), controller.update);
router.delete("/:id", authMiddleware, checkRole(["ADMIN"]), controller.delete);

export default router;
