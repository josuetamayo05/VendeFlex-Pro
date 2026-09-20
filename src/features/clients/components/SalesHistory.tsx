// src/features/clients/components/SalesHistory.tsx
import { useMemo, useState } from 'react';
import {
  Trash2,
  ReceiptText,
  Pencil,
  X,
  Check,
  Plus,
  Minus,
  MessageCircle,
} from 'lucide-react';
import { useSalesStore } from '@/store/useSalesStore';
import { useCurrency } from '@/hooks/useCurrency';
import { sendWhatsAppThankYou } from '@/lib/whatsapp';
import type { Sale, SaleItemDetail, PaymentMethod } from '@/types';

const PAYMENT_METHODS: PaymentMethod[] = [
  'Efectivo USD',
  'Efectivo CUP',
  'MLC',
  'Zelle',
  'Fiado',
];

export const SalesHistory = () => {
  const sales = useSalesStore((s) => s.sales);
  const deleteSale = useSalesStore((s) => s.deleteSale);
  const updateSale = useSalesStore((s) => s.updateSale);
  const { formatFromUSD } = useCurrency();

  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editItems, setEditItems] = useState<SaleItemDetail[]>([]);
  const [editClientName, setEditClientName] = useState('');
  const [editClientPhone, setEditClientPhone] = useState('');
  const [editPayment, setEditPayment] = useState<PaymentMethod>('Efectivo USD');

  const visibleSales = useMemo(
    () =>
      sales.filter(
        (s) => s.items?.length > 0 && (s.totalUSD > 0 || s.totalProfitUSD !== 0)
      ),
    [sales]
  );

  const openEdit = (sale: Sale) => {
    setEditingSale(sale);
    setEditItems(sale.items.map((i) => ({ ...i })));
    setEditClientName(sale.clientName || '');
    setEditClientPhone(sale.clientPhone || '');
    setEditPayment(sale.paymentMethod);
  };

  const closeEdit = () => {
    setEditingSale(null);
    setEditItems([]);
  };

  const changeQty = (productId: number, delta: number) => {
    setEditItems((prev) =>
      prev
        .map((item) => {
          if (item.productId !== productId) return item;
          const qty = Math.max(0, item.quantity + delta);
          const totalUSD = qty * item.unitPriceUSD;
          const profitUSD = qty * (item.unitPriceUSD - item.unitCostUSD);
          return { ...item, quantity: qty, totalUSD, profitUSD };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: number) => {
    setEditItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const handleSaveEdit = () => {
    if (!editingSale) return;
    if (editItems.length === 0) {
      if (confirm('La venta quedó sin productos. ¿Eliminarla por completo?')) {
        deleteSale(editingSale.id);
        closeEdit();
      }
      return;
    }
    updateSale(editingSale.id, {
      items: editItems,
      paymentMethod: editPayment,
      clientName: editClientName || undefined,
      clientPhone: editClientPhone || undefined,
    });
    closeEdit();
  };

  const handleDelete = (id: number, date: string) => {
    if (
      confirm(
        `¿Eliminar la venta del ${new Date(date).toLocaleDateString()}?\nEl stock volverá al inventario y se descontará del cliente.`
      )
    ) {
      deleteSale(id);
    }
  };

  const purgeZeroSales = () => {
    const junk = sales.filter((s) => !s.items?.length || s.totalUSD <= 0);
    if (junk.length === 0) {
      alert('No hay ventas basura de $0');
      return;
    }
    if (confirm(`Se encontraron ${junk.length} ventas vacías/de $0. ¿Eliminarlas?`)) {
      junk.forEach((s) => deleteSale(s.id));
    }
  };

  const editTotal = editItems.reduce((s, i) => s + i.totalUSD, 0);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <h3 className="font-black text-slate-800 flex items-center gap-2 text-sm">
            <ReceiptText className="w-5 h-5 text-blue-600" />
            Control de Ventas ({visibleSales.length})
          </h3>
          <button
            onClick={purgeZeroSales}
            className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg"
          >
            Limpiar $0
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-500 uppercase">
              <tr>
                <th className="p-3 font-bold">Fecha</th>
                <th className="p-3 font-bold">Cliente</th>
                <th className="p-3 font-bold">Productos</th>
                <th className="p-3 font-bold">Método</th>
                <th className="p-3 font-bold text-right">Ingreso</th>
                <th className="p-3 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                    {new Date(sale.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>
                  <td className="p-3 font-bold text-slate-800">
                    {sale.clientName || sale.clientPhone || 'Anónimo'}
                  </td>
                  <td className="p-3 text-slate-500 max-w-[180px]">
                    <span className="line-clamp-2">
                      {sale.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                    </span>
                  </td>
                  <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                    {sale.paymentMethod}
                  </td>
                  <td className="p-3 font-black text-emerald-600 text-right whitespace-nowrap">
                    {formatFromUSD(sale.totalUSD)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => sendWhatsAppThankYou(sale)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Enviar agradecimiento por WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEdit(sale)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar venta"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id, sale.date)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar venta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                    Aún no hay ventas registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL EDITAR VENTA ===== */}
      {editingSale && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeEdit} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-slate-900 text-sm">Editar venta</h3>
                <p className="text-[10px] text-slate-400">
                  {new Date(editingSale.date).toLocaleString('es-ES')}
                </p>
              </div>
              <button onClick={closeEdit} className="p-2 bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cliente</label>
                  <input
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                    placeholder="Nombre"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</label>
                  <input
                    value={editClientPhone}
                    onChange={(e) => setEditClientPhone(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                    placeholder="535..."
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Método de pago</label>
                <select
                  value={editPayment}
                  onChange={(e) => setEditPayment(e.target.value as PaymentMethod)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">
                  Productos de la venta
                </label>
                {editItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.productName}</p>
                      <p className="text-[10px] text-slate-400">
                        ${item.unitPriceUSD.toFixed(2)} c/u · ganancia $
                        {(item.unitPriceUSD - item.unitCostUSD).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => changeQty(item.productId, -1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                      <button
                        onClick={() => changeQty(item.productId, +1)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {editItems.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Sin productos — al guardar se eliminará la venta
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-2xl p-3">
                <span className="text-xs font-bold text-emerald-700">Total actualizado</span>
                <span className="text-lg font-black text-emerald-800">
                  {formatFromUSD(editTotal)}
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={closeEdit}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 text-slate-600 text-sm font-bold"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Guardar cambios
                </button>
              </div>

              {editingSale.clientPhone && (
                <button
                  onClick={() =>
                    sendWhatsAppThankYou({
                      ...editingSale,
                      items: editItems,
                      totalUSD: editTotal,
                      clientName: editClientName || editingSale.clientName,
                      clientPhone: editClientPhone || editingSale.clientPhone,
                      paymentMethod: editPayment,
                    })
                  }
                  className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar Gracias por WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};