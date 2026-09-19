import React, { useState } from 'react';
import { ChevronLeft, Plane, Store, Clock, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import type { InvestmentType } from '@/types';

const types: { key: InvestmentType; label: string; icon: React.ElementType; color: string }[] = [
  { key: 'import_usa', label: 'Importación USA', icon: Plane, color: '#3B82F6' },
  { key: 'local', label: 'Compra Local', icon: Store, color: '#F59E0B' },
  { key: 'encargo', label: 'Por Encargo', icon: Clock, color: '#8B5CF6' },
  { key: 'mixta', label: 'Mixta', icon: Package, color: '#10B981' },
];

export const CreateInvestmentScreen: React.FC = () => {
  const navigateTo = useAppStore((s) => s.navigateTo);
  const addInvestment = useInvestmentsStore((s) => s.addInvestment);
  const setSelectedInvestment = useInvestmentsStore((s) => s.setSelectedInvestment);

  const [type, setType] = useState<InvestmentType>('import_usa');
  const [name, setName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [productsCost, setProductsCost] = useState(0);
  const [weightLbs, setWeightLbs] = useState(0);
  const [shippingRate, setShippingRate] = useState(5);
  const [taxes, setTaxes] = useState(0);
  const [currency, setCurrency] = useState<'USD' | 'CUP'>('USD');
  const [notes, setNotes] = useState('');

  const shippingCost = type === 'import_usa' ? weightLbs * shippingRate : 0;
  const total = productsCost + shippingCost + taxes;

  const selectedType = types.find((t) => t.key === type)!;

  const handleSave = () => {
    if (!name.trim() || !supplier.trim()) {
      alert('Ponle nombre y proveedor a la inversión');
      return;
    }

    const id = addInvestment({
      name,
      supplierName: supplier,
      type,
      status: type === 'import_usa' ? 'in_transit' : 'active',
      createdAt: new Date().toISOString().split('T')[0],
      productsCost,
      weightLbs: type === 'import_usa' ? weightLbs : undefined,
      shippingRatePerLb: type === 'import_usa' ? shippingRate : undefined,
      shippingCost,
      taxes,
      currency,
      notes: notes || undefined,
      color: selectedType.color,
    });

    setSelectedInvestment(id);
    navigateTo('investment_detail');
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigateTo('investments')}
          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Nueva Inversión</h1>
      </div>

      <div className="p-5 space-y-4">
        {/* Tipo */}
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">
            Tipo de inversión
          </label>
          <div className="grid grid-cols-2 gap-2">
            {types.map((t) => {
              const Icon = t.icon;
              const active = type === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center gap-2 transition-all ${
                    active
                      ? 'text-white shadow-md border-transparent'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                  style={active ? { backgroundColor: t.color } : {}}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Datos básicos */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre</label>
            <input
              type="text"
              placeholder="Ej: Ropa Gym Marzo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Proveedor</label>
            <input
              type="text"
              placeholder="Ej: SHEIN, TEMU, Habana"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">Moneda</label>
            <div className="grid grid-cols-2 gap-2">
              {(['USD', 'CUP'] as const).map((c) => (
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
        </div>

        {/* Costos */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Costos</p>

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">
              Costo productos ({currency})
            </label>
            <input
              type="number"
              value={productsCost || ''}
              onChange={(e) => setProductsCost(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {type === 'import_usa' && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">Peso (lbs)</label>
                <input
                  type="number"
                  value={weightLbs || ''}
                  onChange={(e) => setWeightLbs(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 mb-1 block">$/lb</label>
                <input
                  type="number"
                  value={shippingRate || ''}
                  onChange={(e) => setShippingRate(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold"
                />
              </div>
              <div className="col-span-2 text-[10px] font-bold text-blue-700">
                Envío total: ${shippingCost.toFixed(2)} USD
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 mb-1 block">
              Impuestos/Aranceles ({currency})
            </label>
            <input
              type="number"
              value={taxes || ''}
              onChange={(e) => setTaxes(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Total */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex justify-between items-center">
            <span className="text-xs font-bold text-blue-700">Total inversión</span>
            <span className="text-lg font-black text-blue-900">
              ${total.toLocaleString()} {currency}
            </span>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="text-xs font-bold text-slate-500 mb-1 block">Notas (opcional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all text-xs tracking-wide uppercase"
        >
          Crear Inversión
        </button>
      </div>
    </div>
  );
};