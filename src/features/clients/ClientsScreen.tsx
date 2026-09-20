// src/features/clients/ClientsScreen.tsx
import { useState } from 'react';
import { Users, ReceiptText, Plus, Search } from 'lucide-react';
import { useClientsStore } from '@/store/useClientsStore';
import { ClientCard } from './components/ClientCard';
import { ClientDetail } from './components/ClientDetail';
import { SalesHistory } from './components/SalesHistory';

export const ClientsScreen = () => {
  const [activeSubTab, setActiveSubTab] = useState<'clients' | 'sales'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  
  const clients = useClientsStore((s) => s.clients);
  const selectedClientId = useClientsStore((s) => s.selectedClientId);
  const setSelectedClient = useClientsStore((s) => s.setSelectedClient);
  const addClient = useClientsStore((s) => s.addClient);

  // Obtener el objeto completo del cliente seleccionado
  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Si hay un cliente seleccionado, pasarle props exigidos (client y onClose)
  if (selectedClientId !== null && selectedClient) {
    return (
      <ClientDetail
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
      />
    );
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm))
  );

  const handleCreateNewClient = () => {
    const name = prompt('Nombre del nuevo cliente:');
    if (!name) return;
    const phone = prompt('Teléfono (opcional):') || '';
    const newId = addClient({ name, phone, tags: ['Nuevo'] });
    setSelectedClient(newId);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen pb-20">
      {/* HEADER PRINCIPAL */}
      <div className="p-4 bg-white border-b border-slate-200 sticky top-0 z-10 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">Clientes & Ventas</h1>
            <p className="text-xs text-slate-400">Gestión de clientes y control de ventas</p>
          </div>
          {activeSubTab === 'clients' && (
            <button
              onClick={handleCreateNewClient}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          )}
        </div>

        {/* PESTAÑAS (SUB-TABS) */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('clients')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'clients'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Clientes ({clients.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeSubTab === 'sales'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ReceiptText className="w-4 h-4" /> Control de Ventas
          </button>
        </div>

        {/* BUSCADOR DE CLIENTES (SÓLO EN PESTAÑA CLIENTES) */}
        {activeSubTab === 'clients' && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="p-4">
        {activeSubTab === 'clients' ? (
          <div>
            {filteredClients.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 mt-2">
                <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400">No se encontraron clientes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onClick={() => setSelectedClient(client.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* TABLA DE CONTROL DE VENTAS (EXCEL) */
          <SalesHistory />
        )}
      </div>
    </div>
  );
};