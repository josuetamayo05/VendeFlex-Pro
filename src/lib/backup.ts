import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';

export interface BackupData {
  version: string;
  exportedAt: string;
  investments: unknown;
  products: unknown;
  sales: unknown;
  clients: unknown;
}

export const exportBackup = (): void => {
  const data: BackupData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    investments: useInvestmentsStore.getState().investments,
    products: useProductsStore.getState().products,
    sales: useSalesStore.getState().sales,
    clients: useClientsStore.getState().clients,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `vendeflex-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importBackup = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: BackupData = JSON.parse(content);

        if (!data.version || !data.investments) {
          throw new Error('Archivo de backup inválido');
        }

        // Cargar cada store
        useInvestmentsStore.setState({
          investments: data.investments as never,
        });
        useProductsStore.setState({
          products: data.products as never,
        });
        useSalesStore.setState({
          sales: data.sales as never,
        });
        useClientsStore.setState({
          clients: data.clients as never,
        });

        resolve();
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Error al leer archivo'));
    reader.readAsText(file);
  });
};

export const resetAllData = (): void => {
  useInvestmentsStore.getState().resetToMocks();
  useProductsStore.getState().resetToMocks();
  useSalesStore.getState().resetSales();
  useClientsStore.getState().resetToMocks();

  // Limpia localStorage
  localStorage.removeItem('vendeflex-investments');
  localStorage.removeItem('vendeflex-products');
  localStorage.removeItem('vendeflex-sales');
  localStorage.removeItem('vendeflex-clients');
};

export const clearAllData = (): void => {
  useInvestmentsStore.setState({ investments: [], selectedInvestmentId: null });
  useProductsStore.setState({ products: [] });
  useSalesStore.setState({ sales: [] });
  useClientsStore.setState({ clients: [], selectedClientId: null });
};