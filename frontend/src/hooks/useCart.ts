import { create } from 'zustand';
import { CartService } from '@/services/cart.service';
import { Cart, CartItem } from '@/types/cart.types';

interface CartState {
    cart: Cart | null;
    loading: boolean;
    error: string | null;
    isOpen: boolean;

    // Actions
    fetchCart: () => Promise<void>;
    addItem: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    setOpen: (open: boolean) => void;
    toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    loading: false,
    error: null,
    isOpen: false,

    fetchCart: async () => {
        set({ loading: true, error: null });
        try {
            const response = await CartService.getCart();
            set({ cart: response.data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch cart', loading: false });
        }
    },

    addItem: async (productId: string, quantity = 1) => {
        set({ loading: true, error: null });
        try {
            const response = await CartService.addItem({ productId, quantity });
            set({ cart: response.data, loading: false, isOpen: true });
        } catch (err: any) {
            set({ error: err.message || 'Failed to add item', loading: false });
        }
    },

    updateQuantity: async (itemId: string, quantity: number) => {
        set({ loading: true, error: null });
        try {
            const response = await CartService.updateQuantity(itemId, quantity);
            set({ cart: response.data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to update quantity', loading: false });
        }
    },

    removeItem: async (itemId: string) => {
        set({ loading: true, error: null });
        try {
            const response = await CartService.removeItem(itemId);
            set({ cart: response.data, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to remove item', loading: false });
        }
    },

    clearCart: async () => {
        set({ loading: true, error: null });
        try {
            await CartService.clearCart();
            set({ cart: null, loading: false });
        } catch (err: any) {
            set({ error: err.message || 'Failed to clear cart', loading: false });
        }
    },

    setOpen: (open: boolean) => set({ isOpen: open }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useCart = () => useCartStore();
