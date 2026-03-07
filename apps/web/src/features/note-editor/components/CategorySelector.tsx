/**
 * CategorySelector — custom dropdown to pick the note category.
 *
 * Shows a color dot + category name in a custom popover list, matching the
 * design spec. Calls onChange immediately on selection and closes the dropdown.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Row } from '@/notesDS/primitives/row';
import { Stack } from '@/notesDS/primitives/stack';
import { cn } from '@/notesDS/utils/cn';
import type { EditorCategory } from '@/features/note-editor/hooks/useNoteEditor';

type CategorySelectorProps = {
  categories: EditorCategory[];
  selectedCategoryId: string | null;
  onChange: (categoryId: string) => void;
};

export function CategorySelector({
  categories,
  selectedCategoryId,
  onChange,
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) ?? null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(categoryId: string) {
    onChange(categoryId);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Note category"
        className={cn(
          'flex cursor-pointer items-center gap-2',
          'rounded-[var(--radius-sm)] border border-primary px-3 py-1.5',
          'font-sans text-xs text-caption',
          'bg-transparent focus:outline-none',
        )}
      >
        {selectedCategory && (
          <span
            className={cn('h-2.5 w-2.5 shrink-0 rounded-full', selectedCategory.colorClasses.dot)}
            aria-hidden="true"
          />
        )}
        <span>{selectedCategory?.title ?? 'Select category'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="h-3 w-3 shrink-0 text-caption"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <Stack
          as="ul"
          role="listbox"
          gap={0}
          className={cn(
            'absolute left-0 top-full z-50 mt-1',
            'min-w-[10rem] rounded-[var(--radius-sm)] bg-background py-1',
            'shadow-[var(--shadow-card)]',
          )}
        >
          {categories.map((cat) => (
            <li key={cat.id} role="option" aria-selected={cat.id === selectedCategoryId}>
              <Row
                as="button"
                type="button"
                align="center"
                gap={2}
                onClick={() => handleSelect(cat.id)}
                className={cn(
                  'w-full px-3 py-2',
                  'font-sans text-xs text-foreground',
                  'cursor-pointer bg-transparent hover:bg-secondary',
                  'focus:outline-none',
                )}
              >
                <span
                  className={cn('h-2.5 w-2.5 shrink-0 rounded-full', cat.colorClasses.dot)}
                  aria-hidden="true"
                />
                <span>{cat.title}</span>
              </Row>
            </li>
          ))}
        </Stack>
      )}
    </div>
  );
}
