
export interface Category {
  id: string
  name: string
  description: string | null
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
  category: Category | null
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

export interface CategoryListResponse {
  success: boolean
  message: string
  data: Category[]
}

export interface ProductFilters {
  page?: number
  limit?: number
  categoryId?: string
}