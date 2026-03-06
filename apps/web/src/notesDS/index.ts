/**
 * notesDS — Design System barrel export
 *
 * Import from '@/notesDS' to access all design system primitives, components,
 * typography, and utilities.
 *
 * Import rules:
 *   - notesDS may only import from itself and Tailwind.
 *   - NEVER import from domains/, features/, data/, or lib/.
 */

// Layout primitives
export { Stack, stackVariants } from './primitives/stack';
export { Row, rowVariants } from './primitives/row';
export { Container, containerVariants } from './primitives/container';
export { Section, sectionVariants } from './primitives/section';
export { CardShell, cardShellVariants } from './primitives/cardShell';

// Typography
export {
  H1,
  H2,
  H3,
  H4,
  P,
  Large,
  Small,
  Muted,
  Lead,
  Overline,
} from './components/ui/typography';

// Variant components
export { Button, buttonVariants } from './components/ui/button';
export { Input, inputVariants } from './components/ui/input';

// Utilities
export { cn } from './utils/cn';
