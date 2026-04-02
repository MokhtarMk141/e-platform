import { OrderStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../exceptions/app-error";
import { OrderResponseDto } from "./dto/order-response.dto";
import { OrderRepository } from "./order.repository";
import { CheckoutOrderDto } from "./dto/checkout-order.dto";
import { OrderEmailService } from "./order.email";
import { DiscountService } from "../discount/discount.service";

export class OrderService {
  constructor(private orderRepository: OrderRepository = new OrderRepository()) {}

  async checkout(userId: string, checkoutData: CheckoutOrderDto): Promise<OrderResponseDto> {
    const createdOrder = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new AppError("Your cart is empty", 400);
      }

      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}, requested: ${item.quantity}`,
            400
          );
        }
      }

      let total = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      let discountAmount = 0;

      if (checkoutData.discountCode) {
        const cartForValidation = cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price,
        }));

        const validation = await DiscountService.validateDiscountCode(
          checkoutData.discountCode,
          cartForValidation
        );

        discountAmount = validation.discountAmount;
        total -= discountAmount;

        // Increment usage count
        await tx.discount.update({
          where: { id: validation.discountId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Restore stock decrement logic
      for (const item of cart.items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new AppError(`Failed to reserve stock for ${item.product.name}`, 400);
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          status: "PENDING",
          total: Number(Math.max(0, total).toFixed(2)),
          customerName: checkoutData.customerName.trim(),
          customerEmail: checkoutData.customerEmail.trim(),
          customerPhone: checkoutData.customerPhone.trim(),
          shippingAddressLine1: checkoutData.shippingAddressLine1.trim(),
          shippingAddressLine2: checkoutData.shippingAddressLine2?.trim() || null,
          shippingCity: checkoutData.shippingCity.trim(),
          shippingState: checkoutData.shippingState?.trim() || null,
          shippingPostalCode: checkoutData.shippingPostalCode?.trim() || null,
          shippingCountry: checkoutData.shippingCountry.trim(),
          deliveryMode: checkoutData.deliveryMode,
          paymentMethod: checkoutData.paymentMethod,
          orderNotes: checkoutData.orderNotes?.trim() || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return tx.order.findUnique({
        where: { id: order.id },
        include: { items: { include: { product: true } } },
      });
    });

    if (!createdOrder) {
      throw new AppError("Failed to create order", 500);
    }

    // Send order confirmation email asynchronously
    void OrderEmailService.sendOrderConfirmation(createdOrder).catch((err) =>
      console.error("Failed to send order confirmation email:", err)
    );

    return new OrderResponseDto(createdOrder);
  }

  async getMyOrders(userId: string): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findByUserId(userId);
    return orders.map((order) => new OrderResponseDto(order));
  }

  async getAllOrders(): Promise<OrderResponseDto[]> {
    const orders = await this.orderRepository.findAll();
    return orders.map((order) => new OrderResponseDto(order));
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderResponseDto> {
    const existing = await this.orderRepository.findById(orderId);
    if (!existing) {
      throw new AppError("Order not found", 404);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: { include: { product: true } } },
    });

    // Send status update email asynchronously
    void OrderEmailService.sendStatusUpdate(updated).catch((err) =>
      console.error("Failed to send status update email:", err)
    );

    return new OrderResponseDto(updated);
  }
}
