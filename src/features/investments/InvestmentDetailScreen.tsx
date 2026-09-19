import React from 'react';
import { ChevronLeft, Plane, Store, Clock, Package, TrendingUp, DollarSign, Boxes, Trash2 } from 'lucide-react';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useAppStore } from '@/store/useAppStore';
import { useInvestmentMetrics } from '@/hooks/useInvestmentMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { ProductCard } from '@/features/inventory/components/ProductCard';

const typeIcons = { import_usa: Plane, local: Store, encargo: Clock, mixta: Package };
const typeLabels = { import_usa: 'Importación USA', local: 'Compra Local', encargo: 'Por Encargo', mixta: 'Mixta' };

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

  const Icon = typeIcons[investment.type];
  const products = getProductsByInvestment(investment.id);

  const investedUSD =
    investment.currency === 'USD'
      ? investment.totalInvestment
      : investment.totalInvestment / 320;

  const handleDelete = () => {
    if (confirm(`¿Eliminar la inversión "${investment.name}"? Esto NO borrará los productos asociados.`)) {
      deleteInvestment(investment.id);
      navigateTo('investments');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-24 md:pb-6">
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
              style={{ backgroundColor: `${investment.color}20`, color: investment.color }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900">{investment.name}</h1>
              <p className="text-[10px] font-medium text-slate-400">
                {investment.code} · {typeLabels[investment.type]}
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

      {/* KPIs de esta inversión */}
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-blue-600" />
              <p className="text-[9px] font-bold text-slate-400 uppercase">Inversión</p>
            </div>
            <p className="text-base font-black text-slate-900">{formatFromUSD(investedUSD)}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Prod: ${investment.productsCost} + Envío: ${investment.shippingCost} + Tax: ${investment.taxes}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <p className="text-[9px] font-bold text-slate-400 uppercase">Ingreso potencial</p>
            </div>
            <p className="text-base font-black text-emerald-600">
              {formatFromUSD(metrics.pendingRevenueUSD)}
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Si vendes todo el stock
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <Boxes className="w-3 h-3 text-indigo-600" />
              <p className="text-[9px] font-bold text-slate-400 uppercase">Productos</p>
            </div>
            <p className="text-base font-black text-slate-900">{metrics.productsCount}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {metrics.totalStock} unidades en stock
            </p>
          </div>

          <div className="bg-white rounded-2xl p-3 border border-slate-100">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-purple-600" />
              <p className="text-[9px] font-bold text-slate-400 uppercase">ROI est.</p>
            </div>
            <p
              className={`text-base font-black ${
                metrics.roiPercent >= 30 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {metrics.roiPercent.toFixed(0)}%
            </p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Ganancia proyectada
            </p>
          </div>
        </div>

        {/* Detalles del pedido */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Detalles</p>
          <div className="grid grid-cols-2 gap-y-2 text-[11px]">
            <span className="text-slate-500 font-medium">Proveedor</span>
            <span className="text-slate-800 font-bold text-right">{investment.supplierName}</span>

            <span className="text-slate-500 font-medium">Fecha compra</span>
            <span className="text-slate-800 font-bold text-right">{investment.createdAt}</span>

            {investment.arrivalDate && (
              <>
                <span className="text-slate-500 font-medium">Llegada</span>
                <span className="text-slate-800 font-bold text-right">{investment.arrivalDate}</span>
              </>
            )}

            {investment.weightLbs && (
              <>
                <span className="text-slate-500 font-medium">Peso</span>
                <span className="text-slate-800 font-bold text-right">{investment.weightLbs} lbs</span>
              </>
            )}

            {investment.shippingRatePerLb && (
              <>
                <span className="text-slate-500 font-medium">Tarifa envío</span>
                <span className="text-slate-800 font-bold text-right">
                  ${investment.shippingRatePerLb}/lb
                </span>
              </>
            )}
          </div>

          {investment.notes && (
            <div className="pt-2 border-t border-slate-50">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notas</p>
              <p className="text-[11px] text-slate-600 font-medium">{investment.notes}</p>
            </div>
          )}
        </div>

        {/* Productos de esta inversión */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-black text-slate-700 uppercase tracking-wide">
              Productos ({products.length})
            </p>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-200 text-center">
              <Package className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-400">
                Aún no hay productos en esta inversión
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