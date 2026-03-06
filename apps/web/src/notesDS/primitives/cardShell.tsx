import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

const cardShellVariants = cva('rounded-md border border-input shadow-card', {
  variants: {
    padding: {
      none: '',
      sm: 'p-2',
      md: 'p-4',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    padding: 'md',
  },
});

interface CardShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardShellVariants> {}

function CardShell({ padding, className, children, ...props }: CardShellProps) {
  return (
    <div
      className={cn(cardShellVariants({ padding }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { CardShell, cardShellVariants };
