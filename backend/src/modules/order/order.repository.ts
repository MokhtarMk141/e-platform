import { Prisma } from "@prisma/client";
import { prisma } from "../../config/database";

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { product: true } } };
}>;

export class OrderRepository {
  async findById(id: string): Promise<OrderWithItems | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  }

  async findByUserId(userId: string): Promise<OrderWithItems[]> {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(): Promise<OrderWithItems[]> {
    return prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });
  }
}
