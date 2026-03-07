/**
 * Notes repository.
 *
 * Wraps the Orval-generated notes hooks, transforms DTOs to entities,
 * and provides the data access interface for features.
 *
 * Import rule: features import from here — NEVER from data/generated directly.
 */
import { useNotesList, useNotesCreate, getNotesListQueryKey } from '@/data/generated/notes/notes';
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

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: getNotesListQueryKey() });

export const useNotesRepository = (options?: { categoryId?: string }) => {
  const params = options?.categoryId ? { category: options.categoryId } : undefined;
  const { data, isLoading, isError, error } = useNotesList(params);
  const { mutateAsync, isPending: isCreatePending } = useNotesCreate();

  const notes: NoteEntity[] =
    data?.status === 200 && data.data ? data.data.map(toNoteEntity) : [];

  const createNote = async (categoryId?: string): Promise<NoteEntity> => {
    const response = await mutateAsync({ data: { category: categoryId ?? null } });
    if (response.status === 201) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getNotesListQueryKey() }),
        queryClient.invalidateQueries({ queryKey: getCategoriesListQueryKey() }),
      ]);
      return toNoteEntity(response.data);
    }
    throw new Error('Failed to create note');
  };

  return {
    notes,
    isLoading,
    isError,
    error,
    isCreatePending,
    createNote,
  };
};

useNotesRepository.invalidate = invalidate;
