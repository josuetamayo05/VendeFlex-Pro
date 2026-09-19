import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sale, SaleItemDetail, PaymentMethod } from '@/types';

interface SalesStore {
  sales: Sale[];
  addSale: (data: {
    items: SaleItemDetail[];
    paymentMethod: PaymentMethod;
    clientName?: string;
    clientPhone?: string;
  }) => number;
  deleteSale: (id: number) => void;

  getSalesByInvestment: (investmentId: number) => Sale[];
  getTotalRevenueUSD: () => number;
  getTotalProfitUSD: () => number;
  getRevenueByInvestment: (investmentId: number) => number;
  getProfitByInvestment: (investmentId: number) => number;
  getSoldQuantityByProduct: (productId: number) => number;
  resetSales: () => void; // ← Agregado aquí en la interfaz
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: ({ items, paymentMethod, clientName, clientPhone }) => {
        const totalUSD = items.reduce((sum, i) => sum + i.totalUSD, 0);
        const totalProfitUSD = items.reduce((sum, i) => sum + i.profitUSD, 0);

        const newSale: Sale = {
          id: Date.now(),
          date: new Date().toISOString(),
          items,
          totalUSD,
          totalProfitUSD,
          paymentMethod,
          clientName,
          clientPhone,
          isFiado: paymentMethod === 'Fiado',
        };

        set((s) => ({ sales: [newSale, ...s.sales] }));
        return newSale.id;
      },

      deleteSale: (id) =>
        set((s) => ({ sales: s.sales.filter((sale) => sale.id !== id) })),

      getSalesByInvestment: (investmentId) =>
        get().sales.filter((sale) =>
          sale.items.some((item) => item.investmentId === investmentId)
        ),

      getTotalRevenueUSD: () =>
        get().sales.reduce((sum, s) => sum + s.totalUSD, 0),

      getTotalProfitUSD: () =>
        get().sales.reduce((sum, s) => sum + s.totalProfitUSD, 0),

      getRevenueByInvestment: (investmentId) =>
        get().sales.reduce((sum, sale) => {
          const invItems = sale.items.filter((i) => i.investmentId === investmentId);
          return sum + invItems.reduce((s, i) => s + i.totalUSD, 0);
        }, 0),

      getProfitByInvestment: (investmentId) =>
        get().sales.reduce((sum, sale) => {
          const invItems = sale.items.filter((i) => i.investmentId === investmentId);
          return sum + invItems.reduce((s, i) => s + i.profitUSD, 0);
        }, 0),

      getSoldQuantityByProduct: (productId) =>
        get().sales.reduce((sum, sale) => {
          const items = sale.items.filter((i) => i.productId === productId);
          return sum + items.reduce((s, i) => s + i.quantity, 0);
        }, 0),

      resetSales: () => set({ sales: [] }), // ← Agregado aquí en la implementación
    }),
    {
      name: 'vendeflex-sales',
      partialize: (state) => ({ sales: state.sales }),
    }
  )
);