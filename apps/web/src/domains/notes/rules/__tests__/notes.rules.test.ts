import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  formatNoteDate,
  formatNoteDateShort,
  truncateContent,
  mapCategoryColorToToken,
  isNoteEmpty,
} from '../notes.rules';

// ── formatNoteDate ────────────────────────────────────────────────────────────

describe('formatNoteDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-07T14:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const timePattern = /at \d+:\d{2}\s*(am|pm)/i;

  it('returns "Today at HH:MM" for a date that is today', () => {
    expect(formatNoteDate(new Date('2026-03-07T08:00:00Z'))).toMatch(/^Today at /i);
  });

  it('returns "Today at HH:MM" even for the last second of today', () => {
    expect(formatNoteDate(new Date('2026-03-07T23:59:59Z'))).toMatch(/^Today at /i);
  });

  it('returns "Yesterday at HH:MM" for a date that was yesterday', () => {
    expect(formatNoteDate(new Date('2026-03-06T12:00:00Z'))).toMatch(/^Yesterday at /i);
  });

  it('returns a "Month Day at HH:MM" string for older dates', () => {
    const result = formatNoteDate(new Date('2026-03-05T10:00:00Z'));
    expect(result).toMatch(/^Mar 5/);
    expect(result).toMatch(timePattern);
  });

  it('returns a "Month Day" string without the year', () => {
    const result = formatNoteDate(new Date('2025-12-25T00:00:00Z'));
    expect(result).not.toMatch(/\d{4}/);
  });

  it('formats single-digit day without leading zero', () => {
    const result = formatNoteDate(new Date('2026-01-03T10:00:00Z'));
    expect(result).toMatch(/^Jan 3/);
    expect(result).toMatch(timePattern);
  });

  it('uses abbreviated month names', () => {
    const result = formatNoteDate(new Date('2026-02-14T10:00:00Z'));
    expect(result).toMatch(/^Feb 14/);
    expect(result).toMatch(timePattern);
  });
});

// ── formatNoteDateShort ───────────────────────────────────────────────────────

describe('formatNoteDateShort', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-07T14:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Today" for a date that is today', () => {
    expect(formatNoteDateShort(new Date('2026-03-07T08:00:00Z'))).toBe('Today');
  });

  it('returns "Yesterday" for a date that was yesterday', () => {
    expect(formatNoteDateShort(new Date('2026-03-06T12:00:00Z'))).toBe('Yesterday');
  });

  it('returns "Month Day" for older dates', () => {
    expect(formatNoteDateShort(new Date('2026-03-05T10:00:00Z'))).toBe('Mar 5');
  });

  it('does not include a time component', () => {
    expect(formatNoteDateShort(new Date('2026-03-07T08:00:00Z'))).not.toMatch(/at/i);
    expect(formatNoteDateShort(new Date('2026-03-05T10:00:00Z'))).not.toMatch(/at/i);
  });
});

// ── truncateContent ───────────────────────────────────────────────────────────

describe('truncateContent', () => {
  it('returns content unchanged when it is shorter than maxLength', () => {
    expect(truncateContent('Hello', 100)).toBe('Hello');
  });

  it('returns content unchanged when it equals maxLength exactly', () => {
    expect(truncateContent('Hello', 5)).toBe('Hello');
  });

  it('appends an ellipsis when content exceeds maxLength', () => {
    const result = truncateContent('Hello world', 5);
    expect(result).toMatch(/…$/);
  });

  it('truncated result is not longer than maxLength + 1 (for ellipsis)', () => {
    const result = truncateContent('Hello world', 5);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('trims leading/trailing whitespace before checking length', () => {
    expect(truncateContent('  Hello  ', 100)).toBe('Hello');
  });

  it('handles empty string', () => {
    expect(truncateContent('', 10)).toBe('');
  });

  it('does not cut mid-word abruptly — trims trailing space before ellipsis', () => {
    const result = truncateContent('Hello world', 6);
    expect(result).not.toMatch(/ …$/);
  });
});

// ── mapCategoryColorToToken ───────────────────────────────────────────────────

describe('mapCategoryColorToToken', () => {
  it('maps #F5A623 to category-orange tokens', () => {
    const result = mapCategoryColorToToken('#F5A623');
    expect(result.dot).toBe('bg-category-orange');
    expect(result.bg).toBe('bg-category-orange-bg');
  });

  it('is case-insensitive for hex input', () => {
    const lower = mapCategoryColorToToken('#f5a623');
    const upper = mapCategoryColorToToken('#F5A623');
    expect(lower).toEqual(upper);
  });

  it('maps #4A90E2 to category-teal tokens', () => {
    const result = mapCategoryColorToToken('#4A90E2');
    expect(result.dot).toBe('bg-category-teal');
    expect(result.bg).toBe('bg-category-teal-bg');
  });

  it('maps #7ED321 to category-yellow tokens', () => {
    const result = mapCategoryColorToToken('#7ED321');
    expect(result.dot).toBe('bg-category-yellow');
    expect(result.bg).toBe('bg-category-yellow-bg');
  });

  it('returns fallback tokens for an unknown hex color', () => {
    const result = mapCategoryColorToToken('#000000');
    expect(result.dot).toBe('bg-muted-foreground');
    expect(result.bg).toBe('bg-secondary');
  });

  it('returns an object with dot and bg properties', () => {
    const result = mapCategoryColorToToken('#F5A623');
    expect(result).toHaveProperty('dot');
    expect(result).toHaveProperty('bg');
  });
});

// ── isNoteEmpty ───────────────────────────────────────────────────────────────

describe('isNoteEmpty', () => {
  it('returns true when title and content are both empty', () => {
    expect(isNoteEmpty({ title: '', content: '' })).toBe(true);
  });

  it('returns true when title and content are whitespace only', () => {
    expect(isNoteEmpty({ title: '   ', content: '  \n  ' })).toBe(true);
  });

  it('returns false when title has content', () => {
    expect(isNoteEmpty({ title: 'My note', content: '' })).toBe(false);
  });

  it('returns false when content has text', () => {
    expect(isNoteEmpty({ title: '', content: 'Some text here' })).toBe(false);
  });

  it('returns false when both title and content have text', () => {
    expect(isNoteEmpty({ title: 'Title', content: 'Body' })).toBe(false);
  });
});
