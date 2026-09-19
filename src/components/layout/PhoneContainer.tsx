import React from 'react';

interface Props {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const PhoneContainer: React.FC<Props> = ({ children, sidebar }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      {/* ===== DESKTOP / TABLET LAYOUT ===== */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar desktop */}
        {sidebar}

        {/* Contenido principal desktop */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-6xl mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* ===== MOBILE LAYOUT (mockup teléfono) ===== */}
      <div className="md:hidden min-h-screen min-h-[100dvh] flex justify-center items-start">
        <div className="w-full max-w-md bg-slate-50 min-h-screen min-h-[100dvh] shadow-2xl overflow-hidden flex flex-col border-x border-slate-200 relative pt-[env(safe-area-inset-top)]">
          {children}
        </div>
      </div>
    </div>
  );
};