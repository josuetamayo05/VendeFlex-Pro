// src/hooks/useGlobalMetrics.ts
import { useMemo } from 'react';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { useAppStore } from '@/store/useAppStore';
import { getClientDebtUSD } from '@/types';
import { getLiveSaleProfitUSD } from '@/lib/shippingProration';

const toUSD = (amount: number, currency: 'USD' | 'CUP', rate: number) =>
  currency === 'CUP' ? amount / rate : amount;

export const useGlobalMetrics = () => {
  const products = useProductsStore((s) => s.products);
  const investments = useInvestmentsStore((s) => s.investments);
  const sales = useSalesStore((s) => s.sales);
  const clients = useClientsStore((s) => s.clients);

  const financeTransactions = useFinanceStore((s) => s.transactions);
  const totalExpenses = useFinanceStore((s) => s.getTotalExpensesUSD());

  const exchangeRate = useAppStore((s) => s.exchangeRate);
  const activeInvestmentsCount = useInvestmentsStore((s) =>
    s.getActiveInvestmentsCount()
  );

  return useMemo(() => {
    // ── 1. REINVERSIONES UNIFICADAS (Inversiones financiadas + Bóveda) ──
    const reinvestedFromInvestments = investments.reduce((sum, inv) => {
      const invAny = inv as { fundingSource?: string; fundedFromInvestmentId?: number | null };
      if (invAny.fundingSource === 'reinvested' || invAny.fundedFromInvestmentId) {
        return sum + toUSD(inv.totalInvestment, inv.currency, exchangeRate);
      }
      return sum;
    }, 0);

    // Reinversiones registradas directo en Bóveda (evitando duplicar si ya están vinculadas a un id de inversión)
    const reinvestedFromFinance = financeTransactions
      .filter((t) => t.type === 'reinvestment')
      .reduce((sum, t) => {
        const targetInv = investments.find((i) => i.id === t.toInvestmentId);
        const targetInvAny = targetInv as { fundingSource?: string; fundedFromInvestmentId?: number | null } | undefined;
        if (targetInvAny && (targetInvAny.fundingSource === 'reinvested' || targetInvAny.fundedFromInvestmentId)) {
          return sum; // Ya contabilizada arriba
        }
        return sum + t.amountUSD;
      }, 0);

    const totalReinvested = reinvestedFromInvestments + reinvestedFromFinance;

    // ── 2. INVERSIÓN BRUTA Y DE BOLSILLO ──────────────────
    const grossInvestmentUSD = investments.reduce((sum, inv) => {
      return sum + toUSD(inv.totalInvestment, inv.currency, exchangeRate);
    }, 0);

    // Lo que realmente salió de tu bolsillo personal
    const netPocketInvestmentUSD = Math.max(0, grossInvestmentUSD - totalReinvested);

    // ── 3. VENTAS (Cobrado vs Fiado) ──────────────────────
    const collectedSales = sales.filter((s) => !s.isFiado);
    const fiadoSales = sales.filter((s) => s.isFiado);

    const totalRevenueCollected = collectedSales.reduce((s, x) => s + x.totalUSD, 0);
    const totalProfitCollected = collectedSales.reduce(
      (s, x) => s + getLiveSaleProfitUSD(x),
      0
    );
    const totalRevenueFiado = fiadoSales.reduce((s, x) => s + x.totalUSD, 0);

    // ── 4. GANANCIA DE HOY (Fecha local) ─────────────────
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
    const gananciaHoy = todaySales.reduce((s, x) => s + getLiveSaleProfitUSD(x), 0);
    const ingresosHoy = todaySales.reduce((s, x) => s + x.totalUSD, 0);

    // ── 5. STOCK ──────────────────────────────────────────
    const stockAtCostUSD = products.reduce((sum, p) => {
      return sum + toUSD(p.cost || 0, p.currency, exchangeRate) * (p.stock || 0);
    }, 0);

    const stockAtPriceUSD = products.reduce((sum, p) => {
      return sum + toUSD(p.price || 0, p.currency, exchangeRate) * (p.stock || 0);
    }, 0);

    const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);

    // ── 6. POR COBRAR ─────────────────────────────────────
    const totalDebtUSD = clients.reduce((sum, c) => sum + getClientDebtUSD(c), 0);
    const debtorsCount = clients.filter((c) => getClientDebtUSD(c) > 0).length;
    const porCobrarUSD = totalDebtUSD > 0 ? totalDebtUSD : totalRevenueFiado;

    // ── 7. 💵 EFECTIVO ACTUAL EN CAJA (ALGORITMO REAL) ────
    // Dinero que cobraste en efectivo − Gastos de bóveda − Dinero sacado para financiar otros lotes
    const efectivoEnCajaUSD = totalRevenueCollected - totalExpenses - totalReinvested;

    // ── 8. GANANCIA LÍQUIDA LIBRE ─────────────────────────
    const liquidProfitUSD = Math.max(
      0,
      totalProfitCollected - totalExpenses - totalReinvested
    );

    // ── 9. PATRIMONIO TOTAL ──────────────────────────────
    const patrimonioTotalUSD = efectivoEnCajaUSD + stockAtCostUSD + porCobrarUSD;

    // ── 10. RATIOS ────────────────────────────────────────
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
      liquidProfitUSD,

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
    financeTransactions,
    totalExpenses,
    exchangeRate,
    activeInvestmentsCount,
  ]);
};