import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

export type CategoryWithProductsCount = Prisma.CategoryGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export class CategoryRepository {
  async findAll(): Promise<CategoryWithProductsCount[]> {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  async findById(id: string): Promise<CategoryWithProductsCount | null> {
    return prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  }

  async findByName(name: string) {
    return prisma.category.findUnique({ where: { name } });
  }

  async create(data: CreateCategoryDto): Promise<CategoryWithProductsCount> {
    return prisma.category.create({
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  async update(
    id: string,
    data: UpdateCategoryDto
  ): Promise<CategoryWithProductsCount> {
    return prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  async delete(id: string) {
    return prisma.category.delete({ where: { id } });
  }
}
