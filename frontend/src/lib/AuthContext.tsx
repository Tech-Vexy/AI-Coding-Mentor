'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: () => void;
  logout: () => void;
  setSession: (token: string, user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    // Load session from local storage on mount
    const storedToken = localStorage.getItem('ada_session_token');
    const storedUser = localStorage.getItem('ada_session_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const login = () => {
    // Redirect to the backend login flow
    window.location.href = "http://localhost:8000/auth/login";
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ada_session_token');
    localStorage.removeItem('ada_session_user');
  };

  const setSession = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ada_session_token', newToken);
    localStorage.setItem('ada_session_user', JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setSession }}>
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
