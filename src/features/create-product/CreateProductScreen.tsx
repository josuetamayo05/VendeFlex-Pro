import React, { useState } from 'react';
import { ChevronLeft, Wallet } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { PurchaseTypeSelector } from './components/PurchaseTypeSelector';
import { ImportShippingCalculator } from './components/ImportShippingCalculator';
import { ImagePicker } from '@/components/ui/ImagePicker';
import { EXCHANGE_RATE } from '@/lib/constants';
import type { PurchaseType, ProductOrigin } from '@/types';

export const CreateProductScreen: React.FC = () => {
  const navigateTo = useAppStore((s) => s.navigateTo);
  const investments = useInvestmentsStore((s) => s.investments);
  const addProduct = useProductsStore((s) => s.addProduct);

  const [investmentId, setInvestmentId] = useState<number | ''>(
    investments[0]?.id ?? ''
  );
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('local');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Calzado/Ropa');
  const [cost, setCost] = useState(0);
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(1);
  const [weightLbs, setWeightLbs] = useState(0.5);
  const [shippingRate, setShippingRate] = useState(5.0);
  const [currency, setCurrency] = useState<'USD' | 'CUP'>('CUP');
  const [imageUrl, setImageUrl] = useState('');

  const shippingCostCUP =
    purchaseType === 'import' ? weightLbs * shippingRate * EXCHANGE_RATE : 0;
  const totalCost = cost + shippingCostCUP;
  const profit = price - totalCost;
  const marginPercent = totalCost > 0 ? Math.round((profit / totalCost) * 100) : 0;

  const originMap: Record<PurchaseType, ProductOrigin> = {
    local: 'Local',
    import: 'USA',
    encargo: 'Encargo',
  };

  const handleSave = () => {
    if (!productName.trim()) {
      alert('Ponle un nombre al producto');
      return;
    }
    if (!investmentId) {
      alert('Selecciona una inversión');
      return;
    }
    if (price <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    addProduct({
      investmentId: Number(investmentId),
      name: productName,
      category,
      origin: originMap[purchaseType],
      price,
      currency,
      stock,
      image:
        imageUrl ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80',
      cost,
      weightLbs: purchaseType === 'import' ? weightLbs : undefined,
    });

    alert(`✅ Producto "${productName}" agregado con éxito!`);
    navigateTo('inventario', 'inventario');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigateTo('inventario', 'inventario')}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Añadir Producto</h1>
      </div>

      <div className="p-5 space-y-4">
        {/* SELECTOR DE INVERSIÓN */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Wallet className="w-3 h-3" /> Inversión asociada
          </label>

          {investments.length === 0 ? (
            <div className="text-center py-4 space-y-2">
              <p className="text-xs font-bold text-slate-400">
                No hay inversiones creadas
              </p>
              <button
                onClick={() => navigateTo('create_investment')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Crear la primera inversión →
              </button>
            </div>
          ) : (
            <select
              value={investmentId}
              onChange={(e) => setInvestmentId(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            >
              {investments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.code} · {i.name} ({i.supplierName})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* TIPO DE COMPRA */}
        <PurchaseTypeSelector value={purchaseType} onChange={setPurchaseType} />

        {/* FOTO DEL PRODUCTO  ← AQUÍ ESTÁ LO NUEVO */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
          <label className="text-xs font-bold text-slate-500 mb-2 block">
            Imagen del Producto
          </label>
          <ImagePicker value={imageUrl} onChange={setImageUrl} />
        </div>

        {/* FORMULARIO */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Leggin negro talla M"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Calzado/Ropa">Calzado / Ropa</option>
                <option value="Cosméticos">Cosméticos</option>
                <option value="Electrónica">Electrónica</option>
                <option value="Otros">Otros</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">Stock inicial</label>
              <input
                type="number"
                value={stock || ''}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {purchaseType === 'import' && (
            <ImportShippingCalculator
              weightLbs={weightLbs}
              shippingRate={shippingRate}
              setWeightLbs={setWeightLbs}
              setShippingRate={setShippingRate}
            />
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Moneda de precios</label>
            <div className="grid grid-cols-2 gap-2">
              {(['CUP', 'USD'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`py-2 rounded-xl text-xs font-extrabold transition-all ${
                    currency === c
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Costo ({currency})
              </label>
              <input
                type="number"
                value={cost || ''}
                onChange={(e) => setCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">
                Precio venta ({currency})
              </label>
              <input
                type="number"
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Ganancia calculada */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">Ganancia Est.</span>
              <span className="text-sm font-black text-slate-900">
                ${profit.toLocaleString('es-CU')} {currency}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                marginPercent >= 30
                  ? 'bg-emerald-100 text-emerald-700'
                  : marginPercent > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {marginPercent}%
            </span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={investments.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all text-xs tracking-wide uppercase"
        >
          Guardar Producto
        </button>
      </div>
    </div>
  );
};