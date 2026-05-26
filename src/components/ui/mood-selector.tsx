import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface MoodSelectorProps {
  value?: number | null;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const MOODS = [
  { value: 1, emoji: '😔', label: 'سيء', color: 'text-red-500', bg: 'bg-red-500/15' },
  { value: 2, emoji: '😕', label: 'متوسط', color: 'text-orange-500', bg: 'bg-orange-500/15' },
  { value: 3, emoji: '😐', label: 'عادي', color: 'text-yellow-500', bg: 'bg-yellow-500/15' },
  { value: 4, emoji: '🙂', label: 'جيد', color: 'text-lime-500', bg: 'bg-lime-500/15' },
  { value: 5, emoji: '😄', label: 'ممتاز', color: 'text-green-500', bg: 'bg-green-500/15' },
];

const SIZE_MAP = {
  sm: { btn: 'w-8 h-8 text-base', gap: 'gap-1.5' },
  md: { btn: 'w-10 h-10 text-xl', gap: 'gap-2' },
  lg: { btn: 'w-14 h-14 text-2xl', gap: 'gap-3' },
};

export default function MoodSelector({
  value,
  onChange,
  size = 'md',
  disabled,
  className,
}: MoodSelectorProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const sz = SIZE_MAP[size];

  return (
    <div className={cn('flex items-center', sz.gap, className)}>
      {MOODS.map((mood) => {
        const isSelected = value === mood.value;
        const isHovered = hovered === mood.value;

        return (
          <button
            key={mood.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(mood.value)}
            onMouseEnter={() => setHovered(mood.value)}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              'relative flex items-center justify-center rounded-xl transition-all duration-200',
              sz.btn,
              isSelected
                ? cn(mood.bg, 'ring-2 ring-offset-2 ring-offset-background', mood.color.replace('text-', 'ring-'))
                : 'bg-muted/50 hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            title={mood.label}
          >
            <motion.span
              animate={{
                scale: isSelected ? 1.15 : isHovered ? 1.1 : 1,
                y: isSelected ? -2 : 0,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {mood.emoji}
            </motion.span>
            {isSelected && (
              <motion.span
                layoutId="mood-indicator"
                className={cn(
                  'absolute -bottom-1.5 w-1 h-1 rounded-full',
                  mood.bg.replace('/15', '')
                )}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
