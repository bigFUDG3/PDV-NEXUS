import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@pdv.com');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email);
    if (success) {
      navigate('/');
    } else {
      setError('Usuário não encontrado. Use admin@pdv.com');
    }
  };

  const usersDemo = [
    { label: 'Admin', email: 'admin@pdv.com' },
    { label: 'Caixa', email: 'caixa@pdv.com' },
  ];

  return (
    <div className="min-h-screen bg-nexus-500 flex items-center justify-center p-4">
       <Card className="w-full max-w-md bg-white dark:bg-gray-800 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-nexus-100 text-nexus-600 mb-4">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">PDV Nexus</h1>
            <p className="text-gray-500 mt-2">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             <Input 
               label="E-mail"
               type="email" 
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="seu@email.com"
               error={error}
             />
             <Input 
               label="Senha"
               type="password"
               value="123456" // Dummy
               readOnly
             />

             <Button fullWidth size="lg">Entrar no Sistema</Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 mb-3 text-center">Contas de Demonstração (Clique para preencher):</p>
            <div className="flex gap-2 justify-center">
              {usersDemo.map(u => (
                <button
                  key={u.email}
                  onClick={() => setEmail(u.email)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
       </Card>
    </div>
  );
};
