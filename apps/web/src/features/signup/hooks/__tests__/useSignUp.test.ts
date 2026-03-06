import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Screen hook for the sign-up feature.
// These tests will be red until useSignUp is implemented.
import { useSignUp } from '../useSignup';

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

const mockSignUp = vi.fn();

describe('useSignUp', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(useAuthRepository).mockReturnValue({
      signUp: mockSignUp,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      isLoginPending: false,
      isRegisterPending: false,
      isLogoutPending: false,
    });
  });

  describe('initial state', () => {
    it('initializes with email as an empty string', () => {
      const { result } = renderHook(() => useSignUp());
      expect(result.current.email).toBe('');
    });

    it('initializes with password as an empty string', () => {
      const { result } = renderHook(() => useSignUp());
      expect(result.current.password).toBe('');
    });

    it('initializes with password hidden (isPasswordVisible = false)', () => {
      const { result } = renderHook(() => useSignUp());
      expect(result.current.isPasswordVisible).toBe(false);
    });

    it('initializes with no form errors', () => {
      const { result } = renderHook(() => useSignUp());
      expect(result.current.errors).toEqual({});
    });

    it('initializes with isLoading false', () => {
      const { result } = renderHook(() => useSignUp());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setEmail', () => {
    it('updates the email field', () => {
      const { result } = renderHook(() => useSignUp());
      act(() => {
        result.current.setEmail('user@example.com');
      });
      expect(result.current.email).toBe('user@example.com');
    });
  });

  describe('setPassword', () => {
    it('updates the password field', () => {
      const { result } = renderHook(() => useSignUp());
      act(() => {
        result.current.setPassword('mypassword');
      });
      expect(result.current.password).toBe('mypassword');
    });
  });

  describe('togglePasswordVisibility', () => {
    it('toggles isPasswordVisible from false to true', () => {
      const { result } = renderHook(() => useSignUp());
      act(() => {
        result.current.togglePasswordVisibility();
      });
      expect(result.current.isPasswordVisible).toBe(true);
    });

    it('toggles isPasswordVisible from true back to false', () => {
      const { result } = renderHook(() => useSignUp());
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
    it('calls signUp with valid credentials', async () => {
      mockSignUp.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('Password1!');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'Password1!',
      });
    });

    it('redirects to the notes list after successful sign up', async () => {
      mockSignUp.mockResolvedValue(undefined);
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('Password1!');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockReplace).toHaveBeenCalledWith('/');
    });

    it('does not call signUp when email is invalid', async () => {
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('bademail');
        result.current.setPassword('Password1!');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('does not call signUp when password is too short', async () => {
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('123');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('sets errors when email is invalid', async () => {
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('bademail');
        result.current.setPassword('Password1!');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors.email).toBeDefined();
    });

    it('sets errors when password is too short', async () => {
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('user@example.com');
        result.current.setPassword('123');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(result.current.errors.password).toBeDefined();
    });

    it('does not redirect when validation fails', async () => {
      const { result } = renderHook(() => useSignUp());

      act(() => {
        result.current.setEmail('bademail');
        result.current.setPassword('Password1!');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
