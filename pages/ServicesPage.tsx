import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { Card, Button, Input, Modal } from '../components/UI';
import { Search, Plus, Filter, Wrench, Edit2 } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Service Form State
  const [newService, setNewService] = useState({
    name: '',
    category: '',
    price: '',
    duration: '30' // stored in sku or logic for now, keeping simple
  });

  useEffect(() => {
    setServices(db.getServicesOnly());
  }, []);

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) || 
    s.category.toLowerCase().includes(filter.toLowerCase())
  );

  const handleSave = () => {
    const service: Product = {
      id: Date.now().toString(),
      sku: `SRV${Math.floor(Math.random() * 1000)}`,
      barcode: '',
      name: newService.name,
      category: newService.category || 'Geral',
      price: parseFloat(newService.price) || 0,
      cost: 0,
      stock: 9999, // infinite stock for services
      minStock: 0,
      unit: 'SERV',
      type: 'SERVICE'
    };
    db.createProduct(service);
    setServices(db.getServicesOnly());
    setIsModalOpen(false);
    setNewService({ name: '', category: '', price: '', duration: '30' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
             <Wrench className="text-nexus-600" /> Catálogo de Serviços
           </h2>
           <p className="text-gray-500 text-sm">Gerencie os serviços oferecidos e seus preços.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => setIsModalOpen(true)}><Plus size={18} className="mr-2"/> Novo Serviço</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <Input 
             placeholder="Buscar serviço..." 
             className="pl-10"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serviço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(service => (
                <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <Wrench size={18} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</div>
                        <div className="text-xs text-gray-500">Cód: {service.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-bold">R$ {service.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-nexus-600 hover:text-nexus-900 dark:hover:text-nexus-400 mr-3">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    Nenhum serviço encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo Serviço"
      >
        <div className="space-y-4">
          <Input 
            label="Nome do Serviço" 
            placeholder="Ex: Formatação, Instalação..." 
            value={newService.name}
            onChange={e => setNewService({...newService, name: e.target.value})}
          />
          <Input 
            label="Categoria" 
            placeholder="Ex: Informática" 
            value={newService.category}
            onChange={e => setNewService({...newService, category: e.target.value})}
          />
          <Input 
            label="Preço de Venda (R$)" 
            type="number"
            placeholder="0.00" 
            value={newService.price}
            onChange={e => setNewService({...newService, price: e.target.value})}
          />
          <div className="pt-4 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
             <Button onClick={handleSave} disabled={!newService.name || !newService.price}>Salvar Serviço</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
