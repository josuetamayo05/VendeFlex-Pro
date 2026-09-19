import { create } from 'zustand';
import type { CartItem, PaymentMethod, ProductItem } from '@/types';
import { EXCHANGE_RATE } from '@/lib/constants';

interface CartStore {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number;
  clientName: string;
  clientPhone: string;

  addItem: (product: ProductItem) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountReceived: (amount: number) => void;
  setClientName: (name: string) => void;
  setClientPhone: (phone: string) => void;
  clearCart: () => void;

  // Computed helpers
  getSubtotalUSD: () => number;
  getSubtotalCUP: () => number;
  getItemCount: () => number;
  getChangeCUP: () => number;
}

const toUSD = (price: number, currency: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  paymentMethod: 'Efectivo USD',
  amountReceived: 0,
  clientName: '',
  clientPhone: '',

  addItem: (product) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      if (existing.quantity >= product.stock) return; // no pasar del stock
      set({
        items: items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      if (product.stock <= 0) return;
      set({
        items: [
          ...items,
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            unitPrice: product.price,
            currency: product.currency,
            quantity: 1,
            stock: product.stock,
          },
        ],
      });
    }
  },

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set((s) => ({
      items: s.items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.min(quantity, i.stock) }
          : i
      ),
    }));
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setAmountReceived: (amount) => set({ amountReceived: amount }),
  setClientName: (name) => set({ clientName: name }),
  setClientPhone: (phone) => set({ clientPhone: phone }),
  clearCart: () =>
    set({
      items: [],
      paymentMethod: 'Efectivo USD',
      amountReceived: 0,
      clientName: '',
      clientPhone: '',
    }),

  getSubtotalUSD: () =>
    get().items.reduce(
      (sum, i) => sum + toUSD(i.unitPrice, i.currency) * i.quantity,
      0
    ),

  getSubtotalCUP: () => get().getSubtotalUSD() * EXCHANGE_RATE,

  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  getChangeCUP: () => {
    const totalCUP = get().getSubtotalCUP();
    const received = get().amountReceived;
    return Math.max(0, received - totalCUP);
  },
}));