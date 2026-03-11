import { Cart, CartItem, Product } from "@prisma/client";

export class CartItemResponseDto {
    id: string;
    productId: string;
    name: string;
    price: number;
    imageUrl: string | null;
    sku: string;
    quantity: number;

    constructor(item: CartItem & { product: Product }) {
        this.id = item.id;
        this.productId = item.productId;
        this.name = item.product.name;
        this.price = item.product.price;
        this.imageUrl = item.product.imageUrl;
        this.sku = item.product.sku;
        this.quantity = item.quantity;
    }
}

export class CartResponseDto {
    id: string;
    userId: string;
    items: CartItemResponseDto[];
    totalItems: number;
    totalAmount: number;

    constructor(cart: Cart & { items: (CartItem & { product: Product })[] }) {
        this.id = cart.id;
        this.userId = cart.userId;
        this.items = cart.items.map((item) => new CartItemResponseDto(item));
        this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.totalAmount = this.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
    }
}
