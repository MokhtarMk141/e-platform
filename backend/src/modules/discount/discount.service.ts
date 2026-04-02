import { AppError } from "../../exceptions/app-error";
import { prisma } from "../../config/database";
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

  static async validateDiscountCode(
    code: string,
    cartItems: { productId: string; quantity: number; price: number }[]
  ) {
    const discount = await prisma.discount.findUnique({
      where: { code },
    });

    if (!discount) {
      throw new AppError("Invalid discount code", 400);
    }

    if (discount.status !== "ACTIVE") {
      throw new AppError("This discount code is no longer active", 400);
    }

    if (new Date() > discount.expiryDate) {
      throw new AppError("This discount code has expired", 400);
    }

    if (discount.maxUses && discount.usageCount >= discount.maxUses) {
      throw new AppError("This discount code has reached its maximum usage", 400);
    }

    let discountAmount = 0;
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (discount.productId) {
      // Product-specific discount
      const relevantItems = cartItems.filter((item) => item.productId === discount.productId);
      if (relevantItems.length === 0) {
        throw new AppError("This discount code is not applicable to any items in your cart", 400);
      }

      const relevantSubtotal = relevantItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      if (discount.type === "PERCENTAGE") {
        discountAmount = (relevantSubtotal * discount.discount) / 100;
      } else {
        // FIXED discount applied once per product usage (or just once for the whole matching set? usually once per matching product quantity or once per matching line?)
        // Let's assume FIXED is subtracted from the total regardless of quantity of that product as most e-commerce platforms do.
        discountAmount = discount.discount;
      }
    } else {
      // General discount
      if (discount.type === "PERCENTAGE") {
        discountAmount = (subtotal * discount.discount) / 100;
      } else {
        discountAmount = discount.discount;
      }
    }

    // Ensure discount amount doesn't exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return {
      discountId: discount.id,
      code: discount.code,
      discountAmount: Number(discountAmount.toFixed(2)),
      type: discount.type,
      value: discount.discount,
    };
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
