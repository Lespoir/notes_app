import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

/**
 * Tests for the useSpeechToText hook (task 6A).
 *
 * The hook is responsible for:
 *   - Detecting whether the browser supports the Web Speech API
 *   - Starting and stopping speech recognition
 *   - Accumulating interim and final transcription results
 *   - Calling a provided callback when a final transcript segment is ready
 *   - Exposing recording state (isRecording)
 *   - Cleaning up the recognition instance on unmount
 *
 * The hook is expected to live at:
 *   lib/speech/useSpeechToText.ts
 *
 * Tests are red until the implementation is added.
 */

// ── Web Speech API mock factory ───────────────────────────────────────────────
//
// The real SpeechRecognition fires events on an instance. We replicate that
// by creating a mock class whose instances expose the same event-handler
// properties and imperative start/stop methods.

// Local stand-ins for DOM types not yet in TypeScript's lib.dom.d.ts.
interface MockSpeechRecognitionEvent {
  results: Array<{ isFinal: boolean; [index: number]: { transcript: string; confidence: number } }>;
  resultIndex: number;
}
interface MockSpeechRecognitionErrorEvent {
  error: string;
}

type SpeechRecognitionEventHandler = ((event: MockSpeechRecognitionEvent) => void) | null;
type SpeechRecognitionErrorHandler = ((event: MockSpeechRecognitionErrorEvent) => void) | null;
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

// Holds a reference to the most recently constructed recognition instance so
// tests can fire simulated events on it.
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
    // Simulate the browser firing onstart after start() is called.
    if (this.onstart) this.onstart();
  });
  this.stop = vi.fn(() => {
    // Simulate the browser firing onend after stop() is called.
    if (this.onend) this.onend();
  });
  this.abort = vi.fn();
  mockRecognitionInstance = this;
});

// Helper: build a minimal SpeechRecognitionEvent-like object with one result.
function makeResultEvent(
  transcript: string,
  isFinal: boolean,
): MockSpeechRecognitionEvent {
  return {
    results: [
      Object.assign([{ transcript, confidence: 0.9 }], { isFinal }),
    ],
    resultIndex: 0,
  };
}

// ── Import hook after mocks are defined ──────────────────────────────────────
//
// The import is at the bottom of the setup block so `vi.mock` hoisting does
// not cause issues. The hook reads `window.SpeechRecognition` at call time,
// not at module evaluation time.
import { useSpeechToText } from '../useSpeechToText';

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  mockRecognitionInstance = null;
  vi.clearAllMocks();
  // Install the mock constructor on window for each test.
  Object.defineProperty(window, 'SpeechRecognition', {
    value: MockSpeechRecognition,
    writable: true,
    configurable: true,
  });
  // Ensure the webkit-prefixed alias is also cleared.
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: undefined,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  // Clean up so other test suites do not see our mocks.
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

