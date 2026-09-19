import React from 'react';
import { TrendingUp, DollarSign, Package, Wallet } from 'lucide-react';
import { CurrencySelector } from '@/components/ui/CurrencySelector';
import { KPICard } from './components/KPICard';
import { QuickActions } from './components/QuickActions';
import { useCurrency } from '@/hooks/useCurrency';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useClientsStore } from '@/store/useClientsStore';
import { getClientDebtUSD } from '@/types';
import { EXCHANGE_RATE } from '@/lib/constants';
import { Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const toUSD = (price: number, currency: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const DashboardScreen: React.FC = () => {
  const { formatFromUSD } = useCurrency();

  const totalInvestedUSD = useInvestmentsStore((s) => s.getTotalInvestedUSD());
  const activeInvestments = useInvestmentsStore((s) => s.getActiveInvestmentsCount());
  const totalRevenue = useSalesStore((s) => s.getTotalRevenueUSD());
  const totalProfit = useSalesStore((s) => s.getTotalProfitUSD());
  const products = useProductsStore((s) => s.products);
  const clients = useClientsStore((s) => s.clients);

  // Dinero atrapado en stock
  const stockValueUSD = products.reduce(
    (sum, p) => sum + toUSD(p.price, p.currency) * p.stock,
    0
  );
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  // Fiados
  const totalDebt = clients.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
  const debtorsCount = clients.filter((c) => getClientDebtUSD(c) > 0).length;
  
  const navigateTo = useAppStore((s) => s.navigateTo);
  
  // ROI global
  const recoveryPercent = totalInvestedUSD > 0 ? (totalRevenue / totalInvestedUSD) * 100 : 0;

  return (
    <>
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <CurrencySelector />
          <button
            onClick={() => navigateTo('settings')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Configuración"
          >
            <Settings className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Hola, Luis 👋</h1>
          <p className="text-xs text-slate-400 font-medium">
            Resumen global de tus {activeInvestments} inversión(es) activa(s)
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4 overflow-y-auto flex-1 pb-24 md:pb-6">
        <KPICard
          label="Ganancia Total Real"
          value={formatFromUSD(totalProfit)}
          badgeText={`ROI ${recoveryPercent.toFixed(0)}%`}
          badgeColor="emerald"
          badgeIcon={<TrendingUp className="w-3.5 h-3.5" />}
          progress={Math.min(100, recoveryPercent)}
        />

        <KPICard
          label="Inversión Total"
          value={formatFromUSD(totalInvestedUSD)}
          badgeText={`${activeInvestments} activas`}
          badgeColor="blue"
          badgeIcon={<Wallet className="w-3.5 h-3.5" />}
        />

        <KPICard
          label="Dinero Atrapado en Stock"
          value={formatFromUSD(stockValueUSD)}
          badgeText={`${totalStock} items`}
          badgeColor="amber"
          badgeIcon={<Package className="w-3.5 h-3.5" />}
        />

        <KPICard
          label="Ingreso Total Cobrado"
          value={formatFromUSD(totalRevenue)}
          badgeColor="blue"
          badgeIcon={<DollarSign className="w-3.5 h-3.5" />}
        />

        <KPICard
          label="Por Cobrar (Fiados)"
          value={formatFromUSD(totalDebt)}
          valueColor="text-rose-600"
          badgeText={`${debtorsCount} clientes`}
          badgeColor="rose"
        />

        <QuickActions />
      </div>
    </>
  );
};