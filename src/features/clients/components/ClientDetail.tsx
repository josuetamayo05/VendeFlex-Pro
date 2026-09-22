// src/features/clients/components/ClientDetail.tsx
import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  Pencil,
  Check,
  X,
  MessageCircle,
  Phone,
  Trash2,
  Wallet,
  Tag,
} from 'lucide-react';
import type { Client } from '@/types';
import { useClientsStore } from '@/store/useClientsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useCurrency } from '@/hooks/useCurrency';
import { sendWhatsAppThankYou } from '@/lib/whatsapp';
import { getClientDebtUSD, getClientStatus } from '@/types';
import { useConfigStore } from '@/store/useConfigStore';

interface Props {
  client: Client;
  onClose: () => void;
}

export const ClientDetail: React.FC<Props> = ({ client, onClose }) => {
  const updateClient = useClientsStore((s) => s.updateClient);
  const deleteClient = useClientsStore((s) => s.deleteClient);
  const collectDebt = useClientsStore((s) => s.collectDebt);
  const collectAllDebts = useClientsStore((s) => s.collectAllDebts);

  const config = useConfigStore((s) => s.config);
  const businessName = config.businessName || 'Mi Negocio';
  
  const sales = useSalesStore((s) => s.sales);
  const { formatFromUSD } = useCurrency();

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(client.name);
  const [tempPhone, setTempPhone] = useState(client.phone || '');
  const [tempNotes, setTempNotes] = useState(client.notes || '');

  // Ventas de este cliente (por nombre o teléfono)
  const clientSales = useMemo(() => {
    const name = client.name.trim().toLowerCase();
    const phone = (client.phone || '').trim();
    return sales.filter((s) => {
      const sn = (s.clientName || '').trim().toLowerCase();
      const sp = (s.clientPhone || '').trim();
      return (name && sn === name) || (phone && sp && sp === phone);
    });
  }, [sales, client.name, client.phone]);

  const debtUSD = getClientDebtUSD(client);
  const status = getClientStatus(client);

  const statusLabel =
    status === 'al_dia' ? 'Al día' : status === 'debe' ? 'Debe' : 'Moroso';
  const statusColor =
    status === 'al_dia'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'debe'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-rose-50 text-rose-700';

  const saveProfile = () => {
    if (!tempName.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }
    updateClient(client.id, {
      name: tempName.trim(),
      phone: tempPhone.trim(),
      notes: tempNotes.trim(),
    });
    setEditingProfile(false);
  };

  const cancelEdit = () => {
    setTempName(client.name);
    setTempPhone(client.phone || '');
    setTempNotes(client.notes || '');
    setEditingProfile(false);
  };

  const handleDeleteClient = () => {
    if (
      confirm(
        `¿Eliminar al cliente "${client.name}"?\nEsto NO borra sus ventas del historial, solo la ficha del cliente.`
      )
    ) {
      deleteClient(client.id);
      onClose();
    }
  };

  const sendLastThankYou = () => {
    if (clientSales.length === 0) {
      alert('Este cliente aún no tiene ventas para armar el mensaje.');
      return;
    }
    // Última venta
    const last = [...clientSales].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    sendWhatsAppThankYou({
      ...last,
      clientName: client.name,
      clientPhone: client.phone || last.clientPhone,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-24">
      {/* HEADER */}
      <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-base font-black text-slate-900">Ficha de Cliente</h1>
            <p className="text-[10px] text-slate-400 font-medium">{businessName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {(client.phone || clientSales[0]?.clientPhone) && (
            <button
              onClick={sendLastThankYou}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"
              title="Enviar gracias (última compra)"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDeleteClient}
            className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-xl"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* PERFIL EDITABLE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          {!editingProfile ? (
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                  {client.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-slate-900 truncate">{client.name}</h2>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {client.phone || 'Sin teléfono'}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                    {client.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-0.5"
                      >
                        <Tag className="w-2.5 h-2.5" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setEditingProfile(true)}
                className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre</label>
                <input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</label>
                <input
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none"
                  placeholder="535..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Notas</label>
                <textarea
                  value={tempNotes}
                  onChange={(e) => setTempNotes(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Preferencias, talla, zona..."
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={cancelEdit}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Guardar
                </button>
              </div>
            </div>
          )}

          {client.notes && !editingProfile && (
            <p className="text-[11px] text-slate-500 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
              {client.notes}
            </p>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-2xl p-3 border border-slate-200">
            <div className="flex items-center gap-1 text-blue-600 mb-1">
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase">Total gastado</span>
            </div>
            <p className="text-lg font-black text-slate-900">
              {formatFromUSD(client.totalSpentUSD || 0)}
            </p>
            <p className="text-[10px] text-slate-400">{clientSales.length} compras</p>
          </div>
          <div className="bg-white rounded-2xl p-3 border border-slate-200">
            <div className="flex items-center gap-1 text-amber-600 mb-1">
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase">Deuda / Fiado</span>
            </div>
            <p
              className={`text-lg font-black ${
                debtUSD > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {formatFromUSD(debtUSD)}
            </p>
            <p className="text-[10px] text-slate-400">
              {client.debts?.length || 0} fiado(s)
            </p>
          </div>
        </div>

        {/* FIADOS */}
        {(client.debts?.length || 0) > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-amber-50 flex items-center justify-between">
              <h4 className="text-xs font-black text-amber-800">Fiados pendientes</h4>
              <button
                onClick={() => {
                  if (confirm('¿Marcar todos los fiados como cobrados?')) {
                    collectAllDebts(client.id);
                  }
                }}
                className="text-[10px] font-bold text-amber-700 bg-white px-2 py-1 rounded-lg border border-amber-200"
              >
                Cobrar todo
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {client.debts.map((d) => (
                <div key={d.id} className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">{d.concept}</p>
                    <p className="text-[10px] text-slate-400">
                      {d.date} · {formatFromUSD(d.amountUSD)}
                    </p>
                  </div>
                  <button
                    onClick={() => collectDebt(client.id, d.id)}
                    className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg"
                  >
                    Cobrado
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORIAL DE COMPRAS + WHATSAPP */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800">
              Compras ({clientSales.length})
            </h4>
          </div>

          <div className="divide-y divide-slate-100">
            {clientSales.map((sale) => (
              <div key={sale.id} className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-800">
                    {new Date(sale.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    ·{' '}
                    <span className="text-emerald-600">{formatFromUSD(sale.totalUSD)}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                  <p className="text-[10px] text-slate-400">{sale.paymentMethod}</p>
                </div>
                <button
                  onClick={() =>
                    sendWhatsAppThankYou({
                      ...sale,
                      clientName: client.name,
                      clientPhone: client.phone || sale.clientPhone,
                    })
                  }
                  className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl flex-shrink-0"
                  title="Enviar gracias por WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            ))}

            {clientSales.length === 0 && (
              <p className="text-xs text-slate-400 text-center p-6">
                Aún sin compras registradas
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};