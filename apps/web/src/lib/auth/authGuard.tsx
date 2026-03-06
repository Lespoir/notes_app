'use client';

/**
 * AuthGuard — client-side route protection component.
 *
 * Wraps a protected route's content. If the user is not authenticated,
 * redirects to /auth/login. Renders nothing while redirecting.
 */
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from './authState';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthState();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
