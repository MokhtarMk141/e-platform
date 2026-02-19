
import { ApiClient } from '@/lib/api-client'
import { CategoryListResponse } from '@/types/product.types'

export class CategoryService {

  static getAll(): Promise<CategoryListResponse> {
    return ApiClient.get<CategoryListResponse>('/categories')
  }
}