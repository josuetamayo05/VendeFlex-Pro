import React, { useState, useMemo } from 'react';
import { Search, Package } from 'lucide-react';
import { useProductsStore } from '@/store/useProductsStore';
import { useCartStore } from '@/store/useCartStore';

export const ProductGrid: React.FC = () => {
  const products = useProductsStore((s) => s.products);
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.stock > 0 &&
          p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Buscador */}
      <div className="relative mb-3">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-100 pl-9 pr-3 py-2.5 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto flex-1 content-start">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => addItem(p)}
            className="bg-white border border-slate-100 rounded-2xl p-2 flex flex-col items-center gap-1.5 hover:border-blue-300 hover:shadow-md active:scale-95 transition-all group"
          >
            <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[9px] font-bold text-slate-700 text-center leading-tight line-clamp-2 w-full">
              {p.name}
            </span>
            <span className="text-[10px] font-black text-blue-600">
              {p.currency === 'CUP'
                ? `$${(p.price / 1000).toFixed(1)}k`
                : `$${p.price}`}
            </span>
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">Sin productos disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};