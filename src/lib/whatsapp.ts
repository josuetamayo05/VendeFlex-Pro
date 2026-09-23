// src/lib/whatsapp.ts
import type { Sale } from '@/types';
import { useConfigStore } from '@/store/useConfigStore';

export const cleanPhone = (phone?: string): string => {
  if (!phone) return '';
  let clean = phone.replace(/[^\d]/g, '');
  clean = clean.replace(/[\u200e\u200f\u202a-\u202e]/g, '');
  if (clean.startsWith('53') && clean.length >= 10) return clean;
  if (clean.length === 8) return `53${clean}`;
  if (clean.length === 10 && clean.startsWith('5')) return `53${clean}`;
  return clean;
};

export const buildThankYouMessage = (sale: Sale): string => {
  // Lee el nombre del negocio configurado por CADA usuario
  const brand =
    useConfigStore.getState().config.whatsappBrand ||
    useConfigStore.getState().config.businessName ||
    'nuestra tienda';

  // const items = sale.items
  //   .map((i) => `• ${i.quantity}x ${i.productName} — $${i.totalUSD.toFixed(2)}`)
  //   .join('\n');

  const clientName = sale.clientName || 'Estimad@ cliente';

  return `¡Hola ${clientName}! 🌸

Gracias por tu compra en *${brand}* 💖

Cualquier duda o si te interesa algo más, ¡escríbeme! 😊
Gracias por confiar en nosotros 🙌`;
};

export const sendWhatsAppThankYou = (sale: Sale): void => {
  const phone = cleanPhone(sale.clientPhone);
  const msg = encodeURIComponent(buildThankYouMessage(sale));
  const url = phone
    ? `https://wa.me/${phone}?text=${msg}`
    : `https://wa.me/?text=${msg}`;
  window.open(url, '_blank');
};