import { ApiClient } from '@/lib/api-client';
import {
  ApiProductListResponse,
  ProductListResponse,
  ProductResponse,
  ProductFilters,
  Product,
} from '@/types/product.types'

export class ProductService {
  static async uploadImage(file: File): Promise<string> {
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });

    const response = await ApiClient.post<{ data: { imageUrl: string } }>("/products/upload-image", {
      fileName: file.name,
      fileData,
    });

    return response.data.imageUrl;
  }

  static getAll(filters: ProductFilters = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams()
    const minPrices = Array.isArray(filters.minPrice) ? filters.minPrice : filters.minPrice != null ? [filters.minPrice] : []
    const maxPrices = Array.isArray(filters.maxPrice) ? filters.maxPrice : filters.maxPrice != null ? [filters.maxPrice] : []

    if (filters.page)       params.append('page',       String(filters.page))
    if (filters.limit)      params.append('limit',      String(filters.limit))
    if (filters.categoryId) params.append('categoryId', filters.categoryId)
    minPrices.forEach(value => params.append('minPrice', value == null ? '' : String(value)))
    maxPrices.forEach(value => params.append('maxPrice', value == null ? '' : String(value)))
    if (filters.search)     params.append('search',     filters.search)
    if (filters.sortBy)     params.append('sortBy',     filters.sortBy)

    const query = params.toString()
    return ApiClient.get<ApiProductListResponse>(
      `/products${query ? `?${query}` : ''}`
    ).then((response) => ({
      success: response.success,
      message: response.message,
      data: response.data,
      total: response.meta?.total ?? 0,
      page: response.meta?.page ?? filters.page ?? 1,
      limit: response.meta?.limit ?? filters.limit ?? 20,
    }))
  }

  static getById(id: string): Promise<ProductResponse> {
    return ApiClient.get<ProductResponse>(`/products/${id}`)
  }

  static create(data: Partial<Product> | FormData): Promise<ProductResponse> {
    return ApiClient.post<ProductResponse>('/products', data)
  }

  static update(id: string, data: Partial<Product> | FormData): Promise<ProductResponse> {
    return ApiClient.put<ProductResponse>(`/products/${id}`, data)
  }

  static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/products/${id}`)
  }
}
