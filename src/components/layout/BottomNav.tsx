import React from 'react';
import { Home, Boxes, Users, Wallet } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { BottomTab, View } from '@/types';

interface NavItem {
  key: BottomTab;
  label: string;
  icon: React.ElementType;
  view: View;
}

const navItems: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Home, view: 'dashboard' },
  { key: 'inventario', label: 'Inventario', icon: Boxes, view: 'inventario' },
  { key: 'reportes', label: 'Inversiones', icon: Wallet, view: 'investments' },
  { key: 'clientes', label: 'Clientes', icon: Users, view: 'clientes' },
];

export const BottomNav: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <>
      {/* Espaciador fijo para que el contenido no quede tapado por el nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />

      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center z-30 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
        style={{
          paddingTop: '0.5rem',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigateTo(item.view, item.key)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};