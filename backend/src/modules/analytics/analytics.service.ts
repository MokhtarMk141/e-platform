import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

type RevenueResult = { _sum: { total: number | null } };

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
    status: OrderStatus;
    createdAt: Date;
  }>;
  statusDistribution: Array<{
    status: OrderStatus;
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

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildMonthSeries = (months: number) => {
  const now = new Date();
  const current = startOfMonth(now);
  const result: string[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(current.getFullYear(), current.getMonth() - i, 1);
    result.push(toMonthKey(d));
  }

  return result;
};

export class AnalyticsService {
  async getOverview(): Promise<AnalyticsOverview> {
    const [
      users,
      customers,
      admins,
      products,
      categories,
      discounts,
      activeDiscounts,
      carts,
      cartsWithItems,
      orders,
      pendingOrders,
      grossRevenueAgg,
      deliveredRevenueAgg,
      openCartItems,
      topProductSales,
      orderLogs,
      recentUsers,
      recentOrdersRaw,
      statusCounts,
      categorySalesRaw,
      lowStock,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.product.count(),
      prisma.category.count(),
      prisma.discount.count(),
      prisma.discount.count({ where: { status: "ACTIVE" } }),
      prisma.cart.count(),
      prisma.cart.count({ where: { items: { some: {} } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }) as Promise<RevenueResult>,
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: "DELIVERED" },
      }) as Promise<RevenueResult>,
      prisma.cartItem.findMany({
        select: {
          quantity: true,
          product: { select: { price: true } },
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true, price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } },
        select: { createdAt: true, total: true, status: true },
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } },
        select: { createdAt: true },
      }),
      // NEW DATA: Recent Orders
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, customerName: true, total: true, status: true, createdAt: true },
      }),
      // NEW DATA: Status Distribution
      prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      // NEW DATA: Category Sales
      prisma.orderItem.findMany({
        where: { order: { status: { not: "CANCELLED" } } },
        select: {
          quantity: true,
          price: true,
          product: {
            select: {
              category: { select: { id: true, name: true } },
            },
          },
        },
      }),
      // NEW DATA: Low Stock
      prisma.product.findMany({
        where: { stock: { lt: 10 } },
        select: { id: true, name: true, sku: true, stock: true },
        orderBy: { stock: "asc" },
        take: 5,
      }),
    ]);

    const topProductIds = topProductSales.map((row) => row.productId);
    const topProductsMeta = topProductIds.length
      ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, sku: true },
      })
      : [];

    const productMetaById = new Map(topProductsMeta.map((p) => [p.id, p]));

    const topProducts = topProductSales.map((row) => {
      const meta = productMetaById.get(row.productId);
      const unitsSold = row._sum.quantity ?? 0;
      const revenue = row._sum.price ?? 0;

      return {
        productId: row.productId,
        name: meta?.name ?? "Unknown product",
        sku: meta?.sku ?? "N/A",
        unitsSold,
        revenue,
      };
    });

    const monthKeys = buildMonthSeries(6);
    const monthlySeed = monthKeys.reduce<Record<string, { orders: number; revenue: number; newUsers: number }>>(
      (acc, key) => {
        acc[key] = { orders: 0, revenue: 0, newUsers: 0 };
        return acc;
      },
      {}
    );

    for (const order of orderLogs) {
      if (order.status === OrderStatus.CANCELLED) continue;
      const key = toMonthKey(order.createdAt);
      if (!monthlySeed[key]) continue;

      monthlySeed[key].orders += 1;
      // Monthly chart now strictly shows REALIZED profit (Delivered)
      if (order.status === OrderStatus.DELIVERED) {
        monthlySeed[key].revenue += order.total;
      }
    }

    for (const user of recentUsers) {
      const key = toMonthKey(user.createdAt);
      if (!monthlySeed[key]) continue;
      monthlySeed[key].newUsers += 1;
    }

    const monthly = monthKeys.map((key) => ({
      month: key,
      orders: monthlySeed[key].orders,
      revenue: Number(monthlySeed[key].revenue.toFixed(2)),
      newUsers: monthlySeed[key].newUsers,
    }));

    // Process Category Sales
    const categoryMap = new Map<string, { name: string; orders: number; revenue: number }>();
    for (const item of categorySalesRaw) {
      const cat = item.product.category;
      const catId = cat?.id ?? "uncategorized";
      const catName = cat?.name ?? "Uncategorized";

      const current = categoryMap.get(catId) || { name: catName, orders: 0, revenue: 0 };
      current.orders += item.quantity;
      current.revenue += item.quantity * item.price;
      categoryMap.set(catId, current);
    }
    const categorySales = Array.from(categoryMap.entries()).map(([id, val]) => ({
      categoryId: id,
      name: val.name,
      orders: val.orders,
      revenue: Number(val.revenue.toFixed(2)),
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const realized = deliveredRevenueAgg._sum.total ?? 0;
    const potential = grossRevenueAgg._sum.total ?? 0;
    // AOV based on realized revenue / total orders (or delivered orders? let's stick to total for general value)
    const averageOrderValue = orders > 0 ? realized / orders : 0;

    const itemsInOpenCarts = openCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const estimatedOpenCartValue = openCartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0
    );

    return {
      totals: {
        users,
        customers,
        admins,
        products,
        categories,
        discounts,
        activeDiscounts,
        carts,
        cartsWithItems,
        orders,
        pendingOrders,
      },
      revenue: {
        realized: Number(realized.toFixed(2)),
        potential: Number(potential.toFixed(2)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
      },
      carts: {
        itemsInOpenCarts,
        estimatedOpenCartValue: Number(estimatedOpenCartValue.toFixed(2)),
      },
      topProducts,
      monthly,
      recentOrders: recentOrdersRaw,
      statusDistribution: statusCounts.map(s => ({
        status: s.status,
        count: s._count.status
      })),
      categorySales,
      lowStockProducts: lowStock,
    };
  }
}
