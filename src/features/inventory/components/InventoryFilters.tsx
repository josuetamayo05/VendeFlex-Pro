import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  selectedOrigin: string;
  setSelectedOrigin: (v: string) => void;
}

export const InventoryFilters: React.FC<Props> = ({
  searchQuery, setSearchQuery,
  selectedCategory, setSelectedCategory,
  selectedOrigin, setSelectedOrigin
}) => {
  return (
    <>
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Buscar producto..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      <div className="flex gap-2">
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="flex-1 bg-slate-100 text-slate-700 font-extrabold text-[10px] px-3 py-2 rounded-xl border-none focus:outline-none"
        >
          <option value="Todas">Categoría: Todas</option>
          <option value="Calzado/Ropa">Calzado / Ropa</option>
          <option value="Cosméticos">Cosméticos</option>
          <option value="Electrónica">Electrónica</option>
        </select>

        <select 
          value={selectedOrigin}
          onChange={(e) => setSelectedOrigin(e.target.value)}
          className="flex-1 bg-slate-100 text-slate-700 font-extrabold text-[10px] px-3 py-2 rounded-xl border-none focus:outline-none"
        >
          <option value="Todos">Origen: Todos</option>
          <option value="Local">Compra Local</option>
          <option value="USA">Importación USA</option>
          <option value="Encargo">Por Encargo</option>
        </select>
      </div>
    </>
  );
};