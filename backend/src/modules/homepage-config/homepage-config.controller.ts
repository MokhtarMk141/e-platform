import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { HomepageConfigService } from "./homepage-config.service";
import { updateHomepageConfigSchema } from "./dto/update-homepage-config.dto";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { AppError } from "../../exceptions/app-error";

const MAX_HERO_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export class HomepageConfigController {
  private homepageConfigService: HomepageConfigService;

  constructor() {
    this.homepageConfigService = new HomepageConfigService();
  }

  getConfig = asyncHandler(async (_req: Request, res: Response) => {
    const config = await this.homepageConfigService.getConfig();

    return sendSuccess(res, {
      message: "Homepage hero slides fetched successfully",
      data: config,
    });
  });

  updateConfig = asyncHandler(async (req: Request, res: Response) => {
    const dto = updateHomepageConfigSchema.parse(req.body);
    const config = await this.homepageConfigService.updateConfig(dto);

    return sendSuccess(res, {
      message: "Homepage hero slides updated successfully",
      data: config,
    });
  });

  uploadHeroImage = asyncHandler(async (req: Request, res: Response) => {
    const { fileName, fileData } = req.body as {
      fileName?: string;
      fileData?: string;
    };

    if (!fileName || !fileData) {
      throw new AppError("fileName and fileData are required", 400);
    }

    const match = fileData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if (!match) {
      throw new AppError(
        "Invalid image format. Use png, jpg, jpeg, or webp",
        400
      );
    }

    const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const base64Payload = match[2];
    const buffer = Buffer.from(base64Payload, "base64");

    if (buffer.length > MAX_HERO_IMAGE_SIZE_BYTES) {
      throw new AppError("Image too large. Max size is 10MB", 400);
    }

    const safeBase =
      path
        .parse(fileName)
        .name.replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 50) || "homepage-hero";
    const uniqueName = `${safeBase}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "uploads", "homepage");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(fullPath, buffer);

    const heroImageUrl = `${req.protocol}://${req.get("host")}/uploads/homepage/${uniqueName}`;

    return sendSuccess(res, {
      statusCode: 201,
      message: "Homepage hero image uploaded successfully",
      data: { heroImageUrl },
    });
  });
}
