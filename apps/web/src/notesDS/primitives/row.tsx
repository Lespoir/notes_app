import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/notesDS/utils/cn';

const rowVariants = cva('flex flex-row', {
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
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: {
    gap: '4',
    align: 'center',
    justify: 'start',
    wrap: false,
  },
});

type GapValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;

type RowProps<T extends React.ElementType = 'div'> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  gap?: GapValue;
  align?: VariantProps<typeof rowVariants>['align'];
  justify?: VariantProps<typeof rowVariants>['justify'];
  wrap?: boolean;
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'className' | 'children' | 'gap' | 'align' | 'justify' | 'wrap'
>;

function Row<T extends React.ElementType = 'div'>({
  as,
  gap = 4,
  align,
  justify,
  wrap,
  className,
  children,
  ...props
}: RowProps<T>) {
  const Component = (as ?? 'div') as React.ElementType;
  const gapKey = String(gap) as VariantProps<typeof rowVariants>['gap'];
  return (
    <Component
      className={cn(rowVariants({ gap: gapKey, align, justify, wrap }), className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export { Row, rowVariants };
