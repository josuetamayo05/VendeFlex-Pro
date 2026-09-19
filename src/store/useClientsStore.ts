import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeStorage } from '@/lib/safeStorage';
import type { Client, ClientDebt } from '@/types';
import { EXCHANGE_RATE } from '@/lib/constants';

const mockClients: Client[] = [
  {
    id: 1,
    investmentId: 1,
    name: 'María Pérez',
    phone: '5350121476',
    avatar: 'https://i.pravatar.cc/150?u=maria',
    tags: ['VIP'],
    debts: [
      {
        id: 101,
        investmentId: 1,
        amountUSD: 25,
        amountCUP: 25 * EXCHANGE_RATE,
        concept: 'Nike Sneaker + Top Gym',
        date: '2025-03-10',
        invoiceNumber: '#123',
      },
    ],
    totalSpentUSD: 180,
    lastPurchase: '2025-03-10',
  },
  {
    id: 2,
    investmentId: 1,
    name: 'Juan Rodríguez',
    phone: '5355987654',
    avatar: 'https://i.pravatar.cc/150?u=juan',
    tags: ['Frecuente'],
    debts: [
      {
        id: 102,
        investmentId: 1,
        amountUSD: 25,
        amountCUP: 8000,
        concept: 'Auriculares BT',
        date: '2025-03-08',
        invoiceNumber: '#118',
      },
    ],
    totalSpentUSD: 95,
    lastPurchase: '2025-03-08',
  },
  {
    id: 3,
    investmentId: 1,
    name: 'Laura Gómez',
    phone: '5355112233',
    avatar: 'https://i.pravatar.cc/150?u=laura',
    tags: ['VIP', 'Frecuente'],
    debts: [],
    totalSpentUSD: 320,
    lastPurchase: '2025-03-12',
  },
];

interface ClientsStore {
  clients: Client[];
  selectedClientId: number | null;

  setSelectedClient: (id: number | null) => void;
  addClient: (client: Omit<Client, 'id' | 'debts' | 'totalSpentUSD'>) => void;
  collectDebt: (clientId: number, debtId: number) => void;
  collectAllDebts: (clientId: number) => void;
  addDebt: (clientId: number, debt: Omit<ClientDebt, 'id'>) => void;
  resetToMocks: () => void;
}

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set) => ({
      clients: mockClients,
      selectedClientId: null,

      setSelectedClient: (id) => set({ selectedClientId: id }),

      addClient: (data) =>
        set((s) => ({
          clients: [
            ...s.clients,
            {
              ...data,
              id: Date.now(),
              debts: [],
              totalSpentUSD: 0,
            },
          ],
        })),

      collectDebt: (clientId, debtId) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === clientId
              ? { ...c, debts: c.debts.filter((d) => d.id !== debtId) }
              : c
          ),
        })),

      collectAllDebts: (clientId) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === clientId ? { ...c, debts: [] } : c
          ),
        })),

      addDebt: (clientId, debt) =>
        set((s) => ({
          clients: s.clients.map((c) =>
            c.id === clientId
              ? { ...c, debts: [...c.debts, { ...debt, id: Date.now() }] }
              : c
          ),
        })),

      resetToMocks: () => set({ clients: mockClients, selectedClientId: null }),
    }),
    {
      name: 'vendeflex-clients',
      storage: createJSONStorage(() => safeStorage),
    }
  )
);