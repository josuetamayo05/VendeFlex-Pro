import { supabase, isSupabaseConfigured } from './supabase';
import { useInvestmentsStore } from '@/store/useInvestmentsStore';
import { useProductsStore } from '@/store/useProductsStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useClientsStore } from '@/store/useClientsStore';
import { useFinanceStore } from '@/store/useFinanceStore';

/**
 * Carga todos los datos desde Supabase a la app
 */
export const pullFromSupabase = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;

  try {
    console.log('☁️ Descargando datos desde Supabase...');

    const [
      { data: investments },
      { data: products },
      { data: sales },
      { data: clients },
      { data: transactions },
    ] = await Promise.all([
      supabase.from('investments').select('*'),
      supabase.from('products').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('clients').select('*'),
      supabase.from('transactions').select('*'),
    ]);

    if (investments && investments.length > 0) {
      useInvestmentsStore.setState({ investments: investments as any });
    }
    if (products && products.length > 0) {
      useProductsStore.setState({ products: products as any });
    }
    if (sales && sales.length > 0) {
      useSalesStore.setState({ sales: sales as any });
    }
    if (clients && clients.length > 0) {
      useClientsStore.setState({ clients: clients as any });
    }
    if (transactions && transactions.length > 0) {
      useFinanceStore.setState({ transactions: transactions as any });
    }

    console.log('✅ Datos sincronizados desde la nube');
    return true;
  } catch (err) {
    console.error('❌ Error al sincronizar con Supabase:', err);
    return false;
  }
};

/**
 * Empuja todo el estado local actual a Supabase (Upsert)
 */
export const pushToSupabase = async (): Promise<{ success: boolean; message: string }> => {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Faltan las variables de entorno de Supabase (VITE_SUPABASE_URL)' };
  }

  try {
    const investments = useInvestmentsStore.getState().investments;
    const products = useProductsStore.getState().products;
    const sales = useSalesStore.getState().sales;
    const clients = useClientsStore.getState().clients;
    const transactions = useFinanceStore.getState().transactions;

    const results = await Promise.all([
      investments.length > 0 ? supabase.from('investments').upsert(investments) : Promise.resolve({ error: null }),
      products.length > 0 ? supabase.from('products').upsert(products) : Promise.resolve({ error: null }),
      sales.length > 0 ? supabase.from('sales').upsert(sales) : Promise.resolve({ error: null }),
      clients.length > 0 ? supabase.from('clients').upsert(clients) : Promise.resolve({ error: null }),
      transactions.length > 0 ? supabase.from('transactions').upsert(transactions) : Promise.resolve({ error: null }),
    ]);

    const error = results.find((r) => r.error)?.error;
    if (error) {
      console.error('Error Supabase:', error);
      return { success: false, message: `Error Supabase: ${error.message}` };
    }

    return { success: true, message: '¡Datos subidos a Supabase con éxito!' };
  } catch (err: any) {
    console.error('Error inesperado:', err);
    return { success: false, message: err.message || 'Error inesperado al conectar' };
  }
};

/**
 * Escucha cambios en Realtime (WebSockets)
 * Cuando el iPhone registra una venta, la Laptop recibe el evento y actualiza la pantalla al instante.
 */
export const subscribeToRealtime = () => {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel('vendeflex-realtime')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      console.log('⚡ Cambio detectado en la nube! Actualizando local...');
      pullFromSupabase();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};