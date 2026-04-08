
export interface CategorySummary {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  directProductCount?: number
  productCount?: number
}

export interface Subcategory {
  id: string
  name: string
  description: string | null
  categoryId: string
  category: CategorySummary | null
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
  subcategoryId: string | null
  brandId: string | null
  category: Category | null
  subcategory: Subcategory | null
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

export interface SubcategoryListResponse {
  success: boolean
  message: string
  data: Subcategory[]
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
  subcategoryId?: string
  minPrice?: number | Array<number | null>
  maxPrice?: number | Array<number | null>
  search?: string
  sortBy?: 'featured' | 'price_asc' | 'price_desc' | 'newest'
}
