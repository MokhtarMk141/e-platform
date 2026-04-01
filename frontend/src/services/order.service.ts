import { ApiClient } from "@/lib/api-client";
import { CheckoutRequest, OrderResponse, OrdersResponse, OrderStatus } from "@/types/order.types";

export class OrderService {
  static checkout(payload: CheckoutRequest): Promise<OrderResponse> {
    return ApiClient.post<OrderResponse>("/orders/checkout", payload);
  }

  static getMyOrders(): Promise<OrdersResponse> {
    return ApiClient.get<OrdersResponse>("/orders/me");
  }

  static getAllOrders(): Promise<OrdersResponse> {
    return ApiClient.get<OrdersResponse>("/orders");
  }

  static updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponse> {
    return ApiClient.patch<OrderResponse>(`/orders/${orderId}/status`, { status });
  }
}
