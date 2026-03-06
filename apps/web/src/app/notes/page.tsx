/**
 * Notes list page — placeholder.
 * Will be implemented in Task 4A (Notes List Frontend).
 * Authenticated users are redirected here after login/signup.
 */
import { Container } from '@/notesDS/primitives/container';
import { Stack } from '@/notesDS/primitives/stack';
import { H1, Muted } from '@/notesDS/components/ui/typography';

export default function NotesPage() {
  return (
    <Container size="lg" className="flex min-h-screen items-center justify-center">
      <Stack gap={2} align="center">
        <H1>My Notes</H1>
        <Muted>Notes list coming soon — Task 4A.</Muted>
      </Stack>
    </Container>
  );
}
