import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { BrandService } from "./brand.service";
import { createBrandSchema } from "./dto/create-brand.dto";
import { updateBrandSchema } from "./dto/update-brand.dto";
import { AppError } from "../../exceptions/app-error";

const MAX_LOGO_SIZE_BYTES = 10 * 1024 * 1024;

export class BrandController {
  private brandService: BrandService;

  constructor() {
    this.brandService = new BrandService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const brands = await this.brandService.getAllBrands();

    return sendSuccess(res, {
      message: "Brands fetched successfully",
      data: brands,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const brand = await this.brandService.getBrandById(id);

    return sendSuccess(res, {
      message: "Brand fetched successfully",
      data: brand,
    });
  });

  uploadLogo = asyncHandler(async (req: Request, res: Response) => {
    const { fileName, fileData } = req.body as {
      fileName?: string;
      fileData?: string;
    };

    if (!fileName || !fileData) {
      throw new AppError("fileName and fileData are required", 400);
    }

    const match = fileData.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/i);
    if (!match) {
      throw new AppError("Invalid image format. Use png, jpg, jpeg, webp, or gif", 400);
    }

    const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const base64Payload = match[2];
    const buffer = Buffer.from(base64Payload, "base64");

    if (buffer.length > MAX_LOGO_SIZE_BYTES) {
      throw new AppError("Image too large. Max size is 10MB", 400);
    }

    const safeBase = path
      .parse(fileName)
      .name
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50) || "brand-logo";

    const uniqueName = `${safeBase}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "uploads", "brands");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(fullPath, buffer);

    const logoUrl = `${req.protocol}://${req.get("host")}/uploads/brands/${uniqueName}`;

    return sendSuccess(res, {
      statusCode: 201,
      message: "Brand logo uploaded successfully",
      data: { logoUrl },
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = createBrandSchema.parse(req.body);
    const brand = await this.brandService.createBrand(dto);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Brand created successfully",
      data: brand,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dto = updateBrandSchema.parse(req.body);
    const brand = await this.brandService.updateBrand(id, dto);

    return sendSuccess(res, {
      message: "Brand updated successfully",
      data: brand,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.brandService.deleteBrand(id);

    return sendSuccess(res, {
      message: "Brand deleted successfully",
      data: null,
    });
  });
}
