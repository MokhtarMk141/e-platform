import { prisma } from "../../config/database";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

export interface RatingDistribution {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>; // { 1: count, 2: count, ... 5: count }
}

export interface TopRatedProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string;
  stock: number;
  imageUrl: string | null;
  categoryId: string | null;
  brandId: string | null;
  category: { id: string; name: string; slug: string; description: string | null } | null;
  brand: { id: string; name: string; logoUrl: string | null; description: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
  averageRating: number;
  totalReviews: number;
}

export class ReviewRepository {
  async create(userId: string, productId: string, data: CreateReviewDto) {
    return prisma.review.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        userId,
        productId,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async update(id: string, data: UpdateReviewDto) {
    return prisma.review.update({
      where: { id },
      data,
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async delete(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  async getProductRatingStats(productId: string): Promise<RatingDistribution> {
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    for (const review of reviews) {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      sum += review.rating;
    }

    return {
      averageRating: reviews.length > 0 ? sum / reviews.length : 0,
      totalReviews: reviews.length,
      distribution,
    };
  }

  async getTopRatedProducts(limit: number = 8): Promise<TopRatedProduct[]> {
    // Get products that have reviews, ordered by average rating
    const productsWithRatings = await prisma.product.findMany({
      where: {
        reviews: { some: {} },
      },
      include: {
        category: true,
        brand: true,
        reviews: {
          select: { rating: true },
        },
      },
    });

    // Calculate average rating for each product
    const scored = productsWithRatings.map((product) => {
      const ratings = product.reviews.map((r) => r.rating);
      const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        sku: product.sku,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId,
        brandId: product.brandId,
        category: product.category,
        brand: product.brand,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        averageRating: Math.round(avg * 10) / 10,
        totalReviews: ratings.length,
      };
    });

    // Sort by average rating descending, then by total reviews descending
    scored.sort((a, b) => {
      if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
      return b.totalReviews - a.totalReviews;
    });

    return scored.slice(0, limit);
  }
}
