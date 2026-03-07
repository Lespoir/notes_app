import { CardShell } from '@/notesDS/primitives/cardShell';
import { Stack } from '@/notesDS/primitives/stack';
import { Row } from '@/notesDS/primitives/row';
import { H3, Small, Muted } from '@/notesDS/components/ui/typography';
import { cn } from '@/notesDS/utils/cn';

type NotePreviewCardProps = {
  title: string;
  contentPreview: string;
  date: string;
  categoryTitle: string;
  categoryColorClasses: { dot: string; bg: string };
  onClick: () => void;
};

export function NotePreviewCard({
  title,
  contentPreview,
  date,
  categoryTitle,
  categoryColorClasses,
  onClick,
}: NotePreviewCardProps) {
  const borderClass = categoryColorClasses.dot.replace('bg-', 'border-');

  return (
    <CardShell
      className={cn(
        'cursor-pointer transition-opacity hover:opacity-90',
        categoryColorClasses.bg,
        borderClass,
      )}
      onClick={onClick}
    >
      <Stack gap={2}>
        <Row justify="between" align="center" gap={2}>
          <Small className="font-bold text-foreground">{date}</Small>
          {categoryTitle ? <Small>{categoryTitle}</Small> : null}
        </Row>
        <H3>{title}</H3>
        {contentPreview ? <Muted>{contentPreview}</Muted> : null}
      </Stack>
    </CardShell>
  );
}
