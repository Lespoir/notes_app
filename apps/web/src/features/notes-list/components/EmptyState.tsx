import { Stack } from '@/notesDS/primitives/stack';
import { H2, Muted } from '@/notesDS/components/ui/typography';
import { Button } from '@/notesDS/components/ui/button';

type EmptyStateProps = {
  onCreateNote: () => void;
  isCreatePending: boolean;
};

export function EmptyState({ onCreateNote, isCreatePending }: EmptyStateProps) {
  return (
    <Stack gap={4} align="center" justify="center" className="flex-1 py-24">
      <H2>No notes yet</H2>
      <Muted>Create your first note to get started.</Muted>
      <Button variant="secondary" onClick={onCreateNote} disabled={isCreatePending}>
        {isCreatePending ? 'Creating…' : '+ New Note'}
      </Button>
    </Stack>
  );
}
