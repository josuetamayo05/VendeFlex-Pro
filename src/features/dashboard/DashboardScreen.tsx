// src/features/dashboard/DashboardScreen.tsx
import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Landmark,
  TrendingDown,
  Repeat,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { QuickActions } from './components/QuickActions';
import { useCurrency } from '@/hooks/useCurrency';
import { useGlobalMetrics } from '@/hooks/useGlobalMetrics';
import { useConfigStore } from '@/store/useConfigStore';

export const DashboardScreen: React.FC = () => {
  const { formatFromUSD } = useCurrency();
  const m = useGlobalMetrics();

  const config = useConfigStore((s) => s.config);
  const ownerName = config.ownerName ? `Hola, ${config.ownerName}` : '¡Hola!';
  const businessName = config.businessName || 'Mi Negocio';

  return (
    <>
      {/* ═══ HEADER ═══ */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-4">
        <CurrencySelector />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {ownerName} 👋
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {businessName} · {m.activeInvestmentsCount} inversión(es) activa(s)
          </p>
        </div>
      </div>

      <div className="p-5 space-y-3 pb-28">
        {/* ═══ 1. SALDO EN CAJA (héroe + barra) ═══ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Saldo actual en caja
              </p>
              <h2
                className={`text-3xl font-black mt-1 tracking-tight ${
                  m.efectivoEnCajaUSD >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}
              >
                {formatFromUSD(m.efectivoEnCajaUSD)}
              </h2>
            </div>
            <span
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
                m.roiPercent >= 0
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                  : 'text-rose-600 bg-rose-50 border-rose-100'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              ROI {m.roiPercent.toFixed(0)}%
            </span>
          </div>

          {/* Barra de capital recuperado */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${m.recoveryPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Capital recuperado: {m.recoveryPercent.toFixed(0)}%</span>
              <span>
                {m.efectivoEnCajaUSD >= 0 ? 'En mano 💵' : 'En recuperación'}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ 2. GRID 2×2 ═══ */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Patrimonio */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Landmark className="w-3 h-3 text-blue-500" />
              Patrimonio
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(m.patrimonioTotalUSD)}
            </p>
            <p className="text-[9px] font-bold text-slate-400">
              Caja + Stock + Fiados
            </p>
          </div>

          {/* Ganancia de hoy */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              Ganancia de hoy
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(m.gananciaHoy)}
            </p>
            {m.ingresosHoy > 0 ? (
              <p className="text-[9px] font-bold text-emerald-600">
                +{formatFromUSD(m.ingresosHoy)} vendido
              </p>
            ) : (
              <p className="text-[9px] font-bold text-slate-400">Sin ventas hoy</p>
            )}
          </div>

          {/* Ingreso cobrado */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-blue-500" />
              Ingreso cobrado
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(m.totalRevenueCollected)}
            </p>
            <p className="text-[9px] font-bold text-slate-400">
              Ganancia: {formatFromUSD(m.totalProfitCollected)}
            </p>
          </div>

          {/* Stock a costo */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Package className="w-3 h-3 text-amber-500" />
              Stock a costo
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(m.stockAtCostUSD)}
            </p>
            <p className="text-[9px] font-bold text-amber-600">
              {m.totalStockUnits} items · vale {formatFromUSD(m.stockAtPriceUSD)}
            </p>
          </div>
        </div>

        {/* ═══ 3. DESGLOSE BÓVEDA ═══ */}
        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-md space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Desglose bóveda & control
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-rose-400" /> Gastos
              </p>
              <p className="text-sm font-black text-rose-400">
                {formatFromUSD(m.totalExpenses)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <Repeat className="w-3 h-3 text-indigo-400" /> Reinvertido
              </p>
              <p className="text-sm font-black text-indigo-400">
                {formatFromUSD(m.totalReinvested)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400">Inversión bruta</p>
              <p className="text-sm font-black text-slate-200">
                {formatFromUSD(m.grossInvestmentUSD)}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400">Capital recuperado</p>
              <p className="text-sm font-black text-emerald-400">
                {m.recoveryPercent.toFixed(0)}%
              </p>
            </div>
          </div>
        </div>

        <QuickActions />
      </div>
    </>
  );
};