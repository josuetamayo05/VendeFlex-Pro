import React from 'react';
import { Store, Plane, Clock } from 'lucide-react';
import type { PurchaseType } from '@/types';

interface Props {
  value: PurchaseType;
  onChange: (v: PurchaseType) => void;
}

const OPTIONS = [
  { key: 'local' as PurchaseType, label: 'Compra Local', icon: Store },
  { key: 'import' as PurchaseType, label: 'Importación USA', icon: Plane },
  { key: 'encargo' as PurchaseType, label: 'Por Encargo', icon: Clock },
];

export const PurchaseTypeSelector: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-3 gap-1.5 bg-slate-200/60 p-1 rounded-2xl">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isActive = value === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`py-2 px-1 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 transition-all ${
              isActive 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Icon className="w-3 h-3" /> {opt.label}
          </button>
        );
      })}
    </div>
  );
};