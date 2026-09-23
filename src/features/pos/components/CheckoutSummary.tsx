import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MessageCircle, CheckCircle2, User, Phone, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { useAppStore } from '@/store/useAppStore';
import { pushToSupabase } from '@/lib/supabaseSync';
import { EXCHANGE_RATE } from '@/lib/constants';
import type { SaleItemDetail, Client } from '@/types';

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

    // ═══ AUTOCOMPLETADO INTELIGENTE DE CLIENTES ═══
    const [focus, setFocus] = useState<'name' | 'phone' | null>(null);
    const autocompleteRef = useRef<HTMLDivElement>(null);
    // Evita re-disparar el auto-fill en bucle mientras el usuario edita
    const lastAutoFilledRef = useRef<string>('');

    useEffect(() => {
      const onClickOutside = (e: MouseEvent) => {
        if (autocompleteRef.current && !autocompleteRef.current.contains(e.target as Node)) {
          setFocus(null);
        }
      };
      document.addEventListener('mousedown', onClickOutside);
      return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // Auto-relleno silencioso: si el nombre o teléfono coinciden EXACTO con un cliente
    useEffect(() => {
      const nameQ = clientName.trim().toLowerCase();
      const phoneQ = clientPhone.trim().toLowerCase();

      // Evitar loop: si ya auto-rellenamos este mismo valor, no repetir
      const signature = `${nameQ}|${phoneQ}`;
      if (signature === lastAutoFilledRef.current) return;

      // 1) Nombre exacto → rellenar teléfono (si el teléfono está vacío o incompleto)
      if (nameQ.length >= 2) {
        const byName = clients.find((c) => c.name.toLowerCase().trim() === nameQ);
        if (byName?.phone) {
          const existingPhone = (byName.phone || '').trim();
          if (existingPhone && clientPhone.trim() !== existingPhone) {
            lastAutoFilledRef.current = `${nameQ}|${existingPhone.toLowerCase()}`;
            setClientPhone(existingPhone);
            return;
          }
        }
      }

      // 2) Teléfono exacto (mín. 6 dígitos) → rellenar nombre (si el nombre está vacío)
      const phoneDigits = phoneQ.replace(/\D/g, '');
      if (phoneDigits.length >= 6 && !clientName.trim()) {
        const byPhone = clients.find((c) => {
          const cDigits = (c.phone || '').replace(/\D/g, '');
          return cDigits === phoneDigits || cDigits.endsWith(phoneDigits) || phoneDigits.endsWith(cDigits);
        });
        if (byPhone) {
          lastAutoFilledRef.current = `${byPhone.name.toLowerCase()}|${phoneQ}`;
          setClientName(byPhone.name);
        }
      }
    }, [clientName, clientPhone, clients, setClientName, setClientPhone]);

    const suggestions = useMemo(() => {
      const query = (focus === 'name' ? clientName : clientPhone).trim().toLowerCase();
      if (!query || query.length < 1) return [];

      return clients
        .filter((c) => {
          if (focus === 'name') {
            return c.name.toLowerCase().includes(query);
          }
          // En teléfono comparamos también sin guiones/espacios
          const qDigits = query.replace(/\D/g, '');
          const cDigits = (c.phone || '').replace(/\D/g, '');
          return (
            (c.phone || '').toLowerCase().includes(query) ||
            (qDigits.length >= 3 && cDigits.includes(qDigits))
          );
        })
        .slice(0, 5);
    }, [clients, clientName, clientPhone, focus]);

    const pickClient = (c: Client) => {
      const phone = c.phone || '';
      lastAutoFilledRef.current = `${c.name.toLowerCase()}|${phone.toLowerCase()}`;
      setClientName(c.name);
      setClientPhone(phone); // ← SIEMPRE rellena teléfono si está registrado
      setFocus(null);
    };

    const clearClientFields = () => {
      lastAutoFilledRef.current = '';
      setClientName('');
      setClientPhone('');
    };

  // ═══ CHECKOUT ═══
  const handleCheckout = async (sendWhatsApp: boolean) => {
    if (!canCheckout) return;
    if (isFiado && !clientName.trim()) {
      alert('Para vender a fiado debes poner el nombre del cliente');
      return;
    }

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

    addSale({
      items: saleItems,
      paymentMethod,
      clientName: clientName || undefined,
      clientPhone: clientPhone || undefined,
    });

    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        updateStock(item.productId, Math.max(0, product.stock - item.quantity));
      }
    });

    if (clientName.trim()) {
      const client = clients.find(
        (c) => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
      );

      let targetClientId = client?.id;

      if (!client) {
        addClient({
          name: clientName.trim(),
          phone: clientPhone.trim() || undefined,
          tags: isFiado ? ['Fiado'] : ['Cliente'],
        });
        const updatedClients = useClientsStore.getState().clients;
        const newClient = updatedClients.find(
          (c) => c.name.toLowerCase().trim() === clientName.toLowerCase().trim()
        );
        targetClientId = newClient?.id;
      }

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

      {/* ═══ CLIENTE CON AUTOCOMPLETADO ═══ */}
      <div ref={autocompleteRef} className="relative space-y-2">
        {/* Nombre */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <User className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder={isFiado ? 'Nombre cliente *' : 'Cliente (opcional)'}
            value={clientName}
            onChange={(e) => {
              lastAutoFilledRef.current = ''; // el usuario está editando a mano
              setClientName(e.target.value);
            }}
            onFocus={() => setFocus('name')}
            className={`w-full bg-slate-50 border rounded-xl pl-8 pr-8 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500 ${
              isFiado && !clientName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
            }`}
            autoComplete="off"
          />
          {(clientName || clientPhone) && (
            <button
              type="button"
              onClick={clearClientFields}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Teléfono */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <input
            type="tel"
            placeholder="Teléfono WA (opcional)"
            value={clientPhone}
            onChange={(e) => {
              lastAutoFilledRef.current = '';
              setClientPhone(e.target.value);
            }}
            onFocus={() => setFocus('phone')}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
            autoComplete="off"
          />
        </div>

        {/* Sugerencias */}
        {focus && suggestions.length > 0 && (
          <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            <p className="text-[9px] font-black text-slate-400 uppercase px-3 py-2 border-b border-slate-100">
              Clientes existentes · toca para rellenar todo
            </p>
            <div className="max-h-52 overflow-y-auto">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickClient(c)}
                  className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-slate-50 last:border-0 flex items-center gap-2.5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-black text-xs flex items-center justify-center flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {c.phone ? c.phone : 'Sin teléfono guardado'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    {(c.totalSpentUSD || 0) > 0 && (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                        ${c.totalSpentUSD.toFixed(0)}
                      </span>
                    )}
                    {c.phone && (
                      <span className="text-[8px] font-bold text-blue-500">
                        + tel
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
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