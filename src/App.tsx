// src/App.tsx
import { useEffect } from 'react';
import { PhoneContainer } from '@/components/layout/PhoneContainer';
import { BottomNav } from '@/components/layout/BottomNav';
import { DesktopSidebar } from '@/components/layout/DesktopSidebar';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { InventoryScreen } from '@/features/inventory/InventoryScreen';
import { CreateProductScreen } from '@/features/create-product/CreateProductScreen';
import { POSScreen } from '@/features/pos/POSScreen';
import { ClientsScreen } from '@/features/clients/ClientsScreen';
import { InvestmentsScreen } from '@/features/investments/InvestmentsScreen';
import { InvestmentDetailScreen } from '@/features/investments/InvestmentDetailScreen';
import { CreateInvestmentScreen } from '@/features/investments/CreateInvestmentScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { FinanceScreen } from '@/features/finance/FinanceScreen';
import { ReportsScreen } from '@/features/reports/ReportsScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';

import { useAppStore } from '@/store/useAppStore';
import { useConfigStore } from '@/store/useConfigStore';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);
  const onboardingCompleted = useConfigStore((s) => s.config.onboardingCompleted);

  // 🚀 ALGORITMO DE RESET DE SCROLL AL CAMBIAR DE PESTAÑA
  useEffect(() => {
    // Ejecutamos en el siguiente frame para asegurar que la nueva vista ya se montó
    requestAnimationFrame(() => {
      // 1. Scroll del window / documento (móvil sin contenedor propio)
      try {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch {
        // ignorar
      }

      // 2. Contenedores identificados por ID
      const desktopArea = document.getElementById('desktop-scroll-area');
      const mobileArea = document.getElementById('mobile-scroll-area');
      if (desktopArea) desktopArea.scrollTop = 0;
      if (mobileArea) mobileArea.scrollTop = 0;

      // 3. Cualquier otro elemento con overflow-y-auto o overflow-y-scroll
      const scrollables = document.querySelectorAll<HTMLElement>(
        '.overflow-y-auto, .overflow-y-scroll'
      );
      scrollables.forEach((el) => {
        el.scrollTop = 0;
      });
    });
  }, [currentView]);

  if (!onboardingCompleted) {
    return <OnboardingScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardScreen />;
      case 'inventario': return <InventoryScreen />;
      case 'crear_producto': return <CreateProductScreen />;
      case 'pos': return <POSScreen />;
      case 'clientes': return <ClientsScreen />;
      case 'investments': return <InvestmentsScreen />;
      case 'investment_detail': return <InvestmentDetailScreen />;
      case 'create_investment': return <CreateInvestmentScreen />;
      case 'reports': return <ReportsScreen />;
      case 'settings': return <SettingsScreen />;
      case 'finance': return <FinanceScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <PhoneContainer sidebar={<DesktopSidebar />}>
      {renderView()}
      <BottomNav />
    </PhoneContainer>
  );
}