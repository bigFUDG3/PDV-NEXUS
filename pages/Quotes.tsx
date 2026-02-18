import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Quote, Product, CartItem, Customer, Sale } from '../types';
import { Card, Button, Input, Badge, Modal } from '../components/UI';
import { FileSpreadsheet, Plus, Search, Eye, CheckCircle, XCircle, Printer, User as UserIcon, Trash2, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Simple Quote Creator Component (Internal to this page)
const QuoteCreator: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setProducts(db.getProducts());
    setCustomers(db.getCustomers());
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSaveQuote = () => {
    if (!user) return;
    const quote: Quote = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      expirationDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      items: cart,
      subtotal: total,
      total: total,
      customerId: selectedCustomer?.id,
      customerName: selectedCustomer?.name || 'Cliente Balcão',
      userId: user.id,
      status: 'DRAFT',
      notes
    };
    db.createQuote(quote);
    onSave();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-[80vh]">
      <div className="flex gap-4 h-full">
        {/* Left: Product Selection */}
        <div className="w-1/2 flex flex-col gap-4">
           <Input 
             placeholder="Buscar produtos/serviços..." 
             value={searchTerm} 
             onChange={e => setSearchTerm(e.target.value)} 
             className="mb-2"
           />
           <div className="flex-1 overflow-y-auto space-y-2 border rounded-lg p-2">
             {filteredProducts.map(p => (
               <div key={p.id} onClick={() => addToCart(p)} className="p-3 border rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between items-center">
                 <div>
                   <p className="font-medium">{p.name}</p>
                   <p className="text-xs text-gray-500">R$ {p.price.toFixed(2)}</p>
                 </div>
                 <Plus size={16} />
               </div>
             ))}
           </div>
        </div>

        {/* Right: Cart & Customer */}
        <div className="w-1/2 flex flex-col gap-4 border-l pl-4">
           <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
             <label className="text-sm font-bold mb-1 block">Cliente</label>
             <select 
               className="w-full p-2 rounded border bg-white dark:bg-gray-700"
               onChange={e => setSelectedCustomer(customers.find(c => c.id === e.target.value) || null)}
             >
               <option value="">Selecione um cliente...</option>
               {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
           </div>

           <div className="flex-1 overflow-y-auto">
             {cart.map(item => (
               <div key={item.id} className="flex justify-between items-center p-2 border-b">
                 <span className="text-sm">{item.quantity}x {item.name}</span>
                 <div className="flex items-center gap-2">
                   <span className="font-bold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                   <button onClick={() => removeFromCart(item.id)} className="text-red-500"><Trash2 size={14} /></button>
                 </div>
               </div>
             ))}
           </div>
           
           <div className="mt-auto">
             <Input placeholder="Observações..." value={notes} onChange={e => setNotes(e.target.value)} className="mb-2" />
             <div className="flex justify-between items-center text-xl font-bold mb-4">
               <span>Total:</span>
               <span>R$ {total.toFixed(2)}</span>
             </div>
             <div className="flex gap-2">
               <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
               <Button fullWidth onClick={handleSaveQuote} disabled={cart.length === 0}>Salvar Orçamento</Button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export const Quotes: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [viewMode, setViewMode] = useState<'LIST' | 'CREATE'>('LIST');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setQuotes(db.getQuotes());
  }, [viewMode]);

  const handleConvert = (quote: Quote) => {
    if (confirm('Deseja converter este orçamento em venda? Isso irá baixar o estoque.')) {
        const sale: Sale = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            items: quote.items,
            subtotal: quote.subtotal,
            discountTotal: 0,
            total: quote.total,
            paymentMethod: 'CASH', // Default, would need selection in real app
            paymentReceived: quote.total,
            change: 0,
            userId: quote.userId,
            customerId: quote.customerId,
            status: 'COMPLETED'
        };
        db.createSale(sale);
        db.updateQuoteStatus(quote.id, 'CONVERTED');
        alert('Venda criada com sucesso!');
        setQuotes(db.getQuotes());
        setSelectedQuote(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'ACCEPTED': return 'success';
      case 'CONVERTED': return 'success';
      case 'REJECTED': return 'danger';
      case 'SENT': return 'info';
      default: return 'warning'; // DRAFT
    }
  };

  return (
    <div className="space-y-6">
      {viewMode === 'LIST' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="text-nexus-600" /> Orçamentos
              </h2>
              <p className="text-gray-500 text-sm">Gerencie propostas comerciais.</p>
            </div>
            <Button onClick={() => setViewMode('CREATE')}><Plus size={18} className="mr-2"/> Novo Orçamento</Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {quotes.map(quote => (
                    <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quote.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {quote.customerName || 'Cliente não identificado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        R$ {quote.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusVariant(quote.status) as any}>{quote.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => setSelectedQuote(quote)} className="text-nexus-600 hover:text-nexus-900 mr-3">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quotes.length === 0 && (
                     <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Nenhum orçamento encontrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Create Mode */}
      {viewMode === 'CREATE' && (
        <Card title="Criar Novo Orçamento">
            <QuoteCreator onClose={() => setViewMode('LIST')} onSave={() => setViewMode('LIST')} />
        </Card>
      )}

      {/* View Detail Modal */}
      <Modal 
        isOpen={!!selectedQuote} 
        onClose={() => setSelectedQuote(null)} 
        title={`Orçamento #${selectedQuote?.id.slice(-4)}`}
        size="lg"
      >
        {selectedQuote && (
          <div className="space-y-4">
             <div className="flex justify-between items-start bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div>
                   <p className="text-sm text-gray-500">Cliente</p>
                   <p className="font-bold">{selectedQuote.customerName}</p>
                </div>
                <div className="text-right">
                   <p className="text-sm text-gray-500">Validade</p>
                   <p className="font-medium">{new Date(selectedQuote.expirationDate).toLocaleDateString()}</p>
                </div>
             </div>

             <div>
               <h4 className="font-bold border-b pb-2 mb-2">Itens</h4>
               {selectedQuote.items.map((item, i) => (
                 <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-0 text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
             </div>

             <div className="flex justify-between items-center text-xl font-bold pt-2">
                <span>Total</span>
                <span className="text-nexus-600">R$ {selectedQuote.total.toFixed(2)}</span>
             </div>

             {selectedQuote.notes && (
               <div className="text-sm text-gray-500 italic p-2 bg-yellow-50 dark:bg-yellow-900/10 rounded">
                 Obs: {selectedQuote.notes}
               </div>
             )}

             <div className="flex gap-2 justify-end pt-4">
               <Button variant="outline" onClick={() => window.print()}><Printer size={16} className="mr-2"/> Imprimir</Button>
               {selectedQuote.status !== 'CONVERTED' && (
                  <Button variant="success" onClick={() => handleConvert(selectedQuote)}>
                    <ShoppingCart size={16} className="mr-2"/> Converter em Venda
                  </Button>
               )}
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
