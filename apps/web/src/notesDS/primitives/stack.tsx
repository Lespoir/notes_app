import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      '0': 'gap-0',
      '1': 'gap-1',
      '2': 'gap-2',
      '3': 'gap-3',
      '4': 'gap-4',
      '5': 'gap-5',
      '6': 'gap-6',
      '8': 'gap-8',
      '10': 'gap-10',
      '12': 'gap-12',
      '16': 'gap-16',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
  },
  defaultVariants: {
    gap: '4',
    align: 'stretch',
    justify: 'start',
  },
});

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

type StackProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  gap?: GapValue;
  align?: VariantProps<typeof stackVariants>['align'];
  justify?: VariantProps<typeof stackVariants>['justify'];
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'className' | 'children' | 'gap' | 'align' | 'justify'
>;

function Stack<T extends React.ElementType = 'div'>({
  as,
  gap = 4,
  align,
  justify,
  className,
  children,
  ...props
}: StackProps<T>) {
  const Component = (as ?? 'div') as React.ElementType;
  const gapKey = String(gap) as VariantProps<typeof stackVariants>['gap'];
  return (
    <Component
      className={cn(stackVariants({ gap: gapKey, align, justify }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Stack, stackVariants };
