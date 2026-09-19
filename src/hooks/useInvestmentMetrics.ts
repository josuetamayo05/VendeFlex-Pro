import { useMemo } from 'react';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { EXCHANGE_RATE } from '@/lib/constants';

export interface InvestmentMetrics {
  productsCount: number;
  totalStock: number;
  soldCount: number;
  revenueUSD: number;
  profitUSD: number;
  roiPercent: number;
  recoveryPercent: number;
  pendingRevenueUSD: number;
}

const toUSD = (price: number, currency: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const useInvestmentMetrics = (investmentId: number): InvestmentMetrics => {
  const products = useProductsStore((s) => s.products);
  const investment = useInvestmentsStore((s) => s.getInvestmentById(investmentId));
  const sales = useSalesStore((s) => s.sales);

  return useMemo(() => {
    const invProducts = products.filter((p) => p.investmentId === investmentId);
    const productsCount = invProducts.length;
    const totalStock = invProducts.reduce((sum, p) => sum + p.stock, 0);

    // Stock potencial en $ (lo que puedes ganar si vendes todo)
    const pendingRevenueUSD = invProducts.reduce(
      (sum, p) => sum + toUSD(p.price, p.currency) * p.stock,
      0
    );

    // Datos REALES desde las ventas
    let revenueUSD = 0;
    let profitUSD = 0;
    let soldCount = 0;

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (item.investmentId === investmentId) {
          revenueUSD += item.totalUSD;
          profitUSD += item.profitUSD;
          soldCount += item.quantity;
        }
      });
    });

    const investmentUSD = investment
      ? investment.currency === 'USD'
        ? investment.totalInvestment
        : investment.totalInvestment / EXCHANGE_RATE
      : 0;

    const roiPercent = investmentUSD > 0 ? (profitUSD / investmentUSD) * 100 : 0;
    const recoveryPercent = investmentUSD > 0 ? (revenueUSD / investmentUSD) * 100 : 0;

    return {
      productsCount,
      totalStock,
      soldCount,
      revenueUSD,
      profitUSD,
      roiPercent,
      recoveryPercent,
      pendingRevenueUSD,
    };
  }, [products, investment, investmentId, sales]);
};