import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, CartItem, Product } from '@/types';

// ─── Auth Store ───────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

// ─── Cart Store ───────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getTotalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'kamil-cart' }
  )
);

// ─── Checkout Store ───────────────────────────────────────────────────────────
interface CheckoutState {
  selectedProduct: Product | null;
  quantity: number;
  setSelectedProduct: (product: Product | null, qty?: number) => void;
  clearCheckout: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      selectedProduct: null,
      quantity: 1,
      setSelectedProduct: (product, qty = 1) =>
        set({ selectedProduct: product, quantity: qty }),
      clearCheckout: () => set({ selectedProduct: null, quantity: 1 }),
    }),
    { name: 'kamil-checkout' }
  )
);
