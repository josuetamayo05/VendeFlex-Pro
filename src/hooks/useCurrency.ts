import { useAppStore } from '@/store/useAppStore';

export const useCurrency = () => {
  const currency = useAppStore((s) => s.currency);
  const exchangeRate = useAppStore((s) => s.exchangeRate);
  const mlcRate = useAppStore((s) => s.mlcRate);

  const formatFromUSD = (usdAmount: number): string => {
    if (currency === 'CUP') {
      const cup = usdAmount * exchangeRate;
      return `$${cup.toLocaleString('es-CU', { maximumFractionDigits: 0 })} CUP`;
    }
    if (currency === 'MLC') {
      const mlc = usdAmount / mlcRate;
      return `$${mlc.toFixed(2)} MLC`;
    }
    return `$${usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  };

  return { currency, formatFromUSD, EXCHANGE_RATE: exchangeRate, MLC_RATE: mlcRate };
};