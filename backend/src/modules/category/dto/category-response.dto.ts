import { Category } from "@prisma/client";

export class CategoryResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount?: number;

  constructor(category: Category & { _count?: { products: number } }) {
    this.id = category.id;
    this.name = category.name;
    this.description = category.description;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
    this.productCount = category._count?.products || 0;
  }
}