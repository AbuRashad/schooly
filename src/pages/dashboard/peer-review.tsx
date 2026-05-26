import { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MessageSquare, Star, Send } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast-provider';

const MOCK_SUBMISSIONS = [
  { id: 1, studentName: 'أحمد محمد', subject: 'رياضيات', title: 'حل التمرين 3', submittedAt: '2025-05-25' },
  { id: 2, studentName: 'سارة علي', subject: 'علوم', title: 'تقرير التجربة الكيميائية', submittedAt: '2025-05-24' },
];

export default function PeerReviewPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);

  function submitReview() {
    if (!selected || !review || rating === 0) {
      toast.error('اخمن تسليماً واكتب مراجعة واختر تقييماً');
      return;
    }
    toast.success('تم إرسال المراجعة! +20 نقطة لك');
    setSelected(null);
    setReview('');
    setRating(0);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold">الواجبات التعاونية</h1>
            <p className="text-sm text-muted-foreground">راجع عمل زملائك واكسب نقاط</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {MOCK_SUBMISSIONS.map((sub) => (
            <motion.button
              key={sub.id}
              whileHover={{ scale: 1.01 }}
              onClick={() => setSelected(sub.id)}
              className={`text-right p-4 rounded-xl border transition-all ${
                selected === sub.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:bg-muted/30'
              }`}
            >
              <p className="text-sm font-semibold">{sub.title}</p>
              <p className="text-xs text-muted-foreground">{sub.studentName} · {sub.subject}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{sub.submittedAt}</p>
            </motion.button>
          ))}
        </div>

        {selected && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className="p-6">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" /> كتابة مراجعة
              </h3>

              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => setRating(star)}>
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="اكتب مراجعتك البناءة هنا..."
                className="mb-4 text-right min-h-[120px]"
              />

              <Button onClick={submitReview} className="gap-2">
                <Send className="w-4 h-4" /> إرسال المراجعة
              </Button>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
