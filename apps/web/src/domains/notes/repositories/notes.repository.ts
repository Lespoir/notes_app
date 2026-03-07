/**
 * Notes repository.
 *
 * Wraps the Orval-generated notes hooks, transforms DTOs to entities,
 * and provides the data access interface for features.
 *
 * Import rule: features import from here — NEVER from data/generated directly.
 */
import {
  useNotesList,
  useNotesCreate,
  useNotesRetrieve,
  useNotesPartialUpdate,
  getNotesListQueryKey,
  getNotesRetrieveQueryKey,
  notesPartialUpdate,
} from '@/data/generated/notes/notes';
import { getCategoriesListQueryKey } from '@/data/generated/categories/categories';
import { queryClient } from '@/lib/query/query-client';
import type { NoteEntity } from '@/domains/notes/entities/note.entity';
import type { NoteOutputSchema } from '@/data/generated/model';

/**
 * Maps a backend note DTO to the NoteEntity domain entity.
 * Exported so it can be unit-tested independently.
 */
export function toNoteEntity(dto: NoteOutputSchema): NoteEntity {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    category: dto.category
      ? { id: dto.category.id, title: dto.category.title, color: dto.category.color }
      : null,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}

export type UpdateNotePayload = {
  title?: string;
  content?: string;
  category?: string | null;
};

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: getNotesListQueryKey() });

export const useNotesRepository = (options?: { categoryId?: string }) => {
  const params = options?.categoryId ? { category: options.categoryId } : undefined;
  const { data, isLoading, isError, error } = useNotesList(params);
  const { mutateAsync: createMutateAsync, isPending: isCreatePending } = useNotesCreate();
  const { mutateAsync: updateMutateAsync } = useNotesPartialUpdate();

  const notes: NoteEntity[] =
    data?.status === 200 && data.data ? data.data.map(toNoteEntity) : [];

  const createNote = async (categoryId?: string): Promise<NoteEntity> => {
    const response = await createMutateAsync({ data: { category: categoryId ?? null } });
    if (response.status === 201) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getNotesListQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getCategoriesListQueryKey() }),
      ]);
      return toNoteEntity(response.data);
    }
    throw new Error('Failed to create note');
  };

  /**
   * Fetch a single note by ID. Uses the raw fetch function (not the hook) so
   * the screen hook can call it imperatively on mount without violating the
   * rules of hooks.
   */
  const getNote = async (noteId: string): Promise<NoteEntity> => {
    const { notesRetrieve } = await import('@/data/generated/notes/notes');
    const response = await notesRetrieve(noteId);
    if (response.status === 200) {
      return toNoteEntity(response.data);
    }
    throw new Error('Note not found');
  };

  /**
   * Partially update a note by ID. Returns the updated entity.
   * Invalidates the notes list and single-note queries on success.
   */
  const updateNote = async (noteId: string, payload: UpdateNotePayload): Promise<NoteEntity> => {
    const response = await updateMutateAsync({ noteId, data: payload });
    if (response.status === 200) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getNotesListQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getNotesRetrieveQueryKey(noteId) }),
        queryClient.invalidateQueries({ queryKey: getCategoriesListQueryKey() }),
      ]);
      return toNoteEntity(response.data);
    }
    throw new Error('Failed to update note');
  };

  return {
    notes,
    isLoading,
    isError,
    error,
    isCreatePending,
    createNote,
    getNote,
    updateNote,
  };
};

useNotesRepository.invalidate = invalidate;

/**
 * Fire-and-forget PATCH used by `beforeunload` where we cannot await promises.
 * Exported as a standalone function (not returned from the hook) so it can be
 * called outside React's lifecycle without triggering hook rules violations.
 */
export const updateNoteSync = (noteId: string, payload: UpdateNotePayload): void => {
  notesPartialUpdate(noteId, payload).catch(() => {
    // Intentionally silent — best-effort flush on page unload.
  });
};
