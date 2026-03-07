/**
 * NoteEditorHeader — top bar for the note editor.
 *
 * Contains:
 *  - Category selector (left)
 *  - Close button (right)
 */
import { Row } from '@/notesDS/primitives/row';
import { Button } from '@/notesDS/components/ui/button';
import { CategorySelector } from '@/features/note-editor/components/CategorySelector';
import type { EditorCategory } from '@/features/note-editor/hooks/useNoteEditor';

type NoteEditorHeaderProps = {
  categories: EditorCategory[];
  selectedCategoryId: string | null;
  onCategoryChange: (categoryId: string) => void;
  onDelete: () => void;
  onClose: () => void;
};

export function NoteEditorHeader({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onDelete,
  onClose,
}: NoteEditorHeaderProps) {
  return (
    <Row justify="between" align="center" className="mb-4">
      {/* Left: category selector */}
      <CategorySelector
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onChange={onCategoryChange}
      />

      {/* Right: delete + close buttons */}
      <Row gap={1} align="center">
        <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Delete note">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </Button>

        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close editor">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </Row>
    </Row>
  );
}
