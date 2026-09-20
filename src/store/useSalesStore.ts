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
    });
  }
};

const adjustStock = (items: SaleItemDetail[], direction: 1 | -1) => {
  const productsStore = useProductsStore.getState();
  items.forEach((item) => {
    const product = productsStore.products.find((p) => p.id === item.productId);
    if (!product) return;
    // direction -1 = restar stock (venta), +1 = devolver stock (borrar/editar)
    const next = Math.max(0, product.stock + direction * item.quantity);
    productsStore.updateProduct(product.id, { stock: next });
  });
};

export const useSalesStore = create<SalesStore>()(
  persist(
    (set, get) => ({
      sales: [],

      addSale: ({ items, paymentMethod, clientName, clientPhone }) => {
        // 🚫 Evitar ventas vacías o de $0
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

        // Stock ya debería descontarse en el POS al cobrar;
        // si tu POS NO descuenta, descomenta:
        // adjustStock(cleanItems, -1);

        syncClientSpend(newSale.clientName, newSale.clientPhone, totalUSD, dateNow);

        set((s) => ({ sales: [newSale, ...s.sales] }));
        return newSale.id;
      },

      /**
       * EDITAR venta:
       * 1) Devuelve stock de ítems viejos
       * 2) Descuenta stock de ítems nuevos
       * 3) Ajusta totalSpent del cliente (viejo y nuevo)
       */
      updateSale: (id, data) => {
        const oldSale = get().sales.find((s) => s.id === id);
        if (!oldSale) return;

        const cleanItems = data.items.filter((i) => i.quantity > 0);
        if (cleanItems.length === 0) {
          // Si quedó vacía, eliminar
          get().deleteSale(id);
          return;
        }

        const totalUSD = cleanItems.reduce((sum, i) => sum + i.totalUSD, 0);
        const totalProfitUSD = cleanItems.reduce((sum, i) => sum + i.profitUSD, 0);

        // 1. Devolver stock anterior
        adjustStock(oldSale.items, +1);
        // 2. Descontar stock nuevo
        adjustStock(cleanItems, -1);

        // 3. Ajustar gasto del cliente
        // Quitar monto viejo del cliente anterior
        syncClientSpend(oldSale.clientName, oldSale.clientPhone, -oldSale.totalUSD);
        // Sumar monto nuevo al cliente nuevo
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

        // Devolver stock
        adjustStock(sale.items, +1);
        // Restar gasto al cliente
        syncClientSpend(sale.clientName, sale.clientPhone, -sale.totalUSD);

        set((s) => ({ sales: s.sales.filter((saleItem) => saleItem.id !== id) }));
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