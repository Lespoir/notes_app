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
      const message =
        err instanceof Error && err.message.includes('409')
          ? 'An account with this email already exists.'
          : 'Something went wrong. Please try again.';
      setErrors({ server: message });
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
