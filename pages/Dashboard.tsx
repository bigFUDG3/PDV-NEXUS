import React, { useEffect, useState } from 'react';
import { Card, Badge } from '../components/UI';
import { db } from '../services/db';
import { KPIMetrics, Sale } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, AlertTriangle, BarChart3, LineChart as LineChartIcon, Clock } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; icon: any; trend?: string; color: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {trend && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp size={12}/> {trend}</p>}
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<KPIMetrics | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  useEffect(() => {
    const data = db.getStats();
    setStats(data);

    const sales = db.getSales();
    
    // Recent Sales List Data (Top 5)
    setRecentSales(sales.slice(0, 5));

    // Chart Data (Last 10 sales aggregation)
    const last10Sales = sales.slice(0, 10).reverse().map(s => ({
      name: new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      total: s.total
    }));
    setSalesData(last10Sales.length > 0 ? last10Sales : [{name: 'Sem dados', total: 0}]);
  }, []);

  if (!stats) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400">Visão geral do seu negócio hoje.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={`R$ ${stats.totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="bg-nexus-500" 
        />
        <StatCard 
          title="Vendas Realizadas" 
          value={stats.totalSales.toString()} 
          icon={ShoppingBag} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Lucro Estimado" 
          value={`R$ ${stats.totalProfit.toFixed(2)}`} 
          icon={TrendingUp} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Estoque Baixo" 
          value={stats.lowStockCount.toString()} 
          icon={AlertTriangle} 
          color="bg-orange-500"
          trend={stats.lowStockCount > 0 ? "Atenção necessária" : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[400px]">
            <div className="flex flex-row justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Fluxo de Vendas (Recente)</h3>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button 
                  onClick={() => setChartType('bar')}
                  className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white dark:bg-gray-600 shadow-sm text-nexus-600 dark:text-nexus-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                  title="Gráfico de Barras"
                >
                  <BarChart3 size={18} />
                </button>
                <button 
                  onClick={() => setChartType('line')}
                  className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white dark:bg-gray-600 shadow-sm text-nexus-600 dark:text-nexus-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                  title="Gráfico de Linha"
                >
                  <LineChartIcon size={18} />
                </button>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip 
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                ) : (
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Sales List */}
        <div className="lg:col-span-1">
          <Card title="Últimas Vendas" className="h-full">
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma venda registrada hoje.</p>
              ) : (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
                        <DollarSign size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate w-24 sm:w-auto">
                          {sale.customerId ? 'Cliente ID ' + sale.customerId : 'Consumidor Final'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={10} />
                          {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">R$ {sale.total.toFixed(2)}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                        {sale.status === 'COMPLETED' ? 'Pago' : 'Canc'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* Insights Row */}
      <Card title="Insights Rápidos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="mt-1"><TrendingUp size={20} className="text-blue-600 dark:text-blue-400" /></div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-300">Desempenho</h4>
                <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                  O ticket médio subiu 12% em comparação com a semana passada.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="mt-1"><AlertTriangle size={20} className="text-orange-600 dark:text-orange-400" /></div>
              <div>
                <h4 className="font-medium text-orange-900 dark:text-orange-300">Estoque</h4>
                <p className="text-sm text-orange-800 dark:text-orange-400 mt-1">
                  {stats.lowStockCount} produtos estão abaixo do nível mínimo de estoque.
                </p>
              </div>
            </div>

             <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="mt-1"><DollarSign size={20} className="text-green-600 dark:text-green-400" /></div>
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-300">Pagamentos</h4>
                <p className="text-sm text-green-800 dark:text-green-400 mt-1">
                  Pagamentos via PIX representam 45% das transações.
                </p>
              </div>
            </div>
          </div>
        </Card>
    </div>
  );
};
