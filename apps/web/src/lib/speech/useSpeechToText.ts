/**
 * useSpeechToText — Web Speech API wrapper hook.
 *
 * Provides a simple interface over the browser's SpeechRecognition API.
 * Lives in lib/ because it is a pure browser API adapter with no domain
 * or feature knowledge.
 *
 * Usage:
 *   const { isSupported, isRecording, transcript, start, stop } =
 *     useSpeechToText({ onTranscript: (text) => append(text) });
 */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// Minimal Web Speech API types — not yet in TypeScript's lib.dom.d.ts.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Extend the Window type to include webkit-prefixed SpeechRecognition.
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor | undefined;
    webkitSpeechRecognition: SpeechRecognitionConstructor | undefined;
  }
}

type UseSpeechToTextOptions = {
  /** Called each time a final transcript segment is produced. */
  onTranscript: (text: string) => void;
  /** Called when the recognition session ends (naturally or via stopRecording()). */
  onEnd?: () => void;
  /** Called when the recognition session encounters an error. */
  onError?: (errorCode: string) => void;
};

export type UseSpeechToTextReturn = {
  /** Whether the current browser supports the Web Speech API. */
  isSupported: boolean;
  /** Whether a recording session is currently active. */
  isRecording: boolean;
  /** Accumulated transcript text from the current session. */
  transcript: string;
  /** Start a new recognition session. No-op if already recording or unsupported. */
  startRecording: () => void;
  /** Stop the active recognition session. No-op if not recording. */
  stopRecording: () => void;
};

export function useSpeechToText({
  onTranscript,
  onEnd,
  onError,
}: UseSpeechToTextOptions): UseSpeechToTextReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  // Keep a stable ref to callbacks so event handlers don't go stale.
  const onTranscriptRef = useRef(onTranscript);
  const onEndRef = useRef(onEnd);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);

  const startRecording = useCallback(() => {
    if (!isSupported) return;
    if (recognitionRef.current) return; // already recording

    const SpeechRecognitionCtor =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        }
      }
      const trimmed = finalText.trim();
      if (trimmed) {
        setTranscript((prev) => (prev ? `${prev} ${trimmed}` : trimmed));
        onTranscriptRef.current(trimmed);
      }
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setIsRecording(false);
      onEndRef.current?.();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      recognitionRef.current = null;
      setIsRecording(false);
      onErrorRef.current?.(event.error);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript('');
  }, [isSupported]);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    // State resets happen in the onend handler.
  }, []);

  // Clean up on unmount.
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  return { isSupported, isRecording, transcript, startRecording, stopRecording };
}
