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
import { FinanceScreen } from '@/features/finance/FinanceScreen'; // ← IMPORTADO
import { useAppStore } from '@/store/useAppStore';
import { useEffect } from 'react';
import { pullFromSupabase, subscribeToRealtime } from '@/lib/supabaseSync';
import { ReportsScreen } from '@/features/reports/ReportsScreen';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);

  useEffect(() => {
    // Al abrir la app, descarga lo último de Supabase
    pullFromSupabase();

    // Escucha cambios en tiempo real
    const unsubscribe = subscribeToRealtime();
    return () => {
      unsubscribe();
    };
  }, []);

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
      case 'finance': return <FinanceScreen />; // ← RENDERIZADO
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