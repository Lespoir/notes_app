'use client';

import React from 'react';
import Link from 'next/link';
import { Stack } from '@/notesDS/primitives/stack';
import { Row } from '@/notesDS/primitives/row';
import { Button } from '@/notesDS/components/ui/button';
import { Input } from '@/notesDS/components/ui/input';
import { H1, Small } from '@/notesDS/components/ui/typography';
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
    <Stack gap={6} align="center" className="w-full max-w-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustrations/cactus.png"
        alt="Happy cactus"
        className="h-24 object-contain"
      />

      <H1>Yay, You&apos;re Back!</H1>

      {errors.server && (
        <Small className="rounded-[var(--radius-sm)] bg-destructive/10 px-3 py-2 text-destructive block w-full">
          {errors.server}
        </Small>
      )}

      <form onSubmit={handleSubmit} noValidate className="w-full">
        <Stack gap={3}>
          <Stack gap={1}>
            <Input
              id="login-email"
              type="email"
              placeholder="Email address"
              aria-label="Email address"
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
            <Row gap={0} align="center" className="relative">
              <Input
                id="login-password"
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="Password"
                aria-label="Password"
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
            variant="secondary"
            disabled={isLoading}
            className="w-full mt-3"
          >
            Login
          </Button>
        </Stack>
      </form>

      <Link href="/auth/signup" className="text-sm text-primary underline">
        Oops! I&apos;ve never been here before
      </Link>
    </Stack>
  );
}
