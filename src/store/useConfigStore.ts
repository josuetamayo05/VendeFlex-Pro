// src/store/useConfigStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BusinessConfig } from '@/lib/appConfig';
import { DEFAULT_CONFIG } from '@/lib/appConfig';

interface ConfigStore {
  config: BusinessConfig;
  updateConfig: (data: Partial<BusinessConfig>) => void;
  completeOnboarding: (data: Partial<BusinessConfig>) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,

      updateConfig: (data) =>
        set((s) => ({ config: { ...s.config, ...data } })),

      completeOnboarding: (data) =>
        set((s) => ({
          config: {
            ...s.config,
            ...data,
            onboardingCompleted: true,
            createdAt: s.config.createdAt || new Date().toISOString(),
          },
        })),

      resetConfig: () => set({ config: DEFAULT_CONFIG }),
    }),
    {
      name: 'vendeflex-config',
    }
  )
);