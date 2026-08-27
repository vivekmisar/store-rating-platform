import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const TOKEN_KEY = 'store_rating_token';
const USER_KEY = 'store_rating_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user]);

  async function login(credentials) {
    const response = await api.login(credentials);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function register(payload) {
    const response = await api.register(payload);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  }

  async function logout() {
    try {
      if (token) await api.logout();
    } catch {
      // Even if the server call fails, remove the client-side token.
    } finally {
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({ token, user, isAuthenticated: Boolean(token && user), login, register, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
