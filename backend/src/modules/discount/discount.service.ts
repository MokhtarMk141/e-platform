import prisma from "../../lib/prisma";
import type { DiscountStatus, DiscountType } from "@prisma/client";

export class DiscountService {
  static async getAllDiscounts() {
    return prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  static async getDiscountById(id: string) {
    return prisma.discount.findUnique({
      where: { id },
    });
  }

  static async getDiscountByCode(code: string) {
    return prisma.discount.findUnique({
      where: { code },
    });
  }

  static async createDiscount(data: {
    code?: string;
    discount: number;
    type: DiscountType;
    expiryDate: Date;
    status: DiscountStatus;
    maxUses?: number;
    productId?: string;
  }) {
    return prisma.discount.create({
      data,
    });
  }

  static async updateDiscount(
    id: string,
    data: {
      code?: string;
      discount?: number;
      type?: DiscountType;
      expiryDate?: Date;
      status?: DiscountStatus;
      maxUses?: number;
      productId?: string;
    }
  ) {
    return prisma.discount.update({
      where: { id },
      data,
    });
  }

  static async deleteDiscount(id: string) {
    return prisma.discount.delete({
      where: { id },
    });
  }
}
