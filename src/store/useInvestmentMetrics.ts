import { useMemo } from 'react';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { EXCHANGE_RATE } from '@/lib/constants';

export interface InvestmentMetrics {
  productsCount: number;
  totalStock: number;
  soldCount: number;         // items vendidos (stock inicial - actual)
  revenueUSD: number;        // ingreso generado
  profitUSD: number;         // ganancia real
  roiPercent: number;
  recoveryPercent: number;   // % de la inversión recuperada
  pendingRevenueUSD: number; // dinero atrapado en stock
}

const toUSD = (price: number, currency: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const useInvestmentMetrics = (investmentId: number): InvestmentMetrics => {
  const products = useProductsStore((s) => s.products);
  const investment = useInvestmentsStore((s) => s.getInvestmentById(investmentId));

  return useMemo(() => {
    const invProducts = products.filter((p) => p.investmentId === investmentId);

    const totalStock = invProducts.reduce((sum, p) => sum + p.stock, 0);
    const productsCount = invProducts.length;

    // Dinero atrapado en stock disponible (precio de venta)
    const pendingRevenueUSD = invProducts.reduce(
      (sum, p) => sum + toUSD(p.price, p.currency) * p.stock,
      0
    );

    // Aquí en el futuro conectaremos con las ventas reales para calcular:
    // - soldCount (unidades vendidas)
    // - revenueUSD (ingreso real)
    // - profitUSD (ganancia real)
    // Por ahora usamos estimaciones basadas en costo vs precio de venta

    const totalRevenuePotential = invProducts.reduce(
      (sum, p) => sum + toUSD(p.price, p.currency) * p.stock,
      0
    );

    const investmentUSD = investment
      ? investment.currency === 'USD'
        ? investment.totalInvestment
        : investment.totalInvestment / EXCHANGE_RATE
      : 0;

    // Ganancia proyectada = ingreso potencial - inversión
    const profitUSD = totalRevenuePotential - investmentUSD;
    const roiPercent = investmentUSD > 0 ? (profitUSD / investmentUSD) * 100 : 0;

    // Recovery: por ahora 0 hasta conectar ventas reales
    const soldCount = 0;
    const revenueUSD = 0;
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
  }, [products, investment, investmentId]);
};