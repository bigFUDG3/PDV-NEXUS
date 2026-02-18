import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  Sun,
  Moon,
  History,
  Hammer,
  FileSpreadsheet
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingCart, label: 'Caixa / PDV', path: '/pos' },
    { icon: FileSpreadsheet, label: 'Orçamentos', path: '/quotes' },
    { icon: Package, label: 'Estoque', path: '/inventory' },
    { icon: Hammer, label: 'Serviços', path: '/services' },
    { icon: History, label: 'Vendas', path: '/sales' },
    { icon: FileText, label: 'Relatórios', path: '/reports' },
    // { icon: Settings, label: 'Configurações', path: '/settings' }, // Placeholder
  ];

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transition-transform transform lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-nexus-600 dark:text-nexus-500">PDV Nexus</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path 
                    ? 'bg-nexus-50 text-nexus-700 dark:bg-nexus-900/20 dark:text-nexus-400 font-medium' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img src={user?.avatar} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between px-4 lg:px-8 z-10">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 ml-auto">
             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${navigator.onLine ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800'}`}>
                {navigator.onLine ? 'Online' : 'Offline'}
             </span>
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
