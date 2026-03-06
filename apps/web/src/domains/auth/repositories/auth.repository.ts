/**
 * Auth repository.
 *
 * Wraps the Orval-generated auth hooks, transforms DTOs to entities,
 * and manages token storage side-effects on mutation success.
 *
 * Import rule: features import from here — NEVER from data/generated directly.
 */
import { useAuthLogin, useAuthLogout, useAuthRegister } from '@/data/generated/auth/auth';
import { setToken, clearToken } from '@/lib/auth/tokenStorage';
import { queryClient } from '@/lib/query/query-client';
import type { AuthUser } from '@/domains/auth/entities/auth.entity';

const AUTH_QUERY_KEY = 'auth';

/**
 * Maps a backend user DTO to the AuthUser domain entity.
 * Exported so it can be unit-tested independently.
 */
export function toAuthUserEntity(dto: {
  pk: number;
  username: string;
  email: string;
}): AuthUser {
  return {
    id: String(dto.pk),
    email: dto.email,
  };
}

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: [AUTH_QUERY_KEY] });

export const useAuthRepository = () => {
  const { mutateAsync: loginMutation, isPending: isLoginPending } = useAuthLogin();
  const { mutateAsync: registerMutation, isPending: isRegisterPending } = useAuthRegister();
  const { mutateAsync: logoutMutation, isPending: isLogoutPending } = useAuthLogout();

  const login = async (credentials: { email: string; password: string }): Promise<void> => {
    const dto = await loginMutation({ data: { email: credentials.email, password: credentials.password } });
    if (dto.status !== 200) throw new Error('Login failed');
    setToken(dto.data.key);
    invalidate();
  };

  const signUp = async (credentials: { email: string; password: string }): Promise<void> => {
    // The backend register endpoint takes password1/password2 — we send the same password for both
    const dto = await registerMutation({
      data: {
        email: credentials.email,
        password1: credentials.password,
        password2: credentials.password,
      },
    });
    if (dto.status !== 201) throw new Error('Registration failed');
    setToken(dto.data.key);
    invalidate();
  };

  const logout = async (): Promise<void> => {
    await logoutMutation();
    clearToken();
    invalidate();
  };

  return {
    login,
    signUp,
    logout,
    isLoginPending,
    isRegisterPending,
    isLogoutPending,
    isLoading: isLoginPending || isRegisterPending || isLogoutPending,
  };
};

useAuthRepository.invalidate = invalidate;
