import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

export type BrandWithProductsCount = Prisma.BrandGetPayload<{
  include: { _count: { select: { products: true } } };
}>;

export class BrandRepository {
  async findAll(): Promise<BrandWithProductsCount[]> {
    return prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });
  }

  async findById(id: string): Promise<BrandWithProductsCount | null> {
    return prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  }

  async findByName(name: string) {
    return prisma.brand.findUnique({ where: { name } });
  }

  async create(data: CreateBrandDto): Promise<BrandWithProductsCount> {
    return prisma.brand.create({
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  async update(id: string, data: UpdateBrandDto): Promise<BrandWithProductsCount> {
    return prisma.brand.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    });
  }

  async delete(id: string) {
    return prisma.brand.delete({ where: { id } });
  }
}
