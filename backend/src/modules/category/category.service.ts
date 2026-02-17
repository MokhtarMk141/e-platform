import { CategoryRepository } from "./category.repository";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CategoryResponseDto } from "./dto/category-response.dto";
import { AppError } from "../../exceptions/app-error";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.findAll();
    return categories.map((c) => new CategoryResponseDto(c));
  }

  async getCategoryById(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    return new CategoryResponseDto(category);
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.categoryRepository.findByName(dto.name);
    if (existing) {
      throw new AppError(`Category '${dto.name}' already exists`, 409);
    }
    const category = await this.categoryRepository.create(dto);
    return new CategoryResponseDto(category);
  }

  async updateCategory(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (dto.name && dto.name !== category.name) {
      const nameTaken = await this.categoryRepository.findByName(dto.name);
      if (nameTaken) {
        throw new AppError(`Category '${dto.name}' already exists`, 409);
      }
    }

    const updated = await this.categoryRepository.update(id, dto);
    return new CategoryResponseDto(updated);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }
    await this.categoryRepository.delete(id);
  }
}