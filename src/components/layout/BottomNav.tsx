// src/components/layout/BottomNav.tsx
import React from 'react';
import { Home, Wallet, Boxes, Users, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { BottomTab, View } from '@/types';

interface NavItem {
  key: BottomTab | 'config' | 'inversiones';
  label: string;
  icon: React.ElementType;
  view: View;
  tab?: BottomTab;
}

const navItems: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Home, view: 'dashboard', tab: 'inicio' },
  { key: 'inversiones', label: 'Inversiones', icon: Wallet, view: 'investments' },
  { key: 'inventario', label: 'Inventario', icon: Boxes, view: 'inventario', tab: 'inventario' },
  { key: 'clientes', label: 'Clientes', icon: Users, view: 'clientes', tab: 'clientes' },
  { key: 'config', label: 'Ajustes', icon: Settings, view: 'settings' },
];

export const BottomNav: React.FC = () => {
  const currentView = useAppStore((s) => s.currentView);
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      style={{
        paddingTop: '6px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;

          return (
            <button
              key={item.key}
              onClick={() => navigateTo(item.view, item.tab)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 min-w-0 ${
                isActive ? 'text-blue-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.8} />
              <span className="text-[9px] mt-0.5 truncate max-w-full">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};