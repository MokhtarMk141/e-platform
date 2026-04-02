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
    realized: number;
    potential: number;
    averageOrderValue: number;
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
  recentOrders: Array<{
    id: string;
    customerName: string | null;
    total: number;
    status: string;
    createdAt: string;
  }>;
  statusDistribution: Array<{
    status: string;
    count: number;
  }>;
  categorySales: Array<{
    categoryId: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    sku: string;
    stock: number;
  }>;
}

export class AnalyticsService {
  static getOverview(): Promise<{ data: AnalyticsOverview }> {
    return ApiClient.get<{ data: AnalyticsOverview }>('/analytics/overview');
  }
}
