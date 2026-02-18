import { Product, User, Sale, AuditLog, Customer, KPIMetrics, Quote, QuoteStatus, StoreConfig } from '../types';

// Initial Data Seeding
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Administrador', email: 'admin@pdv.com', role: 'ADMIN', avatar: 'https://picsum.photos/100/100?random=1' },
  { id: '2', name: 'Gerente Loja', email: 'gerente@pdv.com', role: 'MANAGER', avatar: 'https://picsum.photos/100/100?random=2' },
  { id: '3', name: 'Operador Caixa', email: 'caixa@pdv.com', role: 'CASHIER', avatar: 'https://picsum.photos/100/100?random=3' },
  { id: '4', name: 'Estoquista', email: 'estoque@pdv.com', role: 'STOCK_KEEPER', avatar: 'https://picsum.photos/100/100?random=4' },
];

const INITIAL_PRODUCTS: Product[] = [
  // Products
  { id: '101', sku: 'BEB001', barcode: '789000101', name: 'Coca-Cola 350ml', category: 'Bebidas', price: 5.00, cost: 2.50, stock: 100, minStock: 20, unit: 'UN', type: 'PRODUCT' },
  { id: '102', sku: 'BEB002', barcode: '789000102', name: 'Água Mineral 500ml', category: 'Bebidas', price: 3.00, cost: 0.80, stock: 150, minStock: 30, unit: 'UN', type: 'PRODUCT' },
  { id: '103', sku: 'BEB003', barcode: '789000103', name: 'Suco de Laranja Natural', category: 'Bebidas', price: 8.00, cost: 3.00, stock: 50, minStock: 10, unit: 'UN', type: 'PRODUCT' },
  { id: '104', sku: 'SNK001', barcode: '789000104', name: 'Batata Chips Original', category: 'Snacks', price: 7.50, cost: 4.00, stock: 40, minStock: 10, unit: 'PCT', type: 'PRODUCT' },
  { id: '105', sku: 'SNK002', barcode: '789000105', name: 'Chocolate Barra Ao Leite', category: 'Snacks', price: 6.00, cost: 3.20, stock: 80, minStock: 15, unit: 'UN', type: 'PRODUCT' },
  { id: '106', sku: 'ELE001', barcode: '789000106', name: 'Cabo USB-C 1m', category: 'Eletrônicos', price: 25.00, cost: 8.00, stock: 25, minStock: 5, unit: 'UN', type: 'PRODUCT' },
  { id: '107', sku: 'ELE002', barcode: '789000107', name: 'Fone de Ouvido Básico', category: 'Eletrônicos', price: 35.00, cost: 12.00, stock: 15, minStock: 3, unit: 'UN', type: 'PRODUCT' },
  { id: '108', sku: 'ELE003', barcode: '789000108', name: 'Carregador Parede Fast', category: 'Eletrônicos', price: 50.00, cost: 20.00, stock: 10, minStock: 2, unit: 'UN', type: 'PRODUCT' },
  { id: '109', sku: 'LIM001', barcode: '789000109', name: 'Detergente Neutro', category: 'Limpeza', price: 2.50, cost: 1.20, stock: 60, minStock: 10, unit: 'UN', type: 'PRODUCT' },
  { id: '110', sku: 'LIM002', barcode: '789000110', name: 'Sabão em Pó 1kg', category: 'Limpeza', price: 12.00, cost: 7.50, stock: 30, minStock: 5, unit: 'CX', type: 'PRODUCT' },
  { id: '111', sku: 'PAP001', barcode: '789000111', name: 'Papel A4 Resma 500', category: 'Papelaria', price: 28.00, cost: 18.00, stock: 100, minStock: 20, unit: 'PCT', type: 'PRODUCT' },
  { id: '112', sku: 'PAP002', barcode: '789000112', name: 'Caneta Esferográfica Azul', category: 'Papelaria', price: 1.50, cost: 0.30, stock: 200, minStock: 50, unit: 'UN', type: 'PRODUCT' },
  { id: '113', sku: 'ALI001', barcode: '789000113', name: 'Arroz Branco 5kg', category: 'Alimentos', price: 22.00, cost: 16.00, stock: 40, minStock: 10, unit: 'PCT', type: 'PRODUCT' },
  { id: '114', sku: 'ALI002', barcode: '789000114', name: 'Feijão Carioca 1kg', category: 'Alimentos', price: 8.50, cost: 5.00, stock: 50, minStock: 10, unit: 'PCT', type: 'PRODUCT' },
  { id: '115', sku: 'ALI003', barcode: '789000115', name: 'Macarrão Espaguete', category: 'Alimentos', price: 4.00, cost: 2.00, stock: 60, minStock: 15, unit: 'PCT', type: 'PRODUCT' },
  { id: '116', sku: 'ALI004', barcode: '789000116', name: 'Óleo de Soja 900ml', category: 'Alimentos', price: 7.00, cost: 4.50, stock: 35, minStock: 8, unit: 'UN', type: 'PRODUCT' },
  { id: '117', sku: 'HIG001', barcode: '789000117', name: 'Sabonete Hidratante', category: 'Higiene', price: 2.00, cost: 0.90, stock: 80, minStock: 20, unit: 'UN', type: 'PRODUCT' },
  { id: '118', sku: 'HIG002', barcode: '789000118', name: 'Shampoo 350ml', category: 'Higiene', price: 15.00, cost: 8.00, stock: 25, minStock: 5, unit: 'UN', type: 'PRODUCT' },
  { id: '119', sku: 'HIG003', barcode: '789000119', name: 'Creme Dental', category: 'Higiene', price: 4.50, cost: 2.20, stock: 60, minStock: 15, unit: 'UN', type: 'PRODUCT' },
  { id: '120', sku: 'UTI001', barcode: '789000120', name: 'Pilha AA (Pack 4)', category: 'Utilidades', price: 12.00, cost: 6.00, stock: 30, minStock: 5, unit: 'PCT', type: 'PRODUCT' },

  // Services
  { id: '201', sku: 'SRV001', barcode: '', name: 'Instalação de Software', category: 'Informática', price: 80.00, cost: 0, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '202', sku: 'SRV002', barcode: '', name: 'Formatação Computador', category: 'Informática', price: 120.00, cost: 0, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '203', sku: 'SRV003', barcode: '', name: 'Configuração de Rede', category: 'Informática', price: 150.00, cost: 0, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '204', sku: 'SRV004', barcode: '', name: 'Troca de Tela Celular (Mão de Obra)', category: 'Manutenção', price: 100.00, cost: 0, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '205', sku: 'SRV005', barcode: '', name: 'Limpeza Interna PC', category: 'Manutenção', price: 50.00, cost: 5.00, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '206', sku: 'SRV006', barcode: '', name: 'Entrega Expressa', category: 'Logística', price: 15.00, cost: 10.00, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '207', sku: 'SRV007', barcode: '', name: 'Embrulho para Presente', category: 'Extra', price: 5.00, cost: 1.00, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '208', sku: 'SRV008', barcode: '', name: 'Consultoria Técnica (Hora)', category: 'Consultoria', price: 200.00, cost: 0, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '209', sku: 'SRV009', barcode: '', name: 'Garantia Estendida 1 Ano', category: 'Seguros', price: 45.00, cost: 20.00, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
  { id: '210', sku: 'SRV010', barcode: '', name: 'Recarga Cartucho', category: 'Manutenção', price: 30.00, cost: 5.00, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Cliente Balcão', email: '', phone: '', document: '' },
  { id: '2', name: 'João da Silva', email: 'joao@email.com', phone: '11999998888', document: '123.456.789-00' },
  { id: '3', name: 'Empresa ABC Ltda', email: 'contato@abc.com', phone: '1133334444', document: '12.345.678/0001-90' },
];

const INITIAL_QUOTES: Quote[] = [
  {
    id: '1001',
    timestamp: Date.now() - 86400000,
    expirationDate: Date.now() + 604800000, // +7 days
    items: [
      { id: '202', sku: 'SRV002', barcode: '', name: 'Formatação Computador', category: 'Informática', price: 120.00, cost: 0, stock: 9999, minStock: 0, unit: 'SERV', type: 'SERVICE', quantity: 1, discount: 0 },
      { id: '111', sku: 'PAP001', barcode: '789000111', name: 'Papel A4 Resma 500', category: 'Papelaria', price: 28.00, cost: 18.00, stock: 100, minStock: 20, unit: 'PCT', type: 'PRODUCT', quantity: 2, discount: 0 }
    ],
    subtotal: 176.00,
    total: 176.00,
    customerId: '2',
    customerName: 'João da Silva',
    userId: '2',
    status: 'DRAFT',
    notes: 'Aguardando aprovação do cliente por WhatsApp'
  }
];

const DEFAULT_CONFIG: StoreConfig = {
  maxDiscountPercent: 10,
  storeName: 'PDV Nexus Store'
};

class MockDB {
  private products: Product[] = [];
  private users: User[] = [];
  private sales: Sale[] = [];
  private customers: Customer[] = [];
  private quotes: Quote[] = [];
  private auditLogs: AuditLog[] = [];
  private config: StoreConfig = DEFAULT_CONFIG;

  constructor() {
    this.load();
  }

  private load() {
    const sProducts = localStorage.getItem('pdv_products');
    const sUsers = localStorage.getItem('pdv_users');
    const sSales = localStorage.getItem('pdv_sales');
    const sCustomers = localStorage.getItem('pdv_customers');
    const sQuotes = localStorage.getItem('pdv_quotes');
    const sLogs = localStorage.getItem('pdv_logs');
    const sConfig = localStorage.getItem('pdv_config');

    this.products = sProducts ? JSON.parse(sProducts) : INITIAL_PRODUCTS;
    this.users = sUsers ? JSON.parse(sUsers) : INITIAL_USERS;
    this.sales = sSales ? JSON.parse(sSales) : [];
    this.customers = sCustomers ? JSON.parse(sCustomers) : INITIAL_CUSTOMERS;
    this.quotes = sQuotes ? JSON.parse(sQuotes) : INITIAL_QUOTES;
    this.auditLogs = sLogs ? JSON.parse(sLogs) : [];
    this.config = sConfig ? JSON.parse(sConfig) : DEFAULT_CONFIG;

    if (!sProducts) this.save('products');
    if (!sUsers) this.save('users');
    if (!sCustomers) this.save('customers');
    if (!sQuotes) this.save('quotes');
    if (!sConfig) this.save('config');
  }

  private save(key: string) {
    if (key === 'products') localStorage.setItem('pdv_products', JSON.stringify(this.products));
    if (key === 'users') localStorage.setItem('pdv_users', JSON.stringify(this.users));
    if (key === 'sales') localStorage.setItem('pdv_sales', JSON.stringify(this.sales));
    if (key === 'customers') localStorage.setItem('pdv_customers', JSON.stringify(this.customers));
    if (key === 'quotes') localStorage.setItem('pdv_quotes', JSON.stringify(this.quotes));
    if (key === 'logs') localStorage.setItem('pdv_logs', JSON.stringify(this.auditLogs));
    if (key === 'config') localStorage.setItem('pdv_config', JSON.stringify(this.config));
  }

  // Auth
  authenticate(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // Config
  getConfig(): StoreConfig {
    return this.config;
  }

  updateConfig(newConfig: Partial<StoreConfig>, userId: string) {
    this.config = { ...this.config, ...newConfig };
    this.save('config');
    this.log(userId, 'CONFIG_UPDATE', 'Configurações do sistema atualizadas', 'SETTINGS');
  }

  // Products & Services
  getProducts(): Product[] {
    return this.products;
  }

  getLowStockProducts(): Product[] {
    return this.products.filter(p => p.type === 'PRODUCT' && p.stock <= p.minStock);
  }
  
  getServicesOnly(): Product[] {
    return this.products.filter(p => p.type === 'SERVICE');
  }
  
  createProduct(product: Product, userId?: string) {
    this.products.push(product);
    this.save('products');
    if (userId) this.log(userId, 'PRODUCT_CREATE', `Produto ${product.name} criado`, 'INVENTORY', product.id);
  }

  updateProduct(product: Product, userId?: string) {
    const idx = this.products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      const old = this.products[idx];
      
      // Check for stock changes for logging
      if (old.stock !== product.stock && userId) {
          const diff = product.stock - old.stock;
          const action = diff > 0 ? 'STOCK_ADD' : 'STOCK_REMOVE';
          this.log(userId, action, `Ajuste manual: ${diff > 0 ? '+' : ''}${diff} un. Novo total: ${product.stock}`, 'INVENTORY', product.id);
      } else if (userId) {
          this.log(userId, 'PRODUCT_UPDATE', `Dados do produto ${product.name} atualizados`, 'INVENTORY', product.id);
      }

      this.products[idx] = product;
      this.save('products');
    }
  }

  deleteProduct(id: string, userId?: string) {
    const product = this.products.find(p => p.id === id);
    this.products = this.products.filter(p => p.id !== id);
    this.save('products');
    if (userId && product) {
        this.log(userId, 'PRODUCT_DELETE', `Produto ${product.name} (SKU: ${product.sku}) excluído`, 'INVENTORY', id);
    }
  }

  updateProductStock(id: string, qtyDelta: number, userId?: string, reason?: string) {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx >= 0 && this.products[idx].type === 'PRODUCT') {
      const oldStock = this.products[idx].stock;
      this.products[idx].stock += qtyDelta;
      this.save('products');
      
      if (userId) {
          const action = qtyDelta > 0 ? 'STOCK_ADD' : 'STOCK_REMOVE';
          const details = reason || `Movimentação automática: ${qtyDelta > 0 ? '+' : ''}${qtyDelta} un`;
          this.log(userId, action, details, 'INVENTORY', id);
      }
    }
  }

  getProductLogs(productId: string): AuditLog[] {
      return this.auditLogs.filter(log => log.entityId === productId).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Sales
  createSale(sale: Sale) {
    this.sales.push(sale);
    // Deduct stock
    sale.items.forEach(item => {
      this.updateProductStock(item.id, -item.quantity, sale.userId, `Venda #${sale.id.slice(-6)}`);
    });
    this.save('sales');
    this.log(sale.userId, 'SALE_CREATED', `Venda ${sale.id} realizada valor R$${sale.total.toFixed(2)}`, 'POS');
  }

  getSales(): Sale[] {
    return this.sales.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Quotes
  getQuotes(): Quote[] {
    return this.quotes.sort((a, b) => b.timestamp - a.timestamp);
  }

  createQuote(quote: Quote) {
    this.quotes.push(quote);
    this.save('quotes');
    this.log(quote.userId, 'QUOTE_CREATED', `Orçamento ${quote.id} criado valor R$${quote.total.toFixed(2)}`, 'QUOTES');
  }

  updateQuoteStatus(id: string, status: QuoteStatus) {
    const idx = this.quotes.findIndex(q => q.id === id);
    if (idx >= 0) {
      this.quotes[idx].status = status;
      this.save('quotes');
    }
  }

  // Customers
  getCustomers(): Customer[] {
    return this.customers;
  }

  // Audit
  log(userId: string, action: string, details: string, module: string, entityId?: string) {
    const entry: AuditLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      userId,
      action,
      details,
      module,
      entityId
    };
    this.auditLogs.unshift(entry);
    this.save('logs');
  }

  getLogs(): AuditLog[] {
    return this.auditLogs;
  }

  getStats(): KPIMetrics {
    const totalSales = this.sales.length;
    const totalRevenue = this.sales.reduce((acc, s) => acc + s.total, 0);
    // Simplified profit calculation
    const totalProfit = this.sales.reduce((acc, s) => {
      const saleCost = s.items.reduce((c, item) => c + (item.cost * item.quantity), 0);
      return acc + (s.total - saleCost);
    }, 0);
    const lowStockCount = this.products.filter(p => p.type === 'PRODUCT' && p.stock <= p.minStock).length;

    return { totalSales, totalRevenue, totalProfit, lowStockCount };
  }
}

export const db = new MockDB();
