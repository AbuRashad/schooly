import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Send, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import MoodSelector from '@/components/ui/mood-selector';
import { toast } from '@/components/ui/toast-provider';

export default function MoodPage() {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([
    { date: '2025-05-25', score: 4, note: 'يوم جيد' },
    { date: '2025-05-24', score: 3, note: '' },
    { date: '2025-05-23', score: 5, note: 'حصلت على تقدير ممتاز!' },
  ]);

  async function submit() {
    if (!mood) {
      toast.error('اختر مزاجك أولاً');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 1, moodScore: mood, note: note || undefined }),
      });
      if (res.ok) {
        toast.success('تم تسجيل مزاجك! 😊');
        setHistory(prev => [{ date: new Date().toISOString().split('T')[0], score: mood, note }, ...prev]);
        setMood(null);
        setNote('');
      } else {
        toast.error('فشل التسجيل');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  }

  const avg = history.length
    ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length * 10) / 10
    : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-pink-500/15 flex items-center justify-center">
            <Heart className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مقياس المزاج</h1>
            <p className="text-sm text-muted-foreground">سجل مزاجك يومياً — نحن نهتم بك</p>
          </div>
        </div>

        <GlassCard className="p-6 mb-6 text-center">
          <p className="text-lg font-medium mb-4">كيف تشعر اليوم؟</p>
          <div className="flex justify-center mb-4">
            <MoodSelector value={mood} onChange={setMood} size="lg" />
          </div>
          <Textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="ملاحظة اختيارية... (ماذا حدث اليوم؟)"
            className="mb-4 text-right"
          />
          <Button onClick={submit} disabled={submitting || !mood} className="gap-2">
            <Send className="w-4 h-4" />
            {submitting ? 'جارٍ الإرسال...' : 'تسجيل'}
          </Button>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">متوسط المزاج</p>
            <p className="text-2xl font-bold text-primary">{avg}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">أيام التسجيل</p>
            <p className="text-2xl font-bold text-primary">{history.length}</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">الاتجاه</p>
            <div className="flex justify-center">
              {avg >= 4 ? <TrendingUp className="w-6 h-6 text-green-500" />
                : avg <= 2.5 ? <TrendingDown className="w-6 h-6 text-red-500" />
                : <Minus className="w-6 h-6 text-yellow-500" />}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-5">
          <h2 className="text-sm font-bold mb-4">السجل الأخير</h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
              >
                <span className="text-2xl">
                  {h.score === 5 ? '😄' : h.score === 4 ? '🙂' : h.score === 3 ? '😐' : h.score === 2 ? '😕' : '😔'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.date}</p>
                  {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                </div>
                <span className="text-sm font-bold text-primary">{h.score}/5</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
