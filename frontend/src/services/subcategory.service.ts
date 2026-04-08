import { ApiClient } from '@/lib/api-client'
import { Subcategory, SubcategoryListResponse } from '@/types/product.types'

export interface SubcategoryResponse {
  success: boolean
  message: string
  data: Subcategory
}

export class SubcategoryService {
  static getAll(): Promise<SubcategoryListResponse> {
    return ApiClient.get<SubcategoryListResponse>('/subcategories')
  }

  static getById(id: string): Promise<SubcategoryResponse> {
    return ApiClient.get<SubcategoryResponse>(`/subcategories/${id}`)
  }

  static create(data: Partial<Subcategory>): Promise<SubcategoryResponse> {
    return ApiClient.post<SubcategoryResponse>('/subcategories', data)
  }

  static update(id: string, data: Partial<Subcategory>): Promise<SubcategoryResponse> {
    return ApiClient.put<SubcategoryResponse>(`/subcategories/${id}`, data)
  }

  static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/subcategories/${id}`)
  }
}
