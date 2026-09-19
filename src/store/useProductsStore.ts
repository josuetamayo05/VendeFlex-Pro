import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductItem } from '@/types';

const mockProducts: ProductItem[] = [
  {
    id: 1,
    investmentId: 1,
    name: 'Zapatillas Nike Air',
    category: 'Calzado/Ropa',
    origin: 'USA',
    price: 18000,
    currency: 'CUP',
    stock: 12,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
    cost: 15,
  },
  {
    id: 4,
    investmentId: 1,
    name: 'Short Deportivo',
    category: 'Calzado/Ropa',
    origin: 'USA',
    price: 15,
    currency: 'USD',
    stock: 0,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=300&q=80',
    cost: 7,
  },
  {
    id: 5,
    investmentId: 1,
    name: 'Top Deportivo Gym',
    category: 'Calzado/Ropa',
    origin: 'USA',
    price: 18,
    currency: 'USD',
    stock: 5,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=300&q=80',
    cost: 8,
  },
  {
    id: 2,
    investmentId: 2,
    name: 'Auriculares BT',
    category: 'Electrónica',
    origin: 'USA',
    price: 45,
    currency: 'USD',
    stock: 8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
    cost: 20,
  },
  {
    id: 6,
    investmentId: 2,
    name: 'Smartwatch Sport',
    category: 'Electrónica',
    origin: 'Encargo',
    price: 35,
    currency: 'USD',
    stock: 2,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
    cost: 18,
  },
  {
    id: 3,
    investmentId: 3,
    name: 'Shampoo Keratina',
    category: 'Cosméticos',
    origin: 'Local',
    price: 1200,
    currency: 'CUP',
    stock: 3,
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=300&q=80',
    cost: 800,
  },
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