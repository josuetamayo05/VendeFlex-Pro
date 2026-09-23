// src/store/useSalesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Sale, SaleItemDetail, PaymentMethod } from '@/types';
import { useClientsStore } from '@/store/useClientsStore';
import { useProductsStore } from '@/store/useProductsStore';
import {
  getLiveUnitCostUSD,
  getLiveItemProfitUSD,
  getLiveSaleProfitUSD,
} from '@/lib/shippingProration';

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
  resetSales: () => void;
}

// ── Sync gasto cliente ──────────────────────────────────────────
const findClient = (clientName?: string, clientPhone?: string) => {
  const clientsStore = useClientsStore.getState();
  const nameIdentifier = (clientName || '').trim().toLowerCase();
  return clientsStore.clients.find(
    (c) =>
      (nameIdentifier && c.name.toLowerCase() === nameIdentifier) ||
      (clientPhone && c.phone === clientPhone)
  );
};

const syncClientSpend = (
  clientName: string | undefined,
  clientPhone: string | undefined,
  deltaUSD: number,
  dateISO?: string
) => {
  if ((!clientName && !clientPhone) || deltaUSD === 0) return;
  const clientsStore = useClientsStore.getState();
  const existing = findClient(clientName, clientPhone);

  if (existing) {
    clientsStore.updateClient(existing.id, {
      totalSpentUSD: Math.max(0, (existing.totalSpentUSD || 0) + deltaUSD),
      ...(dateISO ? { lastPurchase: dateISO } : {}),
    });
  } else if (deltaUSD > 0) {
    clientsStore.addClient({
      id: Date.now(),
      name: clientName || clientPhone || 'Cliente Nuevo',
      phone: clientPhone || '',
      tags: ['Nuevo'],
      debts: [],
      totalSpentUSD: deltaUSD,
      lastPurchase: dateISO || new Date().toISOString(),
    } as Parameters<typeof clientsStore.addClient>[0]);
  }
};

// ── Ajustar stock (+1 devolver / -1 descontar) ──────────────────
const adjustStock = (items: SaleItemDetail[], direction: 1 | -1) => {
  const productsStore = useProductsStore.getState();
  items.forEach((item) => {
    const product = productsStore.products.find((p) => p.id === item.productId);
    if (!product) return;
    const next = Math.max(0, product.stock + direction * item.quantity);
    if (typeof productsStore.updateStock === 'function') {
      productsStore.updateStock(product.id, next);
    } else {
      productsStore.updateProduct(product.id, { stock: next });
    }
  });
};

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: ({ items, paymentMethod, clientName, clientPhone }) => {
        const cleanItems = items.filter((i) => i.quantity > 0);
        if (cleanItems.length === 0) return null;

        const products = useProductsStore.getState().products;

        // Calculamos costos y ganancias iniciales en vivo
        const itemsWithLiveCost = cleanItems.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          const unitCostUSD = product ? getLiveUnitCostUSD(product) : item.unitCostUSD;
          const profitUSD = (item.unitPriceUSD - unitCostUSD) * item.quantity;
          return {
            ...item,
            unitCostUSD,
            profitUSD,
          };
        });

        const totalUSD = itemsWithLiveCost.reduce((sum, i) => sum + i.totalUSD, 0);
        const totalProfitUSD = itemsWithLiveCost.reduce((sum, i) => sum + i.profitUSD, 0);
        if (totalUSD <= 0 && totalProfitUSD <= 0) return null;

        const dateNow = new Date().toISOString();
        const newSale: Sale = {
          id: Date.now(),
          date: dateNow,
          items: itemsWithLiveCost,
          totalUSD,
          totalProfitUSD,
          paymentMethod,
          clientName: clientName?.trim() || undefined,
          clientPhone: clientPhone?.trim() || undefined,
          isFiado: paymentMethod === 'Fiado',
        };

        // Sincronizar gasto del cliente
        syncClientSpend(newSale.clientName, newSale.clientPhone, totalUSD, dateNow);

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

        // Devolver stock viejo y descontar stock nuevo
        adjustStock(oldSale.items, +1);
        adjustStock(cleanItems, -1);

        // Ajustar gasto cliente
        syncClientSpend(oldSale.clientName, oldSale.clientPhone, -oldSale.totalUSD);
        syncClientSpend(
          data.clientName?.trim() || undefined,
          data.clientPhone?.trim() || undefined,
          totalUSD,
          oldSale.date
        );

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
        const sale = get().sales.find((s) => s.id === id);
        if (!sale) return;

        // Devolver stock y restar gasto al cliente
        adjustStock(sale.items, +1);
        syncClientSpend(sale.clientName, sale.clientPhone, -sale.totalUSD);

        set((s) => ({ sales: s.sales.filter((saleItem) => saleItem.id !== id) }));
      },

      getSalesByInvestment: (investmentId) =>
        get().sales.filter((sale) =>
          sale.items.some((item) => item.investmentId === investmentId)
        ),

      getTotalRevenueUSD: () => get().sales.reduce((sum, s) => sum + s.totalUSD, 0),

      // 🎯 CÁLCULO DE GANANCIA EN VIVO (Como Excel):
      getTotalProfitUSD: () =>
        get().sales.reduce((sum, s) => sum + getLiveSaleProfitUSD(s), 0),

      getRevenueByInvestment: (investmentId) =>
        get().sales.reduce((sum, sale) => {
          const invItems = sale.items.filter((i) => i.investmentId === investmentId);
          return sum + invItems.reduce((s, i) => s + i.totalUSD, 0);
        }, 0),

      // 🎯 CÁLCULO DE GANANCIA POR INVERSIÓN EN VIVO:
      getProfitByInvestment: (investmentId) =>
        get().sales.reduce((sum, sale) => {
          const invItems = sale.items.filter((i) => i.investmentId === investmentId);
          return sum + invItems.reduce((s, i) => s + getLiveItemProfitUSD(i), 0);
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