import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, clearToken, setTokenInStorage } from "../utils/api";
import { connectSocket } from "../services/socket";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  refreshUser: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.me();
      setUser(data.user || null);
    } catch {
      setUser(null);
      clearToken();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email, password) => {
    const data = await api.login({ email, password });
    if (data.token) {
      setTokenInStorage(data.token);
    }
    setUser(data.user || null);
    connectSocket();
    return data.user;
  }, []);

  const signup = useCallback(async (body) => {
    const data = await api.signup(body);
    if (data.token) {
      setTokenInStorage(data.token);
    }
    setUser(data.user || null);
    connectSocket();
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {}
    clearToken();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (body) => {
    const data = await api.updateMe(body);
    setUser(data.user || null);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, updateProfile, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
