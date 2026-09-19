import { useAppStore } from '@/store/useAppStore';
import { EXCHANGE_RATE, MLC_RATE } from '@/lib/constants';

export const useCurrency = () => {
  const currency = useAppStore((s) => s.currency);

  const formatFromUSD = (usdAmount: number): string => {
    if (currency === 'CUP') {
      const cup = usdAmount * EXCHANGE_RATE;
      return `$${cup.toLocaleString('es-CU')} CUP`;
    }
    if (currency === 'MLC') {
      const mlc = usdAmount / MLC_RATE;
      return `$${mlc.toFixed(2)} MLC`;
    }
    return `$${usdAmount.toLocaleString('en-US')} USD`;
  };

  return { currency, formatFromUSD, EXCHANGE_RATE, MLC_RATE };
};