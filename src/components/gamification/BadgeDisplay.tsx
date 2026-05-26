import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Award, Lock } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

interface Badge {
  id: number;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  badgeTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsAwarded: number;
  awardedAt: string;
  context?: string;
}

interface BadgeDefinition {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  criteriaType: string;
  criteriaValue: number;
  pointsAwarded: number;
}

const TIER_STYLES = {
  bronze: { border: 'border-amber-700/40', bg: 'bg-amber-700/10', text: 'text-amber-600', glow: 'shadow-amber-700/20' },
  silver: { border: 'border-slate-400/40', bg: 'bg-slate-400/10', text: 'text-slate-400', glow: 'shadow-slate-400/20' },
  gold: { border: 'border-amber-400/40', bg: 'bg-amber-400/10', text: 'text-amber-400', glow: 'shadow-amber-400/20' },
  platinum: { border: 'border-cyan-400/40', bg: 'bg-cyan-400/10', text: 'text-cyan-400', glow: 'shadow-cyan-400/20' },
};

interface BadgeDisplayProps {
  studentId?: number;
  className?: string;
}

export default function BadgeDisplay({ studentId, className }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [definitions, setDefinitions] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const promises: Promise<void>[] = [];

    if (studentId) {
      promises.push(
        fetch(`/api/gamification/badges?studentId=${studentId}`)
          .then(r => r.json())
          .then(data => setBadges(data.badges || []))
      );
    }

    promises.push(
      fetch('/api/gamification/badges')
        .then(r => r.json())
        .then(data => setDefinitions(data.badges || []))
    );

    Promise.all(promises).finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <GlassCard className={cn('p-5', className)}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded bg-muted animate-pulse" />
          <div className="w-24 h-4 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </GlassCard>
    );
  }

  const earnedCodes = new Set(badges.map(b => b.badgeName));
  const displayDefs = showAll ? definitions : definitions.slice(0, 8);

  return (
    <GlassCard className={cn('p-5', className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-400/15">
            <Award className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">الشارات</h3>
            <p className="text-[11px] text-muted-foreground">
              {badges.length} من {definitions.length} شارة
            </p>
          </div>
        </div>
        {definitions.length > 8 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] text-primary hover:underline"
          >
            {showAll ? 'أقل' : 'الكل'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        <AnimatePresence>
          {displayDefs.map((def) => {
            const isEarned = earnedCodes.has(def.name);
            const tier = TIER_STYLES[def.tier];

            return (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className={cn(
                  'relative aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer group',
                  isEarned
                    ? cn(tier.border, tier.bg, 'shadow-lg', tier.glow)
                    : 'border-dashed border-muted bg-muted/20 opacity-50'
                )}
                title={`${def.name}${isEarned ? '' : ' (لم يتم الحصول عليها)'}`}
              >
                <span className="text-2xl">{def.icon}</span>
                {!isEarned && (
                  <Lock className="w-3 h-3 absolute top-1 right-1 text-muted-foreground" />
                )}

                {/* Tooltip */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                  <div className="bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded-lg whitespace-nowrap shadow-lg border">
                    {def.name}
                    <span className={cn('block', tier.text)}>+{def.pointsAwarded} نقطة</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
