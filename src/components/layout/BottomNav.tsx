// src/components/layout/BottomNav.tsx
import React, { useState } from 'react';
import {
  Home,
  Boxes,
  Users,
  BarChart3,
  MoreHorizontal,
  Wallet,
  Landmark,
  Settings,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { BottomTab, View } from '@/types';

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  view?: View;
  tab?: BottomTab;
  action?: 'more';
}

const mainNavItems: NavItem[] = [
  { key: 'inicio', label: 'Inicio', icon: Home, view: 'dashboard', tab: 'inicio' },
  { key: 'inventario', label: 'Inventario', icon: Boxes, view: 'inventario', tab: 'inventario' },
  { key: 'reportes', label: 'Reportes', icon: BarChart3, view: 'reports', tab: 'reportes' },
  { key: 'clientes', label: 'Clientes', icon: Users, view: 'clientes', tab: 'clientes' },
  { key: 'more', label: 'Más', icon: MoreHorizontal, action: 'more' },
];

const moreItems: NavItem[] = [
  { key: 'investments', label: 'Inversiones', icon: Wallet, view: 'investments' },
  { key: 'finance', label: 'Bóveda / Finanzas', icon: Landmark, view: 'finance' },
  { key: 'settings', label: 'Configuración', icon: Settings, view: 'settings' },
];

export const BottomNav: React.FC = () => {
  const currentView = useAppStore((s) => s.currentView);
  const activeTab = useAppStore((s) => s.activeTab);
  const navigateTo = useAppStore((s) => s.navigateTo);
  const [showMore, setShowMore] = useState(false);

  const isMoreActive =
    currentView === 'investments' ||
    currentView === 'investment_detail' ||
    currentView === 'create_investment' ||
    currentView === 'finance' ||
    currentView === 'settings';

  const handleNav = (item: NavItem) => {
    if (item.action === 'more') {
      setShowMore(true);
      return;
    }
    if (item.view) {
      navigateTo(item.view, item.tab);
      setShowMore(false);
    }
  };

  return (
    <>
      {/* ===== BOTTOM NAV ===== */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        style={{
          paddingTop: '6px',
          paddingBottom: 'max(6px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex justify-around items-center max-w-md mx-auto px-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.action === 'more'
                ? isMoreActive || showMore
                : activeTab === item.tab || currentView === item.view;

            return (
              <button
                key={item.key}
                onClick={() => handleNav(item)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-95 min-w-0 ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
                <span className="text-[9px] font-bold mt-0.5 truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ===== SHEET "MÁS" ===== */}
      {showMore && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setShowMore(false)}
          />

          {/* Bottom sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-5 pb-3">
              <h3 className="text-sm font-black text-slate-800">Más opciones</h3>
              <button
                onClick={() => setShowMore(false)}
                className="p-2 rounded-xl bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 pb-8 space-y-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.view;

                return (
                  <button
                    key={item.key}
                    onClick={() => handleNav(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-white/20' : 'bg-white border border-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};