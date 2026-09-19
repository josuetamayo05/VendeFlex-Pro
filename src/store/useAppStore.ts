import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { View, Currency, BottomTab } from '@/types';

interface AppState {
  currentView: View;
  currency: Currency;
  activeTab: BottomTab;
  setView: (view: View) => void;
  setCurrency: (currency: Currency) => void;
  setActiveTab: (tab: BottomTab) => void;
  navigateTo: (view: View, tab?: BottomTab) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'dashboard',
      currency: 'USD',
      activeTab: 'inicio',

      setView: (view) => set({ currentView: view }),
      setCurrency: (currency) => set({ currency }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      navigateTo: (view, tab) =>
        set((state) => ({
          currentView: view,
          activeTab: tab ?? state.activeTab,
        })),
    }),
    {
      name: 'vendeflex-app', // clave en localStorage
      partialize: (state) => ({
        currency: state.currency, // solo persiste la moneda, no la navegación
      }),
    }
  )
);