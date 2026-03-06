'use client';

import { Container } from '@/notesDS/primitives/container';
import { Stack } from '@/notesDS/primitives/stack';
import { useLogin } from '@/features/login/hooks/useLogin';
import { LoginForm } from '@/features/login/components/LoginForm';

export default function LoginPage() {
  const {
    email,
    password,
    isPasswordVisible,
    isLoading,
    errors,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    submit,
  } = useLogin();

  return (
    <Container size="sm" className="flex min-h-screen items-center justify-center py-16">
      <Stack gap={4} align="center" className="w-full">
        <LoginForm
          email={email}
          password={password}
          isPasswordVisible={isPasswordVisible}
          isLoading={isLoading}
          errors={errors}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePasswordVisibility={togglePasswordVisibility}
          onSubmit={submit}
        />
      </Stack>
    </Container>
  );
}
