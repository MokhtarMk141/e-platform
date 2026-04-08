import { AppError } from "../../exceptions/app-error";
import { CategoryRepository } from "../category/category.repository";
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto";
import { SubcategoryResponseDto } from "./dto/subcategory-response.dto";
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto";
import { SubcategoryRepository } from "./subcategory.repository";

export class SubcategoryService {
  constructor(
    private subcategoryRepository: SubcategoryRepository = new SubcategoryRepository(),
    private categoryRepository: CategoryRepository = new CategoryRepository()
  ) {}

  async getAllSubcategories(): Promise<SubcategoryResponseDto[]> {
    const subcategories = await this.subcategoryRepository.findAll();
    return subcategories.map((subcategory) => new SubcategoryResponseDto(subcategory));
  }

  async getSubcategoryById(id: string): Promise<SubcategoryResponseDto> {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }
    return new SubcategoryResponseDto(subcategory);
  }

  async createSubcategory(dto: CreateSubcategoryDto): Promise<SubcategoryResponseDto> {
    const existing = await this.subcategoryRepository.findByName(dto.name);
    if (existing) {
      throw new AppError(`Subcategory '${dto.name}' already exists`, 409);
    }

    await this.ensureCategoryExists(dto.categoryId);
    const subcategory = await this.subcategoryRepository.create(dto);
    return new SubcategoryResponseDto(subcategory);
  }

  async updateSubcategory(id: string, dto: UpdateSubcategoryDto): Promise<SubcategoryResponseDto> {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }

    if (dto.name && dto.name !== subcategory.name) {
      const nameTaken = await this.subcategoryRepository.findByName(dto.name);
      if (nameTaken) {
        throw new AppError(`Subcategory '${dto.name}' already exists`, 409);
      }
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    const updated = await this.subcategoryRepository.update(id, dto);
    return new SubcategoryResponseDto(updated);
  }

  async deleteSubcategory(id: string): Promise<void> {
    const subcategory = await this.subcategoryRepository.findById(id);
    if (!subcategory) {
      throw new AppError("Subcategory not found", 404);
    }
    await this.subcategoryRepository.delete(id);
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }
}
