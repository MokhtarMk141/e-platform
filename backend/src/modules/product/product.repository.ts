import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export class ProductRepository {
  async findAll(params?: {
    skip?: number;
    take?: number;
    categoryId?: string;
  }): Promise<ProductWithCategory[]> {
    const { skip = 0, take = 20, categoryId } = params ?? {};

    return prisma.product.findMany({
      skip,
      take,
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<ProductWithCategory | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
  }

  async findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  }

  async create(data: CreateProductDto): Promise<ProductWithCategory> {
    return prisma.product.create({
      data,
      include: { category: true },
    });
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductWithCategory> {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async count(categoryId?: string): Promise<number> {
    return prisma.product.count({
      where: categoryId ? { categoryId } : undefined,
    });
  }
}
