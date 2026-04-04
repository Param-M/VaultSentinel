import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/auth.types";
import { getMe, logout as doLogout } from "../api/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("vs_session_token");
    const savedUser = localStorage.getItem("vs_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  function setSession(newToken: string, newUser: User) {
    localStorage.setItem("vs_session_token", newToken);
    localStorage.setItem("vs_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    doLogout();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
