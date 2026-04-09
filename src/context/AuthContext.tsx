"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getAuth, setAuth, clearAuth, type AuthState } from "@/lib/auth";

interface AuthContextValue {
  auth: AuthState | null;
  login: (email: string) => void;
  logout: () => void;
  markProfileComplete: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  auth: null,
  login: () => {},
  logout: () => {},
  markProfileComplete: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuthState] = useState<AuthState | null>(null);

  useEffect(() => {
    setAuthState(getAuth());
  }, []);

  const login = useCallback((email: string) => {
    const state: AuthState = { authenticated: true, email, profileComplete: false };
    setAuth(state);
    setAuthState(state);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuthState(null);
  }, []);

  const markProfileComplete = useCallback(() => {
    const current = getAuth();
    if (current) {
      const updated = { ...current, profileComplete: true };
      setAuth(updated);
      setAuthState(updated);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout, markProfileComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
