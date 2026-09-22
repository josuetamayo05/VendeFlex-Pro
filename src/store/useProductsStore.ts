import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductItem } from '@/types';

const mockProducts: ProductItem[] = [
  
];

interface ProductsState {
  products: ProductItem[];
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateStock: (id: number, newStock: number) => void;
  updateProduct: (id: number, data: Partial<ProductItem>) => void;
  removeProduct: (id: number) => void;
  getProductsByInvestment: (investmentId: number) => ProductItem[];
  resetToMocks: () => void;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: mockProducts,

      addProduct: (product) =>
        set((state) => ({
          products: [...state.products, { ...product, id: Date.now() }],
        })),

      updateStock: (id, newStock) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stock: newStock } : p
          ),
        })),

      updateProduct: (id, data) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      getProductsByInvestment: (investmentId) =>
        get().products.filter((p) => p.investmentId === investmentId),

      resetToMocks: () => set({ products: mockProducts }),
    }),
    {
      name: 'vendeflex-products',
      partialize: (state) => ({ products: state.products }),
    }
  )
);