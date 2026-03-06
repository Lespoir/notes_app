import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

/**
 * Button component with CVA variants.
 * Design reference: Figma Notes Taking App — pill-shaped buttons throughout.
 *
 * Variants:
 *   - primary   → filled primary background (default CTA)
 *   - secondary → outlined pill, primary border, secondary background
 *   - ghost     → no border, transparent background, subtle hover
 *   - icon      → circular dark button for icon-only actions (voice input)
 */
const buttonVariants = cva(
  // Base: shared across all variants
  [
    'inline-flex items-center justify-center gap-1.5',
    'font-sans font-bold text-base',
    'transition-colors duration-150',
    'cursor-pointer',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
  ],
  {
    variants: {
      variant: {
        /** Filled primary background — main CTA */
        primary: [
          'bg-primary text-primary-foreground',
          'hover:bg-primary/90',
          'rounded-[var(--radius-pill)]',
          'px-4 py-3',
        ],
        /** Outlined pill — secondary surface, primary border + text (Figma "New Note" / login buttons) */
        secondary: [
          'bg-secondary text-secondary-foreground',
          'border border-primary',
          'hover:bg-primary hover:text-primary-foreground',
          'rounded-[var(--radius-pill)]',
          'px-4 py-3',
        ],
        /** No border, transparent background, subtle hover */
        ghost: [
          'text-primary',
          'hover:bg-primary/10',
          'rounded-[var(--radius-sm)]',
          'px-3 py-2',
        ],
        /** Dark circular icon button — matches voice input button in Figma */
        icon: [
          'bg-action-dark text-action-dark-foreground',
          'hover:bg-action-dark/80',
          'rounded-full',
          'p-3',
          'h-14 w-14',
        ],
      },
      size: {
        sm: 'text-xs',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
