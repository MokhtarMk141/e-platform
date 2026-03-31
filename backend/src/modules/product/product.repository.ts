import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

export type ProductSortBy = "featured" | "price_asc" | "price_desc" | "newest";

export interface ProductQueryParams {
  skip?: number;
  take?: number;
  categoryId?: string;
  minPrice?: Array<number | undefined>;
  maxPrice?: Array<number | undefined>;
  search?: string;
  sortBy?: ProductSortBy;
}

export class ProductRepository {
  private buildWhere(params?: ProductQueryParams): Prisma.ProductWhereInput | undefined {
    const { categoryId, minPrice = [], maxPrice = [], search } = params ?? {};
    const andConditions: Prisma.ProductWhereInput[] = [];

    if (categoryId) {
      andConditions.push({ categoryId });
    }

    const priceRangeCount = Math.max(minPrice.length, maxPrice.length);
    if (priceRangeCount > 0) {
      const priceRanges = Array.from({ length: priceRangeCount }).reduce<Prisma.ProductWhereInput[]>(
        (ranges, _, index) => {
          const gte = minPrice[index];
          const lte = maxPrice[index];

          if (gte == null && lte == null) {
            return ranges;
          }

          ranges.push({
            price: {
              ...(gte != null ? { gte } : {}),
              ...(lte != null ? { lte } : {}),
            },
          });

          return ranges;
        },
        []
      );

      if (priceRanges.length > 0) {
        andConditions.push({ OR: priceRanges });
      }
    }

    const searchTerms = (search ?? "")
      .split(",")
      .map((term) => term.trim())
      .filter(Boolean);

    if (searchTerms.length > 0) {
      andConditions.push({
        OR: searchTerms.flatMap((term) => [
          { name: { contains: term, mode: "insensitive" } },
          { description: { contains: term, mode: "insensitive" } },
          { sku: { contains: term, mode: "insensitive" } },
          { category: { name: { contains: term, mode: "insensitive" } } },
        ]),
      });
    }

    return andConditions.length > 0 ? { AND: andConditions } : undefined;
  }

  private buildOrderBy(sortBy?: ProductSortBy): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case "price_asc":
        return { price: "asc" };
      case "price_desc":
        return { price: "desc" };
      case "newest":
        return { createdAt: "desc" };
      case "featured":
      default:
        return { createdAt: "desc" };
    }
  }

  async findAll(params?: ProductQueryParams): Promise<ProductWithCategory[]> {
    const { skip = 0, take = 20, sortBy } = params ?? {};
    const where = this.buildWhere(params);

    return prisma.product.findMany({
      skip,
      take,
      where,
      include: { category: true },
      orderBy: this.buildOrderBy(sortBy),
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

  async countOrderItems(productId: string): Promise<number> {
    return prisma.orderItem.count({
      where: { productId },
    });
  }

  async delete(id: string) {
    return prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { productId: id },
      });

      await tx.discount.deleteMany({
        where: { productId: id },
      });

      await tx.aIProductDescription.deleteMany({
        where: { productId: id },
      });

      await tx.recommendation.deleteMany({
        where: {
          OR: [{ productId: id }, { recommendedProductId: id }],
        },
      });

      return tx.product.delete({ where: { id } });
    });
  }

  async count(params?: ProductQueryParams): Promise<number> {
    return prisma.product.count({
      where: this.buildWhere(params),
    });
  }
}
