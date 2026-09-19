import React, { useState, useMemo } from 'react';
import { Plus, Package } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { ProductCard } from './components/ProductCard';
import { InventoryFilters } from './components/InventoryFilters';

export const InventoryScreen: React.FC = () => {
  const navigateTo = useAppStore((s) => s.navigateTo);
  const products = useProductsStore((s) => s.products);
  const investments = useInvestmentsStore((s) => s.investments);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedOrigin, setSelectedOrigin] = useState('Todos');
  const [selectedInvestment, setSelectedInvestment] = useState<string>('todas');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchesOrigin = selectedOrigin === 'Todos' || p.origin === selectedOrigin;
      const matchesInvestment =
        selectedInvestment === 'todas' || p.investmentId.toString() === selectedInvestment;
      return matchesSearch && matchesCategory && matchesOrigin && matchesInvestment;
    });
  }, [products, searchQuery, selectedCategory, selectedOrigin, selectedInvestment]);

  // Info de la inversión seleccionada (para mostrar en el header)
  const activeInvestment =
    selectedInvestment !== 'todas'
      ? investments.find((i) => i.id.toString() === selectedInvestment)
      : null;

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-24 md:pb-6">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Inventario</h1>
            {activeInvestment && (
              <p className="text-[11px] font-bold mt-0.5" style={{ color: activeInvestment.color }}>
                Filtrado: {activeInvestment.code} · {activeInvestment.name}
              </p>
            )}
          </div>
          <button
            onClick={() => navigateTo('crear_producto')}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Nuevo
          </button>
        </div>

        <InventoryFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedOrigin={selectedOrigin}
          setSelectedOrigin={setSelectedOrigin}
        />

        {/* Filtro extra por inversión */}
        <select
          value={selectedInvestment}
          onChange={(e) => setSelectedInvestment(e.target.value)}
          className="w-full bg-slate-100 text-slate-700 font-extrabold text-[10px] px-3 py-2 rounded-xl border-none focus:outline-none"
        >
          <option value="todas">📦 Inversión: Todas</option>
          {investments.map((i) => (
            <option key={i.id} value={i.id.toString()}>
              {i.code} · {i.name} ({i.supplierName})
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {filteredProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-2 text-center py-12 text-slate-400 space-y-2">
            <Package className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-bold">No se encontraron productos</p>
            {selectedInvestment !== 'todas' && (
              <button
                onClick={() => setSelectedInvestment('todas')}
                className="text-xs text-blue-600 font-bold hover:underline"
              >
                Ver todas las inversiones →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};