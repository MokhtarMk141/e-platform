import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { CreateSubcategoryDto } from "./dto/create-subcategory.dto";
import { UpdateSubcategoryDto } from "./dto/update-subcategory.dto";

export type SubcategoryWithProductsCount = Prisma.SubcategoryGetPayload<{
  include: {
    _count: { select: { products: true } };
    category: { select: { id: true; name: true } };
  };
}>;

export class SubcategoryRepository {
  async findAll(): Promise<SubcategoryWithProductsCount[]> {
    return prisma.subcategory.findMany({
      orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
      include: {
        _count: { select: { products: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async findById(id: string): Promise<SubcategoryWithProductsCount | null> {
    return prisma.subcategory.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async findByName(name: string) {
    return prisma.subcategory.findUnique({ where: { name } });
  }

  async create(data: CreateSubcategoryDto): Promise<SubcategoryWithProductsCount> {
    return prisma.subcategory.create({
      data,
      include: {
        _count: { select: { products: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: UpdateSubcategoryDto): Promise<SubcategoryWithProductsCount> {
    return prisma.subcategory.update({
      where: { id },
      data,
      include: {
        _count: { select: { products: true } },
        category: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.subcategory.delete({ where: { id } });
  }
}
