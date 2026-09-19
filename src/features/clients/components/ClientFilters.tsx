import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  filter: 'todos' | 'deben' | 'al_dia';
  setFilter: (v: 'todos' | 'deben' | 'al_dia') => void;
}

export const ClientFilters: React.FC<Props> = ({
  search,
  setSearch,
  filter,
  setFilter,
}) => {
  const filters = [
    { key: 'todos' as const, label: 'Todos' },
    { key: 'deben' as const, label: 'Con deuda' },
    { key: 'al_dia' as const, label: 'Al día' },
  ];

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-100 pl-10 pr-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="flex gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all ${
              filter === f.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};