// src/store/useSalesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sale, SaleItemDetail, PaymentMethod } from '@/types';
//import { useClientsStore } from '@/store/useClientsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { EXCHANGE_RATE } from '@/lib/constants';

interface SalesStore {
  sales: Sale[];
  addSale: (data: {
    items: SaleItemDetail[];
    paymentMethod: PaymentMethod;
    clientName?: string;
    clientPhone?: string;
  }) => number | null;
  updateSale: (
    id: number,
    data: {
      items: SaleItemDetail[];
      paymentMethod: PaymentMethod;
      clientName?: string;
      clientPhone?: string;
    }
  ) => void;
  deleteSale: (id: number) => void;
  getSalesByInvestment: (investmentId: number) => Sale[];
  getTotalRevenueUSD: () => number;
  getTotalProfitUSD: () => number;
  getRevenueByInvestment: (investmentId: number) => number;
  getProfitByInvestment: (investmentId: number) => number;
  getSoldQuantityByProduct: (productId: number) => number;
  recalculateAllSalesProfits: () => void; // 👈 FUNCIÓN DE REPARACIÓN
  resetSales: () => void;
}

const toUSD = (price: number, currency?: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: ({ items, paymentMethod, clientName, clientPhone }) => {
        const cleanItems = items.filter((i) => i.quantity > 0);
        if (cleanItems.length === 0) return null;

        const totalUSD = cleanItems.reduce((sum, i) => sum + i.totalUSD, 0);
        const totalProfitUSD = cleanItems.reduce((sum, i) => sum + i.profitUSD, 0);
        if (totalUSD <= 0 && totalProfitUSD <= 0) return null;

        const dateNow = new Date().toISOString();
        const newSale: Sale = {
          id: Date.now(),
          date: dateNow,
          items: cleanItems,
          totalUSD,
          totalProfitUSD,
          paymentMethod,
          clientName: clientName?.trim() || undefined,
          clientPhone: clientPhone?.trim() || undefined,
          isFiado: paymentMethod === 'Fiado',
        };

        set((s) => ({ sales: [newSale, ...s.sales] }));
        return newSale.id;
      },

      updateSale: (id, data) => {
        const oldSale = get().sales.find((s) => s.id === id);
        if (!oldSale) return;

        const cleanItems = data.items.filter((i) => i.quantity > 0);
        if (cleanItems.length === 0) {
          get().deleteSale(id);
          return;
        }

        const totalUSD = cleanItems.reduce((sum, i) => sum + i.totalUSD, 0);
        const totalProfitUSD = cleanItems.reduce((sum, i) => sum + i.profitUSD, 0);

        const updated: Sale = {
          ...oldSale,
          items: cleanItems,
          totalUSD,
          totalProfitUSD,
          paymentMethod: data.paymentMethod,
          clientName: data.clientName?.trim() || undefined,
          clientPhone: data.clientPhone?.trim() || undefined,
          isFiado: data.paymentMethod === 'Fiado',
        };

        set((s) => ({
          sales: s.sales.map((sale) => (sale.id === id ? updated : sale)),
        }));
      },

      deleteSale: (id) => {
        set((s) => ({ sales: s.sales.filter((saleItem) => saleItem.id !== id) }));
      },

      // 🛠️ RECALCULA LAS GANANCIAS DE TODAS LAS VENTAS PASADAS USANDO COSTO + ENVÍO
      recalculateAllSalesProfits: () => {
        const products = useProductsStore.getState().products;
        const investments = useInvestmentsStore.getState().investments;

        const updatedSales = get().sales.map((sale) => {
          let saleProfitUSD = 0;

          const updatedItems = sale.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const inv = investments.find((i) => i.id === (product?.investmentId || item.investmentId));

            // Base cost
            const baseCostUSD = product ? toUSD(product.cost, product.currency) : item.unitCostUSD;

            // Prorrateo de envío
            let shippingPerUnit = 0;
            if (inv && inv.shippingCost > 0) {
              const invProducts = products.filter((p) => p.investmentId === inv.id);
              const totalUnits = invProducts.reduce((sum, p) => {
                const initQty = (p as { initialQuantity?: number }).initialQuantity ?? p.stock ?? 0;
                return sum + initQty;
              }, 0);
              const shippingUSD = inv.currency === 'USD' ? inv.shippingCost : inv.shippingCost / EXCHANGE_RATE;
              shippingPerUnit = totalUnits > 0 ? shippingUSD / totalUnits : 0;
            }

            const realUnitCostUSD = baseCostUSD + shippingPerUnit;
            const itemProfitUSD = (item.unitPriceUSD - realUnitCostUSD) * item.quantity;
            saleProfitUSD += itemProfitUSD;

            return {
              ...item,
              unitCostUSD: realUnitCostUSD,
              profitUSD: itemProfitUSD,
            };
          });

          return {
            ...sale,
            items: updatedItems,
            totalProfitUSD: saleProfitUSD,
          };
        });

        set({ sales: updatedSales });
      },

      getSalesByInvestment: (investmentId) =>
        get().sales.filter((sale) =>
          sale.items.some((item) => item.investmentId === investmentId)
        ),

      getTotalRevenueUSD: () => get().sales.reduce((sum, s) => sum + s.totalUSD, 0),
      getTotalProfitUSD: () => get().sales.reduce((sum, s) => sum + s.totalProfitUSD, 0),

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

      resetSales: () => set({ sales: [] }),
    }),
    {
      name: 'vendeflex-sales',
      partialize: (state) => ({ sales: state.sales }),
    }
  )
);