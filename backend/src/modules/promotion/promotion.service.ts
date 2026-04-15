import {
  CategoryDiscount,
  Coupon,
  FlashSale,
  FlashSaleProduct,
  Prisma,
  Product,
  ProductDiscount,
  PromotionDiscountType,
} from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../exceptions/app-error";
import {
  buildResolvedPricing,
  calculateDiscountAmount,
  formatDiscountLabel,
  getPromotionLifecycleStatus,
  type PromotionLifecycleStatus,
  type PromotionScope,
  type ResolvedPricing,
  type ResolvedPromotion,
} from "./promotion-pricing";

type ProductPricingInput = Pick<Product, "id" | "name" | "price" | "categoryId">;
type PromotionClient = Prisma.TransactionClient | typeof prisma;

type ProductDiscountWithProduct = Prisma.ProductDiscountGetPayload<{
  include: { product: { select: { id: true; name: true; sku: true } } };
}>;

type CategoryDiscountWithCategory = Prisma.CategoryDiscountGetPayload<{
  include: { category: { select: { id: true; name: true; slug: true } } };
}>;

type FlashSaleWithProducts = Prisma.FlashSaleGetPayload<{
  include: { products: { include: { product: { select: { id: true; name: true; sku: true } } } } };
}>;

const activeWindowWhere = (now: Date) => ({
  isActive: true,
  AND: [
    { OR: [{ startDate: null }, { startDate: { lte: now } }] },
    { OR: [{ endDate: null }, { endDate: { gte: now } }] },
  ],
});

const selectHigherValuePromotion = <T extends { createdAt: Date }>(
  current: T | undefined,
  incoming: T,
  currentAmount: number,
  incomingAmount: number
) => {
  if (!current) {
    return incoming;
  }

  if (incomingAmount > currentAmount) {
    return incoming;
  }

  if (incomingAmount === currentAmount && incoming.createdAt > current.createdAt) {
    return incoming;
  }

  return current;
};

