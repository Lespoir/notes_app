import { describe, it, expect } from 'vitest';
import { signUpSchema, loginSchema } from '../auth.schema';

// These tests define expected validation behavior for auth Zod schemas.
// They will be red until the schemas are implemented.

describe('signUpSchema', () => {
  describe('email field', () => {
    it('accepts a valid email address', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty email', () => {
      const result = signUpSchema.safeParse({
        email: '',
        password: 'Password1!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a missing email field', () => {
      const result = signUpSchema.safeParse({ password: 'Password1!' });
      expect(result.success).toBe(false);
    });

    it('rejects a malformed email without @', () => {
      const result = signUpSchema.safeParse({
        email: 'notanemail',
        password: 'Password1!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a malformed email without domain', () => {
      const result = signUpSchema.safeParse({
        email: 'user@',
        password: 'Password1!',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a malformed email without local part', () => {
      const result = signUpSchema.safeParse({
        email: '@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(false);
    });

    it('includes an email validation error message on failure', () => {
      const result = signUpSchema.safeParse({
        email: 'bademail',
        password: 'Password1!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const emailErrors = result.error.issues.filter((i) =>
          i.path.includes('email'),
        );
        expect(emailErrors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('password field', () => {
    it('accepts a password meeting minimum length requirement', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Password1!',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty password', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a missing password field', () => {
      const result = signUpSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });

    it('rejects a password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'short',
      });
      expect(result.success).toBe(false);
    });

    it('accepts a password of exactly 8 characters', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: 'Abcdef1!',
      });
      expect(result.success).toBe(true);
    });

    it('includes a password validation error message on failure', () => {
      const result = signUpSchema.safeParse({
        email: 'user@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const passwordErrors = result.error.issues.filter((i) =>
          i.path.includes('password'),
        );
        expect(passwordErrors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('inferred type', () => {
    it('returns the parsed object on success', () => {
      const input = { email: 'user@example.com', password: 'Password1!' };
      const result = signUpSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('Password1!');
      }
    });
  });
});

describe('loginSchema', () => {
  describe('email field', () => {
    it('accepts a valid email address', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a malformed email', () => {
      const result = loginSchema.safeParse({
        email: 'notanemail',
        password: 'anypassword',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a missing email field', () => {
      const result = loginSchema.safeParse({ password: 'anypassword' });
      expect(result.success).toBe(false);
    });
  });

  describe('password field', () => {
    it('accepts a non-empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('rejects an empty password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects a missing password field', () => {
      const result = loginSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(false);
    });
  });

  describe('inferred type', () => {
    it('returns the parsed object on success', () => {
      const input = { email: 'user@example.com', password: 'mypassword' };
      const result = loginSchema.safeParse(input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('user@example.com');
        expect(result.data.password).toBe('mypassword');
      }
    });
  });
});
