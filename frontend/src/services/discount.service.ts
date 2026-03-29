import { ApiClient } from "@/lib/api-client";

export interface Discount {
  id: string;
  code: string | null;
  discount: number;
  type: "PERCENTAGE" | "FIXED";
  expiryDate: string;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  usageCount: number;
  maxUses: number | null;
  productId: string | null;
  createdAt: string;
  updatedAt: string;
}

export class DiscountService {
  static async getAll() {
    const response = await ApiClient.get<{ data: Discount[] }>("/discounts");
    return response.data;
  }

  static async getById(id: string) {
    const response = await ApiClient.get<{ data: Discount }>(`/discounts/${id}`);
    return response.data;
  }

  static async create(data: Partial<Discount>) {
    const response = await ApiClient.post<{ data: Discount }>("/discounts", data);
    return response.data;
  }

  static async update(id: string, data: Partial<Discount>) {
    const response = await ApiClient.put<{ data: Discount }>(`/discounts/${id}`, data);
    return response.data;
  }

  static async delete(id: string) {
    const response = await ApiClient.delete<{ success: boolean; message: string }>(`/discounts/${id}`);
    return response;
  }
}
