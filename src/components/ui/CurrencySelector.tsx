import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Currency } from '@/types';
import { Edit2 } from 'lucide-react';

const CURRENCIES: Currency[] = ['USD', 'CUP', 'MLC'];

export const CurrencySelector: React.FC = () => {
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const exchangeRate = useAppStore((s) => s.exchangeRate);
  const setExchangeRate = useAppStore((s) => s.setExchangeRate);

  const handleEditRate = () => {
    const newRate = prompt('Ingresa la tasa del USD en CUP hoy:', exchangeRate.toString());
    if (newRate && !isNaN(Number(newRate))) {
      setExchangeRate(Number(newRate));
    }
  };

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        {CURRENCIES.map((curr) => (
          <button
            key={curr}
            onClick={() => setCurrency(curr)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              currency === curr
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {curr}
          </button>
        ))}
      </div>

      <button
        onClick={handleEditRate}
        className="flex items-center gap-1.5 text-xs font-extrabold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200/60 active:scale-95 transition-all"
        title="Tocar para cambiar tasa del día"
      >
        <span>$1 = {exchangeRate} CUP</span>
        <Edit2 className="w-3 h-3 text-blue-500" />
      </button>
    </div>
  );
};