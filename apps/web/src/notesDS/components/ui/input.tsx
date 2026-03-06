import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

/**
 * Input component with CVA variants.
 * Design reference: Figma — thin border, rounded-sm, Inter 12px, primary border color.
 *
 * Variants:
 *   - default → standard bordered input matching Figma auth/form fields
 *   - error   → error state with destructive border color
 *   - ghost   → no border, transparent background (for inline editable fields)
 */
const inputVariants = cva(
  [
    'flex w-full font-sans text-sm text-foreground',
    'placeholder:text-muted-foreground',
    'transition-colors duration-150',
    'focus-visible:outline-none',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        /** Bordered input — matches Figma auth/form fields */
        default: [
          'border border-input',
          'rounded-[var(--radius-sm)]',
          'bg-background',
          'px-4 py-2 h-[39px]',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0',
        ],
        /** Error state — destructive border, same structure as default */
        error: [
          'border border-destructive',
          'rounded-[var(--radius-sm)]',
          'bg-background',
          'px-4 py-2 h-[39px]',
          'focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-0',
        ],
        /** Ghost — transparent, no border; for inline editable note title/content */
        ghost: [
          'border-0 bg-transparent',
          'px-0 py-1',
          'focus-visible:ring-0',
        ],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

function Input({ variant, className, ...props }: InputProps) {
  return (
    <input
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
