// src/hooks/useInvestmentMetrics.ts
import { useMemo } from 'react';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { EXCHANGE_RATE } from '@/lib/constants';
import { getLiveItemProfitUSD } from '@/lib/shippingProration';

export interface DetailedInvestmentMetrics {
  productsCount: number;
  totalStock: number;
  soldCount: number;
  revenueUSD: number;
  profitUSD: number;
  roiPercent: number;
  recoveryPercent: number;
  pendingRevenueUSD: number;

  totalUnits: number;
  productsCost: number;
  shippingCost: number;
  shippingCostPerUnit: number;
  totalInvestmentUSD: number;
  
  expectedRevenueUSD: number;
  expectedProfitUSD: number;
  
  pctInventorySold: number;
  cashRecoveryBalance: number;
  pendingProfitInStock: number;
  projectedTotalProfit: number;
  projectedTotalRevenue: number;

  outOfStockCount: number;
  lowStockCount: number;
  availableCount: number;

  reinvestedInOthers: number;
  netAvailableProfit: number;
}

const toUSD = (price: number, currency?: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

export const useInvestmentMetrics = (investmentId: number): DetailedInvestmentMetrics => {
  const products = useProductsStore((s) => s.products);
  const investment = useInvestmentsStore((s) => s.getInvestmentById(investmentId));
  const investments = useInvestmentsStore((s) => s.investments);
  const sales = useSalesStore((s) => s.sales);

  return useMemo(() => {
    const invProducts = products.filter((p) => p && p.investmentId === investmentId);
    const productIds = new Set(invProducts.map((p) => p.id));
    const productsCount = invProducts.length;

    const totalInvestmentUSD = investment
      ? investment.currency === 'USD'
        ? investment.totalInvestment
        : investment.totalInvestment / EXCHANGE_RATE
      : 0;

    // 1. CÁLCULO ULTRA-PRECISO DE UNIDADES INICIALES (A prueba de campos faltantes)
    const totalUnits = invProducts.reduce((sum, p) => {
      // Si tiene initialQuantity explícito, lo usamos
      if (p.initialQuantity !== undefined && p.initialQuantity !== null && p.initialQuantity > 0) {
        return sum + p.initialQuantity;
      }
      
      // Si falta initialQuantity, calculamos: Stock Actual + Vendidos de este producto
      const soldQtyForProduct = sales.reduce((sSum, sale) => {
        const item = sale.items?.find((i) => i.productId === p.id);
        return sSum + (item?.quantity || 0);
      }, 0);

      return sum + (p.stock || 0) + soldQtyForProduct;
    }, 0);

    const totalStock = invProducts.reduce((sum, p) => sum + (p.stock ?? 0), 0);
    const shippingCost = investment?.shippingCost ?? 0;
    const shippingCostPerUnit = totalUnits > 0 ? shippingCost / totalUnits : 0;

    // 2. Proyecciones Iniciales
    const expectedRevenueUSD = invProducts.reduce((sum, p) => {
      const soldQtyForProduct = sales.reduce((sSum, sale) => {
        const item = sale.items?.find((i) => i.productId === p.id);
        return sSum + (item?.quantity || 0);
      }, 0);
      const initQty = p.initialQuantity ?? ((p.stock || 0) + soldQtyForProduct);
      return sum + toUSD(p.price, p.currency) * initQty;
    }, 0);

    const expectedProfitUSD = expectedRevenueUSD - totalInvestmentUSD;
    const roiPercent = totalInvestmentUSD > 0 ? (expectedProfitUSD / totalInvestmentUSD) * 100 : 0;

    // 3. Ventas Reales (Cálculo en vivo)
    let revenueUSD = 0;
    let profitUSD = 0;
    let soldCount = 0;

    sales.forEach((sale) => {
      sale.items?.forEach((item) => {
        if (item.investmentId === investmentId || productIds.has(item.productId)) {
          revenueUSD += item.totalUSD || 0;
          profitUSD += getLiveItemProfitUSD(item);
          soldCount += item.quantity || 0;
        }
      });
    });

    // 4. Balances y Porcentajes
    const pctInventorySold = totalUnits > 0 ? (soldCount / totalUnits) * 100 : 0;
    const recoveryPercent = totalInvestmentUSD > 0 ? (revenueUSD / totalInvestmentUSD) * 100 : 0;
    const cashRecoveryBalance = revenueUSD - totalInvestmentUSD;

    const pendingRevenueUSD = invProducts.reduce(
      (sum, p) => sum + toUSD(p.price, p.currency) * p.stock,
      0
    );

    const pendingProfitInStock = invProducts.reduce((sum, p) => {
      const unitCost = toUSD(p.cost || 0, p.currency) + shippingCostPerUnit;
      const unitProfit = toUSD(p.price, p.currency) - unitCost;
      return sum + ((p.stock || 0) * unitProfit);
    }, 0);

    const projectedTotalProfit = profitUSD + pendingProfitInStock;
    const projectedTotalRevenue = revenueUSD + pendingRevenueUSD;

    // 5. Alertas de inventario
    const outOfStockCount = invProducts.filter((p) => p.stock === 0).length;
    const lowStockCount = invProducts.filter((p) => p.stock > 0 && p.stock <= 2).length;
    const availableCount = invProducts.filter((p) => p.stock > 2).length;

    // 6. Dinero re-invertido
    const childInvestments = investments.filter(
      (other) => (other as { fundedFromInvestmentId?: number | null }).fundedFromInvestmentId === investmentId
    );
    const reinvestedInOthers = childInvestments.reduce((sum, child) => sum + (child.totalInvestment || 0), 0);
    const netAvailableProfit = profitUSD - reinvestedInOthers;

    return {
      productsCount,
      totalStock,
      soldCount,
      revenueUSD,
      profitUSD,
      roiPercent,
      recoveryPercent,
      pendingRevenueUSD,

      totalUnits,
      productsCost: investment?.productsCost || 0,
      shippingCost,
      shippingCostPerUnit,
      totalInvestmentUSD,
      expectedRevenueUSD,
      expectedProfitUSD,
      pctInventorySold,
      cashRecoveryBalance,
      pendingProfitInStock,
      projectedTotalProfit,
      projectedTotalRevenue,
      outOfStockCount,
      lowStockCount,
      availableCount,
      reinvestedInOthers,
      netAvailableProfit,
    };
  }, [products, investment, investmentId, investments, sales]);
};