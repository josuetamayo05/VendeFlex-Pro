import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Database,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { exportBackup, importBackup, resetAllData, clearAllData } from '@/lib/backup';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { importFromGymShopExcel } from '@/lib/excelImporter';
import { FileSpreadsheet } from 'lucide-react';

export const SettingsScreen: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const investmentsCount = useInvestmentsStore((s) => s.investments.length);
  const productsCount = useProductsStore((s) => s.products.length);
  const salesCount = useSalesStore((s) => s.sales.length);
  const clientsCount = useClientsStore((s) => s.clients.length);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleExport = () => {
    try {
      exportBackup();
      showMessage('success', 'Backup descargado con éxito');
    } catch {
      showMessage('error', 'Error al descargar backup');
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importBackup(file);
      showMessage('success', 'Backup restaurado con éxito');
    } catch {
      showMessage('error', 'Error al importar backup');
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleReset = () => {
    if (confirm('¿Restaurar datos de ejemplo? Esto reemplazará todos tus datos actuales.')) {
      resetAllData();
      showMessage('success', 'Datos restaurados a valores de ejemplo');
    }
  };

  const handleClearAll = () => {
    if (
      confirm(
        '⚠️ ATENCIÓN: Vas a borrar TODOS tus datos permanentemente.\n\n' +
          'Se recomienda descargar un backup ANTES de continuar.\n\n' +
          '¿Estás seguro?'
      )
    ) {
      if (confirm('Última confirmación: ¿Borrar TODO?')) {
        clearAllData();
        showMessage('success', 'Todos los datos han sido borrados');
      }
    }
  };

  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleExcelChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const res = await importFromGymShopExcel(file);
    if (res.success) {
        showMessage('success', '¡Datos de tu Excel importados con éxito!');
    } else {
        showMessage('error', res.message);
    }

    if (excelInputRef.current) excelInputRef.current.value = '';
    };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto pb-24 md:pb-6">
      {/* HEADER */}
      <div className="p-5 bg-white border-b border-slate-100 sticky top-0 z-10">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configuración</h1>
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          Backup, restauración y datos
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* MENSAJE */}
        {message && (
          <div
            className={`p-3 rounded-2xl flex items-center gap-2 text-xs font-bold ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {message.text}
          </div>
        )}

        {/* ESTADO */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900">Estado actual</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <StatItem label="Inversiones" value={investmentsCount} color="blue" />
            <StatItem label="Productos" value={productsCount} color="indigo" />
            <StatItem label="Ventas" value={salesCount} color="emerald" />
            <StatItem label="Clientes" value={clientsCount} color="purple" />
          </div>
        </div>

        {/* BACKUP */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">Backup y Restauración</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Guarda tus datos en un archivo JSON o restaura desde uno anterior
            </p>
          </div>

          <button
            onClick={handleExport}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all text-xs"
          >
            <Download className="w-4 h-4" />
            Descargar Backup (.json)
          </button>

          <button
            onClick={handleImportClick}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all text-xs"
          >
            <Upload className="w-4 h-4" />
            Importar Backup
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => excelInputRef.current?.click()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:scale-[0.98] transition-all text-xs"
            >
            <FileSpreadsheet className="w-4 h-4" />
            Cargar datos desde mi Excel (.xlsx)
            </button>

            <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx, .xls"
            onChange={handleExcelChange}
            className="hidden"
            />
        </div>

        {/* DATOS DE EJEMPLO */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">Restablecer</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              Vuelve a los datos de ejemplo si algo se rompió
            </p>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs"
          >
            <RotateCcw className="w-4 h-4" />
            Restaurar datos de ejemplo
          </button>
        </div>

        {/* ZONA DE PELIGRO */}
        <div className="bg-rose-50 rounded-2xl p-4 border-2 border-rose-200 space-y-3">
          <div>
            <h2 className="text-sm font-black text-rose-700">⚠️ Zona de peligro</h2>
            <p className="text-[10px] text-rose-500 font-medium mt-0.5">
              Estas acciones NO se pueden deshacer
            </p>
          </div>

          <button
            onClick={handleClearAll}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-xs"
          >
            <Trash2 className="w-4 h-4" />
            Borrar TODOS los datos
          </button>
        </div>

        {/* INFO */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-blue-900">
              Tus datos se guardan localmente
            </p>
            <p className="text-[10px] text-blue-700 font-medium mt-0.5">
              Se conservan en este navegador aunque cierres la app. Haz backup regularmente para no
              perderlos si limpias el navegador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem: React.FC<{
  label: string;
  value: number;
  color: 'blue' | 'indigo' | 'emerald' | 'purple';
}> = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    purple: 'bg-purple-50 text-purple-700',
  };

  return (
    <div className={`rounded-xl p-2.5 ${colors[color]}`}>
      <p className="text-[9px] font-bold uppercase opacity-70">{label}</p>
      <p className="text-lg font-black mt-0.5">{value}</p>
    </div>
  );
};