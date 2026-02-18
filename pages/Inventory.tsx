import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { Card, Button, Input, Badge } from '../components/UI';
import { Search, Plus, Filter, AlertTriangle, Edit2 } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setProducts(db.getProducts());
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.sku.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Estoque & Produtos</h2>
           <p className="text-gray-500 text-sm">Gerencie seu catálogo e níveis de estoque.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline"><Filter size={18} className="mr-2"/> Filtros</Button>
           <Button><Plus size={18} className="mr-2"/> Novo Produto</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="relative mb-4">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
           <Input 
             placeholder="Buscar por nome, SKU ou código..." 
             className="pl-10"
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
           />
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
                          {product.stock <= product.minStock && <AlertTriangle size={14} className="text-red-500" />}
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-nexus-600 hover:text-nexus-900 dark:hover:text-nexus-400 mr-3">
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
