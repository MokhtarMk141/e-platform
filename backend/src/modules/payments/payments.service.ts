import { OrderStatus } from "@prisma/client";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { AppError } from "../../exceptions/app-error";
import { OrderService } from "../order/order.service";
import { stripe } from "./stripe";

const THREE_DECIMAL_CURRENCIES = new Set(["bhd", "jod", "kwd", "omr", "tnd"]);
const ZERO_DECIMAL_CURRENCIES = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export class PaymentsService {
  constructor(private orderService: OrderService = new OrderService()) {}

  async createCheckoutSession(userId: string, checkoutData: Parameters<OrderService["createPendingStripeOrder"]>[1]) {
    const order = await this.orderService.createPendingStripeOrder(userId, checkoutData);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/checkout/cancel?order_id=${order.id}`,
      customer_email: order.customerEmail ?? undefined,
      client_reference_id: order.id,
      metadata: {
        orderId: order.id,
        userId,
      },
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: env.STRIPE_CURRENCY,
          product_data: {
            name: item.product.name,
            metadata: {
              productId: item.productId,
              sku: item.product.sku,
            },
          },
          unit_amount: this.toStripeAmount(item.price),
        },
      })),
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return {
      orderId: order.id,
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }

  async handleWebhookEvent(
    signatureHeader: string | string[] | undefined,
    requestBody: Buffer | string | Record<string, unknown> | undefined
  ) {
    const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;

    if (!signature) {
      throw new AppError("Missing Stripe signature", 400);
    }

    const rawBody = this.normalizeWebhookPayload(requestBody);

    let event: ReturnType<typeof stripe.webhooks.constructEvent> | null = null;

    const verificationErrors: unknown[] = [];

    for (const webhookSecret of env.STRIPE_WEBHOOK_SECRETS) {
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        break;
      } catch (error) {
        verificationErrors.push(error);
      }
    }

    if (!event) {
      console.error(
        "Stripe webhook signature verification failed:",
        verificationErrors[verificationErrors.length - 1]
      );
      throw new AppError("Invalid Stripe webhook signature", 400);
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.handleCheckoutSessionCompleted(
          event.data.object as Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
        );
        break;
      default:
        console.info(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  private normalizeWebhookPayload(requestBody: Buffer | string | Record<string, unknown> | undefined) {
    if (Buffer.isBuffer(requestBody)) {
      return requestBody;
    }

    if (typeof requestBody === "string") {
      return Buffer.from(requestBody, "utf8");
    }

    if (requestBody && typeof requestBody === "object") {
      return Buffer.from(JSON.stringify(requestBody), "utf8");
    }

    throw new AppError("Missing Stripe webhook payload", 400);
  }

  private async handleCheckoutSessionCompleted(
    sessionPayload: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
  ) {
    const session = await stripe.checkout.sessions.retrieve(sessionPayload.id, {
      expand: ["line_items"],
    });

    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    const userId = session.metadata?.userId;

    if (!orderId) {
      console.error("Stripe checkout.session.completed missing orderId metadata", {
        sessionId: session.id,
        userId,
      });
      return;
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!existingOrder) {
      console.error("Stripe webhook order not found", { orderId, sessionId: session.id, userId });
      return;
    }

    if (existingOrder.status === OrderStatus.PAID) {
      console.info("Stripe webhook received for already-paid order", { orderId, sessionId: session.id });
      return;
    }

    await prisma.$transaction(async (tx) => {
      for (const item of existingOrder.items) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updated.count === 0) {
          throw new AppError(`Insufficient stock to finalize paid order ${existingOrder.id}`, 409);
        }
      }

      await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          status: OrderStatus.PAID,
          stripeSessionId: session.id,
          paidAt: new Date(),
        },
      });

      await tx.cartItem.deleteMany({
        where: {
          cart: { userId: existingOrder.userId },
        },
      });
    });

    const paidOrder = await prisma.order.findUnique({
      where: { id: existingOrder.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (paidOrder) {
      await this.orderService.sendOrderConfirmation(paidOrder);
    }

    console.info("Stripe checkout.session.completed processed", {
      orderId: existingOrder.id,
      sessionId: session.id,
      userId,
    });
  }

  private toStripeAmount(amount: number) {
    if (THREE_DECIMAL_CURRENCIES.has(env.STRIPE_CURRENCY)) {
      return Math.round(amount * 1000);
    }

    if (ZERO_DECIMAL_CURRENCIES.has(env.STRIPE_CURRENCY)) {
      return Math.round(amount);
    }

    return Math.round(amount * 100);
  }
}
