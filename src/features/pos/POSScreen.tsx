import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useCartStore } from '@/store/useCartStore';
import { ProductGrid } from './components/ProductGrid';
import { Cart } from './components/Cart';
import { PaymentSelector } from './components/PaymentSelector';
import { CheckoutSummary } from './components/CheckoutSummary';

export const POSScreen: React.FC = () => {
  const navigateTo = useAppStore((s) => s.navigateTo);
  const itemCount = useCartStore((s) => s.getItemCount());

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden pb-24 md:pb-0">
      {/* HEADER */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('dashboard', 'inicio')}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all md:hidden"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-lg font-black text-slate-900">Nueva Venta</h1>
            <p className="text-[10px] text-slate-400 font-medium">
              {itemCount > 0 ? `${itemCount} en carrito` : 'Selecciona productos'}
            </p>
          </div>
        </div>
      </div>

      {/* LAYOUT: móvil = stack, desktop = 2 columnas */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Izquierda: Grid de productos */}
        <div className="flex-1 p-4 overflow-hidden flex flex-col md:border-r md:border-slate-100">
          <ProductGrid />
        </div>

        {/* Derecha: Carrito + Pago + Checkout */}
        <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 border-slate-100 flex flex-col p-4 gap-3 overflow-y-auto max-h-[45vh] md:max-h-none">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wide">
            Carrito
          </h2>

          <Cart />

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Forma de pago</p>
              <PaymentSelector />
            </div>

            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
};