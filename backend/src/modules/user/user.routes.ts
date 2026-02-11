// src/modules/user/user.routes.ts
import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();
const controller = new UserController();

router.post("/", controller.create.bind(controller));
router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findOne.bind(controller));

export default router;
