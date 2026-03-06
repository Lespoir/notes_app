import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

const sectionVariants = cva('flex flex-col', {
  variants: {
    gap: {
      '0': 'gap-0',
      '2': 'gap-2',
      '4': 'gap-4',
      '6': 'gap-6',
      '8': 'gap-8',
    },
    padding: {
      none: '',
      sm: 'py-4',
      md: 'py-8',
      lg: 'py-16',
    },
  },
  defaultVariants: {
    gap: '4',
    padding: 'md',
  },
});

type GapValue = 0 | 2 | 4 | 6 | 8;

type SectionProps<T extends React.ElementType = 'section'> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  gap?: GapValue;
  padding?: VariantProps<typeof sectionVariants>['padding'];
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'className' | 'children' | 'gap' | 'padding'
>;

function Section<T extends React.ElementType = 'section'>({
  as,
  gap = 4,
  padding,
  className,
  children,
  ...props
}: SectionProps<T>) {
  const Component = (as ?? 'section') as React.ElementType;
  const gapKey = String(gap) as VariantProps<typeof sectionVariants>['gap'];
  return (
    <Component
      className={cn(sectionVariants({ gap: gapKey, padding }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Section, sectionVariants };
