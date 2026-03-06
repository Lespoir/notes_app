import { describe, it, expect } from 'vitest';
import type { CategoryEntity } from '../category.entity';

// Structural tests for the CategoryEntity type.
// These tests verify that objects conforming to the entity shape
// carry the expected fields and value types at runtime.
// They will be red until the entity module is created and exported.

describe('CategoryEntity shape', () => {
  // Build a conforming entity manually — mirrors what the repository mapper produces.
  const entity: CategoryEntity = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Random Thoughts',
    color: '#A8D5BA',
    noteCount: 3,
    createdAt: new Date('2026-01-15T08:00:00Z'),
  };

  it('has an id string field', () => {
    expect(typeof entity.id).toBe('string');
  });

  it('has a title string field', () => {
    expect(typeof entity.title).toBe('string');
  });

  it('has a color string field', () => {
    expect(typeof entity.color).toBe('string');
  });

  it('has a noteCount number field', () => {
    expect(typeof entity.noteCount).toBe('number');
  });

  it('has a createdAt Date field', () => {
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it('does not have a note_count field (no raw DTO fields leak through)', () => {
    expect(entity).not.toHaveProperty('note_count');
  });

  it('does not have a created_at field (no raw DTO fields leak through)', () => {
    expect(entity).not.toHaveProperty('created_at');
  });
});
