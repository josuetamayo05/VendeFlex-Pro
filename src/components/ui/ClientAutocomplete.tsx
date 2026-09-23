// src/components/ui/ClientAutocomplete.tsx
import { useMemo, useState, useEffect, useRef } from 'react';
import { User, Phone, X } from 'lucide-react';
import { useClientsStore } from '@/store/useClientsStore';
import type { Client } from '@/types';

interface Props {
  clientName: string;
  clientPhone: string;
  onChange: (data: { clientName: string; clientPhone: string }) => void;
}

export const ClientAutocomplete: React.FC<Props> = ({
  clientName,
  clientPhone,
  onChange,
}) => {
  const clients = useClientsStore((s) => s.clients);
  const [focus, setFocus] = useState<'name' | 'phone' | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Cierra sugerencias si hago click fuera
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setFocus(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Filtra sugerencias
  const suggestions = useMemo(() => {
    const query = (focus === 'name' ? clientName : clientPhone).trim().toLowerCase();
    if (!query || query.length < 1) return [];

    return clients
      .filter((c) => {
        const inName = c.name.toLowerCase().includes(query);
        const inPhone = (c.phone || '').toLowerCase().includes(query);
        return focus === 'name' ? inName : inPhone;
      })
      .slice(0, 5);
  }, [clients, clientName, clientPhone, focus]);

  const pickClient = (c: Client) => {
    onChange({
      clientName: c.name,
      clientPhone: c.phone || '',
    });
    setFocus(null);
  };

  const clearFields = () => {
    onChange({ clientName: '', clientPhone: '' });
  };

  return (
    <div ref={boxRef} className="relative space-y-2">
      {/* Nombre */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <User className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={clientName}
          onChange={(e) => onChange({ clientName: e.target.value, clientPhone })}
          onFocus={() => setFocus('name')}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-9 py-3 text-xs font-bold focus:border-blue-500 focus:outline-none"
        />
        {(clientName || clientPhone) && (
          <button
            onClick={clearFields}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Teléfono */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <Phone className="w-4 h-4" />
        </div>
        <input
          type="tel"
          placeholder="Teléfono (opcional)"
          value={clientPhone}
          onChange={(e) => onChange({ clientName, clientPhone: e.target.value })}
          onFocus={() => setFocus('phone')}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-3 text-xs font-bold focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Sugerencias */}
      {focus && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase px-3 py-2 border-b border-slate-100">
            Clientes existentes
          </p>
          <div className="max-h-52 overflow-y-auto">
            {suggestions.map((c) => (
              <button
                key={c.id}
                onClick={() => pickClient(c)}
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-slate-50 last:border-0 flex items-center gap-2.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center flex-shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {c.name}
                  </p>
                  {c.phone && (
                    <p className="text-[10px] text-slate-500 font-medium">
                      {c.phone}
                    </p>
                  )}
                </div>
                {(c.totalSpentUSD || 0) > 0 && (
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
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