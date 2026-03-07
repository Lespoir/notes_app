/**
 * Note editor screen hook.
 *
 * Orchestrates data fetching, local optimistic state, and debounced auto-save
 * for the note editor screen.
 *
 * Auto-save strategy (ADR-003): debounce title/content changes ~1s; flush
 * immediately on category change or beforeunload.
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  useNotesRepository,
  updateNoteSync,
} from '@/domains/notes/repositories/notes.repository';
import { useCategoriesRepository } from '@/domains/categories/repositories/categories.repository';
import { formatNoteDate, mapCategoryColorToToken } from '@/domains/notes/rules/notes.rules';
import { useSpeechToText } from '@/lib/speech/useSpeechToText';
import type { CategoryEntity } from '@/domains/categories/entities/category.entity';

export type EditorCategory = CategoryEntity & {
  colorClasses: { dot: string; bg: string };
};

export type UseNoteEditorReturn = {
  title: string;
  content: string;
  categoryId: string | null;
  /** Raw Date of last edit — used for display and optimistic updates. */
  lastEditedAt: Date;
  /** Formatted label derived from lastEditedAt ("Today", "Yesterday", "Mar 5"). */
  lastEditedLabel: string;
  /** Background color token class driven by the current category. */
  bgClass: string;
  /** Border color token class driven by the current category. */
  borderClass: string;
  categories: EditorCategory[];
  isLoading: boolean;
  isSaving: boolean;
  handleTitleChange: (value: string) => void;
  handleContentChange: (value: string) => void;
  /** Category change triggers an immediate save (no debounce). */
  handleCategoryChange: (categoryId: string) => void;
  handleBack: () => void;
  handleDelete: () => Promise<void>;
  /** Whether the current browser supports the Web Speech API. */
  isVoiceSupported: boolean;
  /** Whether voice recording is currently active. */
  isRecording: boolean;
  /** Start a voice recording session. */
  startVoiceInput: () => void;
  /** Stop the active voice recording session. */
  stopVoiceInput: () => void;
};

const DEBOUNCE_MS = 1000;

export const useNoteEditor = (noteId: string): UseNoteEditorReturn => {
  const router = useRouter();
  const { isLoading, getNote, updateNote, deleteNote } = useNotesRepository();
  const { categories: rawCategories } = useCategoriesRepository();

  // ── Local optimistic state ────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [lastEditedAt, setLastEditedAt] = useState<Date>(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Track whether local state has been seeded from the fetched note.
  const seededRef = useRef(false);

  // Fetch the note by ID on mount, then seed local state.
  useEffect(() => {
    if (seededRef.current) return;
    getNote(noteId)
      .then((note) => {
        if (seededRef.current) return;
        setTitle(note.title);
        setContent(note.content);
        setCategoryId(note.category?.id ?? null);
        setLastEditedAt(note.updatedAt);
        seededRef.current = true;
      })
      .catch(() => {
        // Note not found — render empty state gracefully.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  // ── Debounced auto-save ───────────────────────────────────────────────────
  // Keep refs to latest values so the timer closure always uses fresh state.
  const pendingRef = useRef<{
    title: string;
    content: string;
    categoryId: string | null;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushSave = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendingRef.current) return;
    const payload = pendingRef.current;
    pendingRef.current = null;
    setIsSaving(true);
    try {
      const updated = await updateNote(noteId, {
        title: payload.title,
        content: payload.content,
        category: payload.categoryId ?? undefined,
      });
      if (updated?.updatedAt) setLastEditedAt(updated.updatedAt);
    } finally {
      setIsSaving(false);
    }
  }, [noteId, updateNote]);

  const scheduleSave = useCallback(
    (next: { title: string; content: string; categoryId: string | null }) => {
      pendingRef.current = next;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        flushSave();
      }, DEBOUNCE_MS);
    },
    [flushSave],
  );

  // Flush pending save on page unload (best-effort).
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!pendingRef.current) return;
      const payload = pendingRef.current;
      pendingRef.current = null;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      updateNoteSync(noteId, {
        title: payload.title,
        content: payload.content,
        category: payload.categoryId ?? undefined,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [noteId]);

  // Clean up timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      scheduleSave({ title: value, content, categoryId });
    },
    [content, categoryId, scheduleSave],
  );

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      scheduleSave({ title, content: value, categoryId });
    },
    [title, categoryId, scheduleSave],
  );

  const handleCategoryChange = useCallback(
    async (newCategoryId: string) => {
      setCategoryId(newCategoryId);
      // Clear any pending debounced save and fire immediately.
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      pendingRef.current = null;
      setIsSaving(true);
      try {
        const updated = await updateNote(noteId, { title, content, category: newCategoryId });
        if (updated?.updatedAt) setLastEditedAt(updated.updatedAt);
      } finally {
        setIsSaving(false);
      }
    },
    [noteId, title, content, updateNote],
  );

  const handleBack = useCallback(async () => {
    await flushSave();
    router.push('/');
  }, [flushSave, router]);

  const handleDelete = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingRef.current = null;
    await deleteNote(noteId);
    router.push('/');
  }, [noteId, deleteNote, router]);

  // ── Voice input ───────────────────────────────────────────────────────────

  // Keep a ref to the latest content so the transcript callback always appends
  // to the most up-to-date value without introducing stale-closure issues.
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const handleTranscript = useCallback(
    (text: string) => {
      const next = contentRef.current
        ? `${contentRef.current} ${text}`
        : text;
      // Update the ref immediately so rapid successive transcripts don't
      // overwrite each other before the effect has a chance to re-sync.
      contentRef.current = next;
      setContent(next);
      // Stage the transcribed text for debounced auto-save.
      scheduleSave({ title, content: next, categoryId });
    },
    // title and categoryId are stable across transcript events within a session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scheduleSave, title, categoryId],
  );

  const handleTranscriptEnd = useCallback(() => {
    // Flush the pending save immediately when the session ends so the
    // transcribed content is persisted without waiting for the debounce timer.
    flushSave();
  }, [flushSave]);

  const {
    isSupported: isVoiceSupported,
    isRecording,
    startRecording: startVoiceInput,
    stopRecording: stopVoiceInput,
  } = useSpeechToText({
    onTranscript: handleTranscript,
    onEnd: handleTranscriptEnd,
  });

  // ── Derived display data ──────────────────────────────────────────────────

  const categories: EditorCategory[] = rawCategories.map((cat) => ({
    ...cat,
    colorClasses: mapCategoryColorToToken(cat.color),
  }));

  const currentCategory = rawCategories.find((c) => c.id === categoryId) ?? null;
  const colorTokens = currentCategory ? mapCategoryColorToToken(currentCategory.color) : null;
  const bgClass = colorTokens?.bg ?? 'bg-background';
  const borderClass = colorTokens?.border ?? 'border-input';

  const lastEditedLabel = formatNoteDate(lastEditedAt);

  return {
    title,
    content,
    categoryId,
    lastEditedAt,
    lastEditedLabel,
    bgClass,
    borderClass,
    categories,
    isLoading,
    isSaving,
    handleTitleChange,
    handleContentChange,
    handleCategoryChange,
    handleBack,
    handleDelete,
    isVoiceSupported,
    isRecording,
    startVoiceInput,
    stopVoiceInput,
  };
};
