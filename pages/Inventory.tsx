import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product, AuditLog } from '../types';
import { Card, Button, Input, Badge, Modal } from '../components/UI';
import { Search, Plus, Filter, AlertTriangle, Edit2, Trash2, X, History, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productLogs, setProductLogs] = useState<AuditLog[]>([]);
  const [selectedProductForHistory, setSelectedProductForHistory] = useState<Product | null>(null);
  
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
    unit: 'UN'
  });

  const [formErrors, setFormErrors] = useState({
    name: '',
    price: '',
    cost: '',
    stock: ''
  });

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(db.getProducts());
  };

  const categories = ['Todas', ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products.filter(p => {
    const matchesText = p.name.toLowerCase().includes(filter.toLowerCase()) || 
                        p.sku.toLowerCase().includes(filter.toLowerCase()) ||
                        p.barcode.includes(filter);
    const matchesCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
    const matchesLowStock = !showLowStockOnly || (p.type === 'PRODUCT' && p.stock <= p.minStock);
    
    return matchesText && matchesCategory && matchesLowStock;
  });

  const handleOpenModal = (product?: Product) => {
    setFormErrors({ name: '', price: '', cost: '', stock: '' }); // Clear errors
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        category: product.category,
        price: product.price.toString(),
        cost: product.cost.toString(),
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        unit: product.unit
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: `PROD${Math.floor(Math.random() * 10000)}`,
        barcode: '',
        category: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '5',
        unit: 'UN'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenHistory = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProductForHistory(product);
    setProductLogs(db.getProductLogs(product.id));
    setIsHistoryModalOpen(true);
  };

  const validateForm = () => {
    const errors = { name: '', price: '', cost: '', stock: '' };
    let isValid = true;

    if (!formData.name.trim()) {
      errors.name = 'Nome do produto é obrigatório';
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
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      type: 'PRODUCT', // Inventory page mainly for products
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

    if (editingProduct) {
      db.updateProduct(productData, user.id);
    } else {
      db.createProduct(productData, user.id);
    }
    
    refreshProducts();
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      db.deleteProduct(id, user?.id);
      refreshProducts();
    }
  };

  const getUserName = (id: string) => {
    const u = db.getUserById(id);
    return u ? u.name : 'Sistema';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estoque & Produtos</h2>
           <p className="text-gray-500 text-sm">Gerencie seu catálogo e níveis de estoque.</p>
        </div>
        <div className="flex gap-2">
           <Button onClick={() => handleOpenModal()}><Plus size={18} className="mr-2"/> Novo Produto</Button>
        </div>
      </div>

      <Card className="p-4 space-y-4">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-1/3">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <Input 
               placeholder="Buscar por nome, SKU ou código..." 
               className="pl-10"
               value={filter}
               onChange={(e) => setFilter(e.target.value)}
             />
           </div>
           
           <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <select 
               className="rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 pl-3 pr-10 text-sm focus:border-nexus-500 focus:outline-none focus:ring-1 focus:ring-nexus-500"
               value={selectedCategory}
               onChange={(e) => setSelectedCategory(e.target.value)}
             >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>

             <button
               onClick={() => setShowLowStockOnly(!showLowStockOnly)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                 showLowStockOnly 
                   ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' 
                   : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
               }`}
             >
               <AlertTriangle size={16} />
               <span>Estoque Baixo</span>
             </button>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 font-mono">
                         {product.sku.substring(0,3)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-xs text-gray-500">SKU: {product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">R$ {product.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Custo: R$ {product.cost.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.type === 'SERVICE' ? (
                       <Badge variant="info">Serviço</Badge>
                    ) : (
                       <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${product.stock <= product.minStock ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {product.stock} {product.unit}
                          </span>
                          {product.stock <= product.minStock && <AlertTriangle size={14} className="text-red-500 animate-pulse" />}
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={(e) => handleOpenHistory(product, e)}
                      className="text-gray-500 hover:text-nexus-600 mr-3"
                      title="Histórico"
                    >
                      <History size={18} />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(product)} 
                      className="text-nexus-600 hover:text-nexus-900 dark:hover:text-nexus-400 mr-3"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(product.id, e)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      Nenhum produto encontrado com os filtros atuais.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Editar Produto" : "Novo Produto"}
        size="lg"
      >
         <div className="space-y-4">
            <Input 
              label="Nome do Produto"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              error={formErrors.name}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="SKU"
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value})}
              />
              <Input 
                label="Código de Barras"
                value={formData.barcode}
                onChange={e => setFormData({...formData, barcode: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input 
                label="Categoria"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                placeholder="Ex: Bebidas"
              />
               <Input 
                label="Unidade"
                value={formData.unit}
                onChange={e => setFormData({...formData, unit: e.target.value})}
                placeholder="UN, KG, L..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <Input 
                label="Preço de Custo"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: e.target.value})}
                error={formErrors.cost}
              />
               <Input 
                label="Preço de Venda"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                error={formErrors.price}
              />
            </div>
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
               <Input 
                label="Estoque Atual"
                type="number"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
               <Input 
                label="Estoque Mínimo (Alerta)"
                type="number"
                value={formData.minStock}
                onChange={e => setFormData({...formData, minStock: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
               <Button onClick={handleSave}>Salvar Produto</Button>
            </div>
         </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Histórico de Movimentação: ${selectedProductForHistory?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          {productLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhum histórico encontrado para este produto.</p>
          ) : (
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6 py-2">
              {productLogs.map((log) => (
                <div key={log.id} className="relative pl-6">
                   <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${log.action.includes('ADD') ? 'bg-green-500' : log.action.includes('REMOVE') ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                         {new Date(log.timestamp).toLocaleString()}
                       </span>
                       <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{log.action}</h4>
                       <p className="text-sm text-gray-600 dark:text-gray-300">{log.details}</p>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                       <User size={12} />
                       {getUserName(log.userId)}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-4">
             <Button variant="secondary" onClick={() => setIsHistoryModalOpen(false)}>Fechar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
