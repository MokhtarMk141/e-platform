import { create } from 'zustand';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { Cart } from '@/types/cart.types';

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error && typeof error === 'object') {
        const candidate = error as { message?: unknown };
        if (typeof candidate.message === 'string') {
            return candidate.message;
        }
    }

    return fallback;
};

const redirectToLogin = () => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
};

const hasActiveAuth = () => Boolean(AuthService.getToken() && AuthService.getUser());

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
    resetCart: () => void;
    setOpen: (open: boolean) => void;
    toggleCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    loading: false,
    error: null,
    isOpen: false,

    fetchCart: async () => {
        if (!hasActiveAuth()) {
            set({ cart: null, loading: false, error: null, isOpen: false });
            return;
        }

        set({ loading: true, error: null });
        try {
            const response = await CartService.getCart();
            set({ cart: response.data, loading: false });
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to fetch cart');
            if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
                set({ cart: null, loading: false, error: null, isOpen: false });
                redirectToLogin();
                return;
            }
            set({ error: message, loading: false });
        }
    },

    addItem: async (productId: string, quantity = 1) => {
        if (!hasActiveAuth()) {
            set({ error: 'Please log in to add items to your bag', loading: false });
            redirectToLogin();
            return;
        }

        set({ loading: true, error: null });
        try {
            const response = await CartService.addItem({ productId, quantity });
            set({ cart: response.data, loading: false, isOpen: true });
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to add item');
            if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
                set({ cart: null, loading: false, error: null, isOpen: false });
                redirectToLogin();
                return;
            }
            set({ error: message, loading: false });
        }
    },

    updateQuantity: async (itemId: string, quantity: number) => {
        if (!hasActiveAuth()) {
            set({ cart: null, loading: false, error: null, isOpen: false });
            redirectToLogin();
            return;
        }

        set({ loading: true, error: null });
        try {
            const response = await CartService.updateQuantity(itemId, quantity);
            set({ cart: response.data, loading: false });
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to update quantity');
            if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
                set({ cart: null, loading: false, error: null, isOpen: false });
                redirectToLogin();
                return;
            }
            set({ error: message, loading: false });
        }
    },

    removeItem: async (itemId: string) => {
        if (!hasActiveAuth()) {
            set({ cart: null, loading: false, error: null, isOpen: false });
            redirectToLogin();
            return;
        }

        set({ loading: true, error: null });
        try {
            const response = await CartService.removeItem(itemId);
            set({ cart: response.data, loading: false });
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to remove item');
            if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
                set({ cart: null, loading: false, error: null, isOpen: false });
                redirectToLogin();
                return;
            }
            set({ error: message, loading: false });
        }
    },

    clearCart: async () => {
        if (!hasActiveAuth()) {
            set({ cart: null, loading: false, error: null, isOpen: false });
            redirectToLogin();
            return;
        }

        set({ loading: true, error: null });
        try {
            await CartService.clearCart();
            set({ cart: null, loading: false, isOpen: false });
        } catch (err) {
            const message = getErrorMessage(err, 'Failed to clear cart');
            if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
                set({ cart: null, loading: false, error: null, isOpen: false });
                redirectToLogin();
                return;
            }
            set({ error: message, loading: false });
        }
    },

    resetCart: () => set({ cart: null, loading: false, error: null, isOpen: false }),
    setOpen: (open: boolean) => set({ isOpen: open }),
    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useCart = () => useCartStore();
