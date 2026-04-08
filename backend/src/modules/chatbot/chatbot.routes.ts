import { Router } from "express";
import { ChatbotController } from "./chatbot.controller";

const router = Router();
const controller = new ChatbotController();

router.get("/models", controller.getModels);
router.post("/chat", controller.sendMessage);

export default router;
