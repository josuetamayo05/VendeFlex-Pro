import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { CartItemRow } from './CartItem';

export const Cart: React.FC = () => {
  const items = useCartStore((s) => s.items);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-8">
        <ShoppingCart className="w-10 h-10 mb-2 text-slate-300" />
        <p className="text-xs font-bold">Carrito vacío</p>
        <p className="text-[10px] text-slate-400 mt-1">Toca un producto para agregarlo</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {items.map((item) => (
        <CartItemRow key={item.productId} item={item} />
      ))}
    </div>
  );
};