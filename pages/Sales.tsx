import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Sale } from '../types';
import { Card, Badge, Modal, Button } from '../components/UI';
import { Eye, Printer, XCircle } from 'lucide-react';

export const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    setSales(db.getSales());
  }, []);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('pt-BR');
  };

  const getMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      'CASH': 'Dinheiro',
      'CREDIT_CARD': 'Crédito',
      'DEBIT_CARD': 'Débito',
      'PIX': 'PIX',
      'TRANSFER': 'Ted/Doc'
    };
    return map[method] || method;
  };

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Histórico de Vendas</h2>
       </div>

       <Card className="overflow-hidden">
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
               <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID / Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
               </thead>
               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                 {sales.map(sale => (
                   <tr key={sale.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                     <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">#{sale.id.slice(-6)}</div>
                        <div className="text-xs text-gray-500">{formatDate(sale.timestamp)}</div>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {sale.customerId ? 'Cliente Cadastrado' : 'Consumidor Final'}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       {getMethodLabel(sale.paymentMethod)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                       R$ {sale.total.toFixed(2)}
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <Badge variant={sale.status === 'COMPLETED' ? 'success' : 'danger'}>
                         {sale.status === 'COMPLETED' ? 'Concluído' : 'Cancelado'}
                       </Badge>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button 
                        onClick={() => setSelectedSale(sale)}
                        className="text-nexus-600 hover:text-nexus-900 mr-3"
                       >
                         <Eye size={18} />
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </div>
       </Card>

       {/* Sale Detail Modal */}
       <Modal 
         isOpen={!!selectedSale} 
         onClose={() => setSelectedSale(null)} 
         title={`Venda #${selectedSale?.id.slice(-6)}`}
         size="lg"
       >
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div>
                   <p className="text-gray-500">Data/Hora</p>
                   <p className="font-medium">{formatDate(selectedSale.timestamp)}</p>
                </div>
                <div>
                   <p className="text-gray-500">Método de Pagamento</p>
                   <p className="font-medium">{getMethodLabel(selectedSale.paymentMethod)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">Itens</h4>
                <div className="space-y-2">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                       <span>{item.quantity}x {item.name}</span>
                       <span className="font-mono">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                 <p className="font-bold text-lg">Total</p>
                 <p className="font-bold text-xl text-nexus-600">R$ {selectedSale.total.toFixed(2)}</p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => window.print()}><Printer size={16} className="mr-2"/> Imprimir Recibo</Button>
                <Button variant="danger" disabled={selectedSale.status === 'CANCELLED'}><XCircle size={16} className="mr-2"/> Cancelar Venda</Button>
              </div>
            </div>
          )}
       </Modal>
    </div>
  );
};
