import { describe, it, expect } from 'vitest';
import { toAuthUserEntity } from '../auth.repository';

// Tests for the DTO -> entity transformation logic in the auth repository.
// The `toAuthUserEntity` mapper is a pure function extracted from the repository
// so it can be unit-tested without mocking React Query hooks.
// These tests will be red until the repository is implemented.

describe('toAuthUserEntity (DTO to entity mapping)', () => {
  it('maps the user id from the DTO', () => {
    const dto = { pk: 1, username: 'user@example.com', email: 'user@example.com' };
    const entity = toAuthUserEntity(dto);
    expect(entity.id).toBe('1');
  });

  it('maps the email from the DTO', () => {
    const dto = { pk: 42, username: 'user@example.com', email: 'user@example.com' };
    const entity = toAuthUserEntity(dto);
    expect(entity.email).toBe('user@example.com');
  });

  it('produces an entity with an id string (even when pk is a number)', () => {
    const dto = { pk: 99, username: 'a@b.com', email: 'a@b.com' };
    const entity = toAuthUserEntity(dto);
    expect(typeof entity.id).toBe('string');
  });

  it('produces an entity that does not expose raw DTO fields (pk)', () => {
    const dto = { pk: 7, username: 'x@y.com', email: 'x@y.com' };
    const entity = toAuthUserEntity(dto);
    expect(entity).not.toHaveProperty('pk');
  });

  it('produces an entity that does not expose username as a separate field', () => {
    // The domain entity uses `email` as the identity, not `username`
    const dto = { pk: 3, username: 'x@y.com', email: 'x@y.com' };
    const entity = toAuthUserEntity(dto);
    expect(entity).not.toHaveProperty('username');
  });
});
