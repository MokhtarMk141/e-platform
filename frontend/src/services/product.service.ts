import { ApiClient } from '@/lib/api-client';
import {
  ProductListResponse,
  ProductResponse,
  ProductFilters,
} from '@/types/product.types'

export class ProductService {

  static getAll(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams()

    if (filters.page)       params.append('page',       String(filters.page))
    if (filters.limit)      params.append('limit',      String(filters.limit))
    if (filters.categoryId) params.append('categoryId', filters.categoryId)

    const query = params.toString()
    return ApiClient.get<ProductListResponse>(
      `/products${query ? `?${query}` : ''}`
    )
  }

  static getById(id: string): Promise<ProductResponse> {
    return ApiClient.get<ProductResponse>(`/products/${id}`)
  }
}