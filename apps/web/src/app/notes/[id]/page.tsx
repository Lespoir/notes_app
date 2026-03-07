/**
 * Note editor page.
 *
 * This page is thin — all logic lives in useNoteEditor.
 * Background color changes to match the selected category.
 */
'use client';

import { use } from 'react';
import { useNoteEditor } from '@/features/note-editor/hooks/useNoteEditor';
import { NoteEditorHeader } from '@/features/note-editor/components/NoteEditorHeader';
import { NoteTitle } from '@/features/note-editor/components/NoteTitle';
import { NoteContent } from '@/features/note-editor/components/NoteContent';
import { VoiceInputButton } from '@/features/note-editor/components/VoiceInputButton';
import { Stack } from '@/notesDS/primitives/stack';
import { Container } from '@/notesDS/primitives/container';
import { Row } from '@/notesDS/primitives/row';
import { Muted } from '@/notesDS/components/ui/typography';
import { cn } from '@/notesDS/utils/cn';

type NoteEditorPageProps = {
  params: Promise<{ id: string }>;
};

export default function NoteEditorPage({ params }: NoteEditorPageProps) {
  const { id } = use(params);
  const {
    title,
    content,
    categoryId,
    bgClass,
    lastEditedLabel,
    categories,
    isLoading,
    isSaving,
    handleTitleChange,
    handleContentChange,
    handleCategoryChange,
    handleBack,
    isVoiceSupported,
    isRecording,
    startVoiceInput,
    stopVoiceInput,
  } = useNoteEditor(id);

  return (
    <Stack as="main" gap={0} className={cn('min-h-screen transition-colors duration-300', bgClass)}>
      <Container className="max-w-3xl px-6 py-8">
        <NoteEditorHeader
          lastEditedLabel={lastEditedLabel}
          isSaving={isSaving}
          categories={categories}
          selectedCategoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          onBack={handleBack}
        />

        {isLoading ? (
          <Muted className="py-12 text-center">Loading note…</Muted>
        ) : (
          <Stack gap={4}>
            <NoteTitle value={title} onChange={handleTitleChange} />
            <NoteContent value={content} onChange={handleContentChange} />
            <Row justify="end">
              <VoiceInputButton
                isSupported={isVoiceSupported}
                isRecording={isRecording}
                onStart={startVoiceInput}
                onStop={stopVoiceInput}
              />
            </Row>
          </Stack>
        )}
      </Container>
    </Stack>
  );
}
