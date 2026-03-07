/**
 * VoiceInputButton — microphone control for voice-to-text note input.
 *
 * Renders:
 *  - When idle:       a dark circular microphone icon button (icon variant)
 *  - When recording:  a stop icon button + a green animated dot indicator
 *
 * The component is purely presentational — recording state and callbacks
 * are supplied by the parent (useNoteEditor via the page).
 */
'use client';

import { Row } from '@/notesDS/primitives/row';
import { Button } from '@/notesDS/components/ui/button';
import { Small } from '@/notesDS/components/ui/typography';
import { cn } from '@/notesDS/utils/cn';

type VoiceInputButtonProps = {
  isRecording: boolean;
  isSupported: boolean;
  onStart: () => void;
  onStop: () => void;
};

export function VoiceInputButton({
  isRecording,
  isSupported,
  onStart,
  onStop,
}: VoiceInputButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <Row align="center" gap={2}>
      {/* Recording indicator */}
      {isRecording && (
        <Row align="center" gap={1}>
          <span
            className={cn(
              'block h-2.5 w-2.5 rounded-full',
              'bg-recording',
              'animate-pulse',
            )}
            aria-hidden="true"
          />
          <Small className="text-muted-foreground">Recording…</Small>
        </Row>
      )}

      {/* Mic / Stop button */}
      {isRecording ? (
        <Button
          variant="icon"
          onClick={onStop}
          aria-label="Stop voice recording"
          title="Stop recording"
        >
          {/* Stop icon — solid square */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <rect x="6" y="6" width="12" height="12" rx="1" />
          </svg>
        </Button>
      ) : (
        <Button
          variant="icon"
          onClick={onStart}
          aria-label="Start voice input"
          title="Start voice input"
        >
          {/* Microphone icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Z" />
            <path d="M5 10a1 1 0 0 1 2 0 5 5 0 0 0 10 0 1 1 0 1 1 2 0 7 7 0 0 1-6 6.93V20h2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2h2v-3.07A7 7 0 0 1 5 10Z" />
          </svg>
        </Button>
      )}
    </Row>
  );
}
