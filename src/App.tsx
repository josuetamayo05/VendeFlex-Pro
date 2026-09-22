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
    // 1. Resetea el scroll de la ventana principal
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 2. Si tu contenedor interno o body tiene overflow-y-auto, también los resetea:
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 3. Si PhoneContainer tiene scroll interno, busca el elemento contenedor
    const scrollableContainer = document.querySelector('.phone-scroll-container');
    if (scrollableContainer) {
      scrollableContainer.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [currentView]); // 👈 Se ejecuta CADA VEZ que currentView cambia

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