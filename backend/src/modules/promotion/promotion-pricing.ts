import { PromotionDiscountType } from "@prisma/client";

export type PromotionLifecycleStatus = "INACTIVE" | "SCHEDULED" | "ACTIVE" | "EXPIRED";
export type PromotionScope = "PRODUCT_DISCOUNT" | "CATEGORY_DISCOUNT" | "FLASH_SALE" | "COUPON";

export interface PromotionWindow {
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ResolvedPromotion {
  id: string;
  scope: PromotionScope;
  title: string;
  discountType: PromotionDiscountType;
  discountValue: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface ResolvedPricing {
  originalPrice: number;
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  discountLabel: string | null;
  hasDiscount: boolean;
  activePromotion: ResolvedPromotion | null;
}

export const getPromotionLifecycleStatus = (
  window: PromotionWindow,
  now: Date = new Date()
): PromotionLifecycleStatus => {
  if (!window.isActive) {
    return "INACTIVE";
  }

  if (window.startDate && window.startDate > now) {
    return "SCHEDULED";
  }

  if (window.endDate && window.endDate < now) {
    return "EXPIRED";
  }

  return "ACTIVE";
};

export const calculateDiscountAmount = (
  price: number,
  discountType: PromotionDiscountType,
  discountValue: number
) => {
  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }

  const normalizedValue = Math.max(0, Number(discountValue) || 0);
  const rawAmount =
    discountType === "PERCENTAGE" ? price * (normalizedValue / 100) : normalizedValue;

  return Number(Math.min(price, Math.max(0, rawAmount)).toFixed(2));
};

export const calculateFinalPrice = (
  price: number,
  discountType: PromotionDiscountType,
  discountValue: number
) => Number(Math.max(0, price - calculateDiscountAmount(price, discountType, discountValue)).toFixed(2));

export const calculateEffectiveDiscountPercentage = (price: number, discountAmount: number) => {
  if (!Number.isFinite(price) || price <= 0) {
    return 0;
  }

  return Number(Math.min(100, Math.max(0, (discountAmount / price) * 100)).toFixed(2));
};

export const formatDiscountLabel = (
  discountType: PromotionDiscountType,
  discountValue: number,
  currency: string = "TND"
) =>
  discountType === "PERCENTAGE"
    ? `-${Number(discountValue).toFixed(0)}%`
    : `-${currency} ${Number(discountValue).toFixed(2)}`;

export const buildResolvedPricing = (
  price: number,
  promotion: ResolvedPromotion | null
): ResolvedPricing => {
  if (!promotion) {
    return {
      originalPrice: Number(price.toFixed(2)),
      finalPrice: Number(price.toFixed(2)),
      discountAmount: 0,
      discountPercentage: 0,
      discountLabel: null,
      hasDiscount: false,
      activePromotion: null,
    };
  }

  const discountAmount = calculateDiscountAmount(price, promotion.discountType, promotion.discountValue);

  return {
    originalPrice: Number(price.toFixed(2)),
    finalPrice: Number(Math.max(0, price - discountAmount).toFixed(2)),
    discountAmount,
    discountPercentage: calculateEffectiveDiscountPercentage(price, discountAmount),
    discountLabel: formatDiscountLabel(promotion.discountType, promotion.discountValue),
    hasDiscount: discountAmount > 0,
    activePromotion: promotion,
  };
};
