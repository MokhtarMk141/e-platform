import { Request, Response } from "express";
import { CartService } from "./cart.service";
import { asyncHandler } from "../../utils/async-handler";
import { addItemSchema, updateItemQuantitySchema } from "./dto/add-item.dto";
import { sendSuccess } from "../../utils/api-response";
import { AuthRequest } from "../auth/auth.middleware";
import { getAuthenticatedUserId } from "../../utils/auth-utils";

export class CartController {
    private cartService: CartService;

    constructor() {
        this.cartService = new CartService();
    }

    getCart = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = getAuthenticatedUserId(req);

        const cart = await this.cartService.getCart(userId);

        return sendSuccess(res, {
            message: "Cart fetched successfully",
            data: cart,
        });
    });

    addItem = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = getAuthenticatedUserId(req);

        const dto = addItemSchema.parse(req.body);
        const cart = await this.cartService.addItem(userId, dto);

        return sendSuccess(res, {
            message: "Item added to cart",
            data: cart,
        });
    });

    updateQuantity = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = getAuthenticatedUserId(req);

        const itemId = req.params.itemId as string;
        const { quantity } = updateItemQuantitySchema.parse(req.body);

        const cart = await this.cartService.updateItemQuantity(userId, itemId, quantity);

        return sendSuccess(res, {
            message: "Cart updated successfully",
            data: cart,
        });
    });

    removeItem = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = getAuthenticatedUserId(req);

        const itemId = req.params.itemId as string;
        const cart = await this.cartService.removeItem(userId, itemId);

        return sendSuccess(res, {
            message: "Item removed from cart",
            data: cart,
        });
    });

    clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = getAuthenticatedUserId(req);

        await this.cartService.clearCart(userId);

        return sendSuccess(res, {
            message: "Cart cleared successfully",
            data: null,
        });
    });
}
