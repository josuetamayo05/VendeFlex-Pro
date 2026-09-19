import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import type { PaymentMethod } from '@/types';

const METHODS: { key: PaymentMethod; label: string; color: string }[] = [
  { key: 'Efectivo USD', label: 'USD', color: 'bg-emerald-500' },
  { key: 'Efectivo CUP', label: 'CUP', color: 'bg-blue-500' },
  { key: 'MLC', label: 'MLC', color: 'bg-indigo-500' },
  { key: 'Zelle', label: 'Zelle', color: 'bg-purple-500' },
  { key: 'Fiado', label: 'Fiado', color: 'bg-rose-500' },
];

export const PaymentSelector: React.FC = () => {
  const paymentMethod = useCartStore((s) => s.paymentMethod);
  const setPaymentMethod = useCartStore((s) => s.setPaymentMethod);

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {METHODS.map((m) => {
        const isActive = paymentMethod === m.key;
        return (
          <button
            key={m.key}
            onClick={() => setPaymentMethod(m.key)}
            className={`py-2 rounded-xl text-[10px] font-extrabold transition-all border ${
              isActive
                ? `${m.color} text-white border-transparent shadow-md`
                : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
};