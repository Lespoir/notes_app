/**
 * NoteContent — auto-growing markdown textarea for note body.
 *
 * Uses react-textarea-autosize so the editor expands with content
 * without a fixed height. Ghost styling matches the note surface.
 */
'use client';

import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/notesDS/utils/cn';

type NoteContentProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteContent({ value, onChange }: NoteContentProps) {
  return (
    <TextareaAutosize
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start writing…"
      aria-label="Note content"
      minRows={8}
      className={cn(
        // Ghost style — transparent, no border, no ring
        'w-full resize-none border-0 bg-transparent',
        'font-sans text-sm text-foreground',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-0',
        'px-0 py-1',
      )}
    />
  );
}
