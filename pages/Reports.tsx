import React from 'react';
import { Card, Button } from '../components/UI';
import { FileDown, PieChart } from 'lucide-react';

export const Reports: React.FC = () => {
  const reports = [
    { name: 'Fechamento de Caixa', desc: 'Resumo diário de entradas e saídas por operador.' },
    { name: 'Vendas por Categoria', desc: 'Performance de vendas agrupada por categoria de produto.' },
    { name: 'Estoque Mínimo', desc: 'Lista de produtos que precisam de reposição imediata.' },
    { name: 'Curva ABC', desc: 'Análise de produtos mais rentáveis (80/20).' },
    { name: 'Extrato Financeiro', desc: 'Fluxo detalhado de recebimentos (Dinheiro, PIX, Cartão).' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Relatórios Gerenciais</h2>
        <p className="text-gray-500">Exporte dados para análise e contabilidade.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-nexus-50 dark:bg-nexus-900/20 rounded-lg text-nexus-600">
                <PieChart size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{r.name}</h3>
            <p className="text-sm text-gray-500 mb-6">{r.desc}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" fullWidth><FileDown size={16} className="mr-2"/> PDF</Button>
              <Button size="sm" variant="outline" fullWidth><FileDown size={16} className="mr-2"/> CSV</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
