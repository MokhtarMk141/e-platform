import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../utils/async-handler";
import { createProductSchema } from "./dto/create-product.dto";
import { updateProductSchema } from "./dto/update-product.dto";

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const categoryId = req.query.categoryId as string | undefined;

    const result = await this.productService.getAllProducts({ page, limit, categoryId });

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      ...result,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await this.productService.getProductById(id);

    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = createProductSchema.parse(req.body);
    const product = await this.productService.createProduct(dto);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dto = updateProductSchema.parse(req.body);
    const product = await this.productService.updateProduct(id, dto);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.productService.deleteProduct(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  });
}