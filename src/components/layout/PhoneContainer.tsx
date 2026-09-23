// src/components/layout/PhoneContainer.tsx
import React from 'react';

interface Props {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const PhoneContainer: React.FC<Props> = ({ children, sidebar }) => {
  return (
    <div className="bg-slate-100 text-slate-800 antialiased selection:bg-blue-500 selection:text-white min-h-screen">
      {/* ===== DESKTOP / TABLET (≥ 768px) ===== */}
      <div className="hidden md:flex h-screen overflow-hidden">
        {sidebar}
        <main
          id="app-scroll-container-desktop"
          className="flex-1 bg-slate-50 h-full overflow-y-auto"
        >
          <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* ===== MÓVIL UNIVERSAL (Viewport de App Nativa 100dvh) ===== */}
      <div className="md:hidden flex flex-col h-[100dvh] w-full bg-slate-50 overflow-hidden">
        <main
          id="app-scroll-container-mobile"
          className="flex-1 w-full overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
};