// src/lib/shippingProration.ts
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { EXCHANGE_RATE } from '@/lib/constants';
import type { ProductItem, Sale } from '@/types';

const toUSD = (amount: number, currency?: string) => {
  const num = Number(amount) || 0;
  const rate = Number(EXCHANGE_RATE) || 320;
  return currency === 'CUP' ? num / rate : num;
};

/** Unidades totales del lote (incluye productos con initialQuantity faltante) */
export const getInvestmentTotalUnits = (investmentId: number): number => {
  try {
    const productsState = useProductsStore.getState();
    const salesState = useSalesStore.getState();

    if (!productsState || !Array.isArray(productsState.products)) return 0;
    const sales: Sale[] = salesState?.sales || [];

    const products = productsState.products.filter(
      (p) => p && p.investmentId === investmentId
    );

    return products.reduce((sum, p) => {
      if (p.initialQuantity !== undefined && p.initialQuantity !== null && p.initialQuantity > 0) {
        return sum + p.initialQuantity;
      }
      const soldQty = sales.reduce((sSum: number, sale: Sale) => {
        const item = sale.items?.find((i) => i.productId === p.id);
        return sSum + (item?.quantity || 0);
      }, 0);

      return sum + (p.stock || 0) + soldQty;
    }, 0);
  } catch {
    return 0;
  }
};

/** Costo de envío por unidad en USD */
export const getShippingPerUnitUSD = (investmentId: number): number => {
  try {
    const invState = useInvestmentsStore.getState();
    if (!invState || typeof invState.getInvestmentById !== 'function') return 0;

    const inv = invState.getInvestmentById(investmentId);
    if (!inv || !inv.shippingCost) return 0;

    const totalUnits = getInvestmentTotalUnits(investmentId);
    if (totalUnits <= 0) return 0;

    const shippingUSD = toUSD(inv.shippingCost, inv.currency);
    return shippingUSD / totalUnits;
  } catch {
    return 0;
  }
};

/** Costo REAL unitario en vivo (base + envío) */
export const getLiveUnitCostUSD = (product: ProductItem | undefined): number => {
  if (!product) return 0;
  try {
    const baseCostUSD = toUSD(product.cost || 0, product.currency);
    if (!product.investmentId) return baseCostUSD;

    return baseCostUSD + getShippingPerUnitUSD(product.investmentId);
  } catch {
    return Number(product.cost) || 0;
  }
};

/** Ganancia de una línea de venta en vivo */
export const getLiveItemProfitUSD = (item: {
  productId: number;
  unitPriceUSD: number;
  quantity: number;
  unitCostUSD?: number;
}): number => {
  if (!item) return 0;
  try {
    const productsState = useProductsStore.getState();
    const products = productsState?.products || [];
    const product = products.find((p) => p && p.id === item.productId);

    const unitCost = product
      ? getLiveUnitCostUSD(product)
      : (Number(item.unitCostUSD) || 0);

    const unitPrice = Number(item.unitPriceUSD) || 0;
    const qty = Number(item.quantity) || 0;

    return (unitPrice - unitCost) * qty;
  } catch {
    return 0;
  }
};

/** Ganancia de una venta completa en vivo */
export const getLiveSaleProfitUSD = (sale: {
  items?: Array<{
    productId: number;
    unitPriceUSD: number;
    quantity: number;
    unitCostUSD?: number;
  }>;
}): number => {
  if (!sale || !Array.isArray(sale.items)) return 0;
  try {
    return sale.items.reduce((sum, item) => sum + getLiveItemProfitUSD(item), 0);
  } catch {
    return 0;
  }
};