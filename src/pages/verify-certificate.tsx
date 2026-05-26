import { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VerifyCertificatePage() {
  const [hash, setHash] = useState('');
  const [result, setResult] = useState<{
    valid: boolean;
    certificate?: { title: string; studentName: string; schoolName: string; issuedAt: string };
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function verify() {
    if (!hash.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/certificates/verify?hash=${encodeURIComponent(hash.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ valid: false, error: 'خطأ في الاتصال' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">التحقق من الشهادات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تحقق من صحة الشهادات الرقمية الصادرة من School Smart Eye
          </p>
        </div>

        <GlassCard className="p-6 mb-4">
          <div className="flex gap-2 mb-2">
            <Input
              value={hash}
              onChange={e => setHash(e.target.value)}
              placeholder="أدخل كود التحقق (hash)..."
              className="text-left font-mono text-sm"
              dir="ltr"
            />
            <Button onClick={verify} disabled={loading} size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            اكتب أو الصق كود التحقق الموجود على الشهادة
          </p>
        </GlassCard>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <GlassCard className={`p-6 ${result.valid ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className="flex items-center gap-3 mb-4">
                {result.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-500" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500" />
                )}
                <div>
                  <p className="text-lg font-bold">
                    {result.valid ? 'شهادة موثقة ✅' : 'شهادة غير صالحة ❌'}
                  </p>
                  {!result.valid && <p className="text-xs text-red-400">{result.error}</p>}
                </div>
              </div>

              {result.valid && result.certificate && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">الطالب</span>
                    <span className="font-semibold">{result.certificate.studentName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">الشهادة</span>
                    <span className="font-semibold">{result.certificate.title}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/30">
                    <span className="text-muted-foreground">المدرسة</span>
                    <span className="font-semibold">{result.certificate.schoolName}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">تاريخ الإصدار</span>
                    <span className="font-semibold">{new Date(result.certificate.issuedAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}
