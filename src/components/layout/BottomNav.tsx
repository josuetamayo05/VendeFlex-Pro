import React from 'react';
import { Home, Boxes, Users, BarChart3 } from 'lucide-react';
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
  { key: 'reportes', label: 'Reportes', icon: BarChart3, view: 'reports' }, // ← Apunta a 'reports'
  { key: 'clientes', label: 'Clientes', icon: Users, view: 'clientes' },
];

export const BottomNav: React.FC = () => {
  const activeTab = useAppStore((s) => s.activeTab);
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
      style={{
        paddingTop: '6px',
        paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => navigateTo(item.view, item.key)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all active:scale-95 ${
                isActive ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2.2} />
              <span className="text-[10px] font-bold mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};