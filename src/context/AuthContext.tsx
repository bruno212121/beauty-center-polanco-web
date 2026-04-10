"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import type {
  AuthState,
  LoginCredentials,
  LoginResponse,
  User,
} from "@/types/auth";

/* ─── Helpers de cookie (para que el middleware pueda leerla) ─── */
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function setCookie(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
}

function deleteCookie() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

/* ─── Context ─── */
interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/* ─── Provider ─── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /* Restaurar sesión al montar */
  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    api
      .get<User>("/auth/me")
      .then((user) => {
        setState({ user, token, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        // Token inválido o expirado → limpiar
        localStorage.removeItem("access_token");
        deleteCookie();
        setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
      });
  }, []);

  /* Login */
  const login = useCallback(async (credentials: LoginCredentials) => {
    const { access_token, user } = await api.post<LoginResponse>(
      "/auth/login",
      credentials,
    );

    localStorage.setItem("access_token", access_token);
    setCookie(access_token);

    setState({
      user,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
    });

    router.push("/dashboard");
  }, [router]);

  /* Logout */
  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    deleteCookie();
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ─── Hook ─── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
