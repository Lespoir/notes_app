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
    <div className="flex h-screen flex-col bg-background">
      {/* Top bar */}
      <Row justify="end" className="shrink-0 px-6 pt-8 pb-0">
        <Button variant="secondary" size="sm" onClick={onCreateNote} disabled={isCreatePending}>
          {isCreatePending ? 'Creating…' : '+ New Note'}
        </Button>
      </Row>

      <Row align="start" gap={8} className="min-h-0 flex-1">
        {/* Sidebar */}
        <div className="flex h-full w-52 shrink-0 flex-col pl-6 pt-6 pb-6">
          <CategorySidebar
            categories={sidebarCategories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={onSelectCategory}
            onLogout={onLogout}
          />
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-y-auto pr-6 pt-6 pb-6" style={{ height: '100%' }}>
          {isLoading ? (
            <Muted className="py-12 text-center">Loading notes…</Muted>
          ) : isEmpty ? (
            <EmptyState />
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
