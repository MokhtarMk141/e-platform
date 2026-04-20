import { OrderStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { AppError } from "../../exceptions/app-error";
import { OrderResponseDto } from "./dto/order-response.dto";
import { OrderRepository } from "./order.repository";
import { CheckoutOrderDto } from "./dto/checkout-order.dto";
import { OrderEmailService } from "./order.email";
import { PromotionService } from "../promotion/promotion.service";

export class OrderService {
  constructor(private orderRepository: OrderRepository = new OrderRepository()) {}

  async checkout(userId: string, checkoutData: CheckoutOrderDto): Promise<OrderResponseDto> {
    const createdOrder = await this.createOrderFromCart(userId, checkoutData, {
      decrementStock: true,
      clearCart: true,
    });

    if (!createdOrder) {
      throw new AppError("Failed to create order", 500);
    }

    await this.sendOrderConfirmation(createdOrder);

    return new OrderResponseDto(createdOrder);
  }

  async createPendingStripeOrder(userId: string, checkoutData: CheckoutOrderDto) {
    const createdOrder = await this.createOrderFromCart(userId, checkoutData, {
      decrementStock: false,
      clearCart: false,
    });

    if (!createdOrder) {
      throw new AppError("Failed to create pending order", 500);
    }

    return createdOrder;
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

  async sendOrderConfirmation(order: Awaited<ReturnType<OrderRepository["findById"]>>) {
    if (!order) {
      return;
    }

    void OrderEmailService.sendOrderConfirmation(order).catch((err) =>
      console.error("Failed to send order confirmation email:", err)
    );
  }

  private async createOrderFromCart(
    userId: string,
    checkoutData: CheckoutOrderDto,
    options: { decrementStock: boolean; clearCart: boolean }
  ) {
    return prisma.$transaction(async (tx) => {
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

      const pricingByProductId = await PromotionService.resolvePricingForProducts(
        cart.items.map((item) => item.product)
      );

      let total = cart.items.reduce(
        (sum, item) =>
          sum + (pricingByProductId.get(item.productId)?.finalPrice ?? item.product.price) * item.quantity,
        0
      );

      if (checkoutData.discountCode) {
        const cartForValidation = cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: pricingByProductId.get(item.productId)?.finalPrice ?? item.product.price,
        }));

        const validation = await PromotionService.validateCouponCode(
          checkoutData.discountCode,
          cartForValidation,
          tx
        );

        total -= validation.discountAmount;
        await PromotionService.incrementCouponUsage(validation.couponId, tx);
      }

      if (options.decrementStock) {
        for (const item of cart.items) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

          if (updated.count === 0) {
            throw new AppError(`Failed to reserve stock for ${item.product.name}`, 400);
          }
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING,
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
              price: pricingByProductId.get(item.productId)?.finalPrice ?? item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      if (options.clearCart) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      return order;
    });
  }
}
