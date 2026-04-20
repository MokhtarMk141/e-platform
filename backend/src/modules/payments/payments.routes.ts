import express, { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { PaymentsController } from "./payments.controller";

const router = Router();
const controller = new PaymentsController();

router.post(
  "/checkout-session",
  express.json({ limit: "10mb" }),
  authMiddleware,
  controller.createCheckoutSession
);

router.post(
  "/webhook",
  express.raw({ type: "*/*" }),
  controller.webhook
);

export default router;
