import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the updateNote method added to useNotesRepository in task 5A.
 *
 * updateNote wraps the generated `useNotesPartialUpdate` hook and:
 *   1. Calls mutateAsync with the correct noteId and patch payload
 *   2. Returns the updated NoteEntity (transformed via toNoteEntity)
 *   3. Invalidates the notes list query and the single-note query on success
 *
 * These tests are red until the implementation is added.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/data/generated/notes/notes', () => ({
  useNotesList: vi.fn(),
  useNotesCreate: vi.fn(),
  useNotesRetrieve: vi.fn(),
  useNotesPartialUpdate: vi.fn(),
  useNotesDestroy: vi.fn(),
  getNotesListQueryKey: vi.fn(() => ['/api/v1/notes/']),
  getNotesRetrieveQueryKey: vi.fn((id: string) => [`/api/v1/notes/${id}/`]),
}));

vi.mock('@/data/generated/categories/categories', () => ({
  getCategoriesListQueryKey: vi.fn(() => ['/api/v1/categories/']),
}));

vi.mock('@/lib/query/query-client', () => ({
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}));

import { renderHook } from '@testing-library/react';
import {
  useNotesList,
  useNotesCreate,
  useNotesRetrieve,
  useNotesPartialUpdate,
  useNotesDestroy,
} from '@/data/generated/notes/notes';
import { queryClient } from '@/lib/query/query-client';
import { useNotesRepository } from '../notes.repository';

// ── Helpers ──────────────────────────────────────────────────────────────────

const makeDto = (overrides = {}) => ({
  id: 'note-uuid-1',
  title: 'Existing Title',
  content: 'Existing content',
  category: null,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-05T12:00:00Z',
  ...overrides,
});

const makeUpdatedDto = (overrides = {}) => ({
  id: 'note-uuid-1',
  title: 'Updated Title',
  content: 'Updated content',
  category: null,
  created_at: '2026-03-01T10:00:00Z',
  updated_at: '2026-03-07T09:00:00Z',
  ...overrides,
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useNotesRepository — updateNote', () => {
  const mockPartialUpdateMutateAsync = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    vi.mocked(useNotesList).mockReturnValue({
      data: { status: 200, data: [] },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useNotesList>);

    vi.mocked(useNotesCreate).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useNotesCreate>);

    vi.mocked(useNotesRetrieve).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as unknown as ReturnType<typeof useNotesRetrieve>);

    vi.mocked(useNotesPartialUpdate).mockReturnValue({
      mutateAsync: mockPartialUpdateMutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useNotesPartialUpdate>);

    vi.mocked(useNotesDestroy).mockReturnValue({
      mutateAsync: vi.fn(),
    } as unknown as ReturnType<typeof useNotesDestroy>);
  });

  it('calls the generated partial-update mutateAsync with the noteId and patch payload', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto(),
    });

    const { result } = renderHook(() => useNotesRepository());

    await result.current.updateNote('note-uuid-1', { title: 'Updated Title' });

    expect(mockPartialUpdateMutateAsync).toHaveBeenCalledWith({
      noteId: 'note-uuid-1',
      data: { title: 'Updated Title' },
    });
  });

  it('passes a content patch to mutateAsync', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({ content: 'New content' }),
    });

    const { result } = renderHook(() => useNotesRepository());

    await result.current.updateNote('note-uuid-1', { content: 'New content' });

    expect(mockPartialUpdateMutateAsync).toHaveBeenCalledWith({
      noteId: 'note-uuid-1',
      data: { content: 'New content' },
    });
  });

  it('passes a category patch to mutateAsync', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({
        category: { id: 'cat-1', title: 'School', color: '#4A90E2' },
      }),
    });

    const { result } = renderHook(() => useNotesRepository());

    await result.current.updateNote('note-uuid-1', { category: 'cat-1' });

    expect(mockPartialUpdateMutateAsync).toHaveBeenCalledWith({
      noteId: 'note-uuid-1',
      data: { category: 'cat-1' },
    });
  });

  it('passes the category id to mutateAsync when changing category', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({ category: { id: 'cat-2', title: 'Personal', color: '#FF0000' } }),
    });

    const { result } = renderHook(() => useNotesRepository());

    await result.current.updateNote('note-uuid-1', { category: 'cat-2' });

    expect(mockPartialUpdateMutateAsync).toHaveBeenCalledWith({
      noteId: 'note-uuid-1',
      data: { category: 'cat-2' },
    });
  });

  it('returns a NoteEntity with the updated title', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({ title: 'Updated Title' }),
    });

    const { result } = renderHook(() => useNotesRepository());

    const entity = await result.current.updateNote('note-uuid-1', {
      title: 'Updated Title',
    });

    expect(entity.title).toBe('Updated Title');
  });

  it('returns a NoteEntity with the updated content', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({ content: 'Updated content' }),
    });

    const { result } = renderHook(() => useNotesRepository());

    const entity = await result.current.updateNote('note-uuid-1', {
      content: 'Updated content',
    });

    expect(entity.content).toBe('Updated content');
  });

  it('returns a NoteEntity with updatedAt as a Date object', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({ updated_at: '2026-03-07T09:00:00Z' }),
    });

    const { result } = renderHook(() => useNotesRepository());

    const entity = await result.current.updateNote('note-uuid-1', {
      title: 'Updated Title',
    });

    expect(entity.updatedAt).toBeInstanceOf(Date);
    expect(entity.updatedAt.toISOString()).toBe('2026-03-07T09:00:00.000Z');
  });

  it('returns a NoteEntity with embedded category when category is present', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({
        category: { id: 'cat-1', title: 'School', color: '#4A90E2' },
      }),
    });

    const { result } = renderHook(() => useNotesRepository());

    const entity = await result.current.updateNote('note-uuid-1', {
      category: 'cat-1',
    });

    expect(entity.category).toEqual({
      id: 'cat-1',
      title: 'School',
      color: '#4A90E2',
    });
  });

  it('returns a NoteEntity with category null when DTO category is null', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto({ category: null }),
    });

    const { result } = renderHook(() => useNotesRepository());

    const entity = await result.current.updateNote('note-uuid-1', {
      title: 'No category note',
    });

    expect(entity.category).toBeNull();
  });

  it('invalidates the notes list query after a successful update', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto(),
    });

    const { result } = renderHook(() => useNotesRepository());

    await result.current.updateNote('note-uuid-1', { title: 'Updated' });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['/api/v1/notes/'] }),
    );
  });

  it('invalidates the single-note query after a successful update', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 200,
      data: makeUpdatedDto(),
    });

    const { result } = renderHook(() => useNotesRepository());

    await result.current.updateNote('note-uuid-1', { title: 'Updated' });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['/api/v1/notes/note-uuid-1/'] }),
    );
  });

  it('throws when the API responds with a non-200 status', async () => {
    mockPartialUpdateMutateAsync.mockResolvedValue({
      status: 404,
      data: undefined,
    });

    const { result } = renderHook(() => useNotesRepository());

    await expect(
      result.current.updateNote('note-uuid-1', { title: 'Updated' }),
    ).rejects.toThrow();
  });

  it('propagates errors thrown by mutateAsync', async () => {
    mockPartialUpdateMutateAsync.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotesRepository());

    await expect(
      result.current.updateNote('note-uuid-1', { title: 'Updated' }),
    ).rejects.toThrow('Network error');
  });

  it('exposes updateNote on the repository return value', () => {
    const { result } = renderHook(() => useNotesRepository());
    expect(typeof result.current.updateNote).toBe('function');
  });
});
