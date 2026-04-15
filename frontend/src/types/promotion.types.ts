export type PromotionDiscountType = "PERCENTAGE" | "FIXED";
export type PromotionLifecycleStatus = "INACTIVE" | "SCHEDULED" | "ACTIVE" | "EXPIRED";
export type PromotionScope = "PRODUCT_DISCOUNT" | "CATEGORY_DISCOUNT" | "FLASH_SALE" | "COUPON";

export interface ActivePromotionSummary {
  id: string;
  scope: PromotionScope;
  title: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string | null;
  endDate: string | null;
}

export interface ProductDiscountRecord {
  id: string;
  productId: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  lifecycleStatus: PromotionLifecycleStatus;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface CategoryDiscountRecord {
  id: string;
  categoryId: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  lifecycleStatus: PromotionLifecycleStatus;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface FlashSaleRecord {
  id: string;
  name: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  lifecycleStatus: PromotionLifecycleStatus;
  createdAt: string;
  updatedAt: string;
  products: Array<{
    id: string;
    flashSaleId: string;
    productId: string;
    product: {
      id: string;
      name: string;
      sku: string;
    };
  }>;
}

export interface CouponRecord {
  id: string;
  code: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: string | null;
  endDate: string | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;
  lifecycleStatus: PromotionLifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  couponId: string;
  code: string;
  discountAmount: number;
  discountType: PromotionDiscountType;
  discountValue: number;
  discountLabel: string;
  lifecycleStatus: PromotionLifecycleStatus;
}
