import { Request, Response } from "express";
import { PromotionDiscountType } from "@prisma/client";
import { AppError } from "../../exceptions/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { PromotionService } from "./promotion.service";

const parseDateValue = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw new AppError("Invalid date value", 400);
  }

  return date;
};

const parseOptionalBoolean = (value: unknown) => {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") return true;
  if (value === "false") return false;

  throw new AppError("Invalid boolean value", 400);
};

const parseDiscountType = (value: unknown): PromotionDiscountType => {
  if (value === "PERCENTAGE" || value === "FIXED") {
    return value;
  }

  throw new AppError("Discount type must be PERCENTAGE or FIXED", 400);
};

const parseNumberValue = (value: unknown, fieldName: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new AppError(`${fieldName} must be a valid number`, 400);
  }

  return parsed;
};

export class PromotionController {
  listProductDiscounts = asyncHandler(async (_req: Request, res: Response) => {
    const data = await PromotionService.listProductDiscounts();
    return sendSuccess(res, { message: "Product discounts fetched successfully", data });
  });

  getProductDiscount = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.getProductDiscountById(req.params.id as string);
    return sendSuccess(res, { message: "Product discount fetched successfully", data });
  });

  createProductDiscount = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.createProductDiscount({
      productId: String(req.body.productId || ""),
      discountType: parseDiscountType(req.body.discountType),
      discountValue: parseNumberValue(req.body.discountValue, "Discount value"),
      startDate: parseDateValue(req.body.startDate),
      endDate: parseDateValue(req.body.endDate),
      isActive: parseOptionalBoolean(req.body.isActive),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Product discount created successfully",
      data,
    });
  });

  updateProductDiscount = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.updateProductDiscount(req.params.id as string, {
      ...(req.body.productId !== undefined ? { productId: String(req.body.productId || "") } : {}),
      ...(req.body.discountType !== undefined ? { discountType: parseDiscountType(req.body.discountType) } : {}),
      ...(req.body.discountValue !== undefined
        ? { discountValue: parseNumberValue(req.body.discountValue, "Discount value") }
        : {}),
      ...(req.body.startDate !== undefined ? { startDate: parseDateValue(req.body.startDate) } : {}),
      ...(req.body.endDate !== undefined ? { endDate: parseDateValue(req.body.endDate) } : {}),
      ...(req.body.isActive !== undefined ? { isActive: parseOptionalBoolean(req.body.isActive) } : {}),
    });

    return sendSuccess(res, { message: "Product discount updated successfully", data });
  });

  deleteProductDiscount = asyncHandler(async (req: Request, res: Response) => {
    await PromotionService.deleteProductDiscount(req.params.id as string);
    return sendSuccess(res, { message: "Product discount deleted successfully", data: null });
  });

  listCategoryDiscounts = asyncHandler(async (_req: Request, res: Response) => {
    const data = await PromotionService.listCategoryDiscounts();
    return sendSuccess(res, { message: "Category discounts fetched successfully", data });
  });

  getCategoryDiscount = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.getCategoryDiscountById(req.params.id as string);
    return sendSuccess(res, { message: "Category discount fetched successfully", data });
  });

  createCategoryDiscount = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.createCategoryDiscount({
      categoryId: String(req.body.categoryId || ""),
      discountType: parseDiscountType(req.body.discountType),
      discountValue: parseNumberValue(req.body.discountValue, "Discount value"),
      startDate: parseDateValue(req.body.startDate),
      endDate: parseDateValue(req.body.endDate),
      isActive: parseOptionalBoolean(req.body.isActive),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Category discount created successfully",
      data,
    });
  });

  updateCategoryDiscount = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.updateCategoryDiscount(req.params.id as string, {
      ...(req.body.categoryId !== undefined ? { categoryId: String(req.body.categoryId || "") } : {}),
      ...(req.body.discountType !== undefined ? { discountType: parseDiscountType(req.body.discountType) } : {}),
      ...(req.body.discountValue !== undefined
        ? { discountValue: parseNumberValue(req.body.discountValue, "Discount value") }
        : {}),
      ...(req.body.startDate !== undefined ? { startDate: parseDateValue(req.body.startDate) } : {}),
      ...(req.body.endDate !== undefined ? { endDate: parseDateValue(req.body.endDate) } : {}),
      ...(req.body.isActive !== undefined ? { isActive: parseOptionalBoolean(req.body.isActive) } : {}),
    });

    return sendSuccess(res, { message: "Category discount updated successfully", data });
  });

  deleteCategoryDiscount = asyncHandler(async (req: Request, res: Response) => {
    await PromotionService.deleteCategoryDiscount(req.params.id as string);
    return sendSuccess(res, { message: "Category discount deleted successfully", data: null });
  });

  listFlashSales = asyncHandler(async (_req: Request, res: Response) => {
    const data = await PromotionService.listFlashSales();
    return sendSuccess(res, { message: "Flash sales fetched successfully", data });
  });

  getFlashSale = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.getFlashSaleById(req.params.id as string);
    return sendSuccess(res, { message: "Flash sale fetched successfully", data });
  });

  createFlashSale = asyncHandler(async (req: Request, res: Response) => {
    const productIds = Array.isArray(req.body.productIds) ? req.body.productIds.map(String) : [];
    const data = await PromotionService.createFlashSale({
      name: String(req.body.name || ""),
      productIds,
      discountType: parseDiscountType(req.body.discountType),
      discountValue: parseNumberValue(req.body.discountValue, "Discount value"),
      startDate: parseDateValue(req.body.startDate),
      endDate: parseDateValue(req.body.endDate),
      isActive: parseOptionalBoolean(req.body.isActive),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Flash sale created successfully",
      data,
    });
  });

  updateFlashSale = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.updateFlashSale(req.params.id as string, {
      ...(req.body.name !== undefined ? { name: String(req.body.name || "") } : {}),
      ...(req.body.productIds !== undefined
        ? { productIds: Array.isArray(req.body.productIds) ? req.body.productIds.map(String) : [] }
        : {}),
      ...(req.body.discountType !== undefined ? { discountType: parseDiscountType(req.body.discountType) } : {}),
      ...(req.body.discountValue !== undefined
        ? { discountValue: parseNumberValue(req.body.discountValue, "Discount value") }
        : {}),
      ...(req.body.startDate !== undefined ? { startDate: parseDateValue(req.body.startDate) } : {}),
      ...(req.body.endDate !== undefined ? { endDate: parseDateValue(req.body.endDate) } : {}),
      ...(req.body.isActive !== undefined ? { isActive: parseOptionalBoolean(req.body.isActive) } : {}),
    });

    return sendSuccess(res, { message: "Flash sale updated successfully", data });
  });

  deleteFlashSale = asyncHandler(async (req: Request, res: Response) => {
    await PromotionService.deleteFlashSale(req.params.id as string);
    return sendSuccess(res, { message: "Flash sale deleted successfully", data: null });
  });

  listCoupons = asyncHandler(async (_req: Request, res: Response) => {
    const data = await PromotionService.listCoupons();
    return sendSuccess(res, { message: "Coupons fetched successfully", data });
  });

  getCoupon = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.getCouponById(req.params.id as string);
    return sendSuccess(res, { message: "Coupon fetched successfully", data });
  });

  createCoupon = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.createCoupon({
      code: String(req.body.code || ""),
      discountType: parseDiscountType(req.body.discountType),
      discountValue: parseNumberValue(req.body.discountValue, "Discount value"),
      startDate: parseDateValue(req.body.startDate),
      endDate: parseDateValue(req.body.endDate),
      usageLimit:
        req.body.usageLimit !== undefined && req.body.usageLimit !== null && req.body.usageLimit !== ""
          ? parseNumberValue(req.body.usageLimit, "Usage limit")
          : null,
      isActive: parseOptionalBoolean(req.body.isActive),
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Coupon created successfully",
      data,
    });
  });

  updateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const data = await PromotionService.updateCoupon(req.params.id as string, {
      ...(req.body.code !== undefined ? { code: String(req.body.code || "") } : {}),
      ...(req.body.discountType !== undefined ? { discountType: parseDiscountType(req.body.discountType) } : {}),
      ...(req.body.discountValue !== undefined
        ? { discountValue: parseNumberValue(req.body.discountValue, "Discount value") }
        : {}),
      ...(req.body.startDate !== undefined ? { startDate: parseDateValue(req.body.startDate) } : {}),
      ...(req.body.endDate !== undefined ? { endDate: parseDateValue(req.body.endDate) } : {}),
      ...(req.body.usageLimit !== undefined
        ? {
            usageLimit:
              req.body.usageLimit === null || req.body.usageLimit === ""
                ? null
                : parseNumberValue(req.body.usageLimit, "Usage limit"),
          }
        : {}),
      ...(req.body.isActive !== undefined ? { isActive: parseOptionalBoolean(req.body.isActive) } : {}),
    });

    return sendSuccess(res, { message: "Coupon updated successfully", data });
  });

  deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
    await PromotionService.deleteCoupon(req.params.id as string);
    return sendSuccess(res, { message: "Coupon deleted successfully", data: null });
  });

  getActivePromotions = asyncHandler(async (_req: Request, res: Response) => {
    const data = await PromotionService.getActivePromotions();
    return sendSuccess(res, { message: "Active promotions fetched successfully", data });
  });

  validateCoupon = asyncHandler(async (req: Request, res: Response) => {
    const cartItems = Array.isArray(req.body.cartItems) ? req.body.cartItems : [];
    if (!req.body.code || cartItems.length === 0) {
      throw new AppError("Code and cart items are required", 400);
    }

    const data = await PromotionService.validateCouponCode(String(req.body.code), cartItems);
    return sendSuccess(res, { message: "Coupon validated successfully", data });
  });
}
