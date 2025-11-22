import { create } from 'zustand';
import { Product, CartItem } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getVAT: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product) => {
    // Normalize product to ensure price and vat_rate are numbers
    const normalizedProduct: Product = {
      ...product,
      price: Number(product.price || 0),
      vat_rate: Number(product.vat_rate || 0),
      stock_quantity: Number(product.stock_quantity || 0),
    };
    
    set((state) => {
      const existing = state.items.find((i) => i.product.id === normalizedProduct.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === normalizedProduct.id ? { ...i, quantity: i.quantity + 1 } : i
          )
        };
      }
      return { items: [...state.items, { product: normalizedProduct, quantity: 1, discount: 0 }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId)
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    }));
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, i) => sum + Number(i.product.price || 0) * i.quantity - i.discount,
      0
    );
  },

  getVAT: () => {
    return get().items.reduce((sum, i) => {
      const itemTotal = Number(i.product.price || 0) * i.quantity - i.discount;
      return sum + (itemTotal * Number(i.product.vat_rate || 0)) / 100;
    }, 0);
  },

  getTotal: () => get().getSubtotal() + get().getVAT()
}));
