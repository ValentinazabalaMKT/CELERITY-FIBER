"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { mockCustomer } from "@/data/mockCustomer";
import type { Customer } from "@/types";
import { delay } from "./utils";

// -----------------------------------------------------------------------
// Demo-only authentication. There is no real backend yet -- this exists so
// the rest of the app has a real session/auth boundary to build against.
// See docs/INTEGRATIONS.md for how this gets swapped for real auth
// (Supabase Auth is the proposed target).
// -----------------------------------------------------------------------
const DEMO_EMAIL = "demo@celerityfiber.com";
const DEMO_PASSWORD = "Celerity123!";
const SESSION_KEY = "my-celerity:session";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  customer: Customer | null;
  activeAccountId: string;
  setActiveAccountId: (accountId: string) => void;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAccountId, setActiveAccountIdState] = useState(mockCustomer.activeAccountId);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(SESSION_KEY);
      if (stored === "active") setIsAuthenticated(true);
      const storedAccount = window.localStorage.getItem("my-celerity:activeAccount");
      if (storedAccount) setActiveAccountIdState(storedAccount);
    } catch {
      // localStorage unavailable (e.g. private browsing) -- fall back to
      // an unauthenticated session rather than throwing.
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    await delay(null, 700);
    if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return { ok: false as const, error: "Invalid email or password." };
    }
    setIsAuthenticated(true);
    try {
      window.localStorage.setItem(SESSION_KEY, "active");
    } catch {}
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  const setActiveAccountId = useCallback((accountId: string) => {
    setActiveAccountIdState(accountId);
    try {
      window.localStorage.setItem("my-celerity:activeAccount", accountId);
    } catch {}
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      customer: isAuthenticated ? mockCustomer : null,
      activeAccountId,
      setActiveAccountId,
      login,
      logout,
    }),
    [isAuthenticated, isLoading, activeAccountId, setActiveAccountId, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
