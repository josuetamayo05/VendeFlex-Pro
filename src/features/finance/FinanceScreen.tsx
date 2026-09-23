import React, { useState } from 'react';
import {
  TrendingDown,
  Repeat,
  Plus,
  ArrowRightLeft,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useFinanceStore, type TransactionType } from '@/store/useFinanceStore';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useCurrency } from '@/hooks/useCurrency';

export const FinanceScreen: React.FC = () => {
  const transactions = useFinanceStore((s) => s.transactions);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);
  const investments = useInvestmentsStore((s) => s.investments);
  const { formatFromUSD } = useCurrency();

  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState<TransactionType>('expense');
  const [concept, setConcept] = useState('');
  const [amountUSD, setAmountUSD] = useState(0);
  const [fromInvId, setFromInvId] = useState<number | undefined>(investments[0]?.id);
  const [toInvId, setToInvId] = useState<number | undefined>(investments[1]?.id);

  // Totales
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const totalReinvested = transactions
    .filter((t) => t.type === 'reinvestment')
    .reduce((sum, t) => sum + t.amountUSD, 0);

  const handleSave = () => {
    if (!concept.trim() || amountUSD <= 0) {
      alert('Pon un concepto y un monto válido');
      return;
    }

    addTransaction({
      type,
      concept,
      amountUSD,
      currency: 'USD',
      fromInvestmentId: fromInvId,
      toInvestmentId: type === 'reinvestment' ? toInvId : undefined,
    });

    setConcept('');
    setAmountUSD(0);
    setShowModal(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 pb-24">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 space-y-3 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Bóveda & Finanzas
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Control de gastos y reinversión entre proyectos
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Movimiento
          </button>
        </div>

        {/* RESUMEN RÁPIDO */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-rose-600 mb-1">
              <TrendingDown className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Gastos Totales</span>
            </div>
            <p className="text-lg font-black text-rose-700">{formatFromUSD(totalExpenses)}</p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 text-indigo-600 mb-1">
              <ArrowRightLeft className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase">Reinvertido</span>
            </div>
            <p className="text-lg font-black text-indigo-700">{formatFromUSD(totalReinvested)}</p>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE MOVIMIENTOS */}
      <div className="p-4 space-y-3">
        <h2 className="text-xs font-black text-slate-700 uppercase tracking-wide">
          Historial de Movimientos
        </h2>

        {transactions.map((tx) => {
          const fromInv = investments.find((i) => i.id === tx.fromInvestmentId);
          const toInv = investments.find((i) => i.id === tx.toInvestmentId);

          return (
            <div
              key={tx.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'expense'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-indigo-100 text-indigo-600'
                  }`}
                >
                  {tx.type === 'expense' ? (
                    <Receipt className="w-5 h-5" />
                  ) : (
                    <Repeat className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 truncate">{tx.concept}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {tx.date}
                    {fromInv && ` · Desde ${fromInv.code}`}
                    {toInv && ` ➔ Hacia ${toInv.code}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-xs font-black ${
                    tx.type === 'expense' ? 'text-rose-600' : 'text-indigo-600'
                  }`}
                >
                  {tx.type === 'expense' ? '-' : '+'}${tx.amountUSD} USD
                </span>
                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL REGISTRAR MOVIMIENTO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 space-y-4">
            <h2 className="text-base font-black text-slate-900">Nuevo Movimiento Financiero</h2>

            {/* TOGGLE TIPO */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setType('expense')}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Gasto / Pago
              </button>
              <button
                onClick={() => setType('reinvestment')}
                className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                  type === 'reinvestment' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Reinversión
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Concepto</label>
              <input
                type="text"
                placeholder={type === 'expense' ? 'Ej: Mensajería / Bolsas' : 'Ej: Ganancia P001 a P002'}
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Monto ($ USD)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amountUSD || ''}
                onChange={(e) => setAmountUSD(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
              />
            </div>

            {/* SELECTORES DE INVERSIÓN */}
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Inversión de Origen
              </label>
              <select
                value={fromInvId}
                onChange={(e) => setFromInvId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
              >
                {investments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.code} · {i.name}
                  </option>
                ))}
              </select>
            </div>

            {type === 'reinvestment' && (
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">
                  Inversión Destino
                </label>
                <select
                  value={toInvId}
                  onChange={(e) => setToInvId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold"
                >
                  {investments.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} · {i.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="py-3 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20"
              >
                Guardar Movimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};