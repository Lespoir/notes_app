'use client';

import { useNotesListScreen } from '@/features/notes-list/hooks/useNotesList';
import { CategorySidebar } from '@/features/notes-list/components/CategorySidebar';
import { NotePreviewCard } from '@/features/notes-list/components/NotePreviewCard';
import { EmptyState } from '@/features/notes-list/components/EmptyState';
import { Row } from '@/notesDS/primitives/row';
import { Button } from '@/notesDS/components/ui/button';
import { Muted } from '@/notesDS/components/ui/typography';

export default function NotesPage() {
  const {
    noteCards,
    sidebarCategories,
    selectedCategoryId,
    isLoading,
    isEmpty,
    isCreatePending,
    onSelectCategory,
    onCreateNote,
    onNoteClick,
    onLogout,
  } = useNotesListScreen();

  return (
    <div className="min-h-screen bg-background">
      <Row align="start" gap={0} className="min-h-screen">
        {/* Sidebar */}
        <div className="w-52 shrink-0 p-6 pt-8">
          <CategorySidebar
            categories={sidebarCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={onSelectCategory}
            onLogout={onLogout}
          />
        </div>

        {/* Main content */}
        <div className="flex min-h-screen flex-1 flex-col p-6 pt-8">
          {/* Header */}
          <Row justify="end" className="mb-6">
            <Button variant="secondary" size="sm" onClick={onCreateNote} disabled={isCreatePending}>
              {isCreatePending ? 'Creating…' : '+ New Note'}
            </Button>
          </Row>

          {/* Content */}
          {isLoading ? (
            <Muted className="py-12 text-center">Loading notes…</Muted>
          ) : isEmpty ? (
            <EmptyState onCreateNote={onCreateNote} isCreatePending={isCreatePending} />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {noteCards.map((card) => (
                <NotePreviewCard
                  key={card.id}
                  title={card.title}
                  contentPreview={card.contentPreview}
                  date={card.date}
                  categoryTitle={card.categoryTitle}
                  categoryColorClasses={card.categoryColorClasses}
                  onClick={() => onNoteClick(card.id)}
                />
              ))}
            </div>
          )}
        </div>
      </Row>
    </div>
  );
}
