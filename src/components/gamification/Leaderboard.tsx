import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import AnimatedCounter from '@/components/ui/animated-counter';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  id: number;
  name: string;
  class: string;
  grade: number;
  attendance: number;
  totalPoints: number;
  badgeCount: number;
}

interface LeaderboardProps {
  className?: string;
  classFilter?: string;
  limit?: number;
}

const RANK_STYLES: Record<number, { icon: typeof Trophy; color: string; bg: string; size: string }> = {
  1: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/15', size: 'w-8 h-8' },
  2: { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-300/15', size: 'w-7 h-7' },
  3: { icon: Award, color: 'text-orange-400', bg: 'bg-orange-400/15', size: 'w-7 h-7' },
};

export default function Leaderboard({ className, classFilter, limit = 10 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (classFilter) params.set('classFilter', classFilter);
    params.set('limit', String(limit));

    fetch(`/api/gamification/leaderboard?${params}`)
      .then(r => r.json())
      .then(data => {
        setEntries(data.leaderboard || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [classFilter, limit]);

  if (loading) {
    return (
      <GlassCard className={cn('p-5', className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-muted animate-pulse" />
          <div className="w-32 h-4 rounded bg-muted animate-pulse" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="w-24 h-3 rounded bg-muted animate-pulse" />
              <div className="w-16 h-2.5 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-400/15">
            <Trophy className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">لوحة المتصدرين</h3>
            <p className="text-[11px] text-muted-foreground">أفضل الطلاب هذا الأسبوع</p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
          {entries.length} طالب
        </span>
      </div>

      <div className="space-y-1">
        {entries.map((entry, index) => {
          const rankStyle = RANK_STYLES[entry.rank] || {
            icon: TrendingUp,
            color: 'text-muted-foreground',
            bg: 'bg-muted/50',
            size: 'w-6 h-6',
          };
          const Icon = rankStyle.icon;

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                entry.rank <= 3 ? 'bg-primary/5' : 'hover:bg-muted/30'
              )}
            >
              {/* Rank */}
              <div className={cn('w-8 flex justify-center', rankStyle.color)}>
                {entry.rank <= 3 ? (
                  <Icon className={rankStyle.size} />
                ) : (
                  <span className="text-xs font-bold tabular-nums">{entry.rank}</span>
                )}
              </div>

              {/* Avatar placeholder */}
              <div className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold',
                rankStyle.bg, rankStyle.color
              )}>
                {entry.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{entry.name}</p>
                <p className="text-[10px] text-muted-foreground">{entry.class}</p>
              </div>

              {/* Points */}
              <div className="text-left">
                <p className="text-sm font-bold text-primary tabular-nums">
                  <AnimatedCounter value={entry.totalPoints} />
                </p>
                <p className="text-[9px] text-muted-foreground">نقطة</p>
              </div>

              {/* Badges */}
              {entry.badgeCount > 0 && (
                <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Award className="w-3 h-3" />
                  {entry.badgeCount}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
          لا يوجد طلاب مسجلين بعد
        </div>
      )}
    </GlassCard>
  );
}
