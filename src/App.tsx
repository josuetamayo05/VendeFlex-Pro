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

  // 🚀 RESET DE SCROLL DEFINITIVO Y UNIFICADO
  useEffect(() => {
    const resetScroll = () => {
      // 1. Resetea el contenedor de móvil
      const mobileEl = document.getElementById('app-scroll-container-mobile');
      if (mobileEl) mobileEl.scrollTop = 0;

      // 2. Resetea el contenedor de desktop
      const desktopEl = document.getElementById('app-scroll-container-desktop');
      if (desktopEl) desktopEl.scrollTop = 0;

      // 3. Resetea la ventana global por respaldo
      window.scrollTo(0, 0);
    };

    resetScroll();
    // Ejecutar tras renderizado de React
    const timer = setTimeout(resetScroll, 10);
    return () => clearTimeout(timer);
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