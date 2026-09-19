import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/safeStorage';
import type { View, Currency, BottomTab } from '@/types';

interface AppState {
  currentView: View;
  currency: Currency;
  activeTab: BottomTab;

  // Tasas de cambio editables
  exchangeRate: number; // Ej: 320 CUP
  mlcRate: number;      // Ej: 1.1 USD

  setView: (view: View) => void;
  setCurrency: (currency: Currency) => void;
  setActiveTab: (tab: BottomTab) => void;
  setExchangeRate: (rate: number) => void;
  setMlcRate: (rate: number) => void;
  navigateTo: (view: View, tab?: BottomTab) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      currency: 'USD',
      activeTab: 'inicio',
      exchangeRate: 320,
      mlcRate: 1.1,

      setView: (view) => set({ currentView: view }),
      setCurrency: (currency) => set({ currency }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setExchangeRate: (rate) => set({ exchangeRate: rate }),
      setMlcRate: (rate) => set({ mlcRate: rate }),

      navigateTo: (view, tab) =>
        set((state) => ({
          currentView: view,
          activeTab: tab ?? state.activeTab,
        })),
    }),
    {
      name: 'vendeflex-app',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        currency: state.currency,
        exchangeRate: state.exchangeRate,
        mlcRate: state.mlcRate,
      }),
    }
  )
);