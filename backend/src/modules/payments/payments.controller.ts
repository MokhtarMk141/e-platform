import { Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { AuthRequest } from "../auth/auth.middleware";
import { getAuthenticatedUserId } from "../../utils/auth-utils";
import { checkoutOrderSchema } from "../order/dto/checkout-order.dto";
import { prisma } from "../../config/database";
import { AppError } from "../../exceptions/app-error";
import { PaymentsService } from "./payments.service";

const stripeCheckoutSchema = checkoutOrderSchema.extend({
  paymentMethod: checkoutOrderSchema.shape.paymentMethod.refine((value) => value === "STRIPE", {
    message: "Stripe payment method is required for this endpoint",
  }),
});

export class PaymentsController {
  constructor(private paymentsService: PaymentsService = new PaymentsService()) {}

  createCheckoutSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const checkoutData = stripeCheckoutSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    checkoutData.customerEmail = user.email;
    if (user.phone) {
      checkoutData.customerPhone = user.phone;
    } else if (checkoutData.customerPhone) {
      await prisma.user.update({
        where: { id: userId },
        data: { phone: checkoutData.customerPhone },
      });
    }

    const session = await this.paymentsService.createCheckoutSession(userId, checkoutData);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Stripe Checkout session created successfully",
      data: session,
    });
  });

  webhook = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.paymentsService.handleWebhookEvent(req.headers["stripe-signature"], req.body);

    return sendSuccess(res, {
      message: "Stripe webhook processed",
      data: result,
    });
  });
}
