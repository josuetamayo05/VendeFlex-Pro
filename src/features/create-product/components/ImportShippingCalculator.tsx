import React from 'react';
import { Plane } from 'lucide-react';
import { EXCHANGE_RATE } from '@/lib/constants';

interface Props {
  weightLbs: number;
  shippingRate: number;
  setWeightLbs: (v: number) => void;
  setShippingRate: (v: number) => void;
}

export const ImportShippingCalculator: React.FC<Props> = ({
  weightLbs, shippingRate, setWeightLbs, setShippingRate
}) => {
  const shippingCostUSD = weightLbs * shippingRate;
  const shippingCostCUP = shippingCostUSD * EXCHANGE_RATE;

  return (
    <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
      <p className="text-[11px] font-extrabold text-blue-700 flex items-center gap-1">
        <Plane className="w-3.5 h-3.5" /> Cálculo de Envío por Agencia
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 mb-1 block">Peso (lbs)</label>
          <input 
            type="number" 
            value={weightLbs}
            onChange={(e) => setWeightLbs(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 mb-1 block">Tarifa ($/lb)</label>
          <input 
            type="number" 
            value={shippingRate}
            onChange={(e) => setShippingRate(Number(e.target.value))}
            className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
          />
        </div>
      </div>

      <p className="text-[10px] font-bold text-slate-500">
        Envío estimado: <span className="text-blue-700">${shippingCostUSD} USD</span> (${shippingCostCUP.toLocaleString()} CUP)
      </p>
    </div>
  );
};