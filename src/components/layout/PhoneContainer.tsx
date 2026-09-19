import React from 'react';

interface Props {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const PhoneContainer: React.FC<Props> = ({ children, sidebar }) => {
  return (
    <div className="bg-slate-100 text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* ===== DESKTOP / TABLET (≥ 768px) ===== */}
      <div className="hidden md:flex min-h-screen">
        {sidebar}
        <main className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
          <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
        </main>
      </div>

      {/* ===== MÓVIL UNIVERSAL ===== */}
      <div
        className="md:hidden flex flex-col w-full bg-slate-50"
        style={{
          minHeight: '100dvh',
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </div>
    </div>
  );
};