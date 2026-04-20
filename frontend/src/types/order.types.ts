export type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type DeliveryMode = "STANDARD" | "EXPRESS" | "PICKUP";
export type PaymentMethod = "CASH_ON_DELIVERY" | "STRIPE";

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  stripeSessionId: string | null;
  paidAt: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddressLine1: string | null;
  shippingAddressLine2: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  deliveryMode: DeliveryMode;
  paymentMethod: PaymentMethod;
  orderNotes: string | null;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry: string;
  deliveryMode: DeliveryMode;
  paymentMethod: PaymentMethod;
  orderNotes?: string;
  discountCode?: string;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface CheckoutSessionResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    sessionId: string;
    checkoutUrl: string | null;
  };
}
