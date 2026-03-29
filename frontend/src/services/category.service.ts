import { ApiClient } from '@/lib/api-client'
import { CategoryListResponse, Category } from '@/types/product.types'

export interface CategoryResponse {
  success: boolean
  message: string
  data: Category
}

export class CategoryService {

  static getAll(): Promise<CategoryListResponse> {
    return ApiClient.get<CategoryListResponse>('/categories')
  }

  static getById(id: string): Promise<CategoryResponse> {
    return ApiClient.get<CategoryResponse>(`/categories/${id}`)
  }

  static create(data: Partial<Category>): Promise<CategoryResponse> {
    return ApiClient.post<CategoryResponse>('/categories', data)
  }

  static update(id: string, data: Partial<Category>): Promise<CategoryResponse> {
    return ApiClient.put<CategoryResponse>(`/categories/${id}`, data)
  }

  static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/categories/${id}`)
  }
}