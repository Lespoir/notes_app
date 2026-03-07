/**
 * NoteContent — markdown editor with edit/preview toggle.
 *
 * Edit mode: auto-growing textarea (react-textarea-autosize).
 * Preview mode: rendered markdown (react-markdown + remark-gfm).
 */
'use client';

import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/notesDS/utils/cn';
import { Row } from '@/notesDS/primitives/row';

type NoteContentProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NoteContent({ value, onChange }: NoteContentProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div>
      <Row gap={2} className="mb-2">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded transition-colors',
            mode === 'edit'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={cn(
            'text-xs font-medium px-2 py-0.5 rounded transition-colors',
            mode === 'preview'
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Preview
        </button>
      </Row>

      {mode === 'edit' ? (
        <TextareaAutosize
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing… (markdown supported)"
          aria-label="Note content"
          minRows={8}
          className={cn(
            'w-full resize-none border-0 bg-transparent',
            'font-mono text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-0',
            'px-0 py-1',
          )}
        />
      ) : (
        <div
          className={cn(
            'prose prose-sm max-w-none min-h-32',
            'text-foreground',
            '[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2',
            '[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2',
            '[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1',
            '[&_p]:mb-2 [&_p]:leading-relaxed',
            '[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-2',
            '[&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-2',
            '[&_li]:mb-0.5',
            '[&_code]:font-mono [&_code]:text-xs [&_code]:bg-black/10 [&_code]:px-1 [&_code]:rounded',
            '[&_pre]:bg-black/10 [&_pre]:p-3 [&_pre]:rounded [&_pre]:overflow-x-auto [&_pre]:mb-2',
            '[&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:mb-2',
            '[&_a]:underline [&_a]:text-foreground',
            '[&_hr]:border-muted-foreground/30 [&_hr]:my-3',
            '[&_table]:w-full [&_table]:text-sm [&_table]:mb-2',
            '[&_th]:text-left [&_th]:font-semibold [&_th]:pb-1',
            '[&_td]:pb-1',
          )}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}
