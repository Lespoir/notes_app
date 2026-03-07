import { describe, it, expect } from 'vitest';

/**
 * Tests for auto-save rules added in task 5A.
 *
 * ADR-003 decides:
 *   - Title and content changes trigger debounced auto-save (~1 second delay)
 *   - Category changes trigger immediate save (no debounce)
 *   - A note that hasn't actually changed should not trigger a save
 *
 * These rules are expected to live as pure functions in
 * `domains/notes/rules/notes.rules.ts` so they are fully testable without
 * React or network dependencies.
 *
 * Tests are red until the implementation is added.
 */

import {
  shouldDebounceSave,
  shouldImmediateSave,
  buildUpdatePayload,
} from '@/domains/notes/rules/notes.rules';

// ── shouldDebounceSave ────────────────────────────────────────────────────────

describe('shouldDebounceSave', () => {
  it('returns true when the title has changed', () => {
    expect(
      shouldDebounceSave(
        { title: 'Old', content: 'Same', categoryId: 'cat-1' },
        { title: 'New', content: 'Same', categoryId: 'cat-1' },
      ),
    ).toBe(true);
  });

  it('returns true when the content has changed', () => {
    expect(
      shouldDebounceSave(
        { title: 'Same', content: 'Old content', categoryId: 'cat-1' },
        { title: 'Same', content: 'New content', categoryId: 'cat-1' },
      ),
    ).toBe(true);
  });

  it('returns false when neither title nor content has changed', () => {
    expect(
      shouldDebounceSave(
        { title: 'Same', content: 'Same', categoryId: 'cat-1' },
        { title: 'Same', content: 'Same', categoryId: 'cat-1' },
      ),
    ).toBe(false);
  });

  it('returns false when only the categoryId has changed (category uses immediate save)', () => {
    expect(
      shouldDebounceSave(
        { title: 'Same', content: 'Same', categoryId: 'cat-1' },
        { title: 'Same', content: 'Same', categoryId: 'cat-2' },
      ),
    ).toBe(false);
  });

  it('returns true when both title and content have changed', () => {
    expect(
      shouldDebounceSave(
        { title: 'Old', content: 'Old', categoryId: 'cat-1' },
        { title: 'New', content: 'New', categoryId: 'cat-1' },
      ),
    ).toBe(true);
  });

  it('returns false when both values are empty strings and unchanged', () => {
    expect(
      shouldDebounceSave(
        { title: '', content: '', categoryId: null },
        { title: '', content: '', categoryId: null },
      ),
    ).toBe(false);
  });
});

// ── shouldImmediateSave ───────────────────────────────────────────────────────

describe('shouldImmediateSave', () => {
  it('returns true when the categoryId has changed', () => {
    expect(
      shouldImmediateSave(
        { title: 'Same', content: 'Same', categoryId: 'cat-1' },
        { title: 'Same', content: 'Same', categoryId: 'cat-2' },
      ),
    ).toBe(true);
  });

  it('returns true when categoryId changes from null to a value', () => {
    expect(
      shouldImmediateSave(
        { title: 'Same', content: 'Same', categoryId: null },
        { title: 'Same', content: 'Same', categoryId: 'cat-1' },
      ),
    ).toBe(true);
  });

  it('returns true when categoryId changes from a value to null', () => {
    expect(
      shouldImmediateSave(
        { title: 'Same', content: 'Same', categoryId: 'cat-1' },
        { title: 'Same', content: 'Same', categoryId: null },
      ),
    ).toBe(true);
  });

  it('returns false when categoryId is unchanged', () => {
    expect(
      shouldImmediateSave(
        { title: 'Old', content: 'Old', categoryId: 'cat-1' },
        { title: 'New', content: 'New', categoryId: 'cat-1' },
      ),
    ).toBe(false);
  });

  it('returns false when both categoryId values are null', () => {
    expect(
      shouldImmediateSave(
        { title: '', content: '', categoryId: null },
        { title: 'New', content: 'New', categoryId: null },
      ),
    ).toBe(false);
  });
});

// ── buildUpdatePayload ────────────────────────────────────────────────────────

describe('buildUpdatePayload', () => {
  it('includes title when it has changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Old', content: 'Same', categoryId: 'cat-1' },
      { title: 'New', content: 'Same', categoryId: 'cat-1' },
    );
    expect(payload).toHaveProperty('title', 'New');
  });

  it('includes content when it has changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Same', content: 'Old', categoryId: 'cat-1' },
      { title: 'Same', content: 'New', categoryId: 'cat-1' },
    );
    expect(payload).toHaveProperty('content', 'New');
  });

  it('includes category when categoryId has changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Same', content: 'Same', categoryId: 'cat-1' },
      { title: 'Same', content: 'Same', categoryId: 'cat-2' },
    );
    expect(payload).toHaveProperty('category', 'cat-2');
  });

  it('includes category as null when categoryId changes to null', () => {
    const payload = buildUpdatePayload(
      { title: 'Same', content: 'Same', categoryId: 'cat-1' },
      { title: 'Same', content: 'Same', categoryId: null },
    );
    expect(payload).toHaveProperty('category', null);
  });

  it('does not include title when it has not changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Same', content: 'Old', categoryId: 'cat-1' },
      { title: 'Same', content: 'New', categoryId: 'cat-1' },
    );
    expect(payload).not.toHaveProperty('title');
  });

  it('does not include content when it has not changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Old', content: 'Same', categoryId: 'cat-1' },
      { title: 'New', content: 'Same', categoryId: 'cat-1' },
    );
    expect(payload).not.toHaveProperty('content');
  });

  it('does not include category when categoryId has not changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Old', content: 'Old', categoryId: 'cat-1' },
      { title: 'New', content: 'New', categoryId: 'cat-1' },
    );
    expect(payload).not.toHaveProperty('category');
  });

  it('returns an object with all three fields when all have changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Old', content: 'Old', categoryId: 'cat-1' },
      { title: 'New', content: 'New', categoryId: 'cat-2' },
    );
    expect(payload).toMatchObject({ title: 'New', content: 'New', category: 'cat-2' });
  });

  it('returns an empty object when nothing has changed', () => {
    const payload = buildUpdatePayload(
      { title: 'Same', content: 'Same', categoryId: 'cat-1' },
      { title: 'Same', content: 'Same', categoryId: 'cat-1' },
    );
    expect(payload).toEqual({});
  });
});
