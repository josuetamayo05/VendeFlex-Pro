import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/safeStorage';

export type TransactionType = 'expense' | 'reinvestment';

export interface Transaction {
  id: number;
  type: TransactionType;
  concept: string;
  amountUSD: number;
  currency: 'USD' | 'CUP' | 'MLC';
  fromInvestmentId?: number;
  toInvestmentId?: number;
  date: string;
  notes?: string;
}

interface FinanceState {
  transactions: Transaction[];

  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: number) => void;
  getTotalExpensesUSD: () => number;
  getTotalReinvestedUSD: () => number;
  getExpensesByInvestment: (investmentId: number) => number;
  getReinvestmentsByInvestment: (investmentId: number) => number;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],

      addTransaction: (data) => {
        const newTx: Transaction = {
          ...data,
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
        };

        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
      },

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      getTotalExpensesUSD: () =>
        get()
          .transactions.filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amountUSD, 0),

      getTotalReinvestedUSD: () =>
        get()
          .transactions.filter((t) => t.type === 'reinvestment')
          .reduce((sum, t) => sum + t.amountUSD, 0),

      getExpensesByInvestment: (investmentId) =>
        get()
          .transactions.filter(
            (t) => t.type === 'expense' && t.fromInvestmentId === investmentId
          )
          .reduce((sum, t) => sum + t.amountUSD, 0),

      getReinvestmentsByInvestment: (investmentId) =>
        get()
          .transactions.filter(
            (t) => t.type === 'reinvestment' && t.toInvestmentId === investmentId
          )
          .reduce((sum, t) => sum + t.amountUSD, 0),
    }),
    {
      name: 'vendeflex-finance',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);