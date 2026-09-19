import React from 'react';
import { TrendingUp, DollarSign, Package, Wallet, Landmark, TrendingDown, Repeat } from 'lucide-react';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { KPICard } from './components/KPICard';
import { QuickActions } from './components/QuickActions';
import { useCurrency } from '@/hooks/useCurrency';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useClientsStore } from '@/store/useClientsStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { getClientDebtUSD } from '@/types';
import { EXCHANGE_RATE } from '@/lib/constants';

const toUSD = (price: number, currency: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const DashboardScreen: React.FC = () => {
  const { formatFromUSD } = useCurrency();

  const investments = useInvestmentsStore((s) => s.investments);
  const getTotalInvestedUSD = useInvestmentsStore((s) => s.getTotalInvestedUSD);
  const activeInvestmentsCount = useInvestmentsStore((s) => s.getActiveInvestmentsCount());

  const totalRevenue = useSalesStore((s) => s.getTotalRevenueUSD());
  const totalProfit = useSalesStore((s) => s.getTotalProfitUSD());
  const products = useProductsStore((s) => s.products);
  const clients = useClientsStore((s) => s.clients);

  const totalExpenses = useFinanceStore((s) => s.getTotalExpensesUSD());
  const totalReinvested = useFinanceStore((s) => s.getTotalReinvestedUSD());

  // Inversión Bruta (Suma simple)
  const grossInvestmentUSD = getTotalInvestedUSD();

  // Inversión Neta de Bolsillo = Inversión Bruta - Capital Reinvertido de Ganancias
  const netPocketInvestmentUSD = Math.max(0, grossInvestmentUSD - totalReinvested);

  // Ganancia Líquida Disponible (En Mano) = Ganancia Cobrada - Gastos Operativos - Reinvertido
  const liquidProfitInHand = Math.max(0, totalProfit - totalExpenses - totalReinvested);

  // Dinero Atrapado en Stock (Precio de venta x stock actual)
  const stockValueUSD = products.reduce(
    (sum, p) => sum + toUSD(p.price, p.currency) * p.stock,
    0
  );
  const totalStockCount = products.reduce((sum, p) => sum + p.stock, 0);

  // Deudas Fiadas Reales
  const totalDebt = clients.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
  const debtorsCount = clients.filter((c) => getClientDebtUSD(c) > 0).length;

  // ROI Real de Bolsillo
  const roiPercent = netPocketInvestmentUSD > 0 ? (totalProfit / netPocketInvestmentUSD) * 100 : 0;

  return (
    <>
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-4">
        <CurrencySelector />
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Hola, Josué 👋</h1>
          <p className="text-xs text-slate-400 font-medium">
            Resumen global de tus {activeInvestmentsCount} inversión(es) activa(s)
          </p>
        </div>
      </div>

      <div className="p-5 space-y-3">
        {/* GANANCIA LÍQUIDA LIBRE */}
        <KPICard
          label="Ganancia Líquida Libre (En Mano)"
          value={formatFromUSD(liquidProfitInHand)}
          badgeText={`ROI ${roiPercent.toFixed(0)}%`}
          badgeColor="emerald"
          badgeIcon={<TrendingUp className="w-3.5 h-3.5" />}
          progress={Math.min(100, roiPercent)}
        />

        {/* INVERSIÓN REAL DE BOLSILLO */}
        <KPICard
          label="Inversión Real de Bolsillo"
          value={formatFromUSD(netPocketInvestmentUSD)}
          badgeText={`${investments.length} proyectos`}
          badgeColor="blue"
          badgeIcon={<Wallet className="w-3.5 h-3.5" />}
        />

        {/* DINERO EN STOCK */}
        <KPICard
          label="Dinero Atrapado en Stock"
          value={formatFromUSD(stockValueUSD)}
          badgeText={`${totalStockCount} items`}
          badgeColor="amber"
          badgeIcon={<Package className="w-3.5 h-3.5" />}
        />

        {/* INGRESO TOTAL Y DEUDAS */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-blue-500" /> Ingreso Cobrado
            </p>
            <p className="text-base font-black text-slate-900 mt-1">{formatFromUSD(totalRevenue)}</p>
          </div>

          <div className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Landmark className="w-3 h-3 text-rose-500" /> Por Cobrar (Fiados)
            </p>
            <p className="text-base font-black text-rose-600 mt-1">{formatFromUSD(totalDebt)}</p>
            <p className="text-[9px] font-bold text-slate-400 mt-0.5">{debtorsCount} clientes</p>
          </div>
        </div>

        {/* DESGLOSE BÓVEDA (GASTOS Y REINVERSIÓN) */}
        {(totalExpenses > 0 || totalReinvested > 0) && (
          <div className="bg-slate-900 text-white p-4 rounded-3xl shadow-md space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Desglose Bóveda & Control
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-rose-400">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Gastos: {formatFromUSD(totalExpenses)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-400">
                <Repeat className="w-3.5 h-3.5" />
                <span>Reinvertido: {formatFromUSD(totalReinvested)}</span>
              </div>
            </div>
          </div>
        )}

        <QuickActions />
      </div>
    </>
  );
};