import React from 'react';
import { Plus, ShoppingBag, Landmark } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const QuickActions: React.FC = () => {
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <div className="grid grid-cols-3 gap-2 pt-2">
      <button
        onClick={() => navigateTo('pos', 'inicio')}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[10px] font-bold text-center leading-tight">Nueva Venta</span>
      </button>

      <button
        onClick={() => navigateTo('crear_producto')}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] font-bold text-center leading-tight">Comprar Stock</span>
      </button>

      <button
        onClick={() => navigateTo('finance')}
        className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
      >
        <Landmark className="w-5 h-5" />
        <span className="text-[10px] font-bold text-center leading-tight">Bóveda</span>
      </button>
    </div>
  );
};