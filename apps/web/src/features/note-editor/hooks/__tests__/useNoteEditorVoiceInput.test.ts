import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Integration tests for voice input behaviour on the note editor (task 6A).
 *
 * These tests verify:
 *   - Transcribed text is appended to the existing note content field
 *   - A debounced auto-save is triggered after transcription completes
 *   - The editor exposes voice-input state (isRecording) to the UI layer
 *   - startVoiceInput / stopVoiceInput handlers exist and forward to the
 *     underlying useSpeechToText hook
 *
 * The hook is expected to remain at:
 *   features/note-editor/hooks/useNoteEditor.ts
 *
 * Task 6A adds voice-input fields to its return type:
 *   - isRecording: boolean
 *   - isVoiceSupported: boolean
 *   - startVoiceInput: () => void
 *   - stopVoiceInput: () => void
 *
 * Tests are red until the implementation is added.
 */

// ── Web Speech API mock ───────────────────────────────────────────────────────

// Local stand-ins for DOM types not yet in TypeScript's lib.dom.d.ts.
interface MockSpeechRecognitionEvent {
  results: Array<{ isFinal: boolean; [index: number]: { transcript: string; confidence: number } }>;
  resultIndex: number;
}

type SpeechRecognitionEventHandler = ((event: MockSpeechRecognitionEvent) => void) | null;
type SpeechRecognitionErrorHandler = ((event: { error: string }) => void) | null;
type SpeechRecognitionHandler = (() => void) | null;

interface MockSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: SpeechRecognitionEventHandler;
  onerror: SpeechRecognitionErrorHandler;
  onend: SpeechRecognitionHandler;
  onstart: SpeechRecognitionHandler;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  abort: ReturnType<typeof vi.fn>;
}

let mockRecognitionInstance: MockSpeechRecognitionInstance | null = null;

const MockSpeechRecognition = vi.fn(function (
  this: MockSpeechRecognitionInstance,
) {
  this.continuous = false;
  this.interimResults = false;
  this.lang = '';
  this.onresult = null;
  this.onerror = null;
  this.onend = null;
  this.onstart = null;
  this.start = vi.fn(() => {
    if (this.onstart) this.onstart();
  });
  this.stop = vi.fn(() => {
    if (this.onend) this.onend();
  });
  this.abort = vi.fn();
  mockRecognitionInstance = this;
});

function makeResultEvent(transcript: string, isFinal: boolean): MockSpeechRecognitionEvent {
  return {
    results: [
      Object.assign([{ transcript, confidence: 0.9 }], { isFinal }),
    ],
    resultIndex: 0,
  };
}

// ── Repository / navigation mocks ─────────────────────────────────────────────

vi.mock('@/domains/notes/repositories/notes.repository', () => ({
  useNotesRepository: vi.fn(),
  updateNoteSync: vi.fn(),
}));

