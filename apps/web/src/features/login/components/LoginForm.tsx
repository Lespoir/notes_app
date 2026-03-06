'use client';

import React from 'react';
import Link from 'next/link';
import { Stack } from '@/notesDS/primitives/stack';
import { Row } from '@/notesDS/primitives/row';
import { CardShell } from '@/notesDS/primitives/cardShell';
import { Button } from '@/notesDS/components/ui/button';
import { Input } from '@/notesDS/components/ui/input';
import { H2, Muted, Small } from '@/notesDS/components/ui/typography';
import { PasswordToggle } from './PasswordToggle';
import type { LoginErrors } from '../hooks/useLogin';

interface LoginFormProps {
  email: string;
  password: string;
  isPasswordVisible: boolean;
  isLoading: boolean;
  errors: LoginErrors;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  onSubmit: () => void;
}

export function LoginForm({
  email,
  password,
  isPasswordVisible,
  isLoading,
  errors,
  onEmailChange,
  onPasswordChange,
  onTogglePasswordVisibility,
  onSubmit,
}: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <CardShell padding="lg" className="w-full max-w-sm bg-surface">
      <Stack gap={6}>
        <Stack gap={1}>
          <H2>Welcome back</H2>
          <Muted>Log in to your account to continue.</Muted>
        </Stack>

        {errors.server && (
          <Small className="rounded-[var(--radius-sm)] bg-destructive/10 px-3 py-2 text-destructive block">
            {errors.server}
          </Small>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Stack gap={4}>
            <Stack gap={1}>
              <label htmlFor="login-email">
                <Small className="text-foreground font-medium">Email</Small>
              </label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                variant={errors.email ? 'error' : 'default'}
                onChange={(e) => onEmailChange(e.target.value)}
              />
              {errors.email && (
                <Small className="text-destructive">{errors.email}</Small>
              )}
            </Stack>

            <Stack gap={1}>
              <label htmlFor="login-password">
                <Small className="text-foreground font-medium">Password</Small>
              </label>
              <Row gap={2} align="center" className="relative">
                <Input
                  id="login-password"
                  type={isPasswordVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  variant={errors.password ? 'error' : 'default'}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="pr-10"
                />
                <PasswordToggle
                  visible={isPasswordVisible}
                  onToggle={onTogglePasswordVisibility}
                  className="absolute right-3"
                />
              </Row>
              {errors.password && (
                <Small className="text-destructive">{errors.password}</Small>
              )}
            </Stack>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full"
            >
              Log in
            </Button>
          </Stack>
        </form>

        <Row justify="center" gap={1}>
          <Muted>Don&apos;t have an account?</Muted>
          <Link href="/auth/signup" className="text-sm font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </Row>
      </Stack>
    </CardShell>
  );
}
