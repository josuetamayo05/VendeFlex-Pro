// src/store/useSalesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sale, SaleItemDetail, PaymentMethod } from '@/types';
import { useClientsStore } from '@/store/useClientsStore';
import { useProductsStore } from '@/store/useProductsStore';

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
  resetSales: () => void;
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: ({ items, paymentMethod, clientName, clientPhone }) => {
        const totalUSD = items.reduce((sum, i) => sum + i.totalUSD, 0);
        const totalProfitUSD = items.reduce((sum, i) => sum + i.profitUSD, 0);
        const dateNow = new Date().toISOString();

        const newSale: Sale = {
          id: Date.now(),
          date: dateNow,
          items,
          totalUSD,
          totalProfitUSD,
          paymentMethod,
          clientName,
          clientPhone,
          isFiado: paymentMethod === 'Fiado',
        };

        // Auto-crear o actualizar cliente
        const clientsStore = useClientsStore.getState();
        if (clientName || clientPhone) {
          const nameIdentifier = (clientName || '').trim().toLowerCase();

          const existingClient = clientsStore.clients.find(
            (c) =>
              (nameIdentifier && c.name.toLowerCase() === nameIdentifier) ||
              (clientPhone && c.phone === clientPhone)
          );

          if (existingClient) {
            clientsStore.updateClient(existingClient.id, {
              totalSpentUSD: (existingClient.totalSpentUSD || 0) + totalUSD,
              lastPurchase: dateNow,
            });
          } else {
            clientsStore.addClient({
              id: Date.now(),
              name: clientName || clientPhone || 'Cliente Nuevo',
              phone: clientPhone || '',
              tags: ['Nuevo'],
              debts: [],
              totalSpentUSD: totalUSD,
              lastPurchase: dateNow,
            });
          }
        }

        set((s) => ({ sales: [newSale, ...s.sales] }));
        return newSale.id;
      },

      deleteSale: (id) => {
        const sale = get().sales.find((s) => s.id === id);
        if (!sale) return;

        // 1. Devolver el stock a los productos
        const productsStore = useProductsStore.getState();
        sale.items.forEach((item) => {
          const product = productsStore.products.find((p) => p.id === item.productId);
          if (product) {
            productsStore.updateProduct(product.id, { stock: product.stock + item.quantity });
          }
        });

        // 2. Restar el gasto del cliente
        if (sale.clientName || sale.clientPhone) {
          const clientsStore = useClientsStore.getState();
          const nameIdentifier = (sale.clientName || '').trim().toLowerCase();

          const client = clientsStore.clients.find(
            (c) =>
              (nameIdentifier && c.name.toLowerCase() === nameIdentifier) ||
              (sale.clientPhone && c.phone === sale.clientPhone)
          );

          if (client) {
            clientsStore.updateClient(client.id, {
              totalSpentUSD: Math.max(0, (client.totalSpentUSD || 0) - sale.totalUSD),
            });
          }
        }

        // 3. Eliminar la venta filtrando correctamente por id
        set((s) => ({ sales: s.sales.filter((saleItem) => saleItem.id !== id) }));
      },

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

      resetSales: () => set({ sales: [] }),
    }),
    {
      name: 'vendeflex-sales',
      partialize: (state) => ({ sales: state.sales }),
    }
  )
);