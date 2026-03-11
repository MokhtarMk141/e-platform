export interface CartItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    imageUrl: string | null;
    sku: string;
    quantity: number;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalItems: number;
    totalAmount: number;
}

export interface CartResponse {
    success: boolean;
    message: string;
    data: Cart;
}

export interface AddItemRequest {
    productId: string;
    quantity: number;
}

export interface UpdateQuantityRequest {
    quantity: number;
}
