import React, { useEffect, useState } from 'react';
import { Share, Plus, X, Smartphone } from 'lucide-react';

const STORAGE_KEY = 'vendeflex-install-tip-dismissed';

function isIos() {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isInStandaloneMode() {
  // true cuando ya está instalada como PWA
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export const InstallTip: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed && isIos() && !isInStandaloneMode()) {
      // Mostrar después de 2 segundos
      const t = setTimeout(() => setVisible(true), 2000);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:left-auto md:right-6 md:w-80 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 relative">
        <button
          onClick={dismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg hover:bg-slate-800 text-slate-400"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-black">Instala VendeFlex</p>
            <p className="text-[11px] text-slate-300 font-medium mt-1 leading-relaxed">
              Para usarla como app en tu iPhone:
            </p>
            <ol className="mt-2 space-y-1.5 text-[11px] text-slate-200 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-black">1</span>
                Toca <Share className="w-3.5 h-3.5 inline text-blue-400" /> <strong>Compartir</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-black">2</span>
                Elige <Plus className="w-3.5 h-3.5 inline text-blue-400" /> <strong>Añadir a pantalla de inicio</strong>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-[10px] font-black">3</span>
                Confirma y listo ✨
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};