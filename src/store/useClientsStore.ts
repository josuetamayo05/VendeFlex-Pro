// src/store/useClientsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Client, ClientDebt } from '@/types';

interface ClientsStore {
  clients: Client[];
  selectedClientId: number | null;
  setSelectedClient: (id: number | null) => void;
  addClient: (data: Partial<Client> & { name: string }) => number;
  updateClient: (id: number, data: Partial<Client>) => void;
  deleteClient: (id: number) => void;
  getClientById: (id: number) => Client | undefined;
  searchClients: (query: string) => Client[];
  deduplicateClients: () => void; // 👈 UNIFICA DUPLICADOS EXISTENTES
  resetClients: () => void;
  resetToMocks: () => void;
  addDebt: (clientId: number, debt: Omit<ClientDebt, 'id'>) => void;
  collectDebt: (clientId: number, debtId: number) => void;
  collectAllDebts: (clientId: number) => void;
}

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set, get) => ({
      clients: [],
      selectedClientId: null,

      setSelectedClient: (id) => set({ selectedClientId: id }),

      addClient: (data) => {
        const newClient: Client = {
          id: data.id || Date.now(),
          name: data.name,
          phone: data.phone || '',
          avatar: data.avatar || '',
          tags: data.tags || ['Nuevo'],
          debts: data.debts || [],
          totalSpentUSD: data.totalSpentUSD || 0,
          lastPurchase: data.lastPurchase || new Date().toISOString(),
          notes: data.notes || '',
          investmentId: data.investmentId,
        };
        set((s) => ({ clients: [newClient, ...s.clients] }));
        return newClient.id;
      },

      updateClient: (id, data) =>
        set((s) => ({
          clients: s.clients.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),

      deleteClient: (id) =>
        set((s) => ({
          clients: s.clients.filter((c) => c.id !== id),
          selectedClientId: s.selectedClientId === id ? null : s.selectedClientId,
        })),

      getClientById: (id) => get().clients.find((c) => c.id === id),

      searchClients: (query) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return get().clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q))
        );
      },

      // 🛠️ FUSIONA CLIENTES DUPLICADOS EN UNA SOLA FICHA LIMPIA
      deduplicateClients: () =>
        set((s) => {
          const map = new Map<string, Client>();

          s.clients.forEach((c) => {
            const key = c.name.trim().toLowerCase();
            if (!key) return;

            if (!map.has(key)) {
              map.set(key, { ...c, debts: [...(c.debts || [])], tags: [...(c.tags || [])] });
            } else {
              const existing = map.get(key)!;
              existing.totalSpentUSD = (existing.totalSpentUSD || 0) + (c.totalSpentUSD || 0);
              if (!existing.phone && c.phone) existing.phone = c.phone;
              if (!existing.notes && c.notes) existing.notes = c.notes;
              if (c.debts && c.debts.length > 0) {
                existing.debts = [...existing.debts, ...c.debts];
              }
              existing.tags = Array.from(new Set([...existing.tags, ...(c.tags || [])]));
            }
          });

          return { clients: Array.from(map.values()) };
        }),

      resetClients: () => set({ clients: [], selectedClientId: null }),
      resetToMocks: () => set({ clients: [], selectedClientId: null }),

      addDebt: (clientId, debtData) =>
        set((s) => ({
          clients: s.clients.map((c) => {
            if (c.id !== clientId) return c;
            const newDebt: ClientDebt = { id: Date.now(), ...debtData };
            return { ...c, debts: [...c.debts, newDebt] };
          }),
        })),

      collectDebt: (clientId, debtId) =>
        set((s) => ({
          clients: s.clients.map((c) => {
            if (c.id !== clientId) return c;
            return { ...c, debts: c.debts.filter((d) => d.id !== debtId) };
          }),
        })),

      collectAllDebts: (clientId) =>
        set((s) => ({
          clients: s.clients.map((c) => {
            if (c.id !== clientId) return c;
            return { ...c, debts: [] };
          }),
        })),
    }),
    {
      name: 'vendeflex-clients',
      partialize: (state) => ({ clients: state.clients }),
    }
  )
);