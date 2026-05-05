
import { ActivePromotionSummary } from "./promotion.types"

export interface CategorySummary {
  id: string
  name: string
  slug: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parentId: string | null
  directProductCount?: number
  productCount?: number
  children?: Category[]
}

export interface Brand {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  productCount?: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  discountPercentage: number
  discountAmount: number
  discountLabel: string | null
  finalPrice: number
  hasDiscount: boolean
  activePromotion: ActivePromotionSummary | null
  sku: string
  stock: number
  imageUrl: string | null
  categoryId: string | null
  brandId: string | null
  category: Category | null
  brand: Brand | null
  createdAt: string
  updatedAt: string
}

export interface ProductListResponse {
  success: boolean
  message: string
  data: Product[]
  total: number
  page: number
  limit: number
}

export interface ProductResponse {
  success: boolean
  message: string
  data: Product
}

export interface GeneratedProductContentResponse {
  success: boolean
  message: string
  data: {
    description: string
  }
}

export interface ProductListMeta {
  total: number
  page: number
  limit: number
}

export interface ApiProductListResponse {
  success: boolean
  message: string
  data: Product[]
  meta: ProductListMeta
}

export interface CategoryListResponse {
  success: boolean
  message: string
  data: Category[]
}

export interface BrandListResponse {
  success: boolean
  message: string
  data: Brand[]
}

export interface ProductFilters {
  page?: number
  limit?: number
  categoryId?: string
  minPrice?: number | Array<number | null>
  maxPrice?: number | Array<number | null>
  search?: string
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'newest'
}

export interface Review {
  id: string
  rating: number
  comment: string
  userId: string
  productId: string
  user: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface RatingStats {
  averageRating: number
  totalReviews: number
  distribution: Record<number, number>
}

export interface ProductReviewsResponse {
  success: boolean
  message: string
  data: {
    reviews: Review[]
    stats: RatingStats
  }
}

export interface TopRatedProduct extends Product {
  averageRating: number
  totalReviews: number
}

export interface TopRatedProductsResponse {
  success: boolean
  message: string
  data: TopRatedProduct[]
}
