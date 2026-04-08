import { Request, Response } from "express";
import { ChatbotService } from "./chatbot.service";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { AppError } from "../../exceptions/app-error";

export class ChatbotController {
  private chatbotService: ChatbotService;

  constructor() {
    this.chatbotService = new ChatbotService();
  }

  getModels = asyncHandler(async (_req: Request, res: Response) => {
    const result = await this.chatbotService.getModels();

    return sendSuccess(res, {
      message: "Models fetched successfully",
      data: result,
    });
  });

  sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { model, prompt, system } = req.body as {
      model?: unknown;
      prompt?: unknown;
      system?: unknown;
    };

    if (model !== undefined && (typeof model !== "string" || !model.trim())) {
      throw new AppError("model must be a non-empty string when provided", 400);
    }
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      throw new AppError("prompt is required and must be a non-empty string", 400);
    }
    if (prompt.length > 2000) {
      throw new AppError("prompt must be 2000 characters or less", 400);
    }
    if (system !== undefined && typeof system !== "string") {
      throw new AppError("system must be a string when provided", 400);
    }

    const result = await this.chatbotService.sendMessage({
      model: typeof model === "string" ? model.trim() : undefined,
      prompt: prompt.trim(),
      system: typeof system === "string" ? system.trim() : undefined,
    });

    return sendSuccess(res, {
      message: "Response generated successfully",
      data: result,
    });
  });
}
