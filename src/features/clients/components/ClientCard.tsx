import React from 'react';
import type { Client } from '@/types';
import { getClientDebtUSD, getClientStatus } from '@/types';
import { EXCHANGE_RATE } from '@/lib/constants';

interface Props {
  client: Client;
  onClick: () => void;
}

export const ClientCard: React.FC<Props> = ({ client, onClick }) => {
  const debtUSD = getClientDebtUSD(client);
  const status = getClientStatus(client);

  const statusConfig = {
    al_dia: {
      label: 'Al día',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-100',
      dot: 'bg-emerald-500',
      debtLabel: null,
    },
    debe: {
      label: 'Debe',
      color: 'text-amber-700 bg-amber-50 border-amber-100',
      dot: 'bg-amber-500',
      debtLabel: `Debe $${debtUSD} USD`,
    },
    moroso: {
      label: 'Moroso',
      color: 'text-rose-700 bg-rose-50 border-rose-100',
      dot: 'bg-rose-500',
      debtLabel: `Debe $${debtUSD} USD`,
    },
  }[status];

  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 hover:shadow-md hover:border-blue-200 active:scale-[0.99] transition-all text-left"
    >
      {/* Avatar */}
      {client.avatar ? (
        <img
          src={client.avatar}
          alt={client.name}
          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-slate-100"
        />
      ) : (
        <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm flex-shrink-0">
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-black text-slate-900 truncate">{client.name}</h3>
          {client.tags.includes('VIP') && (
            <span className="text-[8px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
              VIP
            </span>
          )}
        </div>
        {statusConfig.debtLabel ? (
          <p className={`text-[11px] font-bold mt-0.5 ${status === 'moroso' ? 'text-rose-600' : 'text-amber-600'}`}>
            {statusConfig.debtLabel}
            {status === 'debe' && debtUSD * EXCHANGE_RATE < 10000 && (
              <span className="text-slate-400 font-medium">
                {' '}≈ ${(debtUSD * EXCHANGE_RATE).toLocaleString('es-CU')} CUP
              </span>
            )}
          </p>
        ) : (
          <p className="text-[11px] font-medium text-slate-400 mt-0.5">
            Gastó ${client.totalSpentUSD} USD
          </p>
        )}
      </div>

      {/* Status badge */}
      <span
        className={`flex items-center gap-1 text-[9px] font-extrabold px-2 py-1 rounded-full border flex-shrink-0 ${statusConfig.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
        {statusConfig.label}
      </span>
    </button>
  );
};