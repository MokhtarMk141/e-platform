import { CartRepository } from "./cart.repository";
import { ProductRepository } from "../product/product.repository";
import { AppError } from "../../exceptions/app-error";
import { CartResponseDto } from "./dto/cart-response.dto";
import { AddItemDto } from "./dto/add-item.dto";

export class CartService {
    constructor(
        private cartRepository: CartRepository = new CartRepository(),
        private productRepository: ProductRepository = new ProductRepository()
    ) { }

    async getCart(userId: string): Promise<CartResponseDto> {
        let cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            cart = await this.cartRepository.create(userId);
        }
        return new CartResponseDto(cart);
    }

    async addItem(userId: string, dto: AddItemDto): Promise<CartResponseDto> {
        const product = await this.productRepository.findById(dto.productId);
        if (!product) {
            throw new AppError("Product not found", 404);
        }

        if (product.stock < dto.quantity) {
            throw new AppError("Insufficient stock", 400);
        }

        let cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            cart = await this.cartRepository.create(userId);
        }

        const existingItem = await this.cartRepository.findItemInCart(cart.id, dto.productId);

        if (existingItem) {
            const newQuantity = existingItem.quantity + dto.quantity;
            if (product.stock < newQuantity) {
                throw new AppError("Insufficient stock for total quantity", 400);
            }
            await this.cartRepository.updateItemQuantity(existingItem.id, newQuantity);
        } else {
            await this.cartRepository.addItem(cart.id, dto.productId, dto.quantity);
        }

        return this.getCart(userId);
    }

    async updateItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartResponseDto> {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        const item = cart.items.find((i) => i.id === itemId);
        if (!item) {
            throw new AppError("Item not found in cart", 404);
        }

        if (quantity <= 0) {
            await this.cartRepository.removeItem(itemId);
        } else {
            const product = await this.productRepository.findById(item.productId);
            if (product && product.stock < quantity) {
                throw new AppError("Insufficient stock", 400);
            }
            await this.cartRepository.updateItemQuantity(itemId, quantity);
        }

        return this.getCart(userId);
    }

    async removeItem(userId: string, itemId: string): Promise<CartResponseDto> {
        const cart = await this.cartRepository.findByUserId(userId);
        if (!cart) {
            throw new AppError("Cart not found", 404);
        }

        const item = cart.items.find((i) => i.id === itemId);
        if (!item) {
            throw new AppError("Item not found in cart", 404);
        }

        await this.cartRepository.removeItem(itemId);
        return this.getCart(userId);
    }

    async clearCart(userId: string): Promise<void> {
        const cart = await this.cartRepository.findByUserId(userId);
        if (cart) {
            await this.cartRepository.clearCart(cart.id);
        }
    }
}
