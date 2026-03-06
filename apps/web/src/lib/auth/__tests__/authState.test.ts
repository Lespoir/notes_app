import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Import the hook under test — will be red until implemented.
import { useAuthState } from '../authState';

// tokenStorage is mocked so tests do not touch real localStorage internals.
vi.mock('../tokenStorage', () => ({
  getToken: vi.fn(),
  setToken: vi.fn(),
  clearToken: vi.fn(),
}));

import { getToken, setToken, clearToken } from '../tokenStorage';

describe('useAuthState', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('is unauthenticated when no token is in storage', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const { result } = renderHook(() => useAuthState());
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('is authenticated when a token is already in storage', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token');
      const { result } = renderHook(() => useAuthState());
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('sets isAuthenticated to true after login', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const { result } = renderHook(() => useAuthState());

      act(() => {
        result.current.login('new-token');
      });

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('calls setToken with the provided token', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const { result } = renderHook(() => useAuthState());

      act(() => {
        result.current.login('new-token');
      });

      expect(setToken).toHaveBeenCalledWith('new-token');
    });

    it('exposes the token after login', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const { result } = renderHook(() => useAuthState());

      act(() => {
        result.current.login('my-token');
      });

      expect(result.current.token).toBe('my-token');
    });
  });

  describe('logout', () => {
    it('sets isAuthenticated to false after logout', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token');
      const { result } = renderHook(() => useAuthState());

      act(() => {
        result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('calls clearToken on logout', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token');
      const { result } = renderHook(() => useAuthState());

      act(() => {
        result.current.logout();
      });

      expect(clearToken).toHaveBeenCalled();
    });

    it('sets token to null after logout', () => {
      (getToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token');
      const { result } = renderHook(() => useAuthState());

      act(() => {
        result.current.logout();
      });

      expect(result.current.token).toBeNull();
    });
  });
});
