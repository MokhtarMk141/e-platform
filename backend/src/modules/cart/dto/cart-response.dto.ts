import { Cart, CartItem, Product } from "@prisma/client";
import { PromotionService } from "../../promotion/promotion.service";
import { ResolvedPricing } from "../../promotion/promotion-pricing";

type CartProduct = Pick<Product, "id" | "name" | "price" | "categoryId" | "imageUrl" | "sku">;

export class CartItemResponseDto {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  discountLabel: string | null;
  hasDiscount: boolean;
  activePromotion: ResolvedPricing["activePromotion"];
  imageUrl: string | null;
  sku: string;
  quantity: number;

  constructor(item: CartItem & { product: CartProduct }, pricing: ResolvedPricing) {
    this.id = item.id;
    this.productId = item.productId;
    this.name = item.product.name;
    this.price = pricing.finalPrice;
    this.originalPrice = item.product.price;
    this.discountPercentage = pricing.discountPercentage;
    this.discountAmount = pricing.discountAmount;
    this.discountLabel = pricing.discountLabel;
    this.hasDiscount = pricing.hasDiscount;
    this.activePromotion = pricing.activePromotion;
    this.imageUrl = item.product.imageUrl;
    this.sku = item.product.sku;
    this.quantity = item.quantity;
  }
}

export class CartResponseDto {
  id: string;
  userId: string;
  items: CartItemResponseDto[];
  totalItems: number;
  totalAmount: number;

  private constructor(cart: Cart, items: CartItemResponseDto[]) {
    this.id = cart.id;
    this.userId = cart.userId;
    this.items = items;
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.totalAmount = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  static async create(cart: Cart & { items: (CartItem & { product: CartProduct })[] }) {
    const pricingByProductId = await PromotionService.resolvePricingForProducts(
      cart.items.map((item) => item.product)
    );

    const items = cart.items.map(
      (item) =>
        new CartItemResponseDto(
          item,
          pricingByProductId.get(item.productId) ?? {
            originalPrice: item.product.price,
            finalPrice: item.product.price,
            discountAmount: 0,
            discountPercentage: 0,
            discountLabel: null,
            hasDiscount: false,
            activePromotion: null,
          }
        )
    );

    return new CartResponseDto(cart, items);
  }
}
