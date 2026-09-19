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
import { useAppStore } from '@/store/useAppStore';
import { InstallTip } from '@/components/pwa/InstallTip';

export default function App() {
  const currentView = useAppStore((s) => s.currentView);

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
      case 'settings': return <SettingsScreen />;
      default: return <DashboardScreen />;
    }
  };

  return (
    <PhoneContainer sidebar={<DesktopSidebar />}>
      {renderView()}
      <BottomNav />
      <InstallTip />
    </PhoneContainer>
  );
}