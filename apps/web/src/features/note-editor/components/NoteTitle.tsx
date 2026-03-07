/**
 * NoteTitle — inline editable note title input.
 *
 * Uses the ghost Input variant so it blends seamlessly into the editor
 * surface. Typography matches H1 (display font, 3xl, bold).
 */
import { Input } from '@/notesDS/components/ui/input';
import { cn } from '@/notesDS/utils/cn';

type NoteTitleProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteTitle({ value, onChange }: NoteTitleProps) {
  return (
    <Input
      variant="ghost"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Untitled"
      aria-label="Note title"
      className={cn(
        'font-display text-3xl font-bold tracking-tight text-heading',
        'w-full placeholder:text-muted-foreground',
      )}
    />
  );
}
