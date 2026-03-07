/**
 * Notes list screen hook.
 *
 * Orchestrates the notes list view: category filtering, note cards presentation,
 * and note creation with navigation.
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotesRepository } from '@/domains/notes/repositories/notes.repository';
import { useCategoriesRepository } from '@/domains/categories/repositories/categories.repository';
import {
  formatNoteDate,
  truncateContent,
  stripMarkdown,
  mapCategoryColorToToken,
  isNoteEmpty,
} from '@/domains/notes/rules/notes.rules';

export type NoteCard = {
  id: string;
  title: string;
  contentPreview: string;
  date: string;
  categoryTitle: string;
  categoryColorClasses: { dot: string; bg: string };
};

export type SidebarCategory = {
  id: string;
  title: string;
  noteCount: number;
  colorClasses: { dot: string; bg: string };
};

export const useNotesListScreen = () => {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  const { notes, isLoading, isCreatePending, createNote } = useNotesRepository({
    categoryId: selectedCategoryId,
  });
  const { categories } = useCategoriesRepository();

  const noteCards: NoteCard[] = notes.filter((note) => !isNoteEmpty(note)).map((note) => {
    const colorClasses = note.category
      ? mapCategoryColorToToken(note.category.color)
      : { dot: 'bg-muted-foreground', bg: 'bg-secondary' };

    return {
      id: note.id,
      title: note.title.trim() || 'Untitled',
      contentPreview: truncateContent(stripMarkdown(note.content), 100),
      date: formatNoteDate(note.updatedAt),
      categoryTitle: note.category?.title ?? '',
      categoryColorClasses: colorClasses,
    };
  });

  const sidebarCategories: SidebarCategory[] = categories.map((cat) => ({
    id: cat.id,
    title: cat.title,
    noteCount: cat.noteCount,
    colorClasses: mapCategoryColorToToken(cat.color),
  }));

  const handleCreateNote = async () => {
    // Reuse the most-recent note if it's still empty — avoids accumulating blank notes.
    const mostRecent = notes[0];
    if (mostRecent && isNoteEmpty(mostRecent)) {
      router.push(`/notes/${mostRecent.id}`);
      return;
    }
    const note = await createNote(selectedCategoryId);
    router.push(`/notes/${note.id}`);
  };

  const handleNoteClick = (id: string) => {
    router.push(`/notes/${id}`);
  };

  return {
    noteCards,
    sidebarCategories,
    selectedCategoryId,
    isLoading,
    isEmpty: !isLoading && noteCards.length === 0,
    isCreatePending,
    onSelectCategory: setSelectedCategoryId,
    onCreateNote: handleCreateNote,
    onNoteClick: handleNoteClick,
  };
};
