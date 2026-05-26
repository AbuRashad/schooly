import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const glassCardVariants = cva(
  'relative overflow-hidden rounded-2xl border transition-all duration-300',
  {
    variants: {
      variant: {
        default:
          'glass hover-lift',
        strong:
          'glass-strong hover-lift',
        solid:
          'bg-card border-border shadow-sm hover:shadow-md transition-shadow',
        gradient:
          'border-transparent bg-gradient-to-br from-primary/10 to-secondary/10 hover:from-primary/15 hover:to-secondary/15',
      },
      size: {
        default: 'p-5',
        sm: 'p-3',
        lg: 'p-6',
        xl: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {
  asChild?: boolean;
  glow?: boolean;
  shimmer?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant, size, glow, shimmer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          glassCardVariants({ variant, size }),
          glow && 'schooly-glow',
          className
        )}
        {...props}
      >
        {shimmer && (
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent z-0 pointer-events-none" />
        )}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
GlassCard.displayName = 'GlassCard';

export { GlassCard, glassCardVariants };
