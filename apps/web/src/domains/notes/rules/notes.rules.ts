/**
 * Pure business rules for the notes domain.
 */

/** Format a note date as "Today", "Yesterday", or "Mar 5". */
export function formatNoteDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (dateOnly.getTime() === today.getTime()) return 'Today';
  if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Truncate content to maxLength, appending ellipsis if needed. */
export function truncateContent(content: string, maxLength: number): string {
  const trimmed = content.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Strip common markdown syntax to produce plain text suitable for preview cards.
 * Not exhaustive — targets the most common constructs.
 */
export function stripMarkdown(content: string): string {
  return content
    .replace(/^#{1,6}\s+/gm, '')       // headings
    .replace(/\*\*(.+?)\*\*/g, '$1')   // bold
    .replace(/\*(.+?)\*/g, '$1')       // italic
    .replace(/~~(.+?)~~/g, '$1')       // strikethrough
    .replace(/`{3}[\s\S]*?`{3}/g, '')  // fenced code blocks
    .replace(/`(.+?)`/g, '$1')         // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')   // images
    .replace(/\[(.+?)\]\(.*?\)/g, '$1') // links
    .replace(/^[-*+]\s+/gm, '')        // unordered list bullets
    .replace(/^\d+\.\s+/gm, '')        // ordered list numbers
    .replace(/^>\s+/gm, '')            // blockquotes
    .replace(/^[-*_]{3,}$/gm, '')      // horizontal rules
    .replace(/\n{2,}/g, ' ')           // collapse blank lines
    .trim();
}

/** Returns true if a note has no title and no content — considered empty/reusable. */
export function isNoteEmpty(note: { title: string; content: string }): boolean {
  return !note.title.trim() && !note.content.trim();
}

/** Map a seed category hex color to Tailwind token classes for dot and card background. */
export function mapCategoryColorToToken(hex: string): { dot: string; bg: string } {
  const normalized = hex.toLowerCase();
  if (normalized === '#f5a623') return { dot: 'bg-category-orange', bg: 'bg-category-orange-bg' };
  if (normalized === '#4a90e2') return { dot: 'bg-category-teal', bg: 'bg-category-teal-bg' };
  if (normalized === '#7ed321') return { dot: 'bg-category-yellow', bg: 'bg-category-yellow-bg' };
  return { dot: 'bg-muted-foreground', bg: 'bg-secondary' };
}

// ── Auto-save rules (ADR-003) ──────────────────────────────────────────────────

type NoteState = {
  title: string;
  content: string;
  categoryId: string | null;
};

type UpdatePayload = {
  title?: string;
  content?: string;
  category?: string | null;
};

/**
 * Returns true when title or content has changed — these use the debounced
 * (~1s) save path. Category changes are handled by shouldImmediateSave.
 */
export function shouldDebounceSave(prev: NoteState, next: NoteState): boolean {
  return prev.title !== next.title || prev.content !== next.content;
}

/**
 * Returns true when the categoryId has changed — category saves are immediate
 * (no debounce) per ADR-003.
 */
export function shouldImmediateSave(prev: NoteState, next: NoteState): boolean {
  return prev.categoryId !== next.categoryId;
}

/**
 * Builds the minimal PATCH payload containing only the fields that changed.
 * This avoids sending unchanged values to the backend.
 */
export function buildUpdatePayload(prev: NoteState, next: NoteState): UpdatePayload {
  const payload: UpdatePayload = {};
  if (prev.title !== next.title) payload.title = next.title;
  if (prev.content !== next.content) payload.content = next.content;
  if (prev.categoryId !== next.categoryId) payload.category = next.categoryId;
  return payload;
}
