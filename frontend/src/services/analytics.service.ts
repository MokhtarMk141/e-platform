import { ApiClient } from '@/lib/api-client';

export interface AnalyticsOverview {
  totals: {
    users: number;
    customers: number;
    admins: number;
    products: number;
    categories: number;
    discounts: number;
    activeDiscounts: number;
    carts: number;
    cartsWithItems: number;
    orders: number;
    pendingOrders: number;
  };
  revenue: {
    gross: number;
    averageOrderValue: number;
    deliveredRevenue: number;
  };
  carts: {
    itemsInOpenCarts: number;
    estimatedOpenCartValue: number;
  };
  topProducts: Array<{
    productId: string;
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }>;
  monthly: Array<{
    month: string;
    orders: number;
    revenue: number;
    newUsers: number;
  }>;
}

export class AnalyticsService {
  static getOverview(): Promise<{ data: AnalyticsOverview }> {
    return ApiClient.get<{ data: AnalyticsOverview }>('/analytics/overview');
  }
}
