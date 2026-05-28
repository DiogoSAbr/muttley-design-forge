import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { setAuthToken, getAuthToken } from "@/lib/api/client";

export type UserRole = "professor" | "aluno";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  mustChangePassword?: boolean;
  studentId?: string;
  github?: string;
  linkedin?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USER_STORAGE_KEY = "authUser";

function readPersistedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function persistUser(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readPersistedUser());
  const [token, setToken] = useState<string | null>(() => getAuthToken());

  useEffect(() => {
    persistUser(user);
  }, [user]);

  function login(u: AuthUser, t: string) {
    setAuthToken(t);
    setToken(t);
    setUser(u);
  }

  function logout() {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }

  function updateUser(updates: Partial<AuthUser>) {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
