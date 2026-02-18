import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Button, Input, Modal, Badge } from '../components/UI';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Product, CartItem, Customer, Sale, PaymentMethod } from '../types';
import { Search, Trash2, Plus, Minus, CreditCard, Banknote, QrCode, User as UserIcon, CheckCircle, ChevronLeft, ShoppingBag, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const POS: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // UI State
  const [showMobileCart, setShowMobileCart] = useState(false);
  
  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [amountReceived, setAmountReceived] = useState<string>('');

  // Config
  const [maxDiscountPercent, setMaxDiscountPercent] = useState(100);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initial Load
  useEffect(() => {
    setProducts(db.getProducts());
    setMaxDiscountPercent(db.getConfig().maxDiscountPercent);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setShowMobileCart(false); // Switch to products view to search
        searchInputRef.current?.focus();
      }
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0) {
            setShowMobileCart(true); // Show cart context
            setIsPaymentModalOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsPaymentModalOpen(false);
        setIsCustomerModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  // Computed
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountTotal = cart.reduce((acc, item) => acc + item.discount, 0);
  const total = Math.max(0, subtotal - discountTotal);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.barcode.includes(searchTerm) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  // Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
    setSearchTerm(''); // Clear search for next scan
    searchInputRef.current?.focus();
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        // If discount was applied, we might want to keep it proportional or reset it. 
        // For now, let's keep the absolute value but ensure it doesn't exceed total price if qty drops.
        const maxDiscount = (item.price * newQty);
        return { ...item, quantity: newQty, discount: Math.min(item.discount, maxDiscount) };
      }
      return item;
    }));
  };

  const handleApplyDiscount = (id: string) => {
    const item = cart.find(c => c.id === id);
    if (!item) return;

    const input = prompt(`Digite a % de desconto para ${item.name} (Máx: ${maxDiscountPercent}%):`);
    if (input === null) return;

    const percent = parseFloat(input);
    if (isNaN(percent) || percent < 0) {
      alert("Porcentagem inválida.");
      return;
    }

    if (percent > maxDiscountPercent) {
      alert(`Erro: O desconto máximo permitido é de ${maxDiscountPercent}%.`);
      return;
    }

    const discountValue = (item.price * item.quantity) * (percent / 100);
    
    setCart(prev => prev.map(it => 
      it.id === id ? { ...it, discount: discountValue } : it
    ));
  };

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const exactMatch = products.find(p => p.barcode === searchTerm || p.sku === searchTerm);
      if (exactMatch) {
        addToCart(exactMatch);
      }
    }
  };

  const finalizeSale = () => {
    if (!user) return;
    
    const receivedVal = parseFloat(amountReceived) || total;
    
    const sale: Sale = {
      id: Date.now().toString(), // Simple ID gen
      timestamp: Date.now(),
      items: cart,
      subtotal,
      discountTotal,
      total,
      paymentMethod,
      paymentReceived: receivedVal,
      change: Math.max(0, receivedVal - total),
      userId: user.id,
      customerId: selectedCustomer?.id,
      status: 'COMPLETED'
    };

    db.createSale(sale);
    
    // Reset
    setCart([]);
    setIsPaymentModalOpen(false);
    setSelectedCustomer(null);
    setAmountReceived('');
    setShowMobileCart(false);
    alert(`Venda finalizada! Troco: R$ ${sale.change.toFixed(2)}`);
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4 relative">
      
      {/* Mobile Cart Floating Summary Button */}
      {!showMobileCart && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-6 left-4 right-4 z-30">
          <button 
            onClick={() => setShowMobileCart(true)}
            className="w-full bg-nexus-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center animate-bounce-short hover:bg-nexus-700 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                {cartItemCount}
              </div>
              <span className="font-medium">Ver Carrinho</span>
            </div>
            <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
          </button>
        </div>
      )}

      {/* Left Column: Cart */}
      {/* Responsive behavior: Full screen on mobile if open, Sidebar on desktop */}
      <div className={`
        flex flex-col 
        bg-white dark:bg-gray-800 
        overflow-hidden 
        transition-all duration-300 ease-in-out
        ${showMobileCart 
          ? 'fixed inset-0 z-40 w-full h-full' 
          : 'hidden lg:flex lg:w-2/5 lg:relative lg:h-full lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-200 lg:dark:border-gray-700'
        }
      `}>
        {/* Mobile Header for Cart */}
        <div className="lg:hidden p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <button onClick={() => setShowMobileCart(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <span className="font-bold text-lg flex-1">Carrinho</span>
          <span className="text-sm font-mono bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">{cartItemCount} itens</span>
        </div>

        {/* Desktop/Common Cart Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <UserIcon size={20} />
            {selectedCustomer ? selectedCustomer.name : 'Consumidor Final'}
          </h2>
          <Button size="sm" variant="secondary" onClick={() => setIsCustomerModalOpen(true)}>Alterar</Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24 lg:pb-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-50" />
              <p>Carrinho vazio</p>
              <p className="text-sm">Bipe um produto ou pesquise ao lado</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg group">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                     <span>{item.quantity}x R$ {item.price.toFixed(2)}</span>
                     {item.discount > 0 && (
                        <span className="text-green-600 dark:text-green-400 text-xs bg-green-100 dark:bg-green-900/30 px-1 rounded">
                           -R$ {item.discount.toFixed(2)}
                        </span>
                     )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l"><Minus size={14}/></button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r"><Plus size={14}/></button>
                  </div>
                  
                  <div className="flex flex-col items-end w-20">
                     <span className={`font-bold ${item.discount > 0 ? 'text-green-600' : ''}`}>
                       R$ {((item.price * item.quantity) - item.discount).toFixed(2)}
                     </span>
                     {item.discount > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                           R$ {(item.price * item.quantity).toFixed(2)}
                        </span>
                     )}
                  </div>

                  <div className="flex flex-col gap-1">
                     <button 
                        onClick={() => handleApplyDiscount(item.id)}
                        className="text-gray-400 hover:text-nexus-500 p-1"
                        title="Desconto"
                     >
                        <Percent size={16} />
                     </button>
                     <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between mb-1 text-gray-600 dark:text-gray-400 text-sm">
            <span>Subtotal</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          {discountTotal > 0 && (
             <div className="flex justify-between mb-2 text-green-600 dark:text-green-400 text-sm">
               <span>Desconto</span>
               <span>- R$ {discountTotal.toFixed(2)}</span>
             </div>
          )}
          <div className="flex justify-between mb-4 text-2xl font-bold text-nexus-600 dark:text-nexus-400">
            <span>Total</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="danger" disabled={cart.length === 0} onClick={() => { setCart([]); setShowMobileCart(false); }}>Cancelar</Button>
            <Button variant="success" disabled={cart.length === 0} onClick={() => setIsPaymentModalOpen(true)}>
               Finalizar (F4)
            </Button>
          </div>
        </div>
      </div>

      {/* Right Column: Products */}
      <div className={`flex-1 flex flex-col gap-4 min-w-0 h-full ${showMobileCart ? 'hidden lg:flex' : 'flex'}`}>
        {/* Search Bar */}
        <Card className="p-4 flex gap-4 items-center shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar produto (F2) ou scanear..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-nexus-500 outline-none text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleBarcodeScan}
              autoFocus={!showMobileCart}
            />
          </div>
        </Card>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-nexus-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900/50 rounded-xl p-2 pb-24 lg:pb-2">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => (
              <div 
                key={product.id} 
                onClick={() => addToCart(product)}
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-transparent hover:border-nexus-300 flex flex-col justify-between h-40 group select-none active:scale-95 duration-100"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1 rounded">{product.sku}</span>
                    <Badge variant={product.stock <= product.minStock && product.type === 'PRODUCT' ? 'danger' : 'info'}>
                       {product.type === 'SERVICE' ? 'SERV' : `${product.stock} un`}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white mt-2 line-clamp-2 leading-tight group-hover:text-nexus-600 transition-colors">{product.name}</h3>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
                   <p className="text-lg font-bold text-gray-900 dark:text-white">R$ {product.price.toFixed(2)}</p>
                   <div className="w-8 h-8 rounded-full bg-nexus-50 dark:bg-nexus-900/30 flex items-center justify-center text-nexus-600 dark:text-nexus-400 group-hover:bg-nexus-500 group-hover:text-white transition-colors">
                     <Plus size={18} />
                   </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-10 text-gray-500">
                Nenhum produto encontrado.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        title="Finalizar Venda"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center py-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="text-4xl font-bold text-nexus-600">R$ {total.toFixed(2)}</p>
            {discountTotal > 0 && <p className="text-xs text-green-600 mt-1">(Desconto aplicado: R$ {discountTotal.toFixed(2)})</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'CASH', label: 'Dinheiro', icon: Banknote },
                { id: 'CREDIT_CARD', label: 'Crédito', icon: CreditCard },
                { id: 'DEBIT_CARD', label: 'Débito', icon: CreditCard },
                { id: 'PIX', label: 'PIX', icon: QrCode },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === m.id 
                      ? 'border-nexus-500 bg-nexus-50 dark:bg-nexus-900/20 text-nexus-700 dark:text-nexus-400' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-nexus-300'
                  }`}
                >
                  <m.icon size={24} className="mb-2" />
                  <span className="text-sm font-medium">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'CASH' && (
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Valor Recebido"
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(e.target.value)}
                placeholder="0.00"
                className="text-lg"
                autoFocus
              />
              <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900">
                <p className="text-sm text-green-800 dark:text-green-300">Troco</p>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">
                  R$ {Math.max(0, (parseFloat(amountReceived || '0') - total)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
             <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)} fullWidth>Voltar</Button>
             <Button variant="success" onClick={finalizeSale} fullWidth size="lg">Confirmar Pagamento</Button>
          </div>
        </div>
      </Modal>

      {/* Customer Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Selecionar Cliente"
      >
        <div className="space-y-4">
           {db.getCustomers().map(cust => (
             <button
              key={cust.id}
              onClick={() => { setSelectedCustomer(cust); setIsCustomerModalOpen(false); }}
              className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center justify-between group"
             >
               <div>
                 <p className="font-medium">{cust.name}</p>
                 <p className="text-xs text-gray-500">{cust.document || 'Sem documento'}</p>
               </div>
               {selectedCustomer?.id === cust.id && <CheckCircle size={20} className="text-green-500" />}
             </button>
           ))}
           <Button variant="outline" fullWidth className="mt-4">Cadastrar Novo (Stub)</Button>
        </div>
      </Modal>
    </div>
  );
};
