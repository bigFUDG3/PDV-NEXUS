import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Input } from '../components/UI';
import { Settings as SettingsIcon, Save, ShieldAlert } from 'lucide-react';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState(db.getConfig());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (user) {
      db.updateConfig(config, user.id);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-nexus-600" /> Configurações do Sistema
        </h2>
        <p className="text-gray-500 text-sm">Gerencie parâmetros globais da loja.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Identificação da Loja">
          <div className="space-y-4">
             <Input 
                label="Nome da Loja"
                value={config.storeName}
                onChange={(e) => setConfig({ ...config, storeName: e.target.value })}
             />
             <Button onClick={handleSave} className="flex items-center">
               <Save size={18} className="mr-2" /> Salvar Alterações
             </Button>
             {saved && <span className="text-green-600 text-sm font-medium ml-3 fade-in">Salvo com sucesso!</span>}
          </div>
        </Card>

        <Card title="Restrições de Vendas">
          <div className="space-y-4">
             <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg flex items-start gap-3">
               <ShieldAlert className="text-orange-600 dark:text-orange-400 shrink-0" size={24} />
               <div>
                 <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Controle de Descontos</h4>
                 <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                   Defina o limite máximo de desconto (em porcentagem) que operadores podem aplicar individualmente em itens durante uma venda.
                 </p>
               </div>
             </div>

             <Input 
                label="Desconto Máximo Permitido (%)"
                type="number"
                min="0"
                max="100"
                value={config.maxDiscountPercent}
                onChange={(e) => setConfig({ ...config, maxDiscountPercent: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
             />
             
             <Button onClick={handleSave} className="flex items-center">
               <Save size={18} className="mr-2" /> Atualizar Limites
             </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
