import { ApiClient } from '@/lib/api-client'
import {
  ProductReviewsResponse,
  TopRatedProductsResponse,
} from '@/types/product.types'

export class ReviewService {
  static getProductReviews(productId: string): Promise<ProductReviewsResponse> {
    return ApiClient.get<ProductReviewsResponse>(`/reviews/product/${productId}`)
  }

  static createReview(
    productId: string,
    data: { rating: number; comment: string }
  ): Promise<any> {
    return ApiClient.post(`/reviews/product/${productId}`, data)
  }

  static updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<any> {
    return ApiClient.put(`/reviews/${reviewId}`, data)
  }

  static deleteReview(reviewId: string): Promise<void> {
    return ApiClient.delete<void>(`/reviews/${reviewId}`)
  }

  static getTopRatedProducts(limit: number = 8): Promise<TopRatedProductsResponse> {
    return ApiClient.get<TopRatedProductsResponse>(`/reviews/top-rated?limit=${limit}`)
  }
}