export class PromotionService {
  private static validateDiscountValue(discountType: PromotionDiscountType, discountValue: number) {
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new AppError("Discount value must be greater than 0", 400);
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      throw new AppError("Percentage discounts cannot exceed 100%", 400);
    }
  }

  private static validateDateRange(startDate?: Date | null, endDate?: Date | null) {
    if (startDate && Number.isNaN(startDate.getTime())) {
      throw new AppError("Invalid start date", 400);
    }

    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new AppError("Invalid end date", 400);
    }

    if (startDate && endDate && endDate <= startDate) {
      throw new AppError("End date must be after start date", 400);
    }
  }

  private static normalizeCode(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new AppError("Coupon code is required", 400);
    }

    return normalized;
  }

  private static toProductDiscountResponse(item: ProductDiscountWithProduct) {
    return {
      ...item,
      lifecycleStatus: getPromotionLifecycleStatus(item),
    };
  }

  private static toCategoryDiscountResponse(item: CategoryDiscountWithCategory) {
    return {
      ...item,
      lifecycleStatus: getPromotionLifecycleStatus(item),
    };
  }

  private static toFlashSaleResponse(item: FlashSaleWithProducts) {
    return {
      ...item,
      lifecycleStatus: getPromotionLifecycleStatus(item),
    };
  }

  private static toCouponResponse(item: Coupon) {
    return {
      ...item,
      lifecycleStatus: getPromotionLifecycleStatus(item),
    };
  }

  static async listProductDiscounts() {
    const records = await prisma.productDiscount.findMany({
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => this.toProductDiscountResponse(record));
  }

  static async getProductDiscountById(id: string) {
    const record = await prisma.productDiscount.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    if (!record) {
      throw new AppError("Product discount not found", 404);
    }

    return this.toProductDiscountResponse(record);
  }

  static async createProductDiscount(data: {
    productId: string;
    discountType: PromotionDiscountType;
    discountValue: number;
    startDate?: Date | null;
    endDate?: Date | null;
    isActive?: boolean;
  }) {
    this.validateDiscountValue(data.discountType, data.discountValue);
    this.validateDateRange(data.startDate, data.endDate);

    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product) {
      throw new AppError("Selected product was not found", 404);
    }

    const record = await prisma.productDiscount.create({
      data: {
        productId: data.productId,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        isActive: data.isActive ?? true,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return this.toProductDiscountResponse(record);
  }

  static async updateProductDiscount(
    id: string,
    data: Partial<{
      productId: string;
      discountType: PromotionDiscountType;
      discountValue: number;
      startDate: Date | null;
      endDate: Date | null;
      isActive: boolean;
    }>
  ) {
    const existing = await prisma.productDiscount.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Product discount not found", 404);
    }

    if (data.productId) {
      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (!product) {
        throw new AppError("Selected product was not found", 404);
      }
    }

    const nextDiscountType = data.discountType ?? existing.discountType;
    const nextDiscountValue = data.discountValue ?? existing.discountValue;
    const nextStartDate = data.startDate !== undefined ? data.startDate : existing.startDate;
    const nextEndDate = data.endDate !== undefined ? data.endDate : existing.endDate;

    this.validateDiscountValue(nextDiscountType, nextDiscountValue);
    this.validateDateRange(nextStartDate, nextEndDate);

    const record = await prisma.productDiscount.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
    });

    return this.toProductDiscountResponse(record);
  }

  static async deleteProductDiscount(id: string) {
    await this.getProductDiscountById(id);
    await prisma.productDiscount.delete({ where: { id } });
  }

  static async listCategoryDiscounts() {
    const records = await prisma.categoryDiscount.findMany({
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => this.toCategoryDiscountResponse(record));
  }

  static async getCategoryDiscountById(id: string) {
    const record = await prisma.categoryDiscount.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!record) {
      throw new AppError("Category discount not found", 404);
    }

    return this.toCategoryDiscountResponse(record);
  }

  static async createCategoryDiscount(data: {
    categoryId: string;
    discountType: PromotionDiscountType;
    discountValue: number;
    startDate?: Date | null;
    endDate?: Date | null;
    isActive?: boolean;
  }) {
    this.validateDiscountValue(data.discountType, data.discountValue);
    this.validateDateRange(data.startDate, data.endDate);

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new AppError("Selected category was not found", 404);
    }

    const record = await prisma.categoryDiscount.create({
      data: {
        categoryId: data.categoryId,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        isActive: data.isActive ?? true,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return this.toCategoryDiscountResponse(record);
  }

  static async updateCategoryDiscount(
    id: string,
    data: Partial<{
      categoryId: string;
      discountType: PromotionDiscountType;
      discountValue: number;
      startDate: Date | null;
      endDate: Date | null;
      isActive: boolean;
    }>
  ) {
    const existing = await prisma.categoryDiscount.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Category discount not found", 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        throw new AppError("Selected category was not found", 404);
      }
    }

    const nextDiscountType = data.discountType ?? existing.discountType;
    const nextDiscountValue = data.discountValue ?? existing.discountValue;
    const nextStartDate = data.startDate !== undefined ? data.startDate : existing.startDate;
    const nextEndDate = data.endDate !== undefined ? data.endDate : existing.endDate;

    this.validateDiscountValue(nextDiscountType, nextDiscountValue);
    this.validateDateRange(nextStartDate, nextEndDate);

    const record = await prisma.categoryDiscount.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return this.toCategoryDiscountResponse(record);
  }

  static async deleteCategoryDiscount(id: string) {
    await this.getCategoryDiscountById(id);
    await prisma.categoryDiscount.delete({ where: { id } });
  }

  static async listFlashSales() {
    const records = await prisma.flashSale.findMany({
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => this.toFlashSaleResponse(record));
  }

  static async getFlashSaleById(id: string) {
    const record = await prisma.flashSale.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    if (!record) {
      throw new AppError("Flash sale not found", 404);
    }

    return this.toFlashSaleResponse(record);
  }

  static async createFlashSale(data: {
    name: string;
    productIds: string[];
    discountType: PromotionDiscountType;
    discountValue: number;
    startDate?: Date | null;
    endDate?: Date | null;
    isActive?: boolean;
  }) {
    if (!data.name.trim()) {
      throw new AppError("Flash sale name is required", 400);
    }

    if (!Array.isArray(data.productIds) || data.productIds.length === 0) {
      throw new AppError("Select at least one product for the flash sale", 400);
    }

    this.validateDiscountValue(data.discountType, data.discountValue);
    this.validateDateRange(data.startDate, data.endDate);

    const products = await prisma.product.findMany({
      where: { id: { in: data.productIds } },
      select: { id: true },
    });

    if (products.length !== new Set(data.productIds).size) {
      throw new AppError("One or more selected flash sale products were not found", 404);
    }

    const record = await prisma.flashSale.create({
      data: {
        name: data.name.trim(),
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        isActive: data.isActive ?? true,
        products: {
          create: [...new Set(data.productIds)].map((productId) => ({ productId })),
        },
      },
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    return this.toFlashSaleResponse(record);
  }

  static async updateFlashSale(
    id: string,
    data: Partial<{
      name: string;
      productIds: string[];
      discountType: PromotionDiscountType;
      discountValue: number;
      startDate: Date | null;
      endDate: Date | null;
      isActive: boolean;
    }>
  ) {
    const existing = await prisma.flashSale.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!existing) {
      throw new AppError("Flash sale not found", 404);
    }

    const nextDiscountType = data.discountType ?? existing.discountType;
    const nextDiscountValue = data.discountValue ?? existing.discountValue;
    const nextStartDate = data.startDate !== undefined ? data.startDate : existing.startDate;
    const nextEndDate = data.endDate !== undefined ? data.endDate : existing.endDate;

    this.validateDiscountValue(nextDiscountType, nextDiscountValue);
    this.validateDateRange(nextStartDate, nextEndDate);

    const updatePayload: Prisma.FlashSaleUpdateInput = {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
      ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
      ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
      ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    };

    if (data.productIds) {
      if (data.productIds.length === 0) {
        throw new AppError("Select at least one product for the flash sale", 400);
      }

      const uniqueIds = [...new Set(data.productIds)];
      const products = await prisma.product.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });

      if (products.length !== uniqueIds.length) {
        throw new AppError("One or more selected flash sale products were not found", 404);
      }

      updatePayload.products = {
        deleteMany: {},
        create: uniqueIds.map((productId) => ({ productId })),
      };
    }

    const record = await prisma.flashSale.update({
      where: { id },
      data: updatePayload,
      include: {
        products: {
          include: {
            product: { select: { id: true, name: true, sku: true } },
          },
        },
      },
    });

    return this.toFlashSaleResponse(record);
  }

  static async deleteFlashSale(id: string) {
    await this.getFlashSaleById(id);
    await prisma.flashSale.delete({ where: { id } });
  }

  static async listCoupons() {
    const records = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });

    return records.map((record) => this.toCouponResponse(record));
  }

  static async getCouponById(id: string) {
    const record = await prisma.coupon.findUnique({ where: { id } });

    if (!record) {
      throw new AppError("Coupon not found", 404);
    }

    return this.toCouponResponse(record);
  }

  static async createCoupon(data: {
    code: string;
    discountType: PromotionDiscountType;
    discountValue: number;
    startDate?: Date | null;
    endDate?: Date | null;
    usageLimit?: number | null;
    isActive?: boolean;
  }) {
    const code = this.normalizeCode(data.code);
    this.validateDiscountValue(data.discountType, data.discountValue);
    this.validateDateRange(data.startDate, data.endDate);

    if (data.usageLimit !== undefined && data.usageLimit !== null && data.usageLimit <= 0) {
      throw new AppError("Usage limit must be greater than 0", 400);
    }

    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      throw new AppError(`Coupon code '${code}' already exists`, 409);
    }

    const record = await prisma.coupon.create({
      data: {
        code,
        discountType: data.discountType,
        discountValue: data.discountValue,
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
        usageLimit: data.usageLimit ?? null,
        isActive: data.isActive ?? true,
      },
    });

    return this.toCouponResponse(record);
  }

  static async updateCoupon(
    id: string,
    data: Partial<{
      code: string;
      discountType: PromotionDiscountType;
      discountValue: number;
      startDate: Date | null;
      endDate: Date | null;
      usageLimit: number | null;
      isActive: boolean;
    }>
  ) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("Coupon not found", 404);
    }

    const code = data.code !== undefined ? this.normalizeCode(data.code) : existing.code;
    const nextDiscountType = data.discountType ?? existing.discountType;
    const nextDiscountValue = data.discountValue ?? existing.discountValue;
    const nextStartDate = data.startDate !== undefined ? data.startDate : existing.startDate;
    const nextEndDate = data.endDate !== undefined ? data.endDate : existing.endDate;
    const nextUsageLimit = data.usageLimit !== undefined ? data.usageLimit : existing.usageLimit;

    this.validateDiscountValue(nextDiscountType, nextDiscountValue);
    this.validateDateRange(nextStartDate, nextEndDate);

    if (nextUsageLimit !== null && nextUsageLimit !== undefined && nextUsageLimit <= 0) {
      throw new AppError("Usage limit must be greater than 0", 400);
    }

    if (code !== existing.code) {
      const codeTaken = await prisma.coupon.findUnique({ where: { code } });
      if (codeTaken) {
        throw new AppError(`Coupon code '${code}' already exists`, 409);
      }
    }

    const record = await prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code !== undefined ? { code } : {}),
        ...(data.discountType !== undefined ? { discountType: data.discountType } : {}),
        ...(data.discountValue !== undefined ? { discountValue: data.discountValue } : {}),
        ...(data.startDate !== undefined ? { startDate: data.startDate } : {}),
        ...(data.endDate !== undefined ? { endDate: data.endDate } : {}),
        ...(data.usageLimit !== undefined ? { usageLimit: data.usageLimit } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    return this.toCouponResponse(record);
  }

  static async deleteCoupon(id: string) {
    await this.getCouponById(id);
    await prisma.coupon.delete({ where: { id } });
  }

  static async getActivePromotions() {
    const now = new Date();
    const [productDiscounts, categoryDiscounts, flashSales, coupons] = await Promise.all([
      prisma.productDiscount.findMany({
        where: activeWindowWhere(now),
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.categoryDiscount.findMany({
        where: activeWindowWhere(now),
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.flashSale.findMany({
        where: activeWindowWhere(now),
        include: {
          products: {
            include: { product: { select: { id: true, name: true, sku: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.coupon.findMany({
        where: activeWindowWhere(now),
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      productDiscounts: productDiscounts.map((item) => this.toProductDiscountResponse(item)),
      categoryDiscounts: categoryDiscounts.map((item) => this.toCategoryDiscountResponse(item)),
      flashSales: flashSales.map((item) => this.toFlashSaleResponse(item)),
      coupons: coupons.map((item) => this.toCouponResponse(item)),
    };
  }

  private static selectBestPromotion(
    product: ProductPricingInput,
    flashSaleLinks: Array<FlashSaleProduct & { flashSale: FlashSale }>,
    productDiscounts: ProductDiscount[],
    categoryDiscounts: CategoryDiscount[]
  ): ResolvedPromotion | null {
    let bestFlashSale: (FlashSaleProduct & { flashSale: FlashSale }) | undefined;
    let bestFlashAmount = -1;

    for (const link of flashSaleLinks) {
      const amount = calculateDiscountAmount(
        product.price,
        link.flashSale.discountType,
        link.flashSale.discountValue
      );
      if (
        !bestFlashSale ||
        amount > bestFlashAmount ||
        (amount === bestFlashAmount && link.flashSale.createdAt > bestFlashSale.flashSale.createdAt)
      ) {
        bestFlashSale = link;
        bestFlashAmount = amount;
      }
    }

    if (bestFlashSale) {
      return {
        id: bestFlashSale.flashSale.id,
        scope: "FLASH_SALE",
        title: bestFlashSale.flashSale.name,
        discountType: bestFlashSale.flashSale.discountType,
        discountValue: bestFlashSale.flashSale.discountValue,
        startDate: bestFlashSale.flashSale.startDate,
        endDate: bestFlashSale.flashSale.endDate,
      };
    }

    let bestProductDiscount: ProductDiscount | undefined;
    let bestProductAmount = -1;
    for (const discount of productDiscounts) {
      const amount = calculateDiscountAmount(product.price, discount.discountType, discount.discountValue);
      bestProductDiscount = selectHigherValuePromotion(
        bestProductDiscount,
        discount,
        bestProductAmount,
        amount
      );
      bestProductAmount = Math.max(bestProductAmount, amount);
    }

    if (bestProductDiscount) {
      return {
        id: bestProductDiscount.id,
        scope: "PRODUCT_DISCOUNT",
        title: `Product Discount`,
        discountType: bestProductDiscount.discountType,
        discountValue: bestProductDiscount.discountValue,
        startDate: bestProductDiscount.startDate,
        endDate: bestProductDiscount.endDate,
      };
    }

    let bestCategoryDiscount: CategoryDiscount | undefined;
    let bestCategoryAmount = -1;
    for (const discount of categoryDiscounts) {
      const amount = calculateDiscountAmount(product.price, discount.discountType, discount.discountValue);
      bestCategoryDiscount = selectHigherValuePromotion(
        bestCategoryDiscount,
        discount,
        bestCategoryAmount,
        amount
      );
      bestCategoryAmount = Math.max(bestCategoryAmount, amount);
    }

    if (bestCategoryDiscount) {
      return {
        id: String(bestCategoryDiscount.id),
        scope: "CATEGORY_DISCOUNT",
        title: `Category Discount`,
        discountType: bestCategoryDiscount.discountType,
        discountValue: Number(bestCategoryDiscount.discountValue),
        startDate: bestCategoryDiscount.startDate ?? null,
        endDate: bestCategoryDiscount.endDate ?? null,
      };
    }

    return null;
  }

  static async resolvePricingForProducts(products: ProductPricingInput[]): Promise<Map<string, ResolvedPricing>> {
    const pricingMap = new Map<string, ResolvedPricing>();

    if (products.length === 0) {
      return pricingMap;
    }

    const now = new Date();
    const productIds = [...new Set(products.map((product) => product.id))];
    const categoryIds = [...new Set(products.map((product) => product.categoryId).filter((id): id is string => Boolean(id)))];

    const [flashSaleLinks, productDiscounts, categoryDiscounts] = await Promise.all([
      prisma.flashSaleProduct.findMany({
        where: {
          productId: { in: productIds },
          flashSale: activeWindowWhere(now),
        },
        include: {
          flashSale: true,
        },
      }),
      prisma.productDiscount.findMany({
        where: {
          productId: { in: productIds },
          ...activeWindowWhere(now),
        },
      }),
      categoryIds.length
        ? prisma.categoryDiscount.findMany({
            where: {
              categoryId: { in: categoryIds },
              ...activeWindowWhere(now),
            },
          })
        : Promise.resolve([]),
    ]);

    const flashByProductId = new Map<string, Array<FlashSaleProduct & { flashSale: FlashSale }>>();
    for (const link of flashSaleLinks) {
      flashByProductId.set(link.productId, [...(flashByProductId.get(link.productId) ?? []), link]);
    }

    const productDiscountsByProductId = new Map<string, ProductDiscount[]>();
    for (const discount of productDiscounts) {
      productDiscountsByProductId.set(discount.productId, [
        ...(productDiscountsByProductId.get(discount.productId) ?? []),
        discount,
      ]);
    }

    const categoryDiscountsByCategoryId = new Map<string, typeof categoryDiscounts>();
    for (const discount of categoryDiscounts) {
      categoryDiscountsByCategoryId.set(discount.categoryId, [
        ...(categoryDiscountsByCategoryId.get(discount.categoryId) ?? []),
        discount,
      ]);
    }

    for (const product of products) {
      const promotion = this.selectBestPromotion(
        product,
        flashByProductId.get(product.id) ?? [],
        productDiscountsByProductId.get(product.id) ?? [],
        product.categoryId ? categoryDiscountsByCategoryId.get(product.categoryId) ?? [] : []
      );

      pricingMap.set(product.id, buildResolvedPricing(product.price, promotion));
    }

    return pricingMap;
  }

  static async resolvePricingForProduct(product: ProductPricingInput) {
    const pricing = await this.resolvePricingForProducts([product]);
    return pricing.get(product.id) ?? buildResolvedPricing(product.price, null);
  }

  static async validateCouponCode(
    code: string,
    cartItems: Array<{ productId: string; quantity: number; price: number }>,
    client: PromotionClient = prisma
  ) {
    const normalizedCode = this.normalizeCode(code);
    const now = new Date();

    const coupon = await client.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      throw new AppError("Invalid coupon code", 400);
    }

    const lifecycleStatus = getPromotionLifecycleStatus(coupon, now);
    if (lifecycleStatus !== "ACTIVE") {
      throw new AppError("This coupon is not currently active", 400);
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError("This coupon has reached its maximum usage limit", 400);
    }

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = calculateDiscountAmount(subtotal, coupon.discountType, coupon.discountValue);

    return {
      couponId: coupon.id,
      code: coupon.code,
      discountAmount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountLabel: formatDiscountLabel(coupon.discountType, coupon.discountValue),
      lifecycleStatus,
    };
  }

  static async incrementCouponUsage(couponId: string, client: PromotionClient = prisma) {
    await client.coupon.update({
      where: { id: couponId },
      data: { usageCount: { increment: 1 } },
    });
  }

  static getLifecycleStatus(window: {
    isActive: boolean;
    startDate?: Date | null;
    endDate?: Date | null;
  }): PromotionLifecycleStatus {
    return getPromotionLifecycleStatus(window);
  }
}
