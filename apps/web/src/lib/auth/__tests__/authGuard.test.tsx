import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// AuthGuard wraps protected routes and redirects unauthenticated users.
// These tests will be red until the component is implemented.
import { AuthGuard } from '../authGuard';

// Mock Next.js navigation so we can assert on redirects without a full router.
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// Mock the auth state hook so we can control authentication status in tests.
vi.mock('../authState', () => ({
  useAuthState: vi.fn(),
}));

import { useAuthState } from '../authState';

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('when user is authenticated', () => {
    it('renders the protected children', () => {
      (useAuthState as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
        token: 'valid-token',
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <AuthGuard>
          <p>Protected content</p>
        </AuthGuard>,
      );

      expect(screen.getByText('Protected content')).toBeInTheDocument();
    });

    it('does not redirect when authenticated', () => {
      (useAuthState as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: true,
        token: 'valid-token',
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <AuthGuard>
          <p>Content</p>
        </AuthGuard>,
      );

      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe('when user is not authenticated', () => {
    it('redirects to the login page', () => {
      (useAuthState as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <AuthGuard>
          <p>Protected content</p>
        </AuthGuard>,
      );

      expect(mockReplace).toHaveBeenCalledWith('/auth/login');
    });

    it('does not render the protected children', () => {
      (useAuthState as ReturnType<typeof vi.fn>).mockReturnValue({
        isAuthenticated: false,
        token: null,
        login: vi.fn(),
        logout: vi.fn(),
      });

      render(
        <AuthGuard>
          <p>Protected content</p>
        </AuthGuard>,
      );

      expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
    });
  });
});
