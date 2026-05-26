import { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, AlertCircle, Wand2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast-provider';

const DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

interface Slot {
  day: string;
  period: number;
  sectionId: number;
  subjectId: number;
  teacherId: number;
  roomId: number;
}

export default function TimetablePage() {
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const res = await fetch('/api/timetable/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: [{ id: 1, name: '1/1' }, { id: 2, name: '1/2' }],
          subjects: [
            { id: 1, name: 'رياضيات', teacherId: 1, weeklyPeriods: 5 },
            { id: 2, name: 'عربي', teacherId: 2, weeklyPeriods: 6 },
            { id: 3, name: 'علوم', teacherId: 3, weeklyPeriods: 4 },
          ],
          rooms: [{ id: 1, name: 'قاعة 101' }, { id: 2, name: 'قاعة 102' }, { id: 3, name: 'معمل' }],
          days: DAYS,
          periodsPerDay,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSlots(data.slots);
        toast.success(`تم توليد ${data.summary.totalSlots} حصة بدون تعارضات!`);
      } else {
        toast.error(data.error || 'فشل التوليد');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }

  const getSlot = (day: string, period: number) =>
    slots.find(s => s.day === day && s.period === period);

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">الجدول الذكي</h1>
              <p className="text-sm text-muted-foreground">توليد جدول دراسي بدون تعارضات</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <select
                value={periodsPerDay}
                onChange={e => setPeriodsPerDay(Number(e.target.value))}
                className="bg-muted border border-border rounded-lg px-3 py-1.5 text-sm"
              >
                {[4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} حصص/يوم</option>)}
              </select>
            </div>
            <Button onClick={generate} disabled={loading} className="gap-2">
              <Wand2 className="w-4 h-4" />
              {loading ? 'جارٍ التوليد...' : 'توليد الجدول'}
            </Button>
          </div>
        </div>

        {slots.length > 0 ? (
          <GlassCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-3 text-right font-semibold text-muted-foreground">اليوم / الحصة</th>
                    {Array.from({ length: periodsPerDay }, (_, i) => (
                      <th key={i} className="p-3 text-center font-semibold text-muted-foreground">{i + 1}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map(day => (
                    <tr key={day} className="border-b border-border/50">
                      <td className="p-3 font-medium">{day}</td>
                      {Array.from({ length: periodsPerDay }, (_, period) => {
                        const slot = getSlot(day, period + 1);
                        return (
                          <td key={period} className="p-2">
                            {slot ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-center"
                              >
                                <p className="text-xs font-bold text-primary">مادة #{slot.subjectId}</p>
                                <p className="text-[10px] text-muted-foreground">قاعة #{slot.roomId}</p>
                              </motion.div>
                            ) : (
                              <div className="p-2 rounded-lg bg-muted/30 text-center text-muted-foreground text-xs">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        ) : (
          <GlassCard className="p-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">اضغط "توليد الجدول" لإنشاء جدول دراسي ذكي</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
