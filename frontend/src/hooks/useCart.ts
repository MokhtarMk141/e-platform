import { create } from 'zustand';
import { AuthService } from '@/services/auth.service';
import { CartService } from '@/services/cart.service';
import { Cart, CartItem } from '@/types/cart.types';

const GUEST_CART_KEY = 'guest_cart';

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === 'object') {
    const candidate = error as { message?: unknown };
    if (typeof candidate.message === 'string') {
      return candidate.message;
    }
  }

  return fallback;
};

const hasActiveAuth = () => Boolean(AuthService.getToken() && AuthService.getUser());

type GuestProductSnapshot = Pick<CartItem, 'productId' | 'name' | 'price' | 'imageUrl' | 'sku'>;

const buildCartFromItems = (items: CartItem[]): Cart | null => {
  if (items.length === 0) {
    return null;
  }

  return {
    id: 'guest-cart',
    userId: 'guest',
    items,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
};

const readGuestCart = (): Cart | null => {
  if (typeof window === 'undefined') return null;

  const raw = localStorage.getItem(GUEST_CART_KEY);
  if (!raw) return null;

  try {
    const items = JSON.parse(raw) as CartItem[];
    return buildCartFromItems(items);
  } catch {
    localStorage.removeItem(GUEST_CART_KEY);
    return null;
  }
};

const writeGuestCart = (cart: Cart | null) => {
  if (typeof window === 'undefined') return;

  if (!cart || cart.items.length === 0) {
    localStorage.removeItem(GUEST_CART_KEY);
    return;
  }

  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart.items));
};

const clearClientAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.cookie = 'token=; path=/; max-age=0';
  window.dispatchEvent(new Event('auth:changed'));
};

const syncGuestCartToServer = async () => {
  const guestCart = readGuestCart();
  if (!guestCart || guestCart.items.length === 0) {
    return;
  }

  for (const item of guestCart.items) {
    await CartService.addItem({ productId: item.productId, quantity: item.quantity });
  }

  writeGuestCart(null);
};

interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number, productSnapshot?: GuestProductSnapshot) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  resetCart: () => void;
  setOpen: (open: boolean) => void;
  toggleCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: readGuestCart(),
  loading: false,
  error: null,
  isOpen: false,

  fetchCart: async () => {
    if (!hasActiveAuth()) {
      set({ cart: readGuestCart(), loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      await syncGuestCartToServer();
      const response = await CartService.getCart();
      set({ cart: response.data, loading: false });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to fetch cart');
      if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
        clearClientAuth();
        set({ cart: readGuestCart(), loading: false, error: null });
        return;
      }
      set({ error: message, loading: false });
    }
  },

  addItem: async (productId, quantity = 1, productSnapshot) => {
    if (!hasActiveAuth()) {
      if (!productSnapshot) {
        set({ error: 'Unable to add this item right now', loading: false, isOpen: true });
        return;
      }

      const existingCart = readGuestCart();
      const existingItems = existingCart?.items ?? [];
      const existingItem = existingItems.find((item) => item.productId === productId);

      const nextItems = existingItem
        ? existingItems.map((item) =>
            item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
          )
        : [
            ...existingItems,
            {
              id: `guest-${productId}`,
              productId,
              quantity,
              ...productSnapshot,
            },
          ];

      const nextCart = buildCartFromItems(nextItems);
      writeGuestCart(nextCart);
      set({ cart: nextCart, loading: false, error: null, isOpen: true });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await CartService.addItem({ productId, quantity });
      set({ cart: response.data, loading: false, isOpen: true });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to add item');
      if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
        clearClientAuth();
        set({ cart: readGuestCart(), loading: false, error: null, isOpen: true });
        return;
      }
      set({ error: message, loading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    if (!hasActiveAuth()) {
      const currentCart = readGuestCart();
      const nextItems = (currentCart?.items ?? [])
        .map((item) => (item.id === itemId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);
      const nextCart = buildCartFromItems(nextItems);
      writeGuestCart(nextCart);
      set({ cart: nextCart, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await CartService.updateQuantity(itemId, quantity);
      set({ cart: response.data, loading: false });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to update quantity');
      if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
        clearClientAuth();
        set({ cart: readGuestCart(), loading: false, error: null });
        return;
      }
      set({ error: message, loading: false });
    }
  },

  removeItem: async (itemId) => {
    if (!hasActiveAuth()) {
      const currentCart = readGuestCart();
      const nextItems = (currentCart?.items ?? []).filter((item) => item.id !== itemId);
      const nextCart = buildCartFromItems(nextItems);
      writeGuestCart(nextCart);
      set({ cart: nextCart, loading: false, error: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await CartService.removeItem(itemId);
      set({ cart: response.data, loading: false });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to remove item');
      if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
        clearClientAuth();
        set({ cart: readGuestCart(), loading: false, error: null });
        return;
      }
      set({ error: message, loading: false });
    }
  },

  clearCart: async () => {
    if (!hasActiveAuth()) {
      writeGuestCart(null);
      set({ cart: null, loading: false, error: null, isOpen: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      await CartService.clearCart();
      set({ cart: null, loading: false, isOpen: false });
    } catch (err) {
      const message = getErrorMessage(err, 'Failed to clear cart');
      if (message.toLowerCase().includes('session expired') || message.toLowerCase().includes('unauthorized')) {
        clearClientAuth();
        set({ cart: readGuestCart(), loading: false, error: null, isOpen: false });
        return;
      }
      set({ error: message, loading: false });
    }
  },

  resetCart: () => set({ cart: null, loading: false, error: null, isOpen: false }),
  setOpen: (open) => set({ isOpen: open }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const useCart = () => useCartStore();
