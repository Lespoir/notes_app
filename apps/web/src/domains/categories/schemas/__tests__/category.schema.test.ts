import { describe, it, expect } from 'vitest';
import { categoryFilterSchema } from '../category.schema';

// Tests for Zod schemas in the categories domain.
// These tests define the expected validation behavior.
// They will be red until the schemas are implemented.

describe('categoryFilterSchema', () => {
  describe('categoryId field', () => {
    it('accepts a valid UUID', () => {
      const result = categoryFilterSchema.safeParse({
        categoryId: '550e8400-e29b-41d4-a716-446655440000',
      });
      expect(result.success).toBe(true);
    });

    it('accepts undefined (no filter applied — all categories)', () => {
      const result = categoryFilterSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts an explicit undefined value', () => {
      const result = categoryFilterSchema.safeParse({ categoryId: undefined });
      expect(result.success).toBe(true);
    });

    it('rejects a non-UUID string', () => {
      const result = categoryFilterSchema.safeParse({ categoryId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('rejects an empty string', () => {
      const result = categoryFilterSchema.safeParse({ categoryId: '' });
      expect(result.success).toBe(false);
    });

    it('returns the categoryId on success', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const result = categoryFilterSchema.safeParse({ categoryId: id });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBe(id);
      }
    });

    it('returns undefined categoryId when omitted', () => {
      const result = categoryFilterSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryId).toBeUndefined();
      }
    });

    it('includes a validation error on failure', () => {
      const result = categoryFilterSchema.safeParse({ categoryId: 'bad' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.issues.filter((i) =>
          i.path.includes('categoryId'),
        );
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });
});
