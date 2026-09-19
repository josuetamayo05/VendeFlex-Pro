import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Award,
  Wallet,
  PieChart as PieIcon,
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

export const ReportsScreen: React.FC = () => {
  const { formatFromUSD } = useCurrency();
  const sales = useSalesStore((s) => s.sales);
  const products = useProductsStore((s) => s.products);
  const investments = useInvestmentsStore((s) => s.investments);

  const [period, setPeriod] = useState<'7d' | '30d' | 'todo'>('30d');

  // Total Ingresos y Ganancias Reales (SIEMPRE EN USD BASE)
  const totalRevenueUSD = sales.reduce((sum, s) => sum + s.totalUSD, 0);
  const totalProfitUSD = sales.reduce((sum, s) => sum + s.totalProfitUSD, 0);

  // 1. Datos para gráfico de Ventas por Formas de Pago
  const paymentDataMap: Record<string, number> = {};
  sales.forEach((s) => {
    paymentDataMap[s.paymentMethod] = (paymentDataMap[s.paymentMethod] || 0) + s.totalUSD;
  });

  const COLORS = ['#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#F43F5E'];
  const paymentChartData = Object.keys(paymentDataMap).map((method, idx) => ({
    name: method,
    value: Number(paymentDataMap[method].toFixed(2)),
    color: COLORS[idx % COLORS.length],
  }));

  // 2. Comparativa por Inversión (Base USD)
  const investmentChartData = investments.map((inv) => {
    let invRevenue = 0;
    let invProfit = 0;

    sales.forEach((s) => {
      s.items.forEach((item) => {
        if (item.investmentId === inv.id) {
          invRevenue += item.totalUSD;
          invProfit += item.profitUSD;
        }
      });
    });

    const investedUSD = inv.currency === 'USD' ? inv.totalInvestment : inv.totalInvestment / 320;

    return {
      name: inv.code,
      fullName: inv.name,
      InvertidoUSD: Number(investedUSD.toFixed(2)),
      VendidoUSD: Number(invRevenue.toFixed(2)),
      GananciaUSD: Number(invProfit.toFixed(2)),
    };
  });

  // 3. Top 5 Productos más Vendidos
  const productSalesMap: Record<string, { qty: number; revenueUSD: number; profitUSD: number; image: string }> = {};

  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesMap[item.productName]) {
        const prod = products.find((p) => p.id === item.productId);
        productSalesMap[item.productName] = {
          qty: 0,
          revenueUSD: 0,
          profitUSD: 0,
          image: prod?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
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

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Reportes & Analytics
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Moneda Base: USD ($) · Conversión dinámica disponible
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {(['7d', '30d', 'todo'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                  period === p ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                {p === '7d' ? '7 días' : p === '30d' ? '30 días' : 'Todo'}
              </button>
            ))}
          </div>
        </div>

        {/* METRICAS CLAVE EN USD */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Ganancia Neta</span>
            </div>
            <p className="text-xl font-black text-emerald-700">{formatFromUSD(totalProfitUSD)}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-blue-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Ingresos Totales</span>
            </div>
            <p className="text-xl font-black text-blue-700">{formatFromUSD(totalRevenueUSD)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* GRÁFICO COMPARATIVA DE INVERSIONES EN USD */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-600" /> Inversión vs Vendido (USD)
            </h2>
            <span className="text-[10px] font-bold text-slate-400">Base USD</span>
          </div>

          {investmentChartData.length > 0 ? (
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={investmentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: any) => [`$${value} USD`, '']}
                  />
                  <Bar dataKey="InvertidoUSD" name="Invertido USD" fill="#94A3B8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="VendidoUSD" name="Vendido USD" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="GananciaUSD" name="Ganancia USD" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No hay datos de inversiones</p>
          )}
        </div>

        {/* GRÁFICO VENTAS POR MÉTODO DE PAGO */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <PieIcon className="w-4 h-4 text-indigo-600" /> Formas de Pago Recibidas (USD)
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
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                    <span className="font-black text-slate-900">${p.value} USD</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">Registra ventas para ver el desglose</p>
          )}
        </div>

        {/* TOP 5 PRODUCTOS MÁS VENDIDOS */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs space-y-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" /> Top Productos Vendidos
          </h2>

          <div className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between gap-3 p-2 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover bg-slate-200 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{p.qty} unidades vendidas</p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black text-blue-600">${p.revenueUSD.toFixed(2)} USD</p>
                  <p className="text-[9px] font-extrabold text-emerald-600">+${p.profitUSD.toFixed(2)} USD ganancia</p>
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">Aún no hay ventas para ranking</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};