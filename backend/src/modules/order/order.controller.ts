import { Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { AuthRequest } from "../auth/auth.middleware";
import { getAuthenticatedUserId } from "../../utils/auth-utils";
import { OrderService } from "./order.service";
import { updateOrderStatusSchema } from "./dto/update-order-status.dto";
import { checkoutOrderSchema } from "./dto/checkout-order.dto";

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  checkout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const checkoutData = checkoutOrderSchema.parse(req.body);
    const order = await this.orderService.checkout(userId, checkoutData);

    return sendSuccess(res, {
      statusCode: 201,
      message: "Order created successfully",
      data: order,
    });
  });

  getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = getAuthenticatedUserId(req);
    const orders = await this.orderService.getMyOrders(userId);

    return sendSuccess(res, {
      message: "Orders fetched successfully",
      data: orders,
    });
  });

  getAllOrders = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const orders = await this.orderService.getAllOrders();

    return sendSuccess(res, {
      message: "All orders fetched successfully",
      data: orders,
    });
  });

  updateStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orderId = req.params.id as string;
    const { status } = updateOrderStatusSchema.parse(req.body);
    const updated = await this.orderService.updateStatus(orderId, status);

    return sendSuccess(res, {
      message: "Order status updated successfully",
      data: updated,
    });
  });
}
