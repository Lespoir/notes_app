import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, clearToken } from '../tokenStorage';

// Tests for the token storage utility in lib/auth/.
// These tests will be red until tokenStorage is implemented.

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('setToken', () => {
    it('persists the token in localStorage', () => {
      setToken('my-auth-token');
      expect(localStorage.getItem('auth_token')).toBe('my-auth-token');
    });

    it('overwrites a previously stored token', () => {
      setToken('first-token');
      setToken('second-token');
      expect(localStorage.getItem('auth_token')).toBe('second-token');
    });
  });

  describe('getToken', () => {
    it('returns the stored token after setToken', () => {
      setToken('abc123');
      expect(getToken()).toBe('abc123');
    });

    it('returns null when no token has been stored', () => {
      expect(getToken()).toBeNull();
    });

    it('returns null after clearToken is called', () => {
      setToken('some-token');
      clearToken();
      expect(getToken()).toBeNull();
    });
  });

  describe('clearToken', () => {
    it('removes the token from localStorage', () => {
      setToken('token-to-remove');
      clearToken();
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('is safe to call when no token is stored', () => {
      expect(() => clearToken()).not.toThrow();
    });
  });
});
