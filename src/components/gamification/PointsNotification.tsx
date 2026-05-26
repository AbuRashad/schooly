import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PointsNotificationProps {
  show: boolean;
  points: number;
  reason: string;
  onClose: () => void;
}

export default function PointsNotification({ show, points, reason, onClose }: PointsNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={cn(
            'fixed top-4 left-4 z-[100] flex items-center gap-3',
            'px-4 py-3 rounded-2xl border shadow-lg',
            'bg-card/90 backdrop-blur-md border-primary/30'
          )}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center animate-pulse-glow">
            <Star className="w-5 h-5 text-primary fill-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              +{points.toLocaleString('ar-EG')} نقطة!
            </p>
            <p className="text-[11px] text-muted-foreground">{reason}</p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
