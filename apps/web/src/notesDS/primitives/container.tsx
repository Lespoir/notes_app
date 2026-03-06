import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

const containerVariants = cva('mx-auto w-full px-4', {
  variants: {
    size: {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

type ContainerProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & VariantProps<typeof containerVariants> &
  Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

function Container<T extends React.ElementType = 'div'>({
  as,
  size,
  className,
  children,
  ...props
}: ContainerProps<T>) {
  const Component = (as ?? 'div') as React.ElementType;
  return (
    <Component
      className={cn(containerVariants({ size }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Container, containerVariants };
