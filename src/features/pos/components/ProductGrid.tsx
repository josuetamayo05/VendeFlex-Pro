import React, { useState, useMemo } from 'react';
import { Search, Package, Plus, Minus } from 'lucide-react';
import { useProductsStore } from '@/store/useProductsStore';
import { useCartStore } from '@/store/useCartStore';

export const ProductGrid: React.FC = () => {
  const products = useProductsStore((s) => s.products);
  const { items, addItem, updateQuantity } = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // Filtrar productos con stock > 0
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.stock > 0 &&
          p.name.toLowerCase().includes(search.toLowerCase()) &&
          (selectedCategory === 'Todas' || p.category === selectedCategory)
      ),
    [products, search, selectedCategory]
  );

  // Obtener la cantidad de un producto que ya está en el carrito
  const getCartQty = (productId: number) => {
    const item = items.find((i) => i.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Buscador y Filtros */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar en el catálogo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 pl-10 pr-3 py-2.5 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {['Todas', 'Calzado/Ropa', 'Electrónica', 'Cosméticos'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[10px] font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos con Controles Profesional (+ / -) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto flex-1 pr-1 pb-4">
        {filtered.map((p) => {
          const inCartQty = getCartQty(p.id);
          const isMaxStock = inCartQty >= p.stock;

          return (
            <div
              key={p.id}
              className={`bg-white border rounded-2xl p-2.5 flex flex-col justify-between transition-all relative group ${
                inCartQty > 0
                  ? 'border-blue-500 shadow-md ring-2 ring-blue-500/10'
                  : 'border-slate-100 shadow-xs hover:border-slate-200'
              }`}
            >
              {/* Badge flotante de cantidad seleccionada */}
              {inCartQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200 z-10">
                  {inCartQty}
                </span>
              )}

              {/* Foto + Stock disponible dinámico */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-2">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-md">
                  Quedan: {p.stock - inCartQty}
                </span>
              </div>

              {/* Nombre y Precio */}
              <div className="space-y-0.5 mb-2">
                <h4 className="text-[11px] font-black text-slate-900 leading-tight line-clamp-1">
                  {p.name}
                </h4>
                <p className="text-xs font-black text-blue-600">
                  {p.currency === 'CUP'
                    ? `$${p.price.toLocaleString('es-CU')} CUP`
                    : `$${p.price} USD`}
                </p>
              </div>

              {/* Controles de selección + / - */}
              {inCartQty === 0 ? (
                <button
                  onClick={() => addItem(p)}
                  className="w-full bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-extrabold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              ) : (
                <div className="flex items-center justify-between bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(p.id, inCartQty - 1)}
                    className="w-7 h-7 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-700 rounded-lg flex items-center justify-center shadow-xs active:scale-90 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-black text-slate-900 px-1">
                    {inCartQty}
                  </span>

                  <button
                    onClick={() => addItem(p)}
                    disabled={isMaxStock}
                    className="w-7 h-7 bg-blue-600 disabled:bg-slate-300 text-white rounded-lg flex items-center justify-center shadow-xs active:scale-90 transition-all disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold">No hay productos con stock para vender</p>
          </div>
        )}
      </div>
    </div>
  );
};