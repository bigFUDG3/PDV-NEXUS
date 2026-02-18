export type Role = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STOCK_KEEPER' | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export type ProductType = 'PRODUCT' | 'SERVICE';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  type: ProductType;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string; // CPF/CNPJ
}

export interface CartItem extends Product {
  quantity: number;
  discount: number; // value in currency
  note?: string;
}

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'TRANSFER';

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentReceived: number; // For cash change calculation
  change: number;
  customerId?: string;
  userId: string;
  status: 'COMPLETED' | 'CANCELLED';
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';

export interface Quote {
  id: string;
  timestamp: number;
  expirationDate: number;
  items: CartItem[];
  subtotal: number;
  total: number;
  customerId?: string;
  customerName?: string; // Cache for display
  userId: string;
  status: QuoteStatus;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  details: string;
  module: string;
}

export interface KPIMetrics {
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  lowStockCount: number;
}
