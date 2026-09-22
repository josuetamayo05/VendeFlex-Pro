// src/features/reports/ReportsScreen.tsx
import { useMemo, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Award,
  Wallet,
  PieChart as PieIcon,
  Repeat,
  ShieldCheck,
  Package,
  Landmark,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useSalesStore } from '@/store/useSalesStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useCurrency } from '@/hooks/useCurrency';
import { useGlobalMetrics } from '@/hooks/useGlobalMetrics';
import { EXCHANGE_RATE } from '@/lib/constants';

const MS_DAY = 24 * 60 * 60 * 1000;

export const ReportsScreen = () => {
  const { formatFromUSD } = useCurrency();
  const sales = useSalesStore((s) => s.sales);
  const products = useProductsStore((s) => s.products);
  const investments = useInvestmentsStore((s) => s.investments);
  const m = useGlobalMetrics();
  
  
  const [period, setPeriod] = useState<'7d' | '30d' | 'todo'>('todo');

  // 🔹 FILTRO DE PERIODO
  const filteredSales = useMemo(() => {
    if (period === 'todo') return sales;
    if (sales.length === 0) return [];

    const sorted = [...sales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const newest = new Date(sorted[0].date).getTime();
    const days = period === '7d' ? 7 : 30;
    const cutoff = newest - days * MS_DAY;

    return sales.filter((s) => new Date(s.date).getTime() >= cutoff);
  }, [sales, period]);

  // 🔹 MÉTRICAS GLOBALES
  const reinvestedCapital = investments
    .filter((inv) => {
      const anyInv = inv as { fundingSource?: string; fundedFromInvestmentId?: number | null };
      return anyInv.fundingSource === 'reinvested' || !!anyInv.fundedFromInvestmentId;
    })
    .reduce((sum, inv) => {
      const usd =
        inv.currency === 'USD' ? inv.totalInvestment : inv.totalInvestment / EXCHANGE_RATE;
      return sum + usd;
    }, 0);
  const totalProfitUSD = filteredSales.reduce((sum, s) => sum + s.totalProfitUSD, 0);
  const netCashInHand = totalProfitUSD - reinvestedCapital;


  // 🔹 MÉTRICAS DEL PERIODO (solo para header y gráficos)
  const periodRevenueUSD = filteredSales.reduce((sum, s) => sum + s.totalUSD, 0);
  const periodProfitUSD = filteredSales.reduce((sum, s) => sum + s.totalProfitUSD, 0);

  // 1. Formas de pago
  const paymentDataMap: Record<string, number> = {};
  filteredSales.forEach((s) => {
    paymentDataMap[s.paymentMethod] = (paymentDataMap[s.paymentMethod] || 0) + s.totalUSD;
  });

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#F43F5E'];
  const paymentChartData = Object.keys(paymentDataMap).map((method, idx) => ({
    name: method,
    value: Number(paymentDataMap[method].toFixed(2)),
    color: COLORS[idx % COLORS.length],
  }));

  // 2. Comparativa por inversión
  const investmentChartData = investments.map((inv) => {
    let invRevenue = 0;
    let invProfit = 0;

    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (item.investmentId === inv.id) {
          invRevenue += item.totalUSD;
          invProfit += item.profitUSD;
        }
      });
    });

    const investedUSD =
      inv.currency === 'USD' ? inv.totalInvestment : inv.totalInvestment / EXCHANGE_RATE;

    return {
      name: inv.code,
      fullName: inv.name,
      InvertidoUSD: Number(investedUSD.toFixed(2)),
      VendidoUSD: Number(invRevenue.toFixed(2)),
      GananciaUSD: Number(invProfit.toFixed(2)),
    };
  });

  // 3. Top 5 productos
  const productSalesMap: Record<
    string,
    { qty: number; revenueUSD: number; profitUSD: number; image?: string }
  > = {};

  filteredSales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productName]) {
        const prod = products.find((p) => p.id === item.productId);
        productSalesMap[item.productName] = {
          qty: 0,
          revenueUSD: 0,
          profitUSD: 0,
          image: prod?.image || '',
        };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].revenueUSD += item.totalUSD;
      productSalesMap[item.productName].profitUSD += item.profitUSD;
    });
  });

  const topProducts = Object.keys(productSalesMap)
    .map((name) => ({ name, ...productSalesMap[name] }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalProducts = products.length;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-24">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reportes & Analytics
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Moneda base: USD · {filteredSales.length} ventas en el periodo
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {(['7d', '30d', 'todo'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  period === p ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Todo'}
              </button>
            ))}
          </div>
        </div>

        {/* MÉTRICAS DEL PERIODO */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Ganancia Bruta</span>
            </div>
            <p className="text-xl font-black text-emerald-700">
              {formatFromUSD(periodProfitUSD)}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Ingresos del Periodo</span>
            </div>
            <p className="text-xl font-black text-blue-700">
              {formatFromUSD(periodRevenueUSD)}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* CAPITAL & DISPONIBILIDAD (métricas globales) */}
        <div className="bg-slate-900 text-white p-4 rounded-3xl space-y-3">
          <h2 className="text-xs font-black uppercase tracking-wide text-slate-400 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-blue-400" /> Capital & Disponibilidad
          </h2>

          {/* GRID DE 4 TARJETAS */}
          <div className="grid grid-cols-2 gap-3">
            {/* Inversión de bolsillo */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
              <div className="flex items-center gap-1.5 text-blue-400 mb-1">
                <Wallet className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">De Bolsillo</span>
              </div>
              <p className="text-lg font-black text-white">
                {formatFromUSD(m.netPocketInvestmentUSD)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Capital propio</p>
            </div>

            {/* Ganancia líquida libre */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
              <div className="flex items-center gap-1.5 text-emerald-400 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Líquida Libre</span>
              </div>
              <p className="text-lg font-black text-white">
                {formatFromUSD(m.liquidProfitUSD)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tras gastos y reinversión</p>
            </div>

            {/* Reinvertido */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
              <div className="flex items-center gap-1.5 text-purple-400 mb-1">
                <Repeat className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Reinvertido</span>
              </div>
              <p className="text-lg font-black text-white">
                {formatFromUSD(m.totalReinvested)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Entre proyectos</p>
            </div>

            {/* Por cobrar */}
            <div className="bg-slate-800/80 rounded-2xl p-3 border border-slate-700">
              <div className="flex items-center gap-1.5 text-rose-400 mb-1">
                <Landmark className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase">Por Cobrar</span>
              </div>
              <p className="text-lg font-black text-white">
                {formatFromUSD(m.porCobrarUSD)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {m.debtorsCount} cliente{m.debtorsCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* GANANCIA NETA DISPONIBLE (FUERA DEL GRID - ANCHO COMPLETO) */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 mt-2">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-black block tracking-wide">
                Ganancia Neta Disponible
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                (Ganancia bruta − reinversiones)
              </span>
            </div>
            <span
              className={`text-lg sm:text-xl font-black shrink-0 ${
                netCashInHand >= 0 ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {formatFromUSD(netCashInHand)}
            </span>
          </div>
        </div>

        {/* STOCK RÁPIDO */}
        <div className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-600 flex items-center gap-1.5">
            <Package className="w-4 h-4 text-indigo-500" /> Inventario actual
          </span>
          <span className="font-black text-slate-800">
            {totalStock} u · {totalProducts} productos
          </span>
        </div>

        {/* GRÁFICO INVERSIÓN VS VENDIDO */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-600" /> Inversión vs Vendido (USD)
            </h2>
            <span className="text-[10px] font-bold text-slate-400">Base USD</span>
          </div>

          {investmentChartData.length > 0 ? (
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={investmentChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value) => [`$${Number(value ?? 0).toFixed(2)} USD`, '']}
                    labelFormatter={(_, payload) =>
                      (payload?.[0]?.payload as { fullName?: string } | undefined)?.fullName || ''
                    }
                  />
                  <Bar dataKey="InvertidoUSD" name="Invertido" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="VendidoUSD" name="Vendido" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="GananciaUSD" name="Ganancia" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No hay datos de inversiones</p>
          )}
        </div>

        {/* FORMAS DE PAGO */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-indigo-600" /> Formas de Pago (USD)
          </h2>

          {paymentChartData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="h-36 w-36 relative flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
                      paddingAngle={4}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-2">
                {paymentChartData.map((p) => (
                  <div key={p.name} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.name}
                    </span>
                    <span className="font-black text-slate-900">${p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">
              Registra ventas para ver el desglose
            </p>
          )}
        </div>

        {/* TOP 5 PRODUCTOS */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" /> Top Productos Vendidos
          </h2>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-2xl"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-9 h-9 rounded-xl object-cover bg-slate-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {p.qty} unidades vendidas
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-blue-600">
                    ${p.revenueUSD.toFixed(2)}
                  </p>
                  <p className="text-[9px] font-extrabold text-emerald-600">
                    +${p.profitUSD.toFixed(2)} ganancia
                  </p>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                Aún no hay ventas para ranking
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};