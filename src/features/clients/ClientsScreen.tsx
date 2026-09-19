import React, { useState, useMemo } from 'react';
import { Users, Plus, Wallet } from 'lucide-react';
import { useClientsStore } from '@/store/useClientsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { getClientDebtUSD, getClientStatus } from '@/types';
import { ClientCard } from './components/ClientCard';
import { ClientFilters } from './components/ClientFilters';
import { ClientDetail } from './components/ClientDetail';
import { EXCHANGE_RATE } from '@/lib/constants';

export const ClientsScreen: React.FC = () => {
  const clients = useClientsStore((s) => s.clients);
  const selectedClientId = useClientsStore((s) => s.selectedClientId);
  const setSelectedClient = useClientsStore((s) => s.setSelectedClient);
  const investments = useInvestmentsStore((s) => s.investments);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'todos' | 'deben' | 'al_dia'>('todos');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>('todas');

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  // Filtrado inteligente por Búsqueda, Estado y por INVERSIÓN
  const filtered = useMemo(() => {
    return clients
      .filter((c) => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const status = getClientStatus(c);
        const matchFilter =
          filter === 'todos' ||
          (filter === 'deben' && status !== 'al_dia') ||
          (filter === 'al_dia' && status === 'al_dia');

        // Filtro por inversión
        const matchInvestment =
          selectedInvestmentId === 'todas' ||
          c.investmentId?.toString() === selectedInvestmentId ||
          c.debts.some((d) => d.investmentId?.toString() === selectedInvestmentId);

        return matchSearch && matchFilter && matchInvestment;
      })
      .sort((a, b) => getClientDebtUSD(b) - getClientDebtUSD(a));
  }, [clients, search, filter, selectedInvestmentId]);

  // Totales
  const totalDebtUSD = filtered.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
  const clientsWithDebt = filtered.filter((c) => getClientDebtUSD(c) > 0).length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Clientes & Fiados
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {clientsWithDebt > 0
                ? `${clientsWithDebt} con deuda · $${totalDebtUSD.toFixed(2)} USD (≈ $${(
                    totalDebtUSD * EXCHANGE_RATE
                  ).toLocaleString('es-CU')} CUP)`
                : `${filtered.length} clientes · Sin deudas pendientes`}
            </p>
          </div>
          <button
            onClick={() => {
              const name = prompt('Nombre del cliente:');
              if (!name) return;
              const phone = prompt('Teléfono (opcional):') || undefined;
              const invId = selectedInvestmentId !== 'todas' ? Number(selectedInvestmentId) : investments[0]?.id;
              useClientsStore.getState().addClient({
                name,
                phone,
                investmentId: invId,
                tags: ['Nuevo'],
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        {/* FILTRO POR INVERSIÓN */}
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-slate-400" />
          <select
            value={selectedInvestmentId}
            onChange={(e) => setSelectedInvestmentId(e.target.value)}
            className="w-full bg-slate-100 text-slate-800 font-extrabold text-xs px-3 py-2 rounded-xl border-none focus:outline-none"
          >
            <option value="todas">📦 Inversión: Todas las inversiones</option>
            {investments.map((inv) => (
              <option key={inv.id} value={inv.id.toString()}>
                {inv.code} · {inv.name} ({inv.supplierName})
              </option>
            ))}
          </select>
        </div>

        <ClientFilters
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
        />
      </div>

      {/* LISTA DE CLIENTES */}
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
            <p className="text-xs font-bold">No se encontraron clientes para esta inversión</p>
          </div>
        )}
      </div>

      {/* MODAL DETALLE */}
      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  );
};