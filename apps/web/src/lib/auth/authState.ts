'use client';

/**
 * useAuthState — client-side auth state hook.
 *
 * Provides the current authentication status and token, plus imperative
 * login/logout helpers that keep localStorage and the cookie in sync.
 *
 * This hook is consumed by AuthGuard and screen hooks.
 */
import { useState } from 'react';
import { getToken, setToken, clearToken } from './tokenStorage';

export type AuthState = {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
};

export function useAuthState(): AuthState {
  const [token, setTokenState] = useState<string | null>(() => getToken());

  const login = (newToken: string) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
  };

  return {
    isAuthenticated: token !== null && token !== '',
    token,
    login,
    logout,
  };
}
