import React from 'react';
import { useAppStore } from '@/store/useAppStore';
import { EXCHANGE_RATE } from '@/lib/constants';
import type { Currency } from '@/types';

const CURRENCIES: Currency[] = ['USD', 'CUP', 'MLC'];

export const CurrencySelector: React.FC = () => {
  const { currency, setCurrency } = useAppStore();

  return (
    <div className="flex justify-between items-center">
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
      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
        $1 = {EXCHANGE_RATE} CUP
      </span>
    </div>
  );
};