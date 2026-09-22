import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Investment } from '@/types';

const mockInvestments: Investment[] = []

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