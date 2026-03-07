import Image from 'next/image';
import { Stack } from '@/notesDS/primitives/stack';
import { Muted } from '@/notesDS/components/ui/typography';

export function EmptyState() {
  return (
    <Stack gap={4} align="center" justify="center" className="flex-1 py-24">
      <Image src="/illustrations/cup.png" alt="Boba tea cup" width={180} height={180} />
      <Muted className="text-base italic">I&apos;m just here waiting for your charming notes...</Muted>
    </Stack>
  );
}
