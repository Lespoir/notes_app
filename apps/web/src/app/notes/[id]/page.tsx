/**
 * Note editor page — placeholder.
 * Full implementation in Task 5A (Note Editor).
 */
import { Container } from '@/notesDS/primitives/container';
import { Stack } from '@/notesDS/primitives/stack';
import { H1, Muted } from '@/notesDS/components/ui/typography';

export default function NoteEditorPage() {
  return (
    <Container size="lg" className="flex min-h-screen items-center justify-center">
      <Stack gap={2} align="center">
        <H1>Note Editor</H1>
        <Muted>Editor coming soon — Task 5A.</Muted>
      </Stack>
    </Container>
  );
}
