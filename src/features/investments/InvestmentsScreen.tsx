import React, { useState, useMemo } from 'react';
import { Plus, TrendingUp, Package, DollarSign } from 'lucide-react';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useAppStore } from '@/store/useAppStore';
import { useCurrency } from '@/hooks/useCurrency';
import { InvestmentCard } from './components/InvestmentCard';

export const InvestmentsScreen: React.FC = () => {
  const investments = useInvestmentsStore((s) => s.investments);
  const setSelectedInvestment = useInvestmentsStore((s) => s.setSelectedInvestment);
  const getTotalInvestedUSD = useInvestmentsStore((s) => s.getTotalInvestedUSD);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const { formatFromUSD } = useCurrency();

  const [filter, setFilter] = useState<'todas' | 'active' | 'in_transit' | 'closed'>('todas');

  const totalInvestedUSD = getTotalInvestedUSD();
  const activeCount = investments.filter((i) => i.status === 'active').length;
  const inTransitCount = investments.filter((i) => i.status === 'in_transit').length;

  const filtered = useMemo(() => {
    if (filter === 'todas') return investments;
    return investments.filter((i) => i.status === filter);
  }, [investments, filter]);

  const filters = [
    { key: 'todas' as const, label: 'Todas', count: investments.length },
    { key: 'active' as const, label: 'Activas', count: activeCount },
    { key: 'in_transit' as const, label: 'En camino', count: inTransitCount },
    { key: 'closed' as const, label: 'Cerradas', count: investments.filter((i) => i.status === 'closed').length },
  ];

  const openInvestment = (id: number) => {
    setSelectedInvestment(id);
    navigateTo('investment_detail');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-24 md:pb-6">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Inversiones
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {investments.length} inversión(es) registrada(s)
            </p>
          </div>
          <button
            onClick={() => navigateTo('create_investment')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Nueva
          </button>
        </div>

        {/* KPIs globales */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <DollarSign className="w-3 h-3 text-blue-600" />
              <p className="text-[9px] font-bold text-blue-700 uppercase">Total</p>
            </div>
            <p className="text-xs font-black text-blue-900">{formatFromUSD(totalInvestedUSD)}</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <p className="text-[9px] font-bold text-emerald-700 uppercase">Activas</p>
            </div>
            <p className="text-xs font-black text-emerald-900">{activeCount}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
            <div className="flex items-center gap-1 mb-0.5">
              <Package className="w-3 h-3 text-amber-600" />
              <p className="text-[9px] font-bold text-amber-700 uppercase">En camino</p>
            </div>
            <p className="text-xs font-black text-amber-900">{inTransitCount}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-1.5 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {f.label} · {f.count}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de inversiones */}
      <div className="p-4 space-y-2.5">
        {filtered.map((inv) => (
          <InvestmentCard
            key={inv.id}
            investment={inv}
            onClick={() => openInvestment(inv.id)}
          />
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold">No hay inversiones en este filtro</p>
            <button
              onClick={() => navigateTo('create_investment')}
              className="text-xs text-blue-600 font-bold hover:underline mt-2"
            >
              Crear la primera →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};