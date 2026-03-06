import { describe, it, expect } from 'vitest';
import { toCategoryEntity } from '../categories.repository';

// Tests for the DTO -> entity transformation logic in the categories repository.
// The `toCategoryEntity` mapper is a pure function extracted from the repository
// so it can be unit-tested without mocking React Query hooks.
// These tests will be red until the repository is implemented.

describe('toCategoryEntity (DTO to entity mapping)', () => {
  const baseDto = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'School',
    color: '#4A90D9',
    note_count: 5,
    created_at: '2026-03-01T10:00:00Z',
  };

  it('maps the id from the DTO', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity.id).toBe('550e8400-e29b-41d4-a716-446655440000');
  });

  it('maps the title from the DTO', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity.title).toBe('School');
  });

  it('maps the color from the DTO', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity.color).toBe('#4A90D9');
  });

  it('maps note_count to noteCount', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity.noteCount).toBe(5);
  });

  it('maps created_at to a Date object', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it('parses created_at into the correct Date value', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity.createdAt.toISOString()).toBe('2026-03-01T10:00:00.000Z');
  });

  it('does not expose raw DTO snake_case field note_count', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity).not.toHaveProperty('note_count');
  });

  it('does not expose raw DTO snake_case field created_at', () => {
    const entity = toCategoryEntity(baseDto);
    expect(entity).not.toHaveProperty('created_at');
  });

  it('maps a note_count of zero correctly', () => {
    const entity = toCategoryEntity({ ...baseDto, note_count: 0 });
    expect(entity.noteCount).toBe(0);
  });

  it('maps different color values correctly', () => {
    const entity = toCategoryEntity({ ...baseDto, color: '#FF5733' });
    expect(entity.color).toBe('#FF5733');
  });
});
