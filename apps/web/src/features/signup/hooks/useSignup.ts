/**
 * Sign-up screen hook.
 *
 * Orchestrates the registration flow: form state, Zod validation,
 * repository call, and redirect on success.
 *
 * Also exported as `useSignUp` for compatibility with test imports.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthRepository } from '@/domains/auth/repositories/auth.repository';
import { signUpSchema } from '@/domains/auth/schemas/auth.schema';
import { ApiError } from '@/lib/api/fetcher';

export type SignUpErrors = {
  email?: string;
  password?: string;
  server?: string;
};

export const useSignUp = () => {
  const router = useRouter();
  const { signUp, isRegisterPending, isLoading: repoIsLoading } = useAuthRepository();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});

  const togglePasswordVisibility = () => setIsPasswordVisible((prev) => !prev);

  const submit = async () => {
    setErrors({});

    const result = signUpSchema.safeParse({ email, password });
    if (!result.success) {
      const newErrors: SignUpErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpErrors;
        if (!newErrors[field]) newErrors[field] = issue.message;
      }
      setErrors(newErrors);
      return;
    }

    try {
      await signUp({ email: result.data.email, password: result.data.password });
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError) {
        const apiMessage: string | undefined = err.body?.error?.message;
        const details = err.body?.error?.details as Record<string, string[]> | undefined;
        if (details?.email) {
          setErrors({ email: details.email[0] });
        } else if (details?.password) {
          setErrors({ password: details.password[0] });
        } else {
          setErrors({ server: apiMessage ?? 'Something went wrong. Please try again.' });
        }
      } else {
        setErrors({ server: 'Something went wrong. Please try again.' });
      }
    }
  };

  return {
    email,
    password,
    isPasswordVisible,
    errors,
    isLoading: repoIsLoading ?? isRegisterPending ?? false,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    submit,
  };
};

// Alias for test imports (case-insensitive filesystem resolves both useSignup and useSignUp here)
export { useSignUp as useSignup };
