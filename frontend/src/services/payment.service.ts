import { ApiClient } from "@/lib/api-client";
import { CheckoutRequest, CheckoutSessionResponse } from "@/types/order.types";

export class PaymentService {
  static createCheckoutSession(payload: CheckoutRequest): Promise<CheckoutSessionResponse> {
    return ApiClient.post<CheckoutSessionResponse>("/payments/checkout-session", payload);
  }
}
