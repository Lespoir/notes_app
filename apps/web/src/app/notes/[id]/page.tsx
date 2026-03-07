/**
 * Note editor page.
 *
 * This page is thin — all logic lives in useNoteEditor.
 * The editor card background + border color changes to match the selected category.
 */
'use client';

import { use, useState } from 'react';
import { useNoteEditor } from '@/features/note-editor/hooks/useNoteEditor';
import { NoteEditorHeader } from '@/features/note-editor/components/NoteEditorHeader';
import { NoteTitle } from '@/features/note-editor/components/NoteTitle';
import { NoteContent, type NoteContentMode } from '@/features/note-editor/components/NoteContent';
import { VoiceInputButton } from '@/features/note-editor/components/VoiceInputButton';
import { Stack } from '@/notesDS/primitives/stack';
import { Row } from '@/notesDS/primitives/row';
import { Small, Muted } from '@/notesDS/components/ui/typography';
import { cn } from '@/notesDS/utils/cn';

type NoteEditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function NoteEditorPage({ params }: NoteEditorPageProps) {
  const { id } = use(params);
  const [mode, setMode] = useState<NoteContentMode>('edit');
  const {
    title,
    content,
    categoryId,
    bgClass,
    borderClass,
    lastEditedLabel,
    isSaving,
    categories,
    isLoading,
    handleTitleChange,
    handleContentChange,
    handleCategoryChange,
    handleBack,
    handleDelete,
    isVoiceSupported,
    isRecording,
    startVoiceInput,
    stopVoiceInput,
  } = useNoteEditor(id);

  return (
    <Stack as="main" gap={0} className="h-screen bg-background p-6 flex flex-col">
      <NoteEditorHeader
        categories={categories}
        selectedCategoryId={categoryId}
        onCategoryChange={handleCategoryChange}
        onDelete={handleDelete}
        onClose={handleBack}
      />

      {isLoading ? (
        <Muted className="py-12 text-center">Loading note…</Muted>
      ) : (
        <div
          className={cn(
            'relative flex flex-col flex-1 rounded-[var(--radius-lg)] border p-8 transition-colors duration-300 overflow-hidden',
            bgClass,
            borderClass,
          )}
        >
          {/* Top row: edit/preview toggle (left) + last edited (right) */}
          <Row justify="between" align="center" className="mb-6">
            <Row gap={1}>
              {(['edit', 'preview'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'text-xs font-medium px-2 py-0.5 rounded transition-colors capitalize',
                    mode === m
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m}
                </button>
              ))}
            </Row>
            <Small className="text-foreground/60">
              {isSaving ? 'Saving…' : lastEditedLabel ? `Last Edited: ${lastEditedLabel}` : ''}
            </Small>
          </Row>

          <NoteTitle value={title} onChange={handleTitleChange} />
          <NoteContent value={content} onChange={handleContentChange} mode={mode} />

          {/* Voice input — bottom right inside card */}
          <div className="mt-auto flex justify-end pt-4">
            <VoiceInputButton
              isSupported={isVoiceSupported}
              isRecording={isRecording}
              onStart={startVoiceInput}
              onStop={stopVoiceInput}
            />
          </div>
        </div>
      )}
    </Stack>
  );
}
