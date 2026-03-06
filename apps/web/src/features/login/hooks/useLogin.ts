/**
 * Login screen hook.
 *
 * Orchestrates the login flow: form state, validation, repository call,
 * and redirect on success.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRepository } from '@/domains/auth/repositories/auth.repository';
import { loginSchema } from '@/domains/auth/schemas/auth.schema';
import { ApiError } from '@/lib/api/fetcher';

export type LoginErrors = {
  email?: string;
  password?: string;
  server?: string;
};

export const useLogin = () => {
  const router = useRouter();
  const { login, isLoginPending, isLoading: repoIsLoading } = useAuthRepository();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const submit = async () => {
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const newErrors: LoginErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginErrors;
        if (!newErrors[field]) newErrors[field] = issue.message;
      }
      setErrors(newErrors);
      return;
    }

    try {
      await login({ email: result.data.email, password: result.data.password });
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError) {
        const apiMessage: string | undefined = err.body?.error?.message;
        setErrors({ server: apiMessage ?? 'Invalid email or password. Please try again.' });
      } else {
        setErrors({ server: 'Invalid email or password. Please try again.' });
      }
    }
  };

  return {
    email,
    password,
    isPasswordVisible,
    errors,
    isLoading: repoIsLoading ?? isLoginPending ?? false,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    submit,
  };
};
