import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, MoreVertical, Smartphone, X, CheckCircle2 } from 'lucide-react';

// Tipos oficiales para el evento de instalación de PWA y Safari
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Funciones auxiliares fuera del componente (evitan setState innecesarios)
const checkIsInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as NavigatorWithStandalone;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

const checkIsIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
};

export const InstallModal = ({ isOpen, onClose }: InstallModalProps) => {
  // Inicialización directa (elimina el warning react-hooks/set-state-in-effect)
  const [isIOS] = useState<boolean>(checkIsIOS);
  const [isInstalled] = useState<boolean>(checkIsInstalled);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClickAndroid = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-800 text-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl animate-in slide-in-from-bottom-6 duration-300"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Instalar VendeFlex</h3>
              <p className="text-xs text-slate-400">Úsala como una app nativa, sin internet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Si ya está instalada */}
        {isInstalled ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-emerald-300 text-sm">¡Ya tienes instalada la app!</p>
            <p className="text-xs text-slate-400">Estás disfrutando de la experiencia completa sin barras de navegador.</p>
          </div>
        ) : (
          <>
            {/* GUÍA PARA IPHONE (iOS) */}
            {isIOS ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  ⚠️ Asegúrate de estar usando el navegador <strong>Safari</strong> de Apple.
                </p>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shrink-0">1</div>
                    <p className="text-xs text-slate-200">
                      Toca el botón <strong>Compartir</strong> en la barra inferior de Safari.
                    </p>
                    <Share className="w-5 h-5 text-blue-400 shrink-0 ml-auto" />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
                    <p className="text-xs text-slate-200">
                      Baja en el menú y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
                    </p>
                    <PlusSquare className="w-5 h-5 text-emerald-400 shrink-0 ml-auto" />
                  </div>

                  <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shrink-0">3</div>
                    <p className="text-xs text-slate-200">
                      Toca en <strong>"Agregar"</strong> arriba a la derecha ¡y listo!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* GUÍA PARA ANDROID / CHROME */
              <div className="space-y-4">
                {deferredPrompt ? (
                  <button
                    onClick={handleInstallClickAndroid}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98]"
                  >
                    <Smartphone className="w-5 h-5" /> Instalar Aplicación Ahora
                  </button>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shrink-0">1</div>
                      <p className="text-xs text-slate-200">
                        Toca el botón de <strong>3 puntos</strong> arriba a la derecha en Chrome.
                      </p>
                      <MoreVertical className="w-5 h-5 text-slate-400 shrink-0 ml-auto" />
                    </div>

                    <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/50">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xs shrink-0">2</div>
                      <p className="text-xs text-slate-200">
                        Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla principal"</strong>.
                      </p>
                      <Download className="w-5 h-5 text-emerald-400 shrink-0 ml-auto" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl text-xs transition-colors"
        >
          Entendido / Cerrar
        </button>
      </div>
    </div>
  );
};