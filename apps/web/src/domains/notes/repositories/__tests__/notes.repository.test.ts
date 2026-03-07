import { describe, it, expect } from 'vitest';
import { toNoteEntity } from '../notes.repository';

// Tests for the DTO -> entity transformation logic in the notes repository.
// `toNoteEntity` is a pure function extracted from the repository so it can be
// unit-tested without mocking React Query hooks.

describe('toNoteEntity (DTO to entity mapping)', () => {
  const baseDto = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'My Note',
    content: 'Some content here',
    category: null,
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-05T15:30:00Z',
  };

  it('maps id from the DTO', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.id).toBe('550e8400-e29b-41d4-a716-446655440001');
  });

  it('maps title from the DTO', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.title).toBe('My Note');
  });

  it('maps content from the DTO', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.content).toBe('Some content here');
  });

  it('maps category as null when DTO category is null', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.category).toBeNull();
  });

  it('maps category fields when DTO category is present', () => {
    const dto = {
      ...baseDto,
      category: {
        id: 'cat-uuid-1',
        title: 'School',
        color: '#4A90E2',
      },
    };
    const entity = toNoteEntity(dto);
    expect(entity.category).toEqual({ id: 'cat-uuid-1', title: 'School', color: '#4A90E2' });
  });

  it('maps created_at to a Date object', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.createdAt).toBeInstanceOf(Date);
  });

  it('maps updated_at to a Date object', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.updatedAt).toBeInstanceOf(Date);
  });

  it('parses created_at into the correct Date value', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.createdAt.toISOString()).toBe('2026-03-01T10:00:00.000Z');
  });

  it('parses updated_at into the correct Date value', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity.updatedAt.toISOString()).toBe('2026-03-05T15:30:00.000Z');
  });

  it('does not expose raw snake_case field created_at', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity).not.toHaveProperty('created_at');
  });

  it('does not expose raw snake_case field updated_at', () => {
    const entity = toNoteEntity(baseDto);
    expect(entity).not.toHaveProperty('updated_at');
  });

  it('maps an empty title correctly', () => {
    const entity = toNoteEntity({ ...baseDto, title: '' });
    expect(entity.title).toBe('');
  });

  it('maps an empty content correctly', () => {
    const entity = toNoteEntity({ ...baseDto, content: '' });
    expect(entity.content).toBe('');
  });
});
