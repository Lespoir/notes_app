/**
 * Categories repository.
 *
 * Wraps the Orval-generated categories hooks, transforms DTOs to entities,
 * and provides the data access interface for features.
 *
 * Import rule: features import from here — NEVER from data/generated directly.
 */
import { useCategoriesList, getCategoriesListQueryKey } from '@/data/generated/categories/categories';
import { queryClient } from '@/lib/query/query-client';
import type { CategoryEntity } from '@/domains/categories/entities/category.entity';
import type { CategoryOutputSchema } from '@/data/generated/model';

/**
 * Maps a backend category DTO to the CategoryEntity domain entity.
 * Exported so it can be unit-tested independently.
 */
export function toCategoryEntity(dto: CategoryOutputSchema): CategoryEntity {
  return {
    id: dto.id,
    title: dto.title,
    color: dto.color,
    noteCount: dto.note_count,
    createdAt: new Date(dto.created_at),
  };
}

const invalidate = () =>
  queryClient.invalidateQueries({ queryKey: getCategoriesListQueryKey() });

export const useCategoriesRepository = () => {
  const { data, isLoading, isError, error } = useCategoriesList();

  const categories: CategoryEntity[] =
    data?.status === 200 && data.data ? data.data.map(toCategoryEntity) : [];

  return {
    categories,
    isLoading,
    isError,
    error,
  };
};

useCategoriesRepository.invalidate = invalidate;
