import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { asyncHandler } from "../../utils/async-handler";
import { createProductSchema } from "./dto/create-product.dto";
import { updateProductSchema } from "./dto/update-product.dto";
import { sendSuccess } from "../../utils/api-response";

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
    const dto = createProductSchema.parse(req.body);
    const product = await this.productService.createProduct(dto);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product created successfully",
      data: product,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dto = updateProductSchema.parse(req.body);
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
