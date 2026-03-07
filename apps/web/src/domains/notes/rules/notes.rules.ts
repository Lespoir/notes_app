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
