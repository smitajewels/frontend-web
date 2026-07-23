import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/endpoints";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens, setAccessToken } from "../api/client";
import type { AppUser, RegisterPayload } from "../types/api";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    if (res.data) setUser(res.data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (getAccessToken()) {
          const res = await authApi.me();
          if (res.data) setUser(res.data);
        }
      } catch {
        await clearTokens();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (!res.data?.user || !res.data.tokens) throw new Error(res.message || "Login failed");
    setAccessToken(res.data.tokens.accessToken);
    setUser(res.data.user);
    await saveTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    const res = await authApi.register(data);
    if (!res.data?.user || !res.data.tokens) throw new Error(res.message || "Registration failed");
    setAccessToken(res.data.tokens.accessToken);
    setUser(res.data.user);
    await saveTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refresh = getRefreshToken();
      if (refresh) await authApi.logout(refresh);
    } catch {
      /* ignore */
    }
    await clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
