import { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { createSubcategorySchema } from "./dto/create-subcategory.dto";
import { updateSubcategorySchema } from "./dto/update-subcategory.dto";
import { SubcategoryService } from "./subcategory.service";

export class SubcategoryController {
  private subcategoryService: SubcategoryService;

  constructor() {
    this.subcategoryService = new SubcategoryService();
  }

  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const subcategories = await this.subcategoryService.getAllSubcategories();
    return sendSuccess(res, {
      message: "Subcategories fetched successfully",
      data: subcategories,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const subcategory = await this.subcategoryService.getSubcategoryById(id);
    return sendSuccess(res, {
      message: "Subcategory fetched successfully",
      data: subcategory,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = createSubcategorySchema.parse(req.body);
    const subcategory = await this.subcategoryService.createSubcategory(dto);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Subcategory created successfully",
      data: subcategory,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dto = updateSubcategorySchema.parse(req.body);
    const subcategory = await this.subcategoryService.updateSubcategory(id, dto);
    return sendSuccess(res, {
      message: "Subcategory updated successfully",
      data: subcategory,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.subcategoryService.deleteSubcategory(id);
    return sendSuccess(res, {
      message: "Subcategory deleted successfully",
      data: null,
    });
  });
}
