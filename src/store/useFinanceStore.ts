import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/safeStorage';

export type TransactionType = 'expense' | 'reinvestment' | 'withdrawal' | 'deposit';

export interface Transaction {
  id: number;
  type: TransactionType;
  concept: string;
  amountUSD: number;
  currency: 'USD' | 'CUP' | 'MLC';
  fromInvestmentId?: number; // De qué inversión sale la ganancia
  toInvestmentId?: number;   // A qué nueva inversión entra el capital
  date: string;
  notes?: string;
}

interface FinanceState {
  transactions: Transaction[];
  cajaUSD: number;
  cajaCUP: number;
  cajaMLC: number;

  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: number) => void;
  getExpensesByInvestment: (investmentId: number) => number;
  getReinvestmentsByInvestment: (investmentId: number) => number;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [
        {
          id: 1,
          type: 'expense',
          concept: 'Mensajería entrega Licras',
          amountUSD: 5,
          currency: 'USD',
          fromInvestmentId: 1,
          date: '2025-03-12',
        },
        {
          id: 2,
          type: 'reinvestment',
          concept: 'Reinversión de P001 hacia Accesorios TEMU',
          amountUSD: 100,
          currency: 'USD',
          fromInvestmentId: 1,
          toInvestmentId: 2,
          date: '2025-03-14',
        },
      ],
      cajaUSD: 350,
      cajaCUP: 45000,
      cajaMLC: 120,

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