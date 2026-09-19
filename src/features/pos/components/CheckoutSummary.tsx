import React from 'react';
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { useAppStore } from '@/store/useAppStore';
import { pushToSupabase } from '@/lib/supabaseSync';
import { EXCHANGE_RATE } from '@/lib/constants';
import type { SaleItemDetail } from '@/types';

const toUSD = (price: number, currency: 'USD' | 'CUP') =>
  currency === 'CUP' ? price / EXCHANGE_RATE : price;

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

  const products = useProductsStore((s) => s.products);
  const updateStock = useProductsStore((s) => s.updateStock);
  const addSale = useSalesStore((s) => s.addSale);
  const clients = useClientsStore((s) => s.clients);
  const addClient = useClientsStore((s) => s.addClient);
  const addDebt = useClientsStore((s) => s.addDebt);
  const navigateTo = useAppStore((s) => s.navigateTo);

  const subtotalUSD = getSubtotalUSD();
  const subtotalCUP = getSubtotalCUP();
  const changeCUP = getChangeCUP();
  const itemCount = getItemCount();
  const isFiado = paymentMethod === 'Fiado';
  const canCheckout = itemCount > 0;

  const handleCheckout = async (sendWhatsApp: boolean) => {
    if (!canCheckout) return;
    if (isFiado && !clientName.trim()) {
      alert('Para vender a fiado debes poner el nombre del cliente');
      return;
    }

    // 1. Detalle de items de venta
    const saleItems: SaleItemDetail[] = items.map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.productId);
      const unitPriceUSD = toUSD(cartItem.unitPrice, cartItem.currency);
      const unitCostUSD = product?.cost ? toUSD(product.cost, cartItem.currency) : 0;
      const totalUSD = unitPriceUSD * cartItem.quantity;
      const profitUSD = (unitPriceUSD - unitCostUSD) * cartItem.quantity;

      return {
        productId: cartItem.productId,
        productName: cartItem.name,
        investmentId: product?.investmentId ?? 1,
        quantity: cartItem.quantity,
        unitPriceUSD,
        unitCostUSD,
        totalUSD,
        profitUSD,
      };
    });

    // 2. Registrar Venta
    addSale({
      items: saleItems,
      paymentMethod,
      clientName: clientName || undefined,
      clientPhone: clientPhone || undefined,
    });

    // 3. Descontar Stock
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateStock(item.productId, Math.max(0, product.stock - item.quantity));
      }
    });

    // 4. Si es FIADO o hay cliente, registrar deudas en el Módulo Clientes
    if (clientName.trim()) {
      const client = clients.find(
        (c) => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
      );

      let targetClientId = client?.id;

      if (!client) {
        // Crear cliente si no existe
        addClient({
          name: clientName.trim(),
          phone: clientPhone.trim() || undefined,
          tags: isFiado ? ['Fiado'] : ['Cliente'],
        });
        // Obtener ID del cliente recién creado
        const updatedClients = useClientsStore.getState().clients;
        const newClient = updatedClients.find(
          (c) => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
        );
        targetClientId = newClient?.id;
      }

      // Si es FIADO, agregar la deuda
      if (isFiado && targetClientId) {
        const concepts = items.map((i) => `${i.name} x${i.quantity}`).join(', ');
        addDebt(targetClientId, {
          amountUSD: subtotalUSD,
          amountCUP: subtotalCUP,
          concept: concepts,
          date: new Date().toISOString().split('T')[0],
        });
      }
    }

    // 5. Enviar por WhatsApp si fue solicitado
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
        (isFiado ? `⚠️ *Saldo a fiado registrado en tu cuenta*%0A%0A` : '') +
        `¡Gracias por tu compra! 💪`;

      window.open(`https://wa.me/${fullPhone}?text=${msg}`, '_blank');
    }

    // Sincronizar en segundo plano si hay Supabase
    pushToSupabase().catch(() => {});

    alert(
      `✅ Venta registrada con éxito!\n\n` +
        `Items: ${itemCount}\n` +
        `Total: $${subtotalUSD.toFixed(2)} USD\n` +
        `Pago: ${paymentMethod}` +
        (isFiado ? `\n⚠️ Deuda anotada a: ${clientName}` : '')
    );

    clearCart();
    navigateTo('dashboard', 'inicio');
  };

  return (
    <div className="space-y-3">
      {/* Totales */}
      <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 border border-slate-100">
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

      {/* Cliente */}
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder={isFiado ? 'Nombre cliente *' : 'Cliente (opcional)'}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className={`w-full bg-slate-50 border rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none ${
            isFiado && !clientName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
          }`}
        />
        <input
          type="tel"
          placeholder="Teléfono WA (opcional)"
          value={clientPhone}
          onChange={(e) => setClientPhone(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none"
        />
      </div>

      {paymentMethod === 'Efectivo CUP' && (
        <div className="space-y-1">
          <input
            type="number"
            placeholder="Monto recibido CUP"
            value={amountReceived || ''}
            onChange={(e) => setAmountReceived(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
          />
          {amountReceived > 0 && (
            <p className="text-[10px] font-bold text-emerald-600 text-right">
              Cambio: ${changeCUP.toLocaleString('es-CU')} CUP
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => handleCheckout(true)}
          disabled={!canCheckout || (isFiado && !clientName.trim())}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Registrar y Enviar WhatsApp
        </button>

        <button
          onClick={() => handleCheckout(false)}
          disabled={!canCheckout || (isFiado && !clientName.trim())}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-2xl shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all text-xs flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Solo Registrar Venta
        </button>
      </div>
    </div>
  );
};