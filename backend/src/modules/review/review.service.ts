import { ReviewRepository } from "./review.repository";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { AppError } from "../../exceptions/app-error";
import { PromotionService } from "../promotion/promotion.service";
import { ProductResponseDto } from "../product/dto/product-response.dto";
import { ProductRepository } from "../product/product.repository";

export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository = new ReviewRepository(),
    private productRepository: ProductRepository = new ProductRepository()
  ) {}

  async createReview(userId: string, productId: string, dto: CreateReviewDto) {
    // Check product exists
    const product = await this.productRepository.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Check if user already reviewed this product
    const existing = await this.reviewRepository.findByUserAndProduct(userId, productId);
    if (existing) {
      throw new AppError("You have already reviewed this product. Use PUT to update.", 409);
    }

    return this.reviewRepository.create(userId, productId, dto);
  }

  async getReviewsForProduct(productId: string) {
    const [reviews, stats] = await Promise.all([
      this.reviewRepository.findByProductId(productId),
      this.reviewRepository.getProductRatingStats(productId),
    ]);

    return { reviews, stats };
  }

  async updateReview(reviewId: string, userId: string, dto: UpdateReviewDto) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (review.userId !== userId) {
      throw new AppError("You can only edit your own reviews", 403);
    }

    return this.reviewRepository.update(reviewId, dto);
  }

  async deleteReview(reviewId: string, userId: string, userRole: string) {
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    // Allow owner or admin to delete
    if (review.userId !== userId && userRole !== "ADMIN") {
      throw new AppError("You can only delete your own reviews", 403);
    }

    await this.reviewRepository.delete(reviewId);
  }

  async getTopRatedProducts(limit: number = 8) {
    const topProducts = await this.reviewRepository.getTopRatedProducts(limit);

    // Resolve pricing for each product
    const productsForPricing = topProducts.map((p) => ({
      ...p,
      aiproductDescriptions: [],
      cartItems: [],
      flashSaleLinks: [],
      productDiscounts: [],
      orderItems: [],
      recommendations: [],
      reviews: [],
    }));

    const pricingByProductId = await PromotionService.resolvePricingForProducts(
      productsForPricing as any
    );

    return topProducts.map((product) => {
      const pricing = pricingByProductId.get(product.id) ?? {
        originalPrice: product.price,
        finalPrice: product.price,
        discountAmount: 0,
        discountPercentage: 0,
        discountLabel: null,
        hasDiscount: false,
        activePromotion: null,
      };

      return {
        ...new ProductResponseDto(product as any, pricing),
        averageRating: product.averageRating,
        totalReviews: product.totalReviews,
      };
    });
  }
}
