'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from './api-client';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sres_access_token');
    const stored = localStorage.getItem('sres_user');
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const persist = useCallback((user: AuthUser, accessToken: string, refreshToken: string) => {
    localStorage.setItem('sres_access_token', accessToken);
    localStorage.setItem('sres_refresh_token', refreshToken);
    localStorage.setItem('sres_user', JSON.stringify(user));
    setUser(user);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    persist(res.user, res.accessToken, res.refreshToken);
  }, [persist]);

  const register = useCallback(async (data: any) => {
    const res = await api.register(data);
    persist(res.user, res.accessToken, res.refreshToken);
  }, [persist]);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}