import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Tests for the useNoteEditor screen hook (task 5A).
 *
 * The hook is responsible for:
 *   - Fetching a single note by ID on mount
 *   - Managing local title / content / categoryId state
 *   - Scheduling a debounced PATCH when title or content changes
 *   - Triggering an immediate PATCH when the category changes
 *   - Exposing a handleBack() that navigates to the notes list
 *
 * The hook is expected to live at:
 *   features/note-editor/hooks/useNoteEditor.ts
 *
 * Tests are red until the implementation is added.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/domains/notes/repositories/notes.repository', () => ({
  useNotesRepository: vi.fn(),
}));

vi.mock('@/domains/categories/repositories/categories.repository', () => ({
  useCategoriesRepository: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useNotesRepository } from '@/domains/notes/repositories/notes.repository';
import { useCategoriesRepository } from '@/domains/categories/repositories/categories.repository';
import { useNoteEditor } from '../useNoteEditor';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeNote = (overrides = {}) => ({
  id: 'note-uuid-1',
  title: 'My Note',
  content: '# Hello world',
  category: { id: 'cat-1', title: 'School', color: '#4A90E2' },
  createdAt: new Date('2026-03-01T10:00:00Z'),
  updatedAt: new Date('2026-03-07T08:00:00Z'),
  ...overrides,
});

const makeCategories = () => [
  { id: 'cat-1', title: 'School', color: '#4A90E2', noteCount: 3 },
  { id: 'cat-2', title: 'Personal', color: '#7ED321', noteCount: 1 },
];

// ── Setup ─────────────────────────────────────────────────────────────────────

const mockUpdateNote = vi.fn();
const mockGetNote = vi.fn();

function setupMocks(noteOverrides = {}) {
  vi.mocked(useNotesRepository).mockReturnValue({
    notes: [],
    isLoading: false,
    isError: false,
    error: null,
    isCreatePending: false,
    createNote: vi.fn(),
    getNote: mockGetNote.mockResolvedValue(makeNote(noteOverrides)),
    updateNote: mockUpdateNote,
  } as ReturnType<typeof useNotesRepository>);

  vi.mocked(useCategoriesRepository).mockReturnValue({
    categories: makeCategories(),
    isLoading: false,
  } as ReturnType<typeof useCategoriesRepository>);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useNoteEditor', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    setupMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Initial load ────────────────────────────────────────────────────────────

  describe('initial load', () => {
    it('fetches the note by ID on mount', async () => {
      await act(async () => {
        renderHook(() => useNoteEditor('note-uuid-1'));
      });

      expect(mockGetNote).toHaveBeenCalledWith('note-uuid-1');
    });

    it('initializes title from the fetched note', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.title).toBe('My Note');
    });

    it('initializes content from the fetched note', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.content).toBe('# Hello world');
    });

    it('initializes categoryId from the fetched note category', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.categoryId).toBe('cat-1');
    });

    it('initializes categoryId as null when the note has no category', async () => {
      setupMocks({ category: null });

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.categoryId).toBeNull();
    });

    it('exposes isLoading as true while the note is being fetched', () => {
      vi.mocked(useNotesRepository).mockReturnValue({
        ...vi.mocked(useNotesRepository)(),
        isLoading: true,
        getNote: mockGetNote,
        updateNote: mockUpdateNote,
      } as ReturnType<typeof useNotesRepository>);

      const { result } = renderHook(() => useNoteEditor('note-uuid-1'));

      expect(result.current.isLoading).toBe(true);
    });
  });

  // ── Title changes ───────────────────────────────────────────────────────────

  describe('handleTitleChange', () => {
    it('updates the local title state immediately', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleTitleChange('New Title');
      });

      expect(result!.current.title).toBe('New Title');
    });

    it('does not call updateNote immediately (debounced)', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleTitleChange('New Title');
      });

      expect(mockUpdateNote).not.toHaveBeenCalled();
    });

    it('calls updateNote after the debounce delay elapses', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ title: 'New Title' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleTitleChange('New Title');
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ title: 'New Title' }),
      );
    });

    it('debounces rapid title changes into a single call', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ title: 'Final' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleTitleChange('A');
        result!.current.handleTitleChange('AB');
        result!.current.handleTitleChange('Final');
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ title: 'Final' }),
      );
    });
  });

  // ── Content changes ─────────────────────────────────────────────────────────

  describe('handleContentChange', () => {
    it('updates the local content state immediately', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleContentChange('## New Content');
      });

      expect(result!.current.content).toBe('## New Content');
    });

    it('does not call updateNote immediately (debounced)', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleContentChange('## New Content');
      });

      expect(mockUpdateNote).not.toHaveBeenCalled();
    });

    it('calls updateNote with content after the debounce delay', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ content: '## New Content' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleContentChange('## New Content');
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ content: '## New Content' }),
      );
    });

    it('debounces rapid content changes into a single call', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ content: 'Final content' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.handleContentChange('F');
        result!.current.handleContentChange('Final');
        result!.current.handleContentChange('Final content');
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
    });
  });

  // ── Category changes ────────────────────────────────────────────────────────

  describe('handleCategoryChange', () => {
    it('updates local categoryId state immediately', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      await act(async () => {
        result!.current.handleCategoryChange('cat-2');
      });

      expect(result!.current.categoryId).toBe('cat-2');
    });

    it('calls updateNote immediately (no debounce) when category changes', async () => {
      mockUpdateNote.mockResolvedValue(
        makeNote({ category: { id: 'cat-2', title: 'Personal', color: '#7ED321' } }),
      );

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      await act(async () => {
        result!.current.handleCategoryChange('cat-2');
      });

      // No timer advance — should have been called synchronously
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ category: 'cat-2' }),
      );
    });

    it('calls updateNote with null when category is cleared', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ category: null }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      await act(async () => {
        result!.current.handleCategoryChange(null);
      });

      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ category: null }),
      );
    });
  });

  // ── handleBack ───────────────────────────────────────────────────────────────

  describe('handleBack', () => {
    it('navigates to the notes list route', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      await act(async () => {
        result!.current.handleBack();
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('navigates away even if there is a pending debounce', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ title: 'Unsaved change' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      // Type something but don't wait for debounce
      act(() => {
        result!.current.handleTitleChange('Unsaved change');
      });

      await act(async () => {
        result!.current.handleBack();
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // ── Exposed categories ───────────────────────────────────────────────────────

  describe('categories', () => {
    it('exposes the list of available categories from the repository', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.categories).toHaveLength(2);
    });

    it('exposes category id and title', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      const ids = result!.current.categories.map((c) => c.id);
      expect(ids).toContain('cat-1');
      expect(ids).toContain('cat-2');
    });
  });

  // ── updatedAt display ─────────────────────────────────────────────────────────

  describe('lastEditedAt', () => {
    it('exposes a lastEditedAt field from the fetched note', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.lastEditedAt).toBeInstanceOf(Date);
    });

    it('updates lastEditedAt optimistically after a successful save', async () => {
      const laterDate = new Date('2026-03-07T09:30:00Z');
      mockUpdateNote.mockResolvedValue(makeNote({ updatedAt: laterDate }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      await act(async () => {
        result!.current.handleCategoryChange('cat-2');
      });

      expect(result!.current.lastEditedAt.getTime()).toBeGreaterThanOrEqual(
        new Date('2026-03-07T08:00:00Z').getTime(),
      );
    });
  });
});
