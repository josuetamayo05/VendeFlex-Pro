import React from 'react';
import { Home, Boxes, Users} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { BottomTab, View } from '@/types';

interface NavItem {
  key: BottomTab;
  label: string;
  icon: React.ElementType;
  view: View;
}

import { Wallet } from 'lucide-react';

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
    <div className="bg-white border-t border-slate-100 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex justify-around items-center z-20 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.key;

        return (
          <button
            key={item.key}
            onClick={() => navigateTo(item.view, item.key)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-bold">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};