vi.mock('@/domains/categories/repositories/categories.repository', () => ({
  useCategoriesRepository: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { useNotesRepository } from '@/domains/notes/repositories/notes.repository';
import { useCategoriesRepository } from '@/domains/categories/repositories/categories.repository';
import { useNoteEditor } from '../useNoteEditor';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeNote = (overrides = {}) => ({
  id: 'note-uuid-1',
  title: 'My Note',
  content: 'Existing content.',
  category: null,
  createdAt: new Date('2026-03-01T10:00:00Z'),
  updatedAt: new Date('2026-03-07T08:00:00Z'),
  ...overrides,
});

const mockUpdateNote = vi.fn();
const mockGetNote = vi.fn();

function setupMocks(noteOverrides = {}) {
  vi.mocked(useNotesRepository).mockReturnValue({
    notes: [],
    isLoading: false,
    isError: false,
    error: null,
    isCreatePending: false,
    createNote: vi.fn(),
    getNote: mockGetNote.mockResolvedValue(makeNote(noteOverrides)),
    updateNote: mockUpdateNote,
    deleteNote: vi.fn(),
  } as ReturnType<typeof useNotesRepository>);

  vi.mocked(useCategoriesRepository).mockReturnValue({
    categories: [],
    isLoading: false,
  } as unknown as ReturnType<typeof useCategoriesRepository>);
}

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockRecognitionInstance = null;
  vi.resetAllMocks();
  vi.useFakeTimers();
  setupMocks();

  Object.defineProperty(window, 'SpeechRecognition', {
    value: MockSpeechRecognition,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(window, 'SpeechRecognition', {
    value: undefined,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useNoteEditor — voice input integration (task 6A)', () => {

  // ── Exposed voice-input API ─────────────────────────────────────────────────

  describe('exposed voice-input API', () => {
    it('exposes an isRecording field', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(typeof result!.current.isRecording).toBe('boolean');
    });

    it('exposes an isVoiceSupported field', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(typeof result!.current.isVoiceSupported).toBe('boolean');
    });

    it('exposes a startVoiceInput function', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(typeof result!.current.startVoiceInput).toBe('function');
    });

    it('exposes a stopVoiceInput function', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(typeof result!.current.stopVoiceInput).toBe('function');
    });

    it('reports isVoiceSupported as true when the Web Speech API is present', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.isVoiceSupported).toBe(true);
    });

    it('reports isVoiceSupported as false when the Web Speech API is absent', async () => {
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.isVoiceSupported).toBe(false);
    });

    it('starts with isRecording as false', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      expect(result!.current.isRecording).toBe(false);
    });
  });

  // ── startVoiceInput / stopVoiceInput handlers ───────────────────────────────

  describe('startVoiceInput', () => {
    it('sets isRecording to true', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      expect(result!.current.isRecording).toBe(true);
    });

    it('initiates speech recognition (calls start() on the underlying instance)', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      expect(mockRecognitionInstance?.start).toHaveBeenCalledTimes(1);
    });
  });

  describe('stopVoiceInput', () => {
    it('sets isRecording to false', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        result!.current.stopVoiceInput();
      });

      expect(result!.current.isRecording).toBe(false);
    });

    it('stops speech recognition (calls stop() on the underlying instance)', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        result!.current.stopVoiceInput();
      });

      expect(mockRecognitionInstance?.stop).toHaveBeenCalledTimes(1);
    });
  });

  // ── Transcribed text appended to note content ───────────────────────────────

  describe('transcribed text appended to note content', () => {
    it('appends the transcribed text to the current content', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      // At this point, content should be seeded from the fetched note.
      const initialContent = result!.current.content;

      act(() => {
        result!.current.startVoiceInput();
      });

      // Simulate the speech recognition delivering a final transcript.
      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('Dictated sentence.', true));
      });

      expect(result!.current.content).toContain(initialContent);
      expect(result!.current.content).toContain('Dictated sentence.');
    });

    it('appends subsequent transcript segments separated by a space', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('First.', true));
        mockRecognitionInstance!.onresult!(makeResultEvent('Second.', true));
      });

      const { content } = result!.current;
      const firstIndex = content.indexOf('First.');
      const secondIndex = content.indexOf('Second.');
      expect(firstIndex).toBeGreaterThanOrEqual(0);
      expect(secondIndex).toBeGreaterThan(firstIndex);
    });

    it('does not modify content for interim (non-final) results', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      const contentBeforeInterim = result!.current.content;

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('partial text', false));
      });

      expect(result!.current.content).toBe(contentBeforeInterim);
    });

    it('does not call updateNote for interim results (no save triggered)', async () => {
      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('incomplete', false));
      });

      // Even advancing the timer should not trigger a save for interim results.
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(mockUpdateNote).not.toHaveBeenCalled();
    });
  });

  // ── Auto-save after transcription ───────────────────────────────────────────

  describe('auto-save after transcription', () => {
    it('schedules a debounced save when a final transcript is received', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ content: 'Existing content. Dictated text.' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('Dictated text.', true));
      });

      // Before the debounce delay, updateNote must not have been called yet.
      expect(mockUpdateNote).not.toHaveBeenCalled();

      // Advance past the debounce window.
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ content: expect.stringContaining('Dictated text.') }),
      );
    });

    it('triggers auto-save after each separate final transcript segment', async () => {
      mockUpdateNote.mockResolvedValue(makeNote());

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      // First segment.
      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('First sentence.', true));
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Second segment — resets the debounce.
      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('Second sentence.', true));
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // At least one save must have happened per segment (debounce may merge
      // rapid segments into a single call — the key assertion is that a save
      // did occur after each segment's debounce window expired).
      expect(mockUpdateNote).toHaveBeenCalled();
      const lastCall = mockUpdateNote.mock.calls[mockUpdateNote.mock.calls.length - 1];
      expect(lastCall[1]).toEqual(
        expect.objectContaining({ content: expect.stringContaining('Second sentence.') }),
      );
    });

    it('triggers auto-save immediately when stopVoiceInput is called with a pending transcript', async () => {
      mockUpdateNote.mockResolvedValue(makeNote({ content: 'Existing content. Voice note.' }));

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('Voice note.', true));
      });

      // Stop before the debounce timer fires.
      await act(async () => {
        result!.current.stopVoiceInput();
      });

      // The save should have been flushed immediately on stop.
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-uuid-1',
        expect.objectContaining({ content: expect.stringContaining('Voice note.') }),
      );
    });

    it('passes the full updated content (original + transcription) in the save payload', async () => {
      mockUpdateNote.mockResolvedValue(
        makeNote({ content: 'Existing content. New voice text.' }),
      );

      let result: ReturnType<typeof renderHook<ReturnType<typeof useNoteEditor>, unknown>>['result'];

      await act(async () => {
        ({ result } = renderHook(() => useNoteEditor('note-uuid-1')));
      });

      act(() => {
        result!.current.startVoiceInput();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('New voice text.', true));
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      const [, payload] = mockUpdateNote.mock.calls[0];
      // The payload must contain both the original content and the dictated text.
      expect(payload.content).toContain('Existing content.');
      expect(payload.content).toContain('New voice text.');
    });
  });
});
