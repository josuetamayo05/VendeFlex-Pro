// src/features/onboarding/OnboardingScreen.tsx
import { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Store,
  Wallet,
  Package,
  Users,
  BarChart3,
  Check,
  Rocket,
} from 'lucide-react';
import { useConfigStore } from '@/store/useConfigStore';

const steps = [
  {
    icon: Sparkles,
    title: 'Bienvenido a VendeFlex',
    subtitle: 'Tu Excel de negocio, ahora inteligente',
    color: 'from-blue-500 to-indigo-600',
    description:
      'Gestiona tus inversiones, inventario, ventas y clientes desde un solo lugar. Diseñado para vendedores en Cuba y Latinoamérica.',
  },
  {
    icon: Wallet,
    title: 'Registra tus Inversiones',
    subtitle: 'Cada compra o importación es un lote',
    color: 'from-emerald-500 to-teal-600',
    description:
      'Crea una "inversión" por cada compra que hagas (SHEIN, Temu, local, encargo). La app calcula automáticamente costo por unidad, ganancia esperada y ROI.',
  },
  {
    icon: Package,
    title: 'Añade tus Productos',
    subtitle: 'Con precio, costo y stock',
    color: 'from-purple-500 to-pink-600',
    description:
      'Cada producto se asocia a una inversión. La app te muestra qué te queda en stock y cuánto has vendido.',
  },
  {
    icon: Store,
    title: 'Vende desde el POS',
    subtitle: 'Registra ventas en segundos',
    color: 'from-amber-500 to-orange-600',
    description:
      'Selecciona productos, agrega el cliente y elige el método de pago. El stock se descuenta solo y se envía un mensaje de agradecimiento por WhatsApp.',
  },
  {
    icon: Users,
    title: 'Gestiona tus Clientes',
    subtitle: 'Historial y fiados automáticos',
    color: 'from-rose-500 to-red-600',
    description:
      'Cada venta se asocia al cliente. Ve su historial, edítalo, envíale mensajes y controla fiados pendientes.',
  },
  {
    icon: BarChart3,
    title: 'Analiza tu Negocio',
    subtitle: 'Reportes al detalle',
    color: 'from-cyan-500 to-blue-600',
    description:
      'Descubre tus productos más vendidos, tu ganancia neta real, tus formas de pago favoritas y compara inversiones.',
  },
];

export const OnboardingScreen = () => {
  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  const completeOnboarding = useConfigStore((s) => s.completeOnboarding);

  const isFormStep = step === steps.length;
  const totalSteps = steps.length + 1;

  const next = () => {
    if (step < steps.length) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleFinish = () => {
    if (!businessName.trim()) {
      alert('Por favor ingresa el nombre de tu negocio');
      return;
    }
    completeOnboarding({
      businessName: businessName.trim(),
      ownerName: ownerName.trim(),
      whatsappBrand: businessName.trim(),
    });
  };

  const current = steps[step];
  const Icon = current?.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-y-auto">
      {/* Progreso */}
      <div className="p-4 flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i <= step ? 'bg-blue-500' : 'bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        {!isFormStep ? (
          <div className="max-w-md mx-auto w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
              className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${current.color} flex items-center justify-center shadow-2xl`}
            >
              <Icon className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>

            <div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
                Paso {step + 1} de {totalSteps}
              </p>
              <h1 className="text-3xl font-black text-white mb-2">{current.title}</h1>
              <p className="text-base font-bold text-slate-400">{current.subtitle}</p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
              {current.description}
            </p>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                <Rocket className="w-12 h-12 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
                  Último paso
                </p>
                <h1 className="text-3xl font-black text-white mb-2">
                  Configura tu negocio
                </h1>
                <p className="text-sm text-slate-400">
                  Esta información aparecerá en los mensajes de WhatsApp
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Nombre del negocio *
                </label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: JS Concept, Mi Tienda..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1.5 block">
                  Tu nombre (opcional)
                </label>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Ej: María, Carlos..."
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-3.5 text-xs text-blue-200">
              💡 Puedes cambiar estos datos después en <strong>Configuración</strong>.
            </div>
          </div>
        )}
      </div>

      {/* Botones */}
      <div
        className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-950"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {step > 0 && (
          <button
            onClick={prev}
            className="p-3.5 bg-slate-800 text-slate-300 rounded-2xl hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {!isFormStep ? (
          <button
            onClick={next}
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/30"
          >
            {step === 0 ? 'Empezar' : 'Siguiente'}
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/30"
          >
            <Check className="w-5 h-5" />
            Empezar a usar VendeFlex
          </button>
        )}
      </div>
    </div>
  );
};