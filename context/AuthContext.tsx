import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored session (simplified)
    const storedUser = localStorage.getItem('pdv_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string) => {
    const foundUser = db.authenticate(email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('pdv_session', JSON.stringify(foundUser));
      db.log(foundUser.id, 'LOGIN', 'Usuário realizou login', 'AUTH');
      return true;
    }
    return false;
  };

  const logout = () => {
    if (user) {
      db.log(user.id, 'LOGOUT', 'Usuário realizou logout', 'AUTH');
    }
    setUser(null);
    localStorage.removeItem('pdv_session');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
