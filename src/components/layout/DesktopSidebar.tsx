import React from 'react';
import {
  Home,
  Boxes,
  Users,
  ShoppingCart,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { View, BottomTab } from '@/types';

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  view: View;
  tab?: BottomTab;
}



import { Wallet } from 'lucide-react';

import { Settings } from 'lucide-react';

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home, view: 'dashboard', tab: 'inicio' },
  { key: 'investments', label: 'Inversiones', icon: Wallet, view: 'investments' },
  { key: 'inventario', label: 'Inventario', icon: Boxes, view: 'inventario', tab: 'inventario' },
  { key: 'pos', label: 'Nueva Venta', icon: ShoppingCart, view: 'pos', tab: 'inicio' },
  { key: 'clientes', label: 'Clientes', icon: Users, view: 'clientes', tab: 'clientes' },
  { key: 'settings', label: 'Configuración', icon: Settings, view: 'settings' },
];

export const DesktopSidebar: React.FC = () => {
  const currentView = useAppStore((s) => s.currentView);
  const navigateTo = useAppStore((s) => s.navigateTo);

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen sticky top-0 border-r border-slate-800">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">
          V
        </div>
        <div>
          <h1 className="font-bold text-slate-100 text-lg leading-none">VendeFlex</h1>
          <span className="text-xs text-blue-400 font-medium">Pro SaaS</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;

          return (
            <button
              key={item.key}
              onClick={() => navigateTo(item.view, item.tab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* CTA Nueva Venta */}
      <div className="px-4 pb-3">
        <button
          onClick={() => navigateTo('pos', 'inicio')}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Nueva Venta
        </button>
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
              GS
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">GymShop Cuba</p>
              <p className="text-[10px] text-slate-500 truncate">Plan Pro</p>
            </div>
          </div>
          <button className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg flex items-center justify-center transition-colors">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};