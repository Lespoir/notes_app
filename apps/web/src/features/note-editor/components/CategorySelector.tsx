/**
 * CategorySelector — dropdown to pick the note category.
 *
 * Shows a color dot + category name in a native <select> styled to match
 * the notesDS ghost/secondary pattern. Calls handleCategoryChange immediately
 * (no debounce) on selection.
 */
import { Row } from '@/notesDS/primitives/row';
import { cn } from '@/notesDS/utils/cn';
import type { EditorCategory } from '@/features/note-editor/hooks/useNoteEditor';

type CategorySelectorProps = {
  categories: EditorCategory[];
  selectedCategoryId: string | null;
  onChange: (categoryId: string | null) => void;
};

export function CategorySelector({
  categories,
  selectedCategoryId,
  onChange,
}: CategorySelectorProps) {
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  return (
    <Row align="center" gap={2}>
      {/* Color dot for the currently selected category */}
      {selectedCategory && (
        <span
          className={cn('h-2.5 w-2.5 shrink-0 rounded-full', selectedCategory.colorClasses.dot)}
          aria-hidden="true"
        />
      )}
      <select
        value={selectedCategoryId ?? ''}
        onChange={(e) => {
          const value = e.target.value;
          onChange(value === '' ? null : value);
        }}
        aria-label="Note category"
        className={cn(
          'cursor-pointer border-0 bg-transparent',
          'font-sans text-xs text-caption',
          'appearance-none focus:outline-none focus:ring-0',
          'pr-4', // space for implicit native arrow
        )}
      >
        <option value="">No category</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.title}
          </option>
        ))}
      </select>
    </Row>
  );
}
