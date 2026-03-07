import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CardShell } from '@/notesDS/primitives/cardShell';
import { Stack } from '@/notesDS/primitives/stack';
import { Row } from '@/notesDS/primitives/row';
import { H3, Small } from '@/notesDS/components/ui/typography';
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
      padding="none"
      className={cn(
        'cursor-pointer transition-opacity hover:opacity-90',
        'max-h-[246px] overflow-hidden',
        'pl-4 pr-[19px] py-4',
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
        {contentPreview ? (
          <div
            className={cn(
              'overflow-hidden font-sans text-sm leading-normal text-foreground/70',
              'pointer-events-none',
              '[&_strong]:font-bold [&_em]:italic',
              '[&_h1]:text-base [&_h1]:font-bold [&_h1]:leading-normal',
              '[&_h2]:text-sm [&_h2]:font-semibold [&_h2]:leading-normal',
              '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:leading-normal',
              '[&_p]:text-sm',
              '[&_ul]:list-disc [&_ul]:pl-3',
              '[&_ol]:list-decimal [&_ol]:pl-3',
              '[&_code]:font-mono [&_code]:text-xs',
              '[&_a]:underline',
            )}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentPreview}</ReactMarkdown>
          </div>
        ) : null}
      </Stack>
    </CardShell>
  );
}
