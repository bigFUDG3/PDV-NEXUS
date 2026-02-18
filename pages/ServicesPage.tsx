import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { Card, Button, Input, Modal } from '../components/UI';
import { Search, Plus, Wrench, Edit2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ServicesPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    unit: 'SERV'
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    price: '',
    cost: ''
  });

  useEffect(() => {
    refreshServices();
  }, []);

  const refreshServices = () => {
    setServices(db.getServicesOnly());
  };

  const filtered = services.filter(s => 
    s.name.toLowerCase().includes(filter.toLowerCase()) || 
    s.category.toLowerCase().includes(filter.toLowerCase()) ||
    s.sku.toLowerCase().includes(filter.toLowerCase())
  );

  const handleOpenModal = (service?: Product) => {
    setFormErrors({ name: '', price: '', cost: '' }); // Clear errors
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        sku: service.sku,
        barcode: service.barcode,
        category: service.category,
        price: service.price.toString(),
        cost: service.cost.toString(),
        stock: service.stock.toString(),
        minStock: service.minStock.toString(),
        unit: service.unit
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        sku: `SRV${Math.floor(Math.random() * 10000)}`,
        barcode: '',
        category: '',
        price: '',
        cost: '0',
        stock: '9999', // Default high stock for services
        minStock: '0',
        unit: 'SERV'
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = { name: '', price: '', cost: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Nome do serviço é obrigatório';
      isValid = false;
    }

    const price = parseFloat(formData.price);
    const cost = parseFloat(formData.cost);

    if (isNaN(price) || price < 0) {
      errors.price = 'Preço inválido';
      isValid = false;
    }

    if (isNaN(cost) || cost < 0) {
      errors.cost = 'Custo inválido';
      isValid = false;
    }

    if (!isNaN(price) && !isNaN(cost) && price < cost) {
      errors.price = 'O Preço de Venda não pode ser menor que o Custo';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSave = () => {
    if (!user) return;
    if (!validateForm()) return;

    const productData: Product = {
      id: editingService ? editingService.id : Date.now().toString(),
      type: 'SERVICE',
      name: formData.name,
      sku: formData.sku,
      barcode: formData.barcode,
      category: formData.category || 'Geral',
      price: parseFloat(formData.price) || 0,
      cost: parseFloat(formData.cost) || 0,
      stock: parseInt(formData.stock) || 0,
      minStock: parseInt(formData.minStock) || 0,
      unit: formData.unit
    };

    if (editingService) {
      db.updateProduct(productData, user.id);
    } else {
      db.createProduct(productData, user.id);
    }
    
    refreshServices();
    setIsModalOpen(false);
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
           <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2"/> Novo Serviço</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <Input 
             placeholder="Buscar serviço por nome, código ou categoria..." 
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
                <tr 
                  key={service.id} 
                  onClick={() => handleOpenModal(service)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
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
        title={editingService ? "Editar Serviço" : "Novo Serviço"}
        size="lg"
      >
        <div className="space-y-4">
          <Input 
            label="Nome do Serviço" 
            placeholder="Ex: Formatação, Instalação..." 
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            error={formErrors.name}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="SKU / Código" 
              value={formData.sku}
              onChange={e => setFormData({...formData, sku: e.target.value})}
            />
            <Input 
              label="Código de Barras (Opcional)" 
              value={formData.barcode}
              onChange={e => setFormData({...formData, barcode: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Categoria" 
              placeholder="Ex: Informática" 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            />
             <Input 
              label="Unidade"
              value={formData.unit}
              onChange={e => setFormData({...formData, unit: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Custo Operacional (R$)" 
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00" 
              value={formData.cost}
              onChange={e => setFormData({...formData, cost: e.target.value})}
              error={formErrors.cost}
            />
            <Input 
              label="Preço de Venda (R$)" 
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00" 
              value={formData.price}
              onChange={e => setFormData({...formData, price: e.target.value})}
              error={formErrors.price}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
             <Input 
              label="Estoque Virtual"
              type="number"
              value={formData.stock}
              onChange={e => setFormData({...formData, stock: e.target.value})}
              placeholder="Geralmente 9999"
            />
             <Input 
              label="Alerta Mínimo"
              type="number"
              value={formData.minStock}
              onChange={e => setFormData({...formData, minStock: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
             <Button onClick={handleSave}>
               {editingService ? 'Atualizar Serviço' : 'Salvar Serviço'}
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
