// src/features/clients/components/SalesHistory.tsx
import { Trash2, ReceiptText } from 'lucide-react';
import { useSalesStore } from '@/store/useSalesStore';
import { useCurrency } from '@/hooks/useCurrency';

export const SalesHistory = () => {
  const sales = useSalesStore((s) => s.sales);
  const deleteSale = useSalesStore((s) => s.deleteSale);
  const { formatFromUSD } = useCurrency();

  const handleDelete = (id: number, date: string) => {
    if (confirm(`¿Eliminar la venta del ${new Date(date).toLocaleDateString()}? El stock volverá al inventario automáticamente.`)) {
      deleteSale(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-6 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-blue-600" /> Historial de Ventas (Excel)
        </h3>
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
              <th className="p-3 font-bold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                  {new Date(sale.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </td>
                <td className="p-3 font-bold text-slate-800">
                  {sale.clientName || sale.clientPhone || 'Anónimo'}
                </td>
                <td className="p-3 text-slate-500">
                  {sale.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                </td>
                <td className="p-3 font-medium text-slate-600 whitespace-nowrap">
                  {sale.paymentMethod}
                </td>
                <td className="p-3 font-black text-emerald-600 text-right">
                  {formatFromUSD(sale.totalUSD)}
                </td>
                <td className="p-3 text-center">
                  <button 
                    onClick={() => handleDelete(sale.id, sale.date)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {sales.length === 0 && (
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
  );
};