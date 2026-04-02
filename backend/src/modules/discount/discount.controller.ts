import { Request, Response, NextFunction } from "express";
import { DiscountService } from "./discount.service";
import { AppError } from "../../exceptions/app-error";

export class DiscountController {
  static async getAllDiscounts(_req: Request, res: Response, next: NextFunction) {
    try {
      const discounts = await DiscountService.getAllDiscounts();
      res.json({ success: true, data: discounts });
    } catch (error) {
      next(error);
    }
  }

  static async getDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const discount = await DiscountService.getDiscountById(req.params.id as string);
      if (!discount) {
        throw new AppError("Discount not found", 404);
      }
      res.json({ success: true, data: discount });
    } catch (error) {
      next(error);
    }
  }

  static async createDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, discount, type, expiryDate, status, maxUses, productId } = req.body;

      if (!discount || !type || !expiryDate) {
        throw new AppError("Discount, type, and expiryDate are required", 400);
      }

      const newDiscount = await DiscountService.createDiscount({
        code: code || null,
        discount,
        type,
        expiryDate: new Date(expiryDate),
        status: status || "ACTIVE",
        maxUses: maxUses || null,
        productId: productId || null,
      });

      res.status(201).json({ success: true, data: newDiscount });
    } catch (error) {
      next(error);
    }
  }

  static async updateDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const dataToUpdate: any = { ...req.body };
      if (dataToUpdate.expiryDate) {
        dataToUpdate.expiryDate = new Date(dataToUpdate.expiryDate);
      }

      const updatedDiscount = await DiscountService.updateDiscount(
        req.params.id as string,
        dataToUpdate
      );

      res.json({ success: true, data: updatedDiscount });
    } catch (error) {
      next(error);
    }
  }

  static async deleteDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      await DiscountService.deleteDiscount(req.params.id as string);
      res.json({ success: true, message: "Discount deleted successfully" });
    } catch (error) {
      next(error);
    }
  }

  static async validateDiscount(req: Request, res: Response, next: NextFunction) {
    try {
      const { code, cartItems } = req.body;
      if (!code || !cartItems || !Array.isArray(cartItems)) {
        throw new AppError("Code and cartItems are required", 400);
      }
      const result = await DiscountService.validateDiscountCode(code, cartItems);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
