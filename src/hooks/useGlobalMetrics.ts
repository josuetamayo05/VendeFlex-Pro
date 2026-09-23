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
    // 1. INVERSIÓN
    const grossInvestmentUSD = investments.reduce((sum, inv) => {
      return sum + toUSD(inv.totalInvestment, inv.currency, exchangeRate);
    }, 0);

    // Lo que realmente salió de tu bolsillo personal
    const netPocketInvestmentUSD = Math.max(0, grossInvestmentUSD - totalReinvested);

    // 2. VENTAS (Cobrado vs Fiado)
    const collectedSales = sales.filter((s) => !s.isFiado);
    const fiadoSales = sales.filter((s) => s.isFiado);

    const totalRevenueCollected = collectedSales.reduce((s, x) => s + x.totalUSD, 0);
    const totalProfitCollected = collectedSales.reduce((s, x) => s + x.totalProfitUSD, 0);
    const totalRevenueFiado = fiadoSales.reduce((s, x) => s + x.totalUSD, 0);

    // 3. GANANCIA DE HOY (fecha LOCAL del usuario, no UTC)
    const isSameLocalDay = (isoDate: string): boolean => {
      const d = new Date(isoDate);
      const now = new Date();
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    };

    const todaySales = collectedSales.filter((s) => isSameLocalDay(s.date));
    const gananciaHoy = todaySales.reduce((s, x) => s + x.totalProfitUSD, 0);
    const ingresosHoy = todaySales.reduce((s, x) => s + x.totalUSD, 0);

    // 4. STOCK
    const stockAtCostUSD = products.reduce((sum, p) => {
      return sum + toUSD(p.cost || 0, p.currency, exchangeRate) * (p.stock || 0);
    }, 0);

    const stockAtPriceUSD = products.reduce((sum, p) => {
      return sum + toUSD(p.price || 0, p.currency, exchangeRate) * (p.stock || 0);
    }, 0);

    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // 5. POR COBRAR
    const totalDebtUSD = clients.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
    const debtorsCount = clients.filter((c) => getClientDebtUSD(c) > 0).length;
    const porCobrarUSD = totalDebtUSD > 0 ? totalDebtUSD : totalRevenueFiado;

    // 6. 💵 EFECTIVO ACTUAL EN CAJA
    const efectivoEnCajaUSD = totalRevenueCollected - netPocketInvestmentUSD - totalExpenses;

    // 7. 🟢 GANANCIA LÍQUIDA LIBRE (Efectivo ganado después de restar costos y gastos)
    const liquidProfitUSD = Math.max(
      0,
      totalProfitCollected - totalExpenses - totalReinvested
    );

    // 8. 🏦 PATRIMONIO TOTAL (Efectivo + Valor del Stock a costo + Lo que te deben)
    const patrimonioTotalUSD = efectivoEnCajaUSD + stockAtCostUSD + porCobrarUSD;

    // 9. ROI REAL
    const roiPercent =
      netPocketInvestmentUSD > 0
        ? (totalProfitCollected / netPocketInvestmentUSD) * 100
        : 0;

    const recoveryPercent =
      netPocketInvestmentUSD > 0
        ? Math.min(100, (totalRevenueCollected / netPocketInvestmentUSD) * 100)
        : 0;

    return {
      efectivoEnCajaUSD,
      patrimonioTotalUSD,
      liquidProfitUSD, // 👈 AHORA SÍ EXPUESTO CORRECTAMENTE

      gananciaHoy,
      ingresosHoy,

      grossInvestmentUSD,
      netPocketInvestmentUSD,
      activeInvestmentsCount,
      projectsCount: investments.length,

      totalRevenueCollected,
      totalProfitCollected,
      totalRevenueFiado,

      stockAtCostUSD,
      stockAtPriceUSD,
      totalStockUnits,

      porCobrarUSD,
      debtorsCount,

      totalExpenses,
      totalReinvested,

      roiPercent,
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