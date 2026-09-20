// src/features/investments/InvestmentDetailScreen.tsx
import React from 'react';
import {
  ChevronLeft,
  Plane,
  Store,
  Clock,
  Package,
  TrendingUp,
  Boxes,
  Trash2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Repeat,
} from 'lucide-react';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useAppStore } from '@/store/useAppStore';
import { useInvestmentMetrics } from '@/hooks/useInvestmentMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { ProductCard } from '@/features/inventory/components/ProductCard';

const typeIcons: Record<string, React.ElementType> = {
  import_usa: Plane,
  local: Store,
  encargo: Clock,
  mixta: Package,
};

const typeLabels: Record<string, string> = {
  import_usa: 'Importación USA',
  local: 'Compra Local',
  encargo: 'Por Encargo',
  mixta: 'Mixta',
};

export const InvestmentDetailScreen: React.FC = () => {
  const selectedId = useInvestmentsStore((s) => s.selectedInvestmentId);
  const getInvestmentById = useInvestmentsStore((s) => s.getInvestmentById);
  const deleteInvestment = useInvestmentsStore((s) => s.deleteInvestment);
  const getProductsByInvestment = useProductsStore((s) => s.getProductsByInvestment);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const { formatFromUSD } = useCurrency();

  const investment = selectedId ? getInvestmentById(selectedId) : null;
  const metrics = useInvestmentMetrics(selectedId ?? 0);

  if (!investment) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-sm font-bold text-slate-400">Inversión no encontrada</p>
          <button
            onClick={() => navigateTo('investments')}
            className="text-xs text-blue-600 font-bold hover:underline mt-2"
          >
            ← Volver a inversiones
          </button>
        </div>
      </div>
    );
  }

  const Icon = typeIcons[investment.type] || Package;
  const products = getProductsByInvestment(investment.id);

  const handleDelete = () => {
    if (confirm(`¿Eliminar la inversión "${investment.name}"? Esto NO borrará los productos asociados.`)) {
      deleteInvestment(investment.id);
      navigateTo('investments');
    }
  };

  // 🔹 Lectura defensiva sin errores de TypeScript:
  const invAny = investment as { fundingSource?: string; fundedFromInvestmentId?: number | null };
  const isReinvested = invAny.fundingSource === 'reinvested' || !!invAny.fundedFromInvestmentId;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-12">
      {/* HEADER */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('investments')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${investment.color || '#3B82F6'}20`, color: investment.color || '#3B82F6' }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900">{investment.name}</h1>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                  isReinvested ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {isReinvested ? <Repeat className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
                  {isReinvested ? 'Financiado' : 'Bolsillo'}
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                {investment.code} · {typeLabels[investment.type] || investment.type}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* BLOQUE 1: RESUMEN GENERAL & FICHA DE COMPRA (EXCEL) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-500" /> Compra & Proyección Sugerida
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatFromUSD(metrics.totalInvestmentUSD)} <span className="text-[10px] text-slate-400 font-normal">(Inversión)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Total Unidades</span>
              <span className="font-bold text-slate-800">{metrics.totalUnits} pcs</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Envío / Unidad</span>
              <span className="font-bold text-slate-800">${metrics.shippingCostPerUnit.toFixed(2)}</span>
            </div>
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
              <span className="text-blue-600 block text-[10px] font-medium">Ingreso Sugerido</span>
              <span className="font-black text-blue-700">{formatFromUSD(metrics.expectedRevenueUSD)}</span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 block text-[10px] font-medium">Ganancia Esperada</span>
              <span className="font-black text-emerald-700">
                {formatFromUSD(metrics.expectedProfitUSD)} <span className="text-[9px] font-normal">({metrics.roiPercent.toFixed(0)}% ROI)</span>
              </span>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: ESTADÍSTICAS DE VENTAS REALES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Rendimiento Real de Ventas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ingreso Generado */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Ingreso Real</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {metrics.recoveryPercent.toFixed(1)}% Recup.
                </span>
              </div>
              <span className="text-xl font-black text-slate-800 block">{formatFromUSD(metrics.revenueUSD)}</span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.recoveryPercent)}%` }}
                />
              </div>
            </div>

            {/* Ganancia Real Acumulada */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-700 block">Ganancia Real Acumulada</span>
              <span className="text-xl font-black text-emerald-800 block">{formatFromUSD(metrics.profitUSD)}</span>
              <p className="text-[10px] text-emerald-600 font-medium">
                Recuperación limpia: <strong>{formatFromUSD(metrics.cashRecoveryBalance)}</strong>
              </p>
            </div>

            {/* Unidades Vendidas */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Unidades Vendidas</span>
                <span className="font-bold text-slate-700">{metrics.pctInventorySold.toFixed(0)}% del total</span>
              </div>
              <div className="text-xl font-black text-slate-800">
                {metrics.soldCount} <span className="text-xs font-normal text-slate-400">/ {metrics.totalUnits} pcs</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.pctInventorySold}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* BLOQUE 3: PROYECCIÓN EN STOCK Y REINVERSIÓN */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">Ganancia Pendiente en Stock</span>
            <span className="text-sm font-bold text-amber-400">{formatFromUSD(metrics.pendingProfitInStock)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Ingreso Restante por Vender</span>
            <span className="text-sm font-bold text-slate-200">{formatFromUSD(metrics.pendingRevenueUSD)}</span>
          </div>
          <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-slate-400 block text-[10px]">Ganancia Total Proyectada</span>
            <span className="text-sm font-black text-emerald-400">{formatFromUSD(metrics.projectedTotalProfit)}</span>
          </div>
        </div>

        {/* REINVERSIÓN EN OTROS LOTES (SI APLICA) */}
        {metrics.reinvestedInOthers > 0 && (
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-700 font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-purple-900 block">Financió otros lotes (Taladros / Pacas)</span>
                <span className="text-purple-600 text-[10px]">Se usaron {formatFromUSD(metrics.reinvestedInOthers)} de esta ganancia</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-purple-500 uppercase font-bold block">Ganancia Líquida Libre</span>
              <span className="text-sm font-black text-purple-900">{formatFromUSD(metrics.netAvailableProfit)}</span>
            </div>
          </div>
        )}

        {/* ALERTAS DE STOCK DE ESTA INVERSIÓN */}
        <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200/80">
          <span className="font-bold text-slate-600 flex items-center gap-1.5 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Estado del Inventario:
          </span>
          <div className="flex gap-1.5 text-[10px] font-bold">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md">{metrics.outOfStockCount} Agotados</span>
            <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md">{metrics.lowStockCount} Poco Stock</span>
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">{metrics.availableCount} Disponibles</span>
          </div>
        </div>

        {/* DETALLES DEL PEDIDO / NOTAS */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detalles de la Importación</p>
          <div className="grid grid-cols-2 gap-y-2 text-[11px]">
            <span className="text-slate-500 font-medium">Proveedor</span>
            <span className="text-slate-800 font-bold text-right">{investment.supplierName || 'N/A'}</span>

            <span className="text-slate-500 font-medium">Fecha compra</span>
            <span className="text-slate-800 font-bold text-right">{investment.createdAt}</span>

            {investment.arrivalDate && (
              <>
                <span className="text-slate-500 font-medium">Llegada</span>
                <span className="text-slate-800 font-bold text-right">{investment.arrivalDate}</span>
              </>
            )}

            {investment.weightLbs ? (
              <>
                <span className="text-slate-500 font-medium">Peso Total</span>
                <span className="text-slate-800 font-bold text-right">{investment.weightLbs} lbs</span>
              </>
            ) : null}
          </div>

          {investment.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Notas</p>
              <p className="text-[11px] text-slate-600 font-medium">{investment.notes}</p>
            </div>
          )}
        </div>

        {/* LISTADO DE PRODUCTOS */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
              Productos de este lote ({products.length})
            </p>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
              <Boxes className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-400">
                Aún no hay productos asociados a esta inversión
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};