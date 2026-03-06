'use client';

import { Container } from '@/notesDS/primitives/container';
import { Stack } from '@/notesDS/primitives/stack';
import { useSignUp } from '@/features/signup/hooks/useSignup';
import { SignUpForm } from '@/features/signup/components/SignupForm';

export default function SignupPage() {
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
  } = useSignUp();

  return (
    <Container size="sm" className="flex min-h-screen items-center justify-center py-16">
      <Stack gap={4} align="center" className="w-full">
        <SignUpForm
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
