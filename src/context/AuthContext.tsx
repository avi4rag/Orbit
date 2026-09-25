import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export interface UserGoal {
  id: string;
  title: string;
  category: 'career' | 'wealth' | 'peace' | 'confidence' | 'love' | 'travel';
  identityStatement: string;
  vitality: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  goals?: UserGoal[];
  preferences?: {
    preferredDuration: number;
    visualizationStyle: string;
    affirmationStyle: string;
    preferredMood: string;
  };
  streak?: {
    current: number;
    longest: number;
    lastRitualDate: string | null;
  };
  favorites?: string[];
  onboarded?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthModal: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (name: string, email: string, password: string) => Promise<UserProfile>;
  demoSignIn: () => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUserLocal: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('orbit_jwt_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const data = await api.getMe();
      if (data?.user) {
        const storedOnboarded = localStorage.getItem(`orbit_onboarded_${data.user.id || data.user.email}`);
        setUser({
          ...data.user,
          onboarded: data.user.onboarded ?? (storedOnboarded === 'true'),
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const openAuthModal = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    const storedOnboarded = localStorage.getItem(`orbit_onboarded_${res.user.id || res.user.email}`);
    const u: UserProfile = {
      ...res.user,
      onboarded: res.user.onboarded ?? (storedOnboarded === 'true'),
    };
    setUser(u);
    closeAuthModal();
    return u;
  }, [closeAuthModal]);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.register(name, email, password);
    const u: UserProfile = {
      ...res.user,
      onboarded: false,
    };
    setUser(u);
    closeAuthModal();
    return u;
  }, [closeAuthModal]);

  const demoSignIn = useCallback(async () => {
    const res = await api.guestDemo();
    const storedOnboarded = localStorage.getItem(`orbit_onboarded_${res.user.id || res.user.email}`);
    const u: UserProfile = {
      ...res.user,
      onboarded: res.user.onboarded ?? (storedOnboarded === 'true'),
    };
    setUser(u);
    closeAuthModal();
    return u;
  }, [closeAuthModal]);

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.getMe();
      if (data?.user) {
        const storedOnboarded = localStorage.getItem(`orbit_onboarded_${data.user.id || data.user.email}`);
        setUser({
          ...data.user,
          onboarded: data.user.onboarded ?? (storedOnboarded === 'true'),
        });
      }
    } catch {
      // silent
    }
  }, []);

  const updateUserLocal = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        showAuthModal,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        demoSignIn,
        logout,
        refreshUser,
        updateUserLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
