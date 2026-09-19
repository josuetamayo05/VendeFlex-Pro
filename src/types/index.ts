// Tipos de vistas/pantallas
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
  | 'finance'; // ← AÑADIDO AQUÍ

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
  origin: ProductOrigin;
  price: number;
  currency: 'USD' | 'CUP';
  stock: number;           // Stock disponible actual (Columna P)
  image: string;
  cost?: number;
  weightLbs?: number;
}

// Tabs inferiores
export type BottomTab = 'inicio' | 'inventario' | 'clientes' | 'reportes';

export type PaymentMethod = 'Efectivo USD' | 'Efectivo CUP' | 'MLC' | 'Zelle' | 'Fiado';

export interface CartItem {
  productId: number;
  name: string;
  image: string;
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
  investmentId?: number; // ← Cambia a opcional con ?
  amountUSD: number;
  amountCUP: number;
  concept: string;
  date: string;
  invoiceNumber?: string;
}

export interface Client {
  id: number;
  investmentId?: number; // ← NUEVO: inversión principal asociada
  name: string;
  phone?: string;
  avatar?: string;
  tags: string[];
  debts: ClientDebt[];
  totalSpentUSD: number;
  lastPurchase?: string;
  notes?: string;
}

// Helper
export const getClientDebtUSD = (client: Client): number =>
  client.debts.reduce((sum, d) => sum + d.amountUSD, 0);

export const getClientStatus = (client: Client): ClientStatus => {
  const debt = getClientDebtUSD(client);
  if (debt <= 0) return 'al_dia';
  if (debt >= 50) return 'moroso'; // umbral arbitrario
  return 'debe';
};

// ===== INVERSIONES / PEDIDOS =====
export type InvestmentType = 'import_usa' | 'local' | 'encargo' | 'mixta';

export type InvestmentStatus = 'planning' | 'in_transit' | 'active' | 'closed';

export interface Investment {
  id: number;
  code: string;              // P001, P002, etc
  name: string;              // "Ropa Gym Marzo 2025"
  type: InvestmentType;
  status: InvestmentStatus;
  createdAt: string;
  arrivalDate?: string;
  supplierName: string;      // SHEIN, TEMU, Mercado Habana, etc

  // Costos
  productsCost: number;      // Costo de los productos (USD)
  weightLbs?: number;        // Solo para import
  shippingRatePerLb?: number;// Costo por libra (USD)
  shippingCost: number;      // Envío total (USD)
  taxes: number;             // Impuestos/aranceles (USD)
  totalInvestment: number;   // Total invertido (USD)

  // Metadata
  currency: 'USD' | 'CUP';
  notes?: string;
  color?: string;            // Para identificar visualmente
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