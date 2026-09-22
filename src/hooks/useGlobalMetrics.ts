// src/hooks/useGlobalMetrics.ts
import { useMemo } from 'react';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { getClientDebtUSD } from '@/types';

const toUSD = (amount: number, currency: 'USD' | 'CUP', rate: number) =>
  currency === 'CUP' ? amount / rate : amount;

export const useGlobalMetrics = () => {
  const products = useProductsStore((s) => s.products);
  const investments = useInvestmentsStore((s) => s.investments);
  const sales = useSalesStore((s) => s.sales);
  const clients = useClientsStore((s) => s.clients);

  const totalExpenses = useFinanceStore((s) => s.getTotalExpensesUSD());
  const totalReinvested = useFinanceStore((s) => s.getTotalReinvestedUSD());

  const exchangeRate = useAppStore((s) => s.exchangeRate);
  const activeInvestmentsCount = useInvestmentsStore((s) =>
    s.getActiveInvestmentsCount()
  );

  return useMemo(() => {
    // ── 1. INVERSIÓN ──────────────────────────────────────────
    const grossInvestmentUSD = investments.reduce((sum, inv) => {
      return sum + toUSD(inv.totalInvestment, inv.currency, exchangeRate);
    }, 0);

    // Lo que realmente salió de tu bolsillo (sin contar dinero reciclado)
    const netPocketInvestmentUSD = Math.max(0, grossInvestmentUSD - totalReinvested);

    // ── 2. VENTAS: separar cobrado vs fiado ───────────────────
    const collectedSales = sales.filter((s) => !s.isFiado);
    const fiadoSales = sales.filter((s) => s.isFiado);

    const totalRevenueCollected = collectedSales.reduce((s, x) => s + x.totalUSD, 0);
    const totalProfitCollected = collectedSales.reduce((s, x) => s + x.totalProfitUSD, 0);
    const totalRevenueFiado = fiadoSales.reduce((s, x) => s + x.totalUSD, 0);

    // ── 3. GANANCIA DE HOY ────────────────────────────────────
    const todayKey = new Date().toISOString().split('T')[0];
    const todaySales = collectedSales.filter((s) => s.date.startsWith(todayKey));
    const gananciaHoy = todaySales.reduce((s, x) => s + x.totalProfitUSD, 0);
    const ingresosHoy = todaySales.reduce((s, x) => s + x.totalUSD, 0);

    // ── 4. STOCK ──────────────────────────────────────────────
    const stockAtCostUSD = products.reduce((sum, p) => {
      return sum + toUSD(p.cost || 0, p.currency, exchangeRate) * (p.stock || 0);
    }, 0);

    const stockAtPriceUSD = products.reduce((sum, p) => {
      return sum + toUSD(p.price || 0, p.currency, exchangeRate) * (p.stock || 0);
    }, 0);

    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // ── 5. POR COBRAR (fiados de clientes) ────────────────────
    const totalDebtUSD = clients.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
    const debtorsCount = clients.filter((c) => getClientDebtUSD(c) > 0).length;

    // Fallback: si no usas client.debts pero sí sales.isFiado
    const porCobrarUSD = totalDebtUSD > 0 ? totalDebtUSD : totalRevenueFiado;

    // ── 6. GANANCIA LÍQUIDA LIBRE (efectivo real) ─────────────
    // Profit cobrado − gastos − lo que ya reinvertiste en otros lotes
    const liquidProfitUSD = Math.max(
      0,
      totalProfitCollected - totalExpenses - totalReinvested
    );

    // ── 7. SALDO TOTAL / PATRIMONIO ────────────────────────────
    // Efectivo libre + capital inmovilizado en stock + por cobrar
    const saldoTotalUSD = liquidProfitUSD + stockAtCostUSD + porCobrarUSD;

    // ── 8. ROI real (sobre lo que pusiste de tu bolsillo) ─────
    const roiPercent =
      netPocketInvestmentUSD > 0
        ? (totalProfitCollected / netPocketInvestmentUSD) * 100
        : 0;

    // Barra de progreso del ROI (cap 100 visual)
    const roiProgress = Math.min(100, Math.max(0, roiPercent));

    // ── 9. Recuperación de capital ────────────────────────────
    const recoveryPercent =
      netPocketInvestmentUSD > 0
        ? Math.min(100, (totalRevenueCollected / netPocketInvestmentUSD) * 100)
        : 0;

    return {
      // Totales protagonistas
      saldoTotalUSD,
      liquidProfitUSD,
      gananciaHoy,
      ingresosHoy,

      // Inversión
      grossInvestmentUSD,
      netPocketInvestmentUSD,
      activeInvestmentsCount,
      projectsCount: investments.length,

      // Ventas
      totalRevenueCollected,
      totalProfitCollected,
      totalRevenueFiado,

      // Stock
      stockAtCostUSD,
      stockAtPriceUSD,
      totalStockUnits,

      // Fiados
      porCobrarUSD,
      debtorsCount,

      // Bóveda
      totalExpenses,
      totalReinvested,

      // Ratios
      roiPercent,
      roiProgress,
      recoveryPercent,
    };
  }, [
    products,
    investments,
    sales,
    clients,
    totalExpenses,
    totalReinvested,
    exchangeRate,
    activeInvestmentsCount,
  ]);
};