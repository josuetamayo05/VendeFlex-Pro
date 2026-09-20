import React from 'react';
import { Package, Plane, Store, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import type { Investment } from '@/types';
import { useInvestmentMetrics } from '@/hooks/useInvestmentMetrics';
import { useCurrency } from '@/hooks/useCurrency';

interface Props {
  investment: Investment;
  onClick: () => void;
}

// En src/features/investments/components/InvestmentCard.tsx

const typeIcons: Record<string, React.ElementType> = {
  import_usa: Plane,
  local: Store,
  encargo: Clock,
  mixta: Package,
};

const typeLabels: Record<string, string> = {
  import_usa: 'Importación USA',
  local: 'Compra Local',
  encargo: 'Por Encargo',
  mixta: 'Mixta',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  planning: { label: 'Planificando', color: 'bg-slate-100 text-slate-700' },
  in_transit: { label: 'En camino', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  active: { label: 'En venta', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  closed: { label: 'Cerrada', color: 'bg-slate-100 text-slate-600' },
};

export const InvestmentCard: React.FC<Props> = ({ investment, onClick }) => {
  const metrics = useInvestmentMetrics(investment.id);
  const { formatFromUSD } = useCurrency();
  const Icon = typeIcons[investment.type];
  const status = statusConfig[investment.status];

  const investedUSD =
    investment.currency === 'USD'
      ? investment.totalInvestment
      : investment.totalInvestment / 320;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 active:scale-[0.99] transition-all text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${investment.color}20`, color: investment.color }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 truncate">
                {investment.name}
              </h3>
              <span className="text-[9px] font-black text-slate-400">
                {investment.code}
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              {typeLabels[investment.type]} · {investment.supplierName}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 pb-3 border-b border-slate-50">
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Invertido</p>
          <p className="text-xs font-black text-slate-800 mt-0.5">
            {formatFromUSD(investedUSD)}
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Stock</p>
          <p className="text-xs font-black text-slate-800 mt-0.5">
            {metrics.totalStock} <span className="text-slate-400 font-medium">u</span>
          </p>
        </div>
        <div>
          <p className="text-[9px] font-bold text-slate-400 uppercase">ROI est.</p>
          <p
            className={`text-xs font-black mt-0.5 flex items-center gap-0.5 ${
              metrics.roiPercent >= 30 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {metrics.roiPercent >= 0 && <TrendingUp className="w-3 h-3" />}
            {metrics.roiPercent.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className={`text-[9px] font-extrabold px-2 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
        <span className="text-[10px] font-bold text-slate-400">
          {metrics.productsCount} productos · {investment.createdAt}
        </span>
      </div>
    </button>
  );
};