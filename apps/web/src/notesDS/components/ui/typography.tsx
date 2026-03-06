import React from 'react';
import { cn } from '@/notesDS/utils/cn';

/**
 * Typography components — fixed semantic styles, no CVA variants.
 * Override via `className` (merged with cn).
 *
 * Rule: no raw <h1>-<h6> / <p> tags with ad-hoc Tailwind classes.
 * Always use these named exports.
 */

// ── Headings ──────────────────────────────────────────────────────────────────

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {}

/** Large page-level heading. Font: display (Inria Serif), 3xl, bold. */
function H1({ className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn(
        'font-display text-3xl font-bold tracking-tight text-heading',
        className
      )}
      {...props}
    />
  );
}

/** Section heading. Font: display, 2xl, bold. */
function H2({ className, ...props }: HeadingProps) {
  return (
    <h2
      className={cn(
        'font-display text-2xl font-bold tracking-tight text-heading',
        className
      )}
      {...props}
    />
  );
}

/** Sub-section heading. Font: display, xl, bold. */
function H3({ className, ...props }: HeadingProps) {
  return (
    <h3
      className={cn('font-display text-xl font-bold text-heading', className)}
      {...props}
    />
  );
}

/** Card / label heading. Font: sans, lg, semibold. */
function H4({ className, ...props }: HeadingProps) {
  return (
    <h4
      className={cn('font-sans text-lg font-semibold text-foreground', className)}
      {...props}
    />
  );
}

// ── Body text ─────────────────────────────────────────────────────────────────

/** Default body paragraph. Font: sans, sm. */
function P({ className, ...props }: ParagraphProps) {
  return (
    <p className={cn('font-sans text-sm text-foreground', className)} {...props} />
  );
}

/** Emphasized body. Font: sans, base, bold. */
function Large({ className, ...props }: ParagraphProps) {
  return (
    <p
      className={cn('font-sans text-base font-bold text-foreground', className)}
      {...props}
    />
  );
}

/** Fine print / metadata. Font: sans, xs, caption color. */
function Small({ className, ...props }: ParagraphProps) {
  return (
    <p
      className={cn('font-sans text-xs text-caption', className)}
      {...props}
    />
  );
}

/** Secondary / supporting text. Font: sans, sm, muted. */
function Muted({ className, ...props }: ParagraphProps) {
  return (
    <p
      className={cn('font-sans text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Intro paragraph. Font: sans, lg, muted, relaxed leading. */
function Lead({ className, ...props }: ParagraphProps) {
  return (
    <p
      className={cn(
        'font-sans text-lg leading-relaxed text-muted-foreground',
        className
      )}
      {...props}
    />
  );
}

/** Category label / eyebrow. Inline span, xs, uppercase, spaced. */
function Overline({ className, ...props }: SpanProps) {
  return (
    <span
      className={cn(
        'font-sans text-xs font-semibold uppercase tracking-wider text-caption',
        className
      )}
      {...props}
    />
  );
}

export { H1, H2, H3, H4, P, Large, Small, Muted, Lead, Overline };
