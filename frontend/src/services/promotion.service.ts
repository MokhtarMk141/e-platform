import { ApiClient } from "@/lib/api-client";
import {
  CategoryDiscountRecord,
  CouponRecord,
  CouponValidationResult,
  FlashSaleRecord,
  ProductDiscountRecord,
} from "@/types/promotion.types";

type ApiResponse<T> = { data: T };

export class PromotionService {
  static async getActivePromotions() {
    const response = await ApiClient.get<ApiResponse<any>>("/promotions/active");
    return response.data;
  }

  static async getProductDiscounts() {
    const response = await ApiClient.get<ApiResponse<ProductDiscountRecord[]>>("/promotions/product-discounts");
    return response.data;
  }

  static async createProductDiscount(data: {
    productId: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const response = await ApiClient.post<ApiResponse<ProductDiscountRecord>>("/promotions/product-discounts", data);
    return response.data;
  }

  static async updateProductDiscount(id: string, data: Partial<{
    productId: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }>) {
    const response = await ApiClient.put<ApiResponse<ProductDiscountRecord>>(`/promotions/product-discounts/${id}`, data);
    return response.data;
  }

  static async deleteProductDiscount(id: string) {
    return ApiClient.delete(`/promotions/product-discounts/${id}`);
  }

  static async getCategoryDiscounts() {
    const response = await ApiClient.get<ApiResponse<CategoryDiscountRecord[]>>("/promotions/category-discounts");
    return response.data;
  }

  static async createCategoryDiscount(data: {
    categoryId: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const response = await ApiClient.post<ApiResponse<CategoryDiscountRecord>>("/promotions/category-discounts", data);
    return response.data;
  }

  static async updateCategoryDiscount(id: string, data: Partial<{
    categoryId: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }>) {
    const response = await ApiClient.put<ApiResponse<CategoryDiscountRecord>>(`/promotions/category-discounts/${id}`, data);
    return response.data;
  }

  static async deleteCategoryDiscount(id: string) {
    return ApiClient.delete(`/promotions/category-discounts/${id}`);
  }

  static async getFlashSales() {
    const response = await ApiClient.get<ApiResponse<FlashSaleRecord[]>>("/promotions/flash-sales");
    return response.data;
  }

  static async createFlashSale(data: {
    name: string;
    productIds: string[];
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate?: string | null;
    endDate?: string | null;
    isActive?: boolean;
  }) {
    const response = await ApiClient.post<ApiResponse<FlashSaleRecord>>("/promotions/flash-sales", data);
    return response.data;
  }

  static async updateFlashSale(id: string, data: Partial<{
    name: string;
    productIds: string[];
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }>) {
    const response = await ApiClient.put<ApiResponse<FlashSaleRecord>>(`/promotions/flash-sales/${id}`, data);
    return response.data;
  }

  static async deleteFlashSale(id: string) {
    return ApiClient.delete(`/promotions/flash-sales/${id}`);
  }

  static async getCoupons() {
    const response = await ApiClient.get<ApiResponse<CouponRecord[]>>("/promotions/coupons");
    return response.data;
  }

  static async createCoupon(data: {
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate?: string | null;
    endDate?: string | null;
    usageLimit?: number | null;
    isActive?: boolean;
  }) {
    const response = await ApiClient.post<ApiResponse<CouponRecord>>("/promotions/coupons", data);
    return response.data;
  }

  static async updateCoupon(id: string, data: Partial<{
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    startDate: string | null;
    endDate: string | null;
    usageLimit: number | null;
    isActive: boolean;
  }>) {
    const response = await ApiClient.put<ApiResponse<CouponRecord>>(`/promotions/coupons/${id}`, data);
    return response.data;
  }

  static async deleteCoupon(id: string) {
    return ApiClient.delete(`/promotions/coupons/${id}`);
  }

  static async validateCoupon(code: string, cartItems: { productId: string; quantity: number; price: number }[]) {
    const response = await ApiClient.post<ApiResponse<CouponValidationResult>>("/promotions/coupons/validate", {
      code,
      cartItems,
    });
    return response.data;
  }
}
