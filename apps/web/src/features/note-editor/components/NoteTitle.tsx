/**
 * NoteTitle — inline editable note title input.
 *
 * Uses the ghost Input variant so it blends seamlessly into the editor
 * surface. Typography matches H1 (display font, 3xl, bold).
 */
import TextareaAutosize from 'react-textarea-autosize';
import { cn } from '@/notesDS/utils/cn';

type NoteTitleProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteTitle({ value, onChange }: NoteTitleProps) {
  return (
    <TextareaAutosize
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Untitled"
      aria-label="Note title"
      maxRows={4}
      className={cn(
        'w-full resize-none border-0 bg-transparent',
        'font-display text-3xl font-bold tracking-tight text-heading',
        'placeholder:text-muted-foreground',
        'focus:outline-none focus:ring-0',
        'px-0 py-0 mb-4',
        'break-words',
      )}
    />
  );
}
