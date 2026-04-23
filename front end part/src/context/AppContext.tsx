import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { PredictionResult } from '@/lib/predictions';
import { authAPI, AuthUser } from '@/api/auth';
import { historyAPI } from '@/api/history';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Submission {
  id: string; // Keep as string for UI, though DB uses number
  title: string;
  mode: 'all' | 'specific';
  disease?: string;
  date: Date;
  diseases: string[];
  risk_percentages: Record<string, number>;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  submissions: Submission[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  addSubmission: (submission: Submission) => void;
}

const AppContext = createContext<AppState | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('medipredict_token');
      if (token) {
        try {
          const authUser = await authAPI.getMe();
          setUser({ id: authUser.id, email: authUser.email, name: authUser.full_name });
          fetchHistory();
        } catch (error) {
          console.error("Auto-login failed:", error);
          localStorage.removeItem('medipredict_token');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const history = await historyAPI.getAll();
      const mapped: Submission[] = history.map(h => ({
        id: h.id.toString(),
        title: h.title,
        mode: h.mode,
        date: new Date(h.created_at),
        diseases: h.diseases,
        risk_percentages: h.risk_percentages
      }));
      setSubmissions(mapped);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    localStorage.setItem('medipredict_token', res.access_token);
    setUser({ id: res.user.id, email: res.user.email, name: res.user.full_name });
    fetchHistory();
  }, [fetchHistory]);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await authAPI.signup(name, email, password);
    localStorage.setItem('medipredict_token', res.access_token);
    setUser({ id: res.user.id, email: res.user.email, name: res.user.full_name });
    fetchHistory();
  }, [fetchHistory]);

  const logout = useCallback(() => {
    localStorage.removeItem('medipredict_token');
    setUser(null);
    setSubmissions([]); // Clear history on logout
  }, []);

  const addSubmission = useCallback((sub: Submission) => {
    setSubmissions(prev => [sub, ...prev]);
  }, []);

  return (
    <AppContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      submissions, 
      login, 
      signup, 
      logout, 
      addSubmission 
    }}>
      {children}
    </AppContext.Provider>
  );
};
