import { ProductWithCategory } from "../product.repository";
import { ResolvedPricing } from "../../promotion/promotion-pricing";

export class ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPercentage: number;
  discountAmount: number;
  discountLabel: string | null;
  finalPrice: number;
  hasDiscount: boolean;
  activePromotion: ResolvedPricing["activePromotion"];
  sku: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  brandId: string | null;
  category: {
    id: string;
    name: string;
    description: string | null;
    parent: { id: string; name: string } | null;
  } | null;
  brand: { id: string; name: string; logoUrl: string | null; description: string | null } | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(product: ProductWithCategory, pricing: ResolvedPricing) {
    this.id = product.id;
    this.name = product.name;
    this.description = product.description;
    this.price = product.price;
    this.discountPercentage = pricing.discountPercentage;
    this.discountAmount = pricing.discountAmount;
    this.discountLabel = pricing.discountLabel;
    this.finalPrice = pricing.finalPrice;
    this.hasDiscount = pricing.hasDiscount;
    this.activePromotion = pricing.activePromotion;
    this.sku = product.sku;
    this.stock = product.stock;
    this.imageUrl = product.imageUrl;
    this.categoryId = product.categoryId;
    this.brandId = product.brandId;
    this.category = product.category
      ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
          parent: product.category.parent
            ? { id: product.category.parent.id, name: product.category.parent.name }
            : null,
        }
      : null;
    this.brand = product.brand
      ? {
          id: product.brand.id,
          name: product.brand.name,
          logoUrl: product.brand.logoUrl,
          description: product.brand.description,
        }
      : null;
    this.createdAt = product.createdAt;
    this.updatedAt = product.updatedAt;
  }
}
