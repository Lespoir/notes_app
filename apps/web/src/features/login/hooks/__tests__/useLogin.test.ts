import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Screen hook for the login feature.
// These tests will be red until useLogin is implemented.
import { useLogin } from '../useLogin';

// Mock the auth repository so we avoid real network calls.
vi.mock('@/domains/auth/repositories/auth.repository', () => ({
  useAuthRepository: vi.fn(),
}));

// Mock Next.js navigation.
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import { useAuthRepository } from '@/domains/auth/repositories/auth.repository';

const mockLogin = vi.fn();

describe('useLogin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuthRepository).mockReturnValue({
      login: mockLogin,
      isLoading: false,
      signUp: vi.fn(),
      logout: vi.fn(),
      isLoginPending: false,
      isRegisterPending: false,
      isLogoutPending: false,
    });
  });

  describe('initial state', () => {
    it('initializes with email as an empty string', () => {
      const { result } = renderHook(() => useLogin());
      expect(result.current.email).toBe('');
    });

    it('initializes with password as an empty string', () => {
      const { result } = renderHook(() => useLogin());
      expect(result.current.password).toBe('');
    });

    it('initializes with password hidden (isPasswordVisible = false)', () => {
      const { result } = renderHook(() => useLogin());
      expect(result.current.isPasswordVisible).toBe(false);
    });

    it('initializes with no form errors', () => {
      const { result } = renderHook(() => useLogin());
      expect(result.current.errors).toEqual({});
    });

    it('initializes with isLoading false', () => {
      const { result } = renderHook(() => useLogin());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setEmail', () => {
    it('updates the email field', () => {
      const { result } = renderHook(() => useLogin());
      act(() => {
        result.current.setEmail('user@example.com');
      });
      expect(result.current.email).toBe('user@example.com');
    });
  });

  describe('setPassword', () => {
    it('updates the password field', () => {
      const { result } = renderHook(() => useLogin());
      act(() => {
        result.current.setPassword('mypassword');
      });
      expect(result.current.password).toBe('mypassword');
    });
  });

  describe('togglePasswordVisibility', () => {
    it('toggles isPasswordVisible from false to true', () => {
      const { result } = renderHook(() => useLogin());
      act(() => {
        result.current.togglePasswordVisibility();
      });
      expect(result.current.isPasswordVisible).toBe(true);
    });

    it('toggles isPasswordVisible from true back to false', () => {
      const { result } = renderHook(() => useLogin());
      act(() => {
        result.current.togglePasswordVisibility();
      });
      act(() => {
        result.current.togglePasswordVisibility();
      });
      expect(result.current.isPasswordVisible).toBe(false);
    });
  });

  describe('submit', () => {
    it('calls login with valid credentials', async () => {
      mockLogin.mockResolvedValue(undefined);
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('mypassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'mypassword',
      });
    });

    it('redirects to the notes list after successful login', async () => {
      mockLogin.mockResolvedValue(undefined);
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('mypassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockReplace).toHaveBeenCalledWith('/');
    });

    it('does not call login when email is invalid', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('notanemail');
        result.current.setPassword('mypassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('does not call login when password is empty', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('sets an email error when email is invalid', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('notanemail');
        result.current.setPassword('mypassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors.email).toBeDefined();
    });

    it('sets a password error when password is empty', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors.password).toBeDefined();
    });

    it('does not redirect when validation fails', async () => {
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('notanemail');
        result.current.setPassword('mypassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });

    it('exposes a server error when the login request fails', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('wrongpassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors.server).toBeDefined();
    });

    it('does not redirect when the server returns an error', async () => {
      mockLogin.mockRejectedValue(new Error('Invalid credentials'));
      const { result } = renderHook(() => useLogin());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('wrongpassword');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
