import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '@/types';
import { useCartStore } from '@/store/useCartStore';

interface Props {
  item: CartItemType;
}

export const CartItemRow: React.FC<Props> = ({ item }) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);


  return (
    <div className="flex items-center gap-2.5 py-2 border-b border-slate-50 last:border-0">
      <img
        src={item.image}
        alt={item.name}
        className="w-10 h-10 rounded-xl object-cover bg-slate-100 flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-800 truncate">{item.name}</p>
        <p className="text-[10px] font-black text-blue-600">
          {item.currency === 'CUP'
            ? `$${item.unitPrice.toLocaleString('es-CU')} CUP`
            : `$${item.unitPrice} USD`}
          {' × '}{item.quantity}
        </p>
      </div>

      {/* Controles cantidad */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
        >
          <Minus className="w-3 h-3 text-slate-600" />
        </button>
        <span className="text-xs font-black text-slate-800 w-5 text-center">
          {item.quantity}
        </span>
        <button
          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.stock}
          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors disabled:opacity-40"
        >
          <Plus className="w-3 h-3 text-slate-600" />
        </button>
      </div>

      <button
        onClick={() => removeItem(item.productId)}
        className="w-6 h-6 rounded-lg hover:bg-rose-50 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};