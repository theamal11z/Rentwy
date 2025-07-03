import React, { createContext, useContext, useState } from 'react';
import { mockUsers, User } from './mockData';
import * as SplashScreen from 'expo-splash-screen';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate checking for existing session on app start
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string) => {
    const existing = mockUsers.find((u) => u.email === email && u.password === password);
    if (existing) {
      setUser(existing);
      return true;
    }
    return false;
  };

  const signup = async (name: string, email: string, password: string) => {
    const exists = mockUsers.some((u) => u.email === email);
    if (exists) return false;
    const newUser: User = { id: `u${mockUsers.length + 1}`, name, email, password };
    mockUsers.push(newUser);
    setUser(newUser);
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
