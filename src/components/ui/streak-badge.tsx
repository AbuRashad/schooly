import { cn } from '@/lib/utils';
import { Flame, Zap, Trophy, Star } from 'lucide-react';

interface StreakBadgeProps {
  count: number;
  label?: string;
  type?: 'fire' | 'lightning' | 'trophy' | 'star';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

const TYPE_CONFIG = {
  fire: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
  lightning: { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  trophy: { icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  star: { icon: Star, color: 'text-violet-500', bg: 'bg-violet-500/15', border: 'border-violet-500/30' },
};

const SIZE_CONFIG = {
  sm: { wrapper: 'px-2 py-0.5 gap-1 text-[11px]', icon: 'w-3 h-3' },
  md: { wrapper: 'px-2.5 py-1 gap-1.5 text-xs', icon: 'w-3.5 h-3.5' },
  lg: { wrapper: 'px-3 py-1.5 gap-2 text-sm', icon: 'w-4 h-4' },
};

export default function StreakBadge({
  count,
  label,
  type = 'fire',
  size = 'md',
  className,
  pulse = false,
}: StreakBadgeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const sz = SIZE_CONFIG[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-lg font-semibold border',
        config.color,
        config.bg,
        config.border,
        sz.wrapper,
        pulse && 'animate-pulse-glow',
        className
      )}
    >
      <Icon className={cn(sz.icon, 'flex-shrink-0')} />
      <span className="tabular-nums">{count.toLocaleString('ar-EG')}</span>
      {label && <span className="opacity-70">{label}</span>}
    </span>
  );
}
