import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Investment } from '@/types';

const mockInvestments: Investment[] = [
  {
    id: 1,
    code: 'P001',
    name: 'Ropa Gym Marzo',
    type: 'import_usa',
    status: 'active',
    createdAt: '2025-03-01',
    arrivalDate: '2025-03-15',
    supplierName: 'SHEIN',
    productsCost: 200,
    weightLbs: 7.5,
    shippingRatePerLb: 5,
    shippingCost: 37.5,
    taxes: 10,
    totalInvestment: 247.5,
    currency: 'USD',
    color: '#3B82F6',
    notes: 'Primer pedido, ropa deportiva',
  },
  {
    id: 2,
    code: 'P002',
    name: 'Accesorios TEMU',
    type: 'import_usa',
    status: 'in_transit',
    createdAt: '2025-03-10',
    supplierName: 'TEMU',
    productsCost: 150,
    weightLbs: 12,
    shippingRatePerLb: 4.5,
    shippingCost: 54,
    taxes: 0,
    totalInvestment: 204,
    currency: 'USD',
    color: '#10B981',
    notes: 'Auriculares BT y smartwatches',
  },
  {
    id: 3,
    code: 'P003',
    name: 'Cosméticos Local',
    type: 'local',
    status: 'active',
    createdAt: '2025-03-05',
    supplierName: 'Distribuidora La Habana',
    productsCost: 15000,
    shippingCost: 0,
    taxes: 0,
    totalInvestment: 15000,
    currency: 'CUP',
    color: '#F59E0B',
    notes: 'Shampoos y cremas de temporada',
  },
];

interface InvestmentsStore {
  investments: Investment[];
  selectedInvestmentId: number | null;

  setSelectedInvestment: (id: number | null) => void;
  addInvestment: (data: Omit<Investment, 'id' | 'code' | 'totalInvestment'>) => number;
  updateInvestment: (id: number, data: Partial<Investment>) => void;
  deleteInvestment: (id: number) => void;

  getInvestmentById: (id: number) => Investment | undefined;
  getTotalInvestedUSD: () => number;
  getActiveInvestmentsCount: () => number;

  // Reset
  resetToMocks: () => void;
}

const generateCode = (existing: Investment[]) => {
  const nums = existing.map((i) => parseInt(i.code.replace('P', '')) || 0);
  const next = (Math.max(0, ...nums) + 1).toString().padStart(3, '0');
  return `P${next}`;
};

export const useInvestmentsStore = create<InvestmentsStore>()(
  persist(
    (set, get) => ({
      investments: mockInvestments,
      selectedInvestmentId: null,

      setSelectedInvestment: (id) => set({ selectedInvestmentId: id }),

      addInvestment: (data) => {
        const { investments } = get();
        const total = data.productsCost + data.shippingCost + data.taxes;
        const newInvestment: Investment = {
          ...data,
          id: Date.now(),
          code: generateCode(investments),
          totalInvestment: total,
        };
        set({ investments: [...investments, newInvestment] });
        return newInvestment.id;
      },

      updateInvestment: (id, data) =>
        set((s) => ({
          investments: s.investments.map((i) => {
            if (i.id !== id) return i;
            const updated = { ...i, ...data };
            updated.totalInvestment =
              updated.productsCost + updated.shippingCost + updated.taxes;
            return updated;
          }),
        })),

      deleteInvestment: (id) =>
        set((s) => ({
          investments: s.investments.filter((i) => i.id !== id),
        })),

      getInvestmentById: (id) => get().investments.find((i) => i.id === id),

      getTotalInvestedUSD: () => {
        return get().investments.reduce((sum, i) => {
          if (i.currency === 'USD') return sum + i.totalInvestment;
          return sum + i.totalInvestment / 320;
        }, 0);
      },

      getActiveInvestmentsCount: () =>
        get().investments.filter((i) => i.status === 'active' || i.status === 'in_transit').length,

      resetToMocks: () => set({ investments: mockInvestments, selectedInvestmentId: null }),
    }),
    {
      name: 'vendeflex-investments',
      partialize: (state) => ({ investments: state.investments }),
    }
  )
);