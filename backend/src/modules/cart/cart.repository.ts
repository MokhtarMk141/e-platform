import { prisma } from "../../config/database";
import { Prisma } from "@prisma/client";

export type CartWithItems = Prisma.CartGetPayload<{
    include: { items: { include: { product: true } } };
}>;

export class CartRepository {
    async findByUserId(userId: string): Promise<CartWithItems | null> {
        return prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async create(userId: string): Promise<CartWithItems> {
        return prisma.cart.create({
            data: { userId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }

    async findItemInCart(cartId: string, productId: string) {
        return prisma.cartItem.findFirst({
            where: { cartId, productId },
        });
    }

    async addItem(cartId: string, productId: string, quantity: number) {
        return prisma.cartItem.create({
            data: {
                cartId,
                productId,
                quantity,
            },
            include: {
                product: true,
            },
        });
    }

    async updateItemQuantity(itemId: string, quantity: number) {
        return prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
            include: {
                product: true,
            },
        });
    }

    async removeItem(itemId: string) {
        return prisma.cartItem.delete({
            where: { id: itemId },
        });
    }

    async clearCart(cartId: string) {
        return prisma.cartItem.deleteMany({
            where: { cartId },
        });
    }
}
