/**
 * NoteEditorHeader — top bar for the note editor.
 *
 * Contains:
 *  - Back button (navigates to /notes with flush save)
 *  - Last-edited timestamp
 *  - Category selector
 *  - Saving indicator
 */
import { Row } from '@/notesDS/primitives/row';
import { Muted, Small } from '@/notesDS/components/ui/typography';
import { Button } from '@/notesDS/components/ui/button';
import { CategorySelector } from '@/features/note-editor/components/CategorySelector';
import type { EditorCategory } from '@/features/note-editor/hooks/useNoteEditor';

type NoteEditorHeaderProps = {
  lastEditedLabel: string;
  isSaving: boolean;
  categories: EditorCategory[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string) => void;
  onBack: () => void;
};

export function NoteEditorHeader({
  lastEditedLabel,
  isSaving,
  categories,
  selectedCategoryId,
  onCategoryChange,
  onBack,
}: NoteEditorHeaderProps) {
  return (
    <Row justify="between" align="center" gap={4} className="mb-6">
      {/* Left: back button */}
      <Button variant="ghost" size="sm" onClick={onBack} aria-label="Back to notes list">
        ← Back
      </Button>

      {/* Right: meta + category */}
      <Row gap={4} align="center">
        {isSaving ? (
          <Small className="text-muted-foreground">Saving…</Small>
        ) : lastEditedLabel ? (
          <Muted className="text-xs">{lastEditedLabel}</Muted>
        ) : null}
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onChange={onCategoryChange}
        />
      </Row>
    </Row>
  );
}
