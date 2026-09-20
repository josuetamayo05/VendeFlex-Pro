// src/components/ui/ClientAutocomplete.tsx
import { useState, useRef, useEffect } from 'react';
import { User, Phone, Search } from 'lucide-react';
import { useClientsStore } from '@/store/useClientsStore';
import type { Client } from '@/types';

interface Props {
  clientName: string;
  clientPhone: string;
  onChange: (data: { name: string; phone: string }) => void;
}

export const ClientAutocomplete: React.FC<Props> = ({
  clientName,
  clientPhone,
  onChange,
}) => {
  const clients = useClientsStore((s) => s.clients);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNameChange = (value: string) => {
    onChange({ name: value, phone: clientPhone });
    const q = value.trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const results = clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.phone && c.phone.includes(q))
      )
      .slice(0, 6);
    setSuggestions(results);
    setShowSuggestions(results.length > 0);
  };

  const handlePhoneChange = (value: string) => {
    onChange({ name: clientName, phone: value });
    const q = value.trim();
    if (!q) return;
    const match = clients.find((c) => c.phone && c.phone.includes(q));
    if (match) {
      setSuggestions([match]);
      setShowSuggestions(true);
    }
  };

  const pickClient = (c: Client) => {
    onChange({ name: c.name, phone: c.phone || '' });
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="space-y-2 relative">
      <div className="relative">
        <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={clientName}
          onChange={(e) => handleNameChange(e.target.value)}
          onFocus={() => clientName && handleNameChange(clientName)}
          placeholder="Nombre del cliente (escribe para buscar)"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="relative">
        <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="tel"
          value={clientPhone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="Teléfono (535..)"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Dropdown de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-lg z-30 overflow-hidden">
          <div className="p-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 border-b border-slate-100 flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Clientes registrados
          </div>
          <div className="max-h-56 overflow-y-auto">
            {suggestions.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => pickClient(c)}
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 flex items-center justify-between gap-2 border-b border-slate-50 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                  {c.phone && (
                    <p className="text-[11px] text-slate-400 font-medium">{c.phone}</p>
                  )}
                </div>
                {c.totalSpentUSD > 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ${c.totalSpentUSD.toFixed(0)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};