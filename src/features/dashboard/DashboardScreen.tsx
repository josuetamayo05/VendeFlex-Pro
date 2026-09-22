// src/features/dashboard/DashboardScreen.tsx
import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  Wallet,
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
        {/* ═══ SALDO TOTAL (héroe) ═══ */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Saldo total (Patrimonio)
              </p>
              <h2 className="text-3xl font-black text-slate-900 mt-1 tracking-tight">
                {formatFromUSD(m.saldoTotalUSD)}
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

          {/* Barra de recuperación de capital */}
          <div className="space-y-1">
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${m.recoveryPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Capital recuperado: {m.recoveryPercent.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* ═══ GRID 2×2 PRINCIPAL ═══ */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Ganancia de hoy */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 text-emerald-500" />
              Ganancia de hoy
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(m.gananciaHoy)}
            </p>
            {m.ingresosHoy > 0 && (
              <p className="text-[9px] font-bold text-emerald-600">
                +{formatFromUSD(m.ingresosHoy)} vendido
              </p>
            )}
          </div>

          {/* Inversión en curso */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Wallet className="w-3 h-3 text-blue-500" />
              Inversión de bolsillo
            </p>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(m.netPocketInvestmentUSD)}
            </p>
            <p className="text-[9px] font-bold text-blue-600">
              {m.projectsCount} proyecto{m.projectsCount !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Ingresos cobrados */}
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

          {/* Por cobrar */}
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Landmark className="w-3 h-3 text-rose-500" />
              Por cobrar
            </p>
            <p className="text-lg font-black text-rose-600">
              {formatFromUSD(m.porCobrarUSD)}
            </p>
            <p className="text-[9px] font-bold text-slate-400">
              {m.debtorsCount} cliente{m.debtorsCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* ═══ GANANCIA LÍQUIDA + STOCK ═══ */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-3xl space-y-1">
            <p className="text-[10px] font-bold text-emerald-700/70">
              Ganancia líquida libre
            </p>
            <p className="text-lg font-black text-emerald-700">
              {formatFromUSD(m.liquidProfitUSD)}
            </p>
            <p className="text-[9px] font-bold text-emerald-600/80">En mano 💵</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-3.5 rounded-3xl space-y-1">
            <p className="text-[10px] font-bold text-amber-700/70 flex items-center gap-1">
              <Package className="w-3 h-3" /> Stock a costo
            </p>
            <p className="text-lg font-black text-amber-700">
              {formatFromUSD(m.stockAtCostUSD)}
            </p>
            <p className="text-[9px] font-bold text-amber-600/80">
              {m.totalStockUnits} items · vale {formatFromUSD(m.stockAtPriceUSD)}
            </p>
          </div>
        </div>

        {/* ═══ DESGLOSE BÓVEDA (bloque oscuro estilo Gemini) ═══ */}
        <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Desglose bóveda & control
            </p>
          </div>

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