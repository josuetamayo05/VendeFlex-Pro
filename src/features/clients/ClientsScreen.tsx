import React, { useState, useMemo } from 'react';
import { Users, Plus } from 'lucide-react';
import { useClientsStore } from '@/store/useClientsStore';
import { getClientDebtUSD, getClientStatus } from '@/types';
import { ClientCard } from './components/ClientCard';
import { ClientFilters } from './components/ClientFilters';
import { ClientDetail } from './components/ClientDetail';
import { EXCHANGE_RATE } from '@/lib/constants';

export const ClientsScreen: React.FC = () => {
  const clients = useClientsStore((s) => s.clients);
  const selectedClientId = useClientsStore((s) => s.selectedClientId);
  const setSelectedClient = useClientsStore((s) => s.setSelectedClient);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'deben' | 'al_dia'>('todos');

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  // Totales
  const totalDebtUSD = clients.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
  const clientsWithDebt = clients.filter((c) => getClientDebtUSD(c) > 0).length;

  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const status = getClientStatus(c);
        const matchFilter =
          filter === 'todos' ||
          (filter === 'deben' && status !== 'al_dia') ||
          (filter === 'al_dia' && status === 'al_dia');
        return matchSearch && matchFilter;
      })
      .sort((a, b) => getClientDebtUSD(b) - getClientDebtUSD(a)); // deudas primero
  }, [clients, search, filter]);

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clientes & Fiados
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {clientsWithDebt > 0
                ? `${clientsWithDebt} con deuda · $${totalDebtUSD} USD (≈ $${(totalDebtUSD * EXCHANGE_RATE).toLocaleString('es-CU')} CUP)`
                : `${clients.length} clientes · Sin deudas pendientes`}
            </p>
          </div>
          <button
            onClick={() => {
              const name = prompt('Nombre del cliente:');
              if (!name) return;
              const phone = prompt('Teléfono (opcional):') || undefined;
              useClientsStore.getState().addClient({
                name,
                phone,
                tags: ['Nuevo'],
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        <ClientFilters
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      {/* LISTA */}
      <div className="p-4 space-y-2.5">
        {filtered.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onClick={() => setSelectedClient(client.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold">No se encontraron clientes</p>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};