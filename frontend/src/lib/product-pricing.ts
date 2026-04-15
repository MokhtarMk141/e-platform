import { ActivePromotionSummary } from "@/types/promotion.types"

type ProductPricingInput = {
  price: number
  finalPrice?: number | null
  hasDiscount?: boolean | null
  discountLabel?: string | null
  discountPercentage?: number | null
  activePromotion?: ActivePromotionSummary | null
}

export const getProductFinalPrice = (product: ProductPricingInput) => {
  if (typeof product.finalPrice === 'number' && Number.isFinite(product.finalPrice)) {
    return product.finalPrice
  }

  return Number(product.price.toFixed(2))
}

export const productHasDiscount = (product: ProductPricingInput) => {
  if (typeof product.hasDiscount === 'boolean') {
    return product.hasDiscount
  }

  return getProductFinalPrice(product) < product.price
}

export const getProductDiscountLabel = (product: ProductPricingInput, currency: string = 'TND') => {
  if (product.discountLabel) {
    return product.discountLabel
  }

  if (product.activePromotion) {
    return product.activePromotion.discountType === 'PERCENTAGE'
      ? `-${Number(product.activePromotion.discountValue).toFixed(0)}%`
      : `-${currency} ${Number(product.activePromotion.discountValue).toFixed(2)}`
  }

  if (typeof product.discountPercentage === 'number' && product.discountPercentage > 0) {
    return `-${product.discountPercentage.toFixed(0)}%`
  }

  return null
}
