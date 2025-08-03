"use client";

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const SESSION_DURATION = 3600000; // 1 hour

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('session_timestamp');
    setIsAuthenticated(false);
  }, []);

  const resetSession = useCallback(() => {
    if (isAuthenticated) {
      localStorage.setItem('session_timestamp', Date.now().toString());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      const lastActivity = localStorage.getItem('session_timestamp');
      if (lastActivity && Date.now() - parseInt(lastActivity) < SESSION_DURATION) {
        setIsAuthenticated(true);
        resetSession();
      } else {
        logout();
      }
    } catch (error) {
      console.error("Could not access local storage", error);
      logout();
    }
    setIsLoaded(true);
  }, [logout, resetSession]);

  useEffect(() => {
    let activityInterval: NodeJS.Timeout;
    
    if (isAuthenticated) {
      activityInterval = setInterval(() => {
        const lastActivity = localStorage.getItem('session_timestamp');
        if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_DURATION) {
          logout();
        }
      }, 60000); // Check every minute

      window.addEventListener('mousemove', resetSession);
      window.addEventListener('keydown', resetSession);
    }

    return () => {
      clearInterval(activityInterval);
      window.removeEventListener('mousemove', resetSession);
      window.removeEventListener('keydown', resetSession);
    };
  }, [isAuthenticated, logout, resetSession]);

  const login = (password: string): boolean => {
    if (password === '2025') {
      setIsAuthenticated(true);
      localStorage.setItem('session_timestamp', Date.now().toString());
      return true;
    }
    return false;
  };

  const value = { isAuthenticated, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {isLoaded ? children : null}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
