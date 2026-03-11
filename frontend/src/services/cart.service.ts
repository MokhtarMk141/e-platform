import { ApiClient } from '@/lib/api-client';
import {
    CartResponse,
    AddItemRequest,
    UpdateQuantityRequest,
} from '@/types/cart.types';

export class CartService {
    static getCart(): Promise<CartResponse> {
        return ApiClient.get<CartResponse>('/cart');
    }

    static addItem(data: AddItemRequest): Promise<CartResponse> {
        return ApiClient.post<CartResponse>('/cart/items', data);
    }

    static updateQuantity(itemId: string, quantity: number): Promise<CartResponse> {
        return ApiClient.patch<CartResponse>(`/cart/items/${itemId}`, { quantity });
    }

    static removeItem(itemId: string): Promise<CartResponse> {
        return ApiClient.delete<CartResponse>(`/cart/items/${itemId}`);
    }

    static clearCart(): Promise<void> {
        return ApiClient.delete<void>('/cart');
    }
}
