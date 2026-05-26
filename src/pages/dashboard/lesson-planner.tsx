import { useState } from 'react';
import { motion } from 'motion/react';
import { Wand2, BookOpen, Clock, GraduationCap, Copy, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast-provider';

interface LessonPlan {
  title: string;
  objectives: string[];
  materials: string[];
  timeline: { phase: string; minutes: number; activity: string }[];
  homework: string;
  notes: string;
}

export default function LessonPlannerPage() {
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('45');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!subject || !grade || !topic) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/ai/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, topic, duration: parseInt(duration), lang: 'ar' }),
      });
      const data = await res.json();
      if (data.lessonPlan) {
        setPlan(data.lessonPlan);
        toast.success('تم إنشاء خطة الدرس!');
      } else {
        toast.error(data.error || 'فشل الإنشاء');
      }
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }

  function copyPlan() {
    if (!plan) return;
    navigator.clipboard.writeText(JSON.stringify(plan, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('تم النسخ!');
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">مخطط الدروس الذكي</h1>
            <p className="text-sm text-muted-foreground">AI يولد خطة درس كاملة في ثوانٍ</p>
          </div>
        </div>

        <GlassCard className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>المادة</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="مثال: الرياضيات" />
            </div>
            <div className="space-y-2">
              <Label>الصف</Label>
              <Input value={grade} onChange={e => setGrade(e.target.value)} placeholder="مثال: الثالث الإعدادي" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>الموضوع</Label>
              <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="مثال: الجذور التربيعية" />
            </div>
            <div className="space-y-2">
              <Label>المدة (دقيقة)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
          <Button onClick={generate} disabled={loading} className="gap-2">
            {loading ? 'جارٍ الإنشاء...' : <><Wand2 className="w-4 h-4" /> إنشاء خطة الدرس</>}
          </Button>
        </GlassCard>

        {plan && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{plan.title}</h2>
                <Button variant="outline" size="sm" onClick={copyPlan} className="gap-1">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'تم النسخ' : 'نسخ'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" /> الأهداف
                  </h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {plan.objectives.map((o, i) => <li key={i}>{o}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> المواد والأدوات
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {plan.materials.map((m, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-muted">{m}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> الجدول الزمني
                  </h3>
                  <div className="space-y-2">
                    {plan.timeline.map((t, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                        <span className="text-xs font-bold text-primary whitespace-nowrap">{t.minutes} د</span>
                        <div>
                          <p className="text-sm font-medium">{t.phase}</p>
                          <p className="text-xs text-muted-foreground">{t.activity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {plan.homework && (
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <h3 className="text-sm font-semibold text-primary mb-1">الواجب المنزلي</h3>
                    <p className="text-sm text-muted-foreground">{plan.homework}</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
