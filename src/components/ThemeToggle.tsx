import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'segmented';
}

export default function ThemeToggle({ className, variant = 'icon' }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-0.5 rounded-xl p-1',
          'bg-muted/50 border border-border',
          className
        )}
      >
        {([
          { key: 'light' as const, icon: Sun, label: 'فاتح' },
          { key: 'system' as const, icon: Monitor, label: 'تلقائي' },
          { key: 'dark' as const, icon: Moon, label: 'داكن' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            title={label}
            className={cn(
              'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200',
              theme === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex items-center justify-center w-9 h-9 rounded-xl',
        'bg-muted/50 border border-border text-foreground',
        'hover:bg-muted hover:scale-105 transition-all duration-200',
        className
      )}
      title={resolvedTheme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
    >
      <Sun className={cn(
        'w-4 h-4 absolute transition-all duration-300',
        resolvedTheme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
      )} />
      <Moon className={cn(
        'w-4 h-4 absolute transition-all duration-300',
        resolvedTheme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
      )} />
    </button>
  );
}
