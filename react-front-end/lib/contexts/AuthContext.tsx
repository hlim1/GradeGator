"use client"


import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, login as authLogin, logout as authLogout } from '../auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isStaff: boolean;
  isInstructor: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // const user = await getCurrentUser();
      setUser(user);
    } catch {
      setError('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await authLogin(credentials);
      setUser(user);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authLogout();
      setUser(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: user !== null,
    isStaff: user?.is_staff || false,
    isInstructor: user?.instructor !== null || false,
    isStudent: user?.student !== null || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}