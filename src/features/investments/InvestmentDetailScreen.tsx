// src/features/investments/InvestmentDetailScreen.tsx
import React, { useState} from 'react';
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
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useAppStore } from '@/store/useAppStore';
import { useInvestmentMetrics } from '@/hooks/useInvestmentMetrics';
import { useCurrency } from '@/hooks/useCurrency';
import { ProductCard } from '@/features/inventory/components/ProductCard';
import type { InvestmentStatus } from '@/types';

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

const STATUS_OPTIONS: { key: InvestmentStatus; label: string }[] = [
  { key: 'planning', label: 'Planificando' },
  { key: 'in_transit', label: 'En tránsito' },
  { key: 'active', label: 'Activa' },
  { key: 'closed', label: 'Cerrada' },
];

export const InvestmentDetailScreen: React.FC = () => {
  const selectedId = useInvestmentsStore((s) => s.selectedInvestmentId);
  const getInvestmentById = useInvestmentsStore((s) => s.getInvestmentById);
  const updateInvestment = useInvestmentsStore((s) => s.updateInvestment);
  const deleteInvestment = useInvestmentsStore((s) => s.deleteInvestment);
  const investments = useInvestmentsStore((s) => s.investments);
  const getProductsByInvestment = useProductsStore((s) => s.getProductsByInvestment);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const { formatFromUSD } = useCurrency();

  const investment = selectedId ? getInvestmentById(selectedId) : null;
  const metrics = useInvestmentMetrics(selectedId ?? 0);

  // ═══ MODAL EDITAR ═══
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [productsCost, setProductsCost] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxes, setTaxes] = useState(0);
  const [weightLbs, setWeightLbs] = useState(0);
  const [shippingRate, setShippingRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  // Reinversión (solo editar lo que ya existe; no rompe tu flujo)
  const [fundingSource, setFundingSource] = useState<'pocket' | 'reinvested'>('pocket');
  const [fundedFromId, setFundedFromId] = useState<number | null>(null);
  // Cómo editar el envío: factura directa (recomendado) o lbs × tarifa
  const [shippingMode, setShippingMode] = useState<'invoice' | 'lbs'>('invoice');

  const handleOpenEdit = () => {
    if (!investment) return;
    const invAny = investment as {
      fundingSource?: string;
      fundedFromInvestmentId?: number | null;
    };
    setName(investment.name || '');
    setSupplier(investment.supplierName || '');
    setStatus(String(investment.status || 'active'));
    setProductsCost(Number(investment.productsCost) || 0);
    setShippingCost(Number(investment.shippingCost) || 0);
    setTaxes(Number(investment.taxes) || 0);
    setWeightLbs(Number(investment.weightLbs) || 0);
    setShippingRate(Number(investment.shippingRatePerLb) || 0);
    setNotes(investment.notes || '');
    setArrivalDate(investment.arrivalDate || '');
    setFundingSource(
      invAny.fundingSource === 'reinvested' || invAny.fundedFromInvestmentId
        ? 'reinvested'
        : 'pocket'
    );
    setFundedFromId(invAny.fundedFromInvestmentId ?? null);
    setShippingMode('invoice');
    setShowEdit(true);
  };

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

  const invAny = investment as {
    fundingSource?: string;
    fundedFromInvestmentId?: number | null;
  };
  const isReinvested =
    invAny.fundingSource === 'reinvested' || !!invAny.fundedFromInvestmentId;

  const otherInvestments = investments.filter((i) => i.id !== investment.id);

  const handleDelete = () => {
    if (
      confirm(
        `¿Eliminar la inversión "${investment.name}"? Esto NO borrará los productos asociados.`
      )
    ) {
      deleteInvestment(investment.id);
      navigateTo('investments');
    }
  };

  const handleSaveEdit = () => {
    if (!name.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    const finalShipping =
      shippingMode === 'lbs'
        ? Number((weightLbs * shippingRate).toFixed(2))
        : Number(shippingCost) || 0;

    updateInvestment(investment.id, {
      name: name.trim(),
      supplierName: supplier.trim() || undefined,
      status,
      productsCost: Number(productsCost) || 0,
      shippingCost: finalShipping,
      taxes: Number(taxes) || 0,
      weightLbs: weightLbs > 0 ? weightLbs : undefined,
      shippingRatePerLb: shippingRate > 0 ? shippingRate : undefined,
      notes: notes.trim() || undefined,
      arrivalDate: arrivalDate || undefined,
      // Reinversión editable sin romper tu lógica
      fundingSource: fundingSource,
      fundedFromInvestmentId:
        fundingSource === 'reinvested' ? fundedFromId : null,
    } as Partial<typeof investment>);

    setShowEdit(false);
    // Las métricas se recalculan solas (envío/unidad, ganancias, ROI…)
  };

  const editTotal =
    (Number(productsCost) || 0) +
    (shippingMode === 'lbs'
      ? weightLbs * shippingRate
      : Number(shippingCost) || 0) +
    (Number(taxes) || 0);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-12">
      {/* HEADER */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigateTo('investments')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: `${investment.color || '#3B82F6'}20`,
                color: investment.color || '#3B82F6',
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-slate-900 truncate">
                  {investment.name}
                </h1>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    isReinvested
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {isReinvested ? (
                    <Repeat className="w-2.5 h-2.5" />
                  ) : (
                    <ShieldCheck className="w-2.5 h-2.5" />
                  )}
                  {isReinvested ? 'Financiado' : 'Bolsillo'}
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-400">
                {investment.code} · {typeLabels[investment.type] || investment.type}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* BOTÓN EDITAR */}
          <button
            onClick={handleOpenEdit}
            className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors"
            title="Editar inversión"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* COSTOS REALES (resumen rápido — lo que más editas) */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Costos del lote
            </p>
            <button
              onClick={handleOpenEdit}
              className="text-[10px] font-bold text-blue-600 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" /> Editar factura / costos
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Compra</span>
              <span className="font-black text-slate-800">
                {formatFromUSD(
                  investment.currency === 'USD'
                    ? investment.productsCost
                    : investment.productsCost / 320
                )}
              </span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
              <span className="text-amber-700 block text-[10px] font-medium">
                Factura envío
              </span>
              <span className="font-black text-amber-800">
                {formatFromUSD(
                  investment.currency === 'USD'
                    ? investment.shippingCost
                    : investment.shippingCost / 320
                )}
              </span>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
              <span className="text-blue-600 block text-[10px]">Total</span>
              <span className="font-black text-blue-800">
                {formatFromUSD(metrics.totalInvestmentUSD)}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Envío / unidad (auto):{' '}
            <strong className="text-slate-700">
              ${metrics.shippingCostPerUnit.toFixed(4)}
            </strong>{' '}
            · {metrics.totalUnits} u
          </p>
        </div>

        {/* BLOQUE 1: RESUMEN GENERAL */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-500" /> Compra & Proyección Sugerida
            </span>
            <span className="text-sm font-black text-slate-900">
              {formatFromUSD(metrics.totalInvestmentUSD)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">(Inversión)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Total Unidades</span>
              <span className="font-bold text-slate-800">{metrics.totalUnits} pcs</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Envío / Unidad</span>
              <span className="font-bold text-slate-800">
                ${metrics.shippingCostPerUnit.toFixed(2)}
              </span>
            </div>
            <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
              <span className="text-blue-600 block text-[10px] font-medium">
                Ingreso Sugerido
              </span>
              <span className="font-black text-blue-700">
                {formatFromUSD(metrics.expectedRevenueUSD)}
              </span>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 block text-[10px] font-medium">
                Ganancia Esperada
              </span>
              <span className="font-black text-emerald-700">
                {formatFromUSD(metrics.expectedProfitUSD)}{' '}
                <span className="text-[9px] font-normal">
                  ({metrics.roiPercent.toFixed(0)}% ROI)
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: VENTAS REALES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Rendimiento Real de Ventas
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Ingreso Real</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {metrics.recoveryPercent.toFixed(1)}% Recup.
                </span>
              </div>
              <span className="text-xl font-black text-slate-800 block">
                {formatFromUSD(metrics.revenueUSD)}
              </span>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, metrics.recoveryPercent)}%` }}
                />
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-1">
              <span className="text-xs font-bold text-emerald-700 block">
                Ganancia Real Acumulada
              </span>
              <span className="text-xl font-black text-emerald-800 block">
                {formatFromUSD(metrics.profitUSD)}
              </span>
              <p className="text-[10px] text-emerald-600 font-medium">
                Recuperación limpia:{' '}
                <strong>{formatFromUSD(metrics.cashRecoveryBalance)}</strong>
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Unidades Vendidas</span>
                <span className="font-bold text-slate-700">
                  {metrics.pctInventorySold.toFixed(0)}% del total
                </span>
              </div>
              <div className="text-xl font-black text-slate-800">
                {metrics.soldCount}{' '}
                <span className="text-xs font-normal text-slate-400">
                  / {metrics.totalUnits} pcs
                </span>
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

        {/* BLOQUE 3: PROYECCIÓN */}
        <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">
              Ganancia Pendiente en Stock
            </span>
            <span className="text-sm font-bold text-amber-400">
              {formatFromUSD(metrics.pendingProfitInStock)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">
              Ingreso Restante por Vender
            </span>
            <span className="text-sm font-bold text-slate-200">
              {formatFromUSD(metrics.pendingRevenueUSD)}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
            <span className="text-slate-400 block text-[10px]">
              Ganancia Total Proyectada
            </span>
            <span className="text-sm font-black text-emerald-400">
              {formatFromUSD(metrics.projectedTotalProfit)}
            </span>
          </div>
        </div>

        {metrics.reinvestedInOthers > 0 && (
          <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-100 rounded-xl text-purple-700 font-bold">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-purple-900 block">
                  Financió otros lotes
                </span>
                <span className="text-purple-600 text-[10px]">
                  Se usaron {formatFromUSD(metrics.reinvestedInOthers)} de esta ganancia
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-purple-500 uppercase font-bold block">
                Ganancia Líquida Libre
              </span>
              <span className="text-sm font-black text-purple-900">
                {formatFromUSD(metrics.netAvailableProfit)}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs bg-white p-3 rounded-2xl border border-slate-200/80">
          <span className="font-bold text-slate-600 flex items-center gap-1.5 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Estado del Inventario:
          </span>
          <div className="flex gap-1.5 text-[10px] font-bold">
            <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-md">
              {metrics.outOfStockCount} Agotados
            </span>
            <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md">
              {metrics.lowStockCount} Poco Stock
            </span>
            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md">
              {metrics.availableCount} Disponibles
            </span>
          </div>
        </div>

        {/* DETALLES */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Detalles de la Importación
          </p>
          <div className="grid grid-cols-2 gap-y-2 text-[11px]">
            <span className="text-slate-500 font-medium">Proveedor</span>
            <span className="text-slate-800 font-bold text-right">
              {investment.supplierName || 'N/A'}
            </span>
            <span className="text-slate-500 font-medium">Estado</span>
            <span className="text-slate-800 font-bold text-right">{investment.status}</span>
            <span className="text-slate-500 font-medium">Fecha compra</span>
            <span className="text-slate-800 font-bold text-right">
              {investment.createdAt}
            </span>
            {investment.arrivalDate && (
              <>
                <span className="text-slate-500 font-medium">Llegada</span>
                <span className="text-slate-800 font-bold text-right">
                  {investment.arrivalDate}
                </span>
              </>
            )}
            {investment.weightLbs ? (
              <>
                <span className="text-slate-500 font-medium">Peso Total</span>
                <span className="text-slate-800 font-bold text-right">
                  {investment.weightLbs} lbs
                </span>
              </>
            ) : null}
            {isReinvested && invAny.fundedFromInvestmentId ? (
              <>
                <span className="text-slate-500 font-medium">Financiado desde</span>
                <span className="text-purple-700 font-bold text-right">
                  {getInvestmentById(invAny.fundedFromInvestmentId)?.code ||
                    `#${invAny.fundedFromInvestmentId}`}
                </span>
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

        {/* PRODUCTOS */}
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

      {/* ═══ MODAL EDITAR INVERSIÓN ═══ */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowEdit(false)}
          />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92dvh] overflow-y-auto"
            style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          >
            {/* Header modal */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between z-10">
              <div>
                <h2 className="text-base font-black text-slate-900">Editar inversión</h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  {investment.code} · Los productos NO se borran
                </p>
              </div>
              <button
                onClick={() => setShowEdit(false)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Datos básicos */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    Nombre
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    Proveedor
                  </label>
                  <input
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    Estado
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setStatus(s.key)}
                        className={`py-2 rounded-xl text-[10px] font-extrabold transition-all ${
                          status === s.key
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* COSTOS — lo importante */}
              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 space-y-3">
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-wide">
                  Costos · Factura agencia
                </p>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                    Costo productos ({investment.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productsCost || ''}
                    onChange={(e) => setProductsCost(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold"
                  />
                </div>

                {/* Modo de envío */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1.5 block">
                    Cómo registrar el envío
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setShippingMode('invoice')}
                      className={`py-2 rounded-xl text-[10px] font-extrabold ${
                        shippingMode === 'invoice'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Factura total (exacta)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMode('lbs')}
                      className={`py-2 rounded-xl text-[10px] font-extrabold ${
                        shippingMode === 'lbs'
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Peso × $/lb (aprox)
                    </button>
                  </div>

                  {shippingMode === 'invoice' ? (
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                        Factura agencia / envío ({investment.currency})
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={shippingCost || ''}
                        onChange={(e) => setShippingCost(Number(e.target.value))}
                        placeholder="Ej: 113.05"
                        className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm font-black text-amber-900"
                      />
                      <p className="text-[9px] text-slate-400 mt-1">
                        Pon aquí el monto real cuando te llegue el cheque/factura. Se reparte
                        solo entre las {metrics.totalUnits || '—'} unidades del lote.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                          Peso (lbs)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={weightLbs || ''}
                          onChange={(e) => setWeightLbs(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                          $/lb
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={shippingRate || ''}
                          onChange={(e) => setShippingRate(Number(e.target.value))}
                          className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold"
                        />
                      </div>
                      <div className="col-span-2 text-[10px] font-bold text-amber-800">
                        Envío calculado: ${(weightLbs * shippingRate).toFixed(2)}{' '}
                        {investment.currency}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                    Impuestos / aranceles ({investment.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={taxes || ''}
                    onChange={(e) => setTaxes(Number(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold"
                  />
                </div>

                <div className="bg-white rounded-xl p-3 flex justify-between items-center border border-amber-200">
                  <span className="text-xs font-bold text-slate-600">Total inversión</span>
                  <span className="text-lg font-black text-slate-900">
                    ${editTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                    {investment.currency}
                  </span>
                </div>
              </div>

              {/* Financiamiento / reinversión */}
              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 space-y-2">
                <p className="text-[10px] font-black text-purple-800 uppercase">
                  Origen del capital
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setFundingSource('pocket');
                      setFundedFromId(null);
                    }}
                    className={`py-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 ${
                      fundingSource === 'pocket'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3 h-3" /> Bolsillo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundingSource('reinvested')}
                    className={`py-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 ${
                      fundingSource === 'reinvested'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Repeat className="w-3 h-3" /> Reinversión
                  </button>
                </div>
                {fundingSource === 'reinvested' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                      Financiado desde
                    </label>
                    <select
                      value={fundedFromId ?? ''}
                      onChange={(e) =>
                        setFundedFromId(e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full bg-white border border-purple-200 rounded-xl p-3 text-xs font-bold"
                    >
                      <option value="">— Seleccionar inversión —</option>
                      {otherInvestments.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.code} · {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Extra */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    Fecha llegada
                  </label>
                  <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">
                    Notas
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="py-3.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="py-3.5 bg-blue-600 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  <Save className="w-4 h-4" /> Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};