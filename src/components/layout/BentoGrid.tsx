import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui/glass-card';

/* ── BentoGrid ─────────────────────────────────────────────────────────── */

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

const BentoGrid = React.forwardRef<HTMLDivElement, BentoGridProps>(
  ({ className, cols = 4, gap = 'md', children, ...props }, ref) => {
    const gapClass = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    }[gap];

    const colClass = {
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[cols];

    return (
      <div
        ref={ref}
        className={cn('grid', colClass, gapClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BentoGrid.displayName = 'BentoGrid';

/* ── BentoItem ─────────────────────────────────────────────────────────── */

type ColSpan = 1 | 2 | 3 | 4;
type RowSpan = 1 | 2;

interface BentoItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: ColSpan;
  rowSpan?: RowSpan;
  variant?: React.ComponentProps<typeof GlassCard>['variant'];
  glow?: boolean;
  shimmer?: boolean;
}

const BentoItem = React.forwardRef<HTMLDivElement, BentoItemProps>(
  ({ className, colSpan = 1, rowSpan = 1, variant, glow, shimmer, children, ...props }, ref) => {
    const spanClasses: Record<ColSpan, string> = {
      1: 'md:col-span-1',
      2: 'md:col-span-2',
      3: 'md:col-span-3',
      4: 'md:col-span-4',
    };

    const rowClasses: Record<RowSpan, string> = {
      1: '',
      2: 'md:row-span-2',
    };

    return (
      <GlassCard
        ref={ref}
        variant={variant ?? 'default'}
        glow={glow}
        shimmer={shimmer}
        className={cn(spanClasses[colSpan], rowClasses[rowSpan], className)}
        {...props}
      >
        {children}
      </GlassCard>
    );
  }
);
BentoItem.displayName = 'BentoItem';

export { BentoGrid, BentoItem };
export type { BentoGridProps, BentoItemProps };
