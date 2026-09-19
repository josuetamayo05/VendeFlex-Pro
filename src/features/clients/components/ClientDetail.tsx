import React from 'react';
import { X, MessageCircle, CheckCircle2, Phone } from 'lucide-react';
import type { Client } from '@/types';
import { getClientDebtUSD } from '@/types';
import { useClientsStore } from '@/store/useClientsStore';
import { EXCHANGE_RATE } from '@/lib/constants';

interface Props {
  client: Client;
  onClose: () => void;
}

export const ClientDetail: React.FC<Props> = ({ client, onClose }) => {
  const collectDebt = useClientsStore((s) => s.collectDebt);
  const collectAllDebts = useClientsStore((s) => s.collectAllDebts);

  const debtUSD = getClientDebtUSD(client);
  const debtCUP = debtUSD * EXCHANGE_RATE;
  const hasDebt = debtUSD > 0;

  const initials = client.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleWhatsAppCollect = () => {
    if (!client.phone) {
      alert('Este cliente no tiene teléfono registrado');
      return;
    }
    const phone = client.phone.replace(/\D/g, '');
    const fullPhone = phone.length === 8 ? `53${phone}` : phone;

    const debtLines = client.debts
      .map(
        (d) =>
          `• ${d.concept}: $${d.amountUSD} USD` +
          (d.invoiceNumber ? ` (${d.invoiceNumber})` : '')
      )
      .join('%0A');

    const msg =
      `¡Hola ${client.name}! 👋%0A%0A` +
      `Te escribo de *VendeFlex* para recordarte tu saldo pendiente:%0A%0A` +
      `${debtLines}%0A%0A` +
      `*Total:* $${debtUSD} USD (≈ $${debtCUP.toLocaleString('es-CU')} CUP)%0A%0A` +
      `¿Me confirmas cuándo podrías saldarlo? ¡Gracias! 🙏`;

    window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
  };

  const handleCollectAll = () => {
    if (confirm(`¿Marcar como cobrado todo el saldo de ${client.name} ($${debtUSD} USD)?`)) {
      collectAllDebts(client.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {client.avatar ? (
              <img
                src={client.avatar}
                alt={client.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-slate-900">{client.name}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                {client.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[8px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {client.phone && (
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" /> {client.phone}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Resumen deuda */}
          {hasDebt ? (
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">
                Total adeudado
              </p>
              <p className="text-3xl font-black text-rose-600 mt-1">${debtUSD} USD</p>
              <p className="text-xs font-bold text-rose-400 mt-0.5">
                ≈ ${debtCUP.toLocaleString('es-CU')} CUP
              </p>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-sm font-black text-emerald-700">Cliente al día</p>
              <p className="text-[11px] text-emerald-500 font-medium mt-0.5">
                Total gastado: ${client.totalSpentUSD} USD
              </p>
            </div>
          )}

          {/* Lista de deudas */}
          {hasDebt && (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Detalle de deudas
              </p>
              {client.debts.map((debt) => (
                <div
                  key={debt.id}
                  className="bg-slate-50 rounded-2xl p-3 flex items-center justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{debt.concept}</p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {debt.date}
                      {debt.invoiceNumber ? ` · ${debt.invoiceNumber}` : ''}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs font-black text-rose-600">${debt.amountUSD} USD</p>
                    <button
                      onClick={() => {
                        if (confirm(`¿Cobrar esta deuda de $${debt.amountUSD} USD?`)) {
                          collectDebt(client.id, debt.id);
                        }
                      }}
                      className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 mt-0.5"
                    >
                      Cobrar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <p className="text-[9px] font-bold text-slate-400">Total gastado</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">
                ${client.totalSpentUSD} USD
              </p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-3 text-center">
              <p className="text-[9px] font-bold text-slate-400">Última compra</p>
              <p className="text-sm font-black text-slate-800 mt-0.5">
                {client.lastPurchase || '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {hasDebt && (
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button
              onClick={handleWhatsAppCollect}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Cobrar vía WhatsApp
            </button>
            <button
              onClick={handleCollectAll}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 rounded-2xl active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Marcar todo como cobrado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};