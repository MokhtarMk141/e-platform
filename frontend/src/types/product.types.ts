
export interface Category {
  id: string
  name: string
  description: string | null
  productCount?: number
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
