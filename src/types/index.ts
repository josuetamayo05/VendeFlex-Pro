// src/types/index.ts

export type View =
  | 'dashboard'
  | 'crear_producto'
  | 'inventario'
  | 'pos'
  | 'clientes'
  | 'investments'
  | 'investment_detail'
  | 'create_investment'
  | 'settings'
  | 'finance'
  | 'reports';

// Tipos de moneda soportados
export type Currency = 'USD' | 'CUP' | 'MLC';

// Tipos de modelo de negocio
export type PurchaseType = 'local' | 'import' | 'encargo';

// Origen del producto
export type ProductOrigin = 'Local' | 'USA' | 'Encargo';

// Categorías
export type Category = 'Todas' | 'Calzado/Ropa' | 'Cosméticos' | 'Electrónica';

// Interfaz de Producto
export interface ProductItem {
  id: number;
  investmentId: number;
  name: string;
  category: string;
  origin?: string;
  price: number;
  currency: 'USD' | 'CUP';
  stock: number;
  initialQuantity?: number;
  cost: number;
  image?: string;
  weightLbs?: number; // 👈 CORRIGE EL ERROR DE CreateProductScreen
}

// Alias de conveniencia
export type Product = ProductItem;

// Tabs inferiores
export type BottomTab = 'inicio' | 'inventario' | 'reportes' | 'clientes' | 'config' | 'inversiones';

export type PaymentMethod = 'Efectivo USD' | 'Efectivo CUP' | 'MLC' | 'Zelle' | 'Fiado';

export interface CartItem {
  productId: number;
  name: string;
  image?: string; // 👈 CORRIGE EL ERROR DE useCartStore (AHORA ACEPTA UNDEFINED)
  unitPrice: number;
  currency: 'USD' | 'CUP';
  quantity: number;
  stock: number;
}

export interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number;
  clientName: string;
  clientPhone: string;
}

// ===== CLIENTES / FIADOS =====
export type ClientStatus = 'al_dia' | 'debe' | 'moroso';

export interface ClientDebt {
  id: number;
  investmentId?: number;
  amountUSD: number;
  amountCUP: number;
  concept: string;
  date: string;
  invoiceNumber?: string;
}

export interface Client {
  id: number;
  investmentId?: number;
  name: string;
  phone?: string;
  avatar?: string;
  tags: string[];
  debts: ClientDebt[];
  totalSpentUSD: number;
  lastPurchase?: string;
  notes?: string;
}

// Helpers
export const getClientDebtUSD = (client: Client): number =>
  client.debts.reduce((sum, d) => sum + d.amountUSD, 0);

export const getClientStatus = (client: Client): ClientStatus => {
  const debt = getClientDebtUSD(client);
  if (debt <= 0) return 'al_dia';
  if (debt >= 50) return 'moroso';
  return 'debe';
};

// ===== INVERSIONES / PEDIDOS =====
export type InvestmentType = 'import_usa' | 'local' | 'encargo' | 'mixta';

export type InvestmentStatus = 'planning' | 'in_transit' | 'active' | 'closed';

export interface Investment {
  id: number;
  code: string;
  name: string;
  supplierName?: string;
  type: InvestmentType | string;
  status: InvestmentStatus | string;
  createdAt: string;
  arrivalDate?: string;
  productsCost: number;
  weightLbs?: number;
  shippingRatePerLb?: number;
  shippingCost: number;
  taxes: number;
  totalInvestment: number;
  currency: 'USD' | 'CUP';
  color?: string;
  notes?: string;

  // 🔹 CAMPOS PARA SEGUIMIENTO DE FINANCIAMIENTO:
  fundingSource?: 'pocket' | 'reinvested';
  fundedFromInvestmentId?: number | null;
}

// ===== VENTAS =====
export interface SaleItemDetail {
  productId: number;
  productName: string;
  investmentId: number;
  quantity: number;
  unitPriceUSD: number;
  unitCostUSD: number;
  totalUSD: number;
  profitUSD: number;
}

export interface Sale {
  id: number;
  date: string;
  items: SaleItemDetail[];
  totalUSD: number;
  totalProfitUSD: number;
  paymentMethod: PaymentMethod;
  clientName?: string;
  clientPhone?: string;
  isFiado: boolean;
}