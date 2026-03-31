import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../utils/async-handler";
import { createProductSchema } from "./dto/create-product.dto";
import { updateProductSchema } from "./dto/update-product.dto";
import { sendSuccess } from "../../utils/api-response";
import { ProductSortBy } from "./product.repository";
import { AppError } from "../../exceptions/app-error";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  private parseNumberArray(value: unknown): Array<number | undefined> | undefined {
    const rawValues = Array.isArray(value) ? value : value != null ? [value] : [];
    const numbers = rawValues
      .flatMap((entry) => String(entry).split(","))
      .map((entry) => {
        const trimmed = entry.trim();
        if (!trimmed) {
          return undefined;
        }

        const parsed = Number(trimmed);
        return Number.isFinite(parsed) ? parsed : undefined;
      });

    return numbers.some((entry) => entry != null) ? numbers : undefined;
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const categoryId = req.query.categoryId as string | undefined;
    const minPrice = this.parseNumberArray(req.query.minPrice);
    const maxPrice = this.parseNumberArray(req.query.maxPrice);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const sortBy = typeof req.query.sortBy === "string" ? (req.query.sortBy as ProductSortBy) : undefined;

    const result = await this.productService.getAllProducts({
      page,
      limit,
      categoryId,
      minPrice,
      maxPrice,
      search,
      sortBy,
    });

    return sendSuccess(res, {
      message: "Products fetched successfully",
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await this.productService.getProductById(id);

    return sendSuccess(res, {
      message: "Product fetched successfully",
      data: product,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = createProductSchema.parse({
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      imageUrl: req.body.imageUrl,
    });
    const product = await this.productService.createProduct(dto);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  });

  uploadImage = asyncHandler(async (req: Request, res: Response) => {
    const { fileName, fileData } = req.body as {
      fileName?: string;
      fileData?: string;
    };

    if (!fileName || !fileData) {
      throw new AppError("fileName and fileData are required", 400);
    }

    const match = fileData.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if (!match) {
      throw new AppError("Invalid image format. Use png, jpg, jpeg, or webp", 400);
    }

    const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const base64Payload = match[2];
    const buffer = Buffer.from(base64Payload, "base64");

    // 5MB max image size
    if (buffer.length > 5 * 1024 * 1024) {
      throw new AppError("Image too large. Max size is 5MB", 400);
    }

    const safeBase = path
      .parse(fileName)
      .name
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 50) || "product-image";

    const uniqueName = `${safeBase}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "uploads", "products");
    fs.mkdirSync(uploadsDir, { recursive: true });

    const fullPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(fullPath, buffer);

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/products/${uniqueName}`;

    return sendSuccess(res, {
      statusCode: 201,
      message: "Image uploaded successfully",
      data: { imageUrl },
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dto = updateProductSchema.parse({
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : undefined,
      imageUrl: req.body.imageUrl,
    });
    const product = await this.productService.updateProduct(id, dto);

    return sendSuccess(res, {
      message: "Product updated successfully",
      data: product,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.productService.deleteProduct(id);

    return sendSuccess(res, {
      message: "Product deleted successfully",
      data: null,
    });
  });
}