describe('useSpeechToText', () => {
  // ── Browser support detection ───────────────────────────────────────────────

  describe('browser support detection', () => {
    it('reports isSupported as true when window.SpeechRecognition is available', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));
      expect(result.current.isSupported).toBe(true);
    });

    it('reports isSupported as true when only window.webkitSpeechRecognition is available', () => {
      Object.defineProperty(window, 'SpeechRecognition', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'webkitSpeechRecognition', {
        value: MockSpeechRecognition,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));
      expect(result.current.isSupported).toBe(true);
    });

    it('reports isSupported as false when neither SpeechRecognition variant is available', () => {
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

      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));
      expect(result.current.isSupported).toBe(false);
    });
  });

  // ── Initial state ───────────────────────────────────────────────────────────

  describe('initial state', () => {
    it('starts with isRecording as false', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));
      expect(result.current.isRecording).toBe(false);
    });

    it('exposes a startRecording function', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));
      expect(typeof result.current.startRecording).toBe('function');
    });

    it('exposes a stopRecording function', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));
      expect(typeof result.current.stopRecording).toBe('function');
    });
  });

  // ── Starting recording ──────────────────────────────────────────────────────

  describe('startRecording', () => {
    it('sets isRecording to true after startRecording is called', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(true);
    });

    it('calls start() on the SpeechRecognition instance', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      expect(mockRecognitionInstance?.start).toHaveBeenCalledTimes(1);
    });

    it('configures SpeechRecognition with continuous mode enabled', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      expect(mockRecognitionInstance?.continuous).toBe(true);
    });

    it('configures SpeechRecognition with interimResults enabled', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      expect(mockRecognitionInstance?.interimResults).toBe(true);
    });

    it('does nothing if the browser does not support speech recognition', () => {
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

      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      // isRecording should remain false — no recognition instance was created.
      expect(result.current.isRecording).toBe(false);
    });

    it('does nothing if already recording', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      const startCallCount = mockRecognitionInstance?.start.mock.calls.length ?? 0;

      act(() => {
        result.current.startRecording();
      });

      // start() should not have been called a second time.
      expect(mockRecognitionInstance?.start).toHaveBeenCalledTimes(startCallCount);
    });
  });

  // ── Stopping recording ──────────────────────────────────────────────────────

  describe('stopRecording', () => {
    it('sets isRecording to false after stopRecording is called', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        result.current.stopRecording();
      });

      expect(result.current.isRecording).toBe(false);
    });

    it('calls stop() on the SpeechRecognition instance', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        result.current.stopRecording();
      });

      expect(mockRecognitionInstance?.stop).toHaveBeenCalledTimes(1);
    });

    it('does nothing when stopRecording is called without a prior startRecording', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      // Should not throw.
      expect(() => {
        act(() => {
          result.current.stopRecording();
        });
      }).not.toThrow();
    });
  });

  // ── Transcription events ────────────────────────────────────────────────────

  describe('transcription events', () => {
    it('calls onTranscript with the final transcript when a final result arrives', () => {
      const onTranscript = vi.fn();
      const { result } = renderHook(() => useSpeechToText({ onTranscript }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('Hello world', true));
      });

      expect(onTranscript).toHaveBeenCalledWith('Hello world');
    });

    it('does not call onTranscript for interim (non-final) results', () => {
      const onTranscript = vi.fn();
      const { result } = renderHook(() => useSpeechToText({ onTranscript }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('partial text', false));
      });

      expect(onTranscript).not.toHaveBeenCalled();
    });

    it('calls onTranscript for each separate final result segment', () => {
      const onTranscript = vi.fn();
      const { result } = renderHook(() => useSpeechToText({ onTranscript }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('First segment.', true));
        mockRecognitionInstance!.onresult!(makeResultEvent('Second segment.', true));
      });

      expect(onTranscript).toHaveBeenCalledTimes(2);
      expect(onTranscript).toHaveBeenNthCalledWith(1, 'First segment.');
      expect(onTranscript).toHaveBeenNthCalledWith(2, 'Second segment.');
    });

    it('passes the trimmed transcript text to onTranscript', () => {
      const onTranscript = vi.fn();
      const { result } = renderHook(() => useSpeechToText({ onTranscript }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        mockRecognitionInstance!.onresult!(makeResultEvent('  spaces around  ', true));
      });

      expect(onTranscript).toHaveBeenCalledWith('spaces around');
    });
  });

  // ── Recording ends naturally (onend without explicit stop) ──────────────────

  describe('onend event', () => {
    it('sets isRecording to false when the browser fires onend', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      expect(result.current.isRecording).toBe(true);

      // Simulate the browser ending the session on its own (e.g., silence timeout).
      act(() => {
        mockRecognitionInstance!.onend!();
      });

      expect(result.current.isRecording).toBe(false);
    });
  });

  // ── Error handling ──────────────────────────────────────────────────────────

  describe('error handling', () => {
    it('sets isRecording to false when an error event fires', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        mockRecognitionInstance!.onerror!({
          error: 'network',
        } as MockSpeechRecognitionErrorEvent);
      });

      expect(result.current.isRecording).toBe(false);
    });

    it('calls an optional onError callback when an error occurs', () => {
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useSpeechToText({ onTranscript: vi.fn(), onError }),
      );

      act(() => {
        result.current.startRecording();
      });

      act(() => {
        mockRecognitionInstance!.onerror!({
          error: 'not-allowed',
        } as MockSpeechRecognitionErrorEvent);
      });

      expect(onError).toHaveBeenCalledWith('not-allowed');
    });

    it('does not throw if onError is not provided', () => {
      const { result } = renderHook(() => useSpeechToText({ onTranscript: vi.fn() }));

      act(() => {
        result.current.startRecording();
      });

      expect(() => {
        act(() => {
          mockRecognitionInstance!.onerror!({
            error: 'aborted',
          } as MockSpeechRecognitionErrorEvent);
        });
      }).not.toThrow();
    });
  });

  // ── Cleanup on unmount ──────────────────────────────────────────────────────

  describe('cleanup on unmount', () => {
    it('calls abort() on the recognition instance when the component unmounts while recording', () => {
      const { result, unmount } = renderHook(() =>
        useSpeechToText({ onTranscript: vi.fn() }),
      );

      act(() => {
        result.current.startRecording();
      });

      unmount();

      expect(mockRecognitionInstance?.abort).toHaveBeenCalledTimes(1);
    });

    it('does not throw when unmounting without having started recording', () => {
      const { unmount } = renderHook(() =>
        useSpeechToText({ onTranscript: vi.fn() }),
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});
