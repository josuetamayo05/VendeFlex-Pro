import React from 'react';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useAppStore } from '@/store/useAppStore';

export const CheckoutSummary: React.FC = () => {
  const {
    items,
    paymentMethod,
    amountReceived,
    clientName,
    clientPhone,
    setAmountReceived,
    setClientName,
    setClientPhone,
    getSubtotalUSD,
    getSubtotalCUP,
    getChangeCUP,
    getItemCount,
    clearCart,
  } = useCartStore();

  const updateStock = useProductsStore((s) => s.updateStock);
  const navigateTo = useAppStore((s) => s.navigateTo);

  const subtotalUSD = getSubtotalUSD();
  const subtotalCUP = getSubtotalCUP();
  const changeCUP = getChangeCUP();
  const itemCount = getItemCount();
  const isFiado = paymentMethod === 'Fiado';
  const canCheckout = itemCount > 0;

  const handleCheckout = (sendWhatsApp: boolean) => {
    if (!canCheckout) return;

    // Descontar stock
    items.forEach((item) => {
      const product = useProductsStore.getState().products.find((p) => p.id === item.productId);
      if (product) {
        updateStock(item.productId, product.stock - item.quantity);
      }
    });

    // Mensaje WhatsApp
    if (sendWhatsApp && clientPhone) {
      const phone = clientPhone.replace(/\D/g, '');
      const fullPhone = phone.length === 8 ? `53${phone}` : phone;

      const lines = items
        .map(
          (i) =>
            `• ${i.name} x${i.quantity} — ${
              i.currency === 'CUP'
                ? `$${(i.unitPrice * i.quantity).toLocaleString('es-CU')} CUP`
                : `$${i.unitPrice * i.quantity} USD`
            }`
        )
        .join('%0A');

      const msg =
        `¡Hola${clientName ? ` ${clientName}` : ''}! 🔥%0A%0A` +
        `Tu compra en *VendeFlex*:%0A${lines}%0A%0A` +
        `*Total:* $${subtotalUSD.toFixed(2)} USD ($${subtotalCUP.toLocaleString('es-CU')} CUP)%0A` +
        `*Pago:* ${paymentMethod}%0A%0A` +
        `¡Gracias por tu compra! 💪`;

      window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    }

    alert(
      `✅ Venta registrada!\n\n` +
        `${itemCount} producto(s)\n` +
        `Total: $${subtotalUSD.toFixed(2)} USD\n` +
        `Pago: ${paymentMethod}` +
        (isFiado ? `\n⚠️ Fiado a: ${clientName || 'Sin nombre'}` : '')
    );

    clearCart();
    navigateTo('dashboard', 'inicio');
  };

  return (
    <div className="space-y-3">
      {/* Totales */}
      <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-slate-500">
            {itemCount} producto{itemCount !== 1 ? 's' : ''}
          </span>
          <span className="text-sm font-black text-slate-900">
            ${subtotalUSD.toFixed(2)} USD
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400">Equivalente CUP</span>
          <span className="text-xs font-bold text-slate-600">
            ${subtotalCUP.toLocaleString('es-CU')} CUP
          </span>
        </div>
      </div>

      {/* Cliente (opcional, obligatorio si Fiado) */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder={isFiado ? 'Nombre *' : 'Cliente (opcional)'}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 ${
            isFiado && !clientName ? 'border-rose-300' : 'border-slate-200'
          }`}
        />
        <input
          type="tel"
          placeholder="Teléfono WA"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Monto recibido + cambio (solo efectivo CUP) */}
      {paymentMethod === 'Efectivo CUP' && (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Monto recibido CUP"
              value={amountReceived || ''}
              onChange={(e) => setAmountReceived(Number(e.target.value))}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>
          {amountReceived > 0 && (
            <p className="text-[10px] font-bold text-emerald-600 text-right">
              Cambio: ${changeCUP.toLocaleString('es-CU')} CUP
            </p>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => handleCheckout(true)}
          disabled={!canCheckout || (isFiado && !clientName)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Registrar y Enviar WhatsApp
        </button>

        <button
          onClick={() => handleCheckout(false)}
          disabled={!canCheckout || (isFiado && !clientName)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-2xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Solo Registrar Venta
        </button>
      </div>
    </div>
  );
};