import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { asyncHandler } from "../../utils/async-handler";
import { createCategorySchema } from "./dto/create-category.dto";
import { updateCategorySchema } from "./dto/update-category.dto";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const categories = await this.categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.getCategoryById(id);
    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const dto = createCategorySchema.parse(req.body);
    const category = await this.categoryService.createCategory(dto);
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const dto = updateCategorySchema.parse(req.body);
    const category = await this.categoryService.updateCategory(id, dto);
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.categoryService.deleteCategory(id);
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  });
}