import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'auth_token';

function decodeBase64Url(input) {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  return atob(padded);
}

function parseToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (!payload?.id || !payload?.username || !payload?.role) return null;
    if (payload.exp && Date.now() >= payload.exp * 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setAuthReady(true);
      return;
    }

    const parsedUser = parseToken(storedToken);
    if (!parsedUser) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      setAuthReady(true);
      return;
    }

    setToken(storedToken);
    setUser(parsedUser);
    setAuthReady(true);
  }, []);

  const login = async (username, password) => {
    const res = await apiClient.post('/login', { username, password });
    const parsedUser = parseToken(res.token);
    if (!parsedUser) {
      throw new Error('Token invalide recu du serveur');
    }

    setToken(res.token);
    setUser(parsedUser);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, res.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);


