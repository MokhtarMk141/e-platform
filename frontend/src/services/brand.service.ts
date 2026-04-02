import { ApiClient } from '@/lib/api-client'
import { BrandListResponse, Brand } from '@/types/product.types'

export interface BrandResponse {
  success: boolean
  message: string
  data: Brand
}

export interface BrandUploadResponse {
  success: boolean
  message: string
  data: { logoUrl: string }
}

export class BrandService {
  static async uploadLogo(file: File): Promise<string> {
    const fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ""))
      reader.onerror = () => reject(new Error("Failed to read image file"))
      reader.readAsDataURL(file)
    })

    const response = await ApiClient.post<BrandUploadResponse>("/brands/upload-logo", {
      fileName: file.name,
      fileData,
    })

    return response.data.logoUrl
  }

  static getAll(): Promise<BrandListResponse> {
    return ApiClient.get<BrandListResponse>('/brands')
  }

  static getById(id: string): Promise<BrandResponse> {
    return ApiClient.get<BrandResponse>(`/brands/${id}`)
  }

  static create(data: Partial<Brand>): Promise<BrandResponse> {
    return ApiClient.post<BrandResponse>('/brands', data)
  }

  static update(id: string, data: Partial<Brand>): Promise<BrandResponse> {
    return ApiClient.put<BrandResponse>(`/brands/${id}`, data)
  }

  static delete(id: string): Promise<void> {
    return ApiClient.delete<void>(`/brands/${id}`)
  }
}
