import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight, Trophy, Flame, TrendingUp, TrendingDown,
  Calendar, AlertTriangle, CheckCircle, Heart, Shield,
  Users, Star, Award, Clock,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProgressRing from '@/components/ui/progress-ring';

interface Badge {
  code: string; name: string; description: string;
  icon: string; tier: string; awardedAt: string;
}
interface MoodLog {
  id: number; moodScore: number; date: string; note: string;
}
interface RiskAlert {
  id: number; riskScore: number; severity: string;
  suggestedAction: string; factors: string;
}
interface AttendanceRecord {
  id: number; className: string; date: string;
  total: number; present: number; absent: number; late: number; rate: number;
}
interface PointsEntry {
  id: number; points: number; reason: string; category: string; createdAt: string;
}
interface StudentDetail {
  id: number; name: string; class: string; grade: number;
  attendance: number; status: string; gpa: number; totalPoints: number;
}

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#00C2FF',
};

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  excellent: { label: 'ممتاز', color: '#22C55E' },
  good:      { label: 'جيد', color: '#00C2FF' },
  average:   { label: 'متوسط', color: '#F59E0B' },
  warning:   { label: 'تحذير', color: '#F97316' },
  danger:    { label: 'خطر', color: '#EF4444' },
};

/* ── Mini Bar Chart ─────────────────────────────────────────── */
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[3px] h-16">
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.4, delay: i * 0.05 }}
          className="flex-1 rounded-t-sm min-h-[3px]"
          style={{ background: i === data.length - 1 ? color : `${color}66` }}
        />
      ))}
    </div>
  );
}

/* ── Mood Emoji ─────────────────────────────────────────────── */
function MoodEmoji({ score }: { score: number }) {
  const map: Record<number, string> = { 1: '😢', 2: '😟', 3: '😐', 4: '🙂', 5: '😄' };
  return <span className="text-lg">{map[score] ?? '😐'}</span>;
}

/* ── Main Page ──────────────────────────────────────────────── */
export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<{
    student: StudentDetail;
    badges: Badge[];
    moodHistory: MoodLog[];
    riskAlert: RiskAlert | null;
    attendance: AttendanceRecord[];
    pointsHistory: PointsEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/dashboard/students/${id}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="تفاصيل الطالب" subtitle="جارٍ التحميل...">
        <div className="flex items-center justify-center h-64">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3,1,0.3], y: [0,-4,0] }}
                transition={{ duration: 0.7, delay: i*0.15, repeat: Infinity }} />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout title="تفاصيل الطالب" subtitle="">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <AlertTriangle className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">تعذر تحميل بيانات الطالب</p>
          <button onClick={() => navigate('/dashboard/students')}
            className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> العودة للطلاب
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const { student, badges, moodHistory, riskAlert, attendance, pointsHistory } = data;
  const st = STATUS_CFG[student.status] ?? STATUS_CFG.average;

  // Attendance trend for sparkline
  const attendanceRates = attendance.slice().reverse().map(a => Number(a.rate));

  // Mood trend
  const moodScores = moodHistory.slice().reverse().map(m => m.moodScore);

  // Recent points (last 5)
  const recentPoints = pointsHistory.slice(0, 5);

  return (
    <DashboardLayout title={student.name} subtitle={`الصف ${student.class}`}>
      <title>{student.name} — School Smart Eye</title>

      {/* Back button */}
      <button onClick={() => navigate('/dashboard/students')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowRight className="w-4 h-4" /> العودة للطلاب
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-6xl">

        {/* ── Profile Card ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 rounded-2xl p-5 glass border border-border/50 flex flex-col gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
              style={{ background: `${st.color}18`, color: st.color, border: `2px solid ${st.color}44` }}>
              {student.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{student.name}</h2>
              <p className="text-sm text-muted-foreground">الصف {student.class}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: `${st.color}18`, color: st.color }}>
              {st.label}
            </span>
            {student.totalPoints > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-primary/10 text-primary flex items-center gap-1">
                <Trophy className="w-3 h-3" /> {student.totalPoints} نقطة
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-1">
            <div className="text-center p-3 rounded-xl bg-muted/40">
              <p className="text-xl font-bold" style={{ color: student.grade >= 75 ? '#22C55E' : '#F59E0B' }}>{student.grade}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">الدرجة</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/40">
              <p className="text-xl font-bold text-primary">{student.gpa.toFixed(1)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">GPA</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted/40">
              <p className="text-xl font-bold" style={{ color: student.attendance >= 90 ? '#22C55E' : '#EF4444' }}>{student.attendance}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">الحضور</p>
            </div>
          </div>

          {/* Progress rings */}
          <div className="flex justify-around py-2">
            <ProgressRing value={student.grade} max={100} size={60} strokeWidth={5}
              color={student.grade >= 75 ? '#22C55E' : '#F59E0B'} label="درجة" />
            <ProgressRing value={student.attendance} max={100} size={60} strokeWidth={5}
              color={student.attendance >= 90 ? '#22C55E' : '#EF4444'} label="حضور" />
            <ProgressRing value={student.gpa} max={4} size={60} strokeWidth={5}
              color="#00C2FF" label="GPA" />
          </div>
        </motion.div>

        {/* ── Attendance Trend ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5 glass border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">متابعة الحضور</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">آخر {attendance.length} يوم</span>
          </div>
          {attendanceRates.length > 0 ? (
            <MiniBarChart data={attendanceRates} color="#00C2FF" />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات حضور</p>
          )}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {attendance.slice(0, 3).map(a => (
              <div key={a.id} className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-xs font-bold text-foreground">{a.rate}%</p>
                <p className="text-[9px] text-muted-foreground">{a.date}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Mood Trend ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 glass border border-border/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-bold text-foreground">المزاج</h3>
            </div>
            <span className="text-[10px] text-muted-foreground">آخر {moodHistory.length} يوم</span>
          </div>
          {moodScores.length > 0 ? (
            <MiniBarChart data={moodScores} color="#A855F7" />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد بيانات مزاج</p>
          )}
          <div className="flex flex-col gap-2 mt-4 max-h-28 overflow-y-auto">
            {moodHistory.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <MoodEmoji score={m.moodScore} />
                <span className="text-muted-foreground flex-1 truncate">{m.note || 'بدون ملاحظة'}</span>
                <span className="text-muted-foreground/60">{m.date}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Badges ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 rounded-2xl p-5 glass border border-border/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">الشارات المكتسبة</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground ms-auto">
              {badges.length} شارة
            </span>
          </div>
          {badges.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لم يكتسب أي شارات بعد</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((b, i) => (
                <motion.div
                  key={b.code}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/30"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${TIER_COLORS[b.tier] || '#888'}18`, border: `1px solid ${TIER_COLORS[b.tier] || '#888'}44` }}>
                    {b.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{b.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{b.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Risk Alert ─────────────────────────────────────────── */}
        {riskAlert && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`rounded-2xl p-5 glass border ${riskAlert.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className={`w-4 h-4 ${riskAlert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
              <h3 className="text-sm font-bold text-foreground">تنبيه المخاطر</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ms-auto ${riskAlert.severity === 'critical' ? 'bg-red-500/15 text-red-500' : 'bg-orange-500/15 text-orange-500'}`}>
                {riskAlert.riskScore}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{riskAlert.suggestedAction}</p>
          </motion.div>
        )}

        {/* ── Points History ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-3 rounded-2xl p-5 glass border border-border/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-bold text-foreground">سجل النقاط</h3>
          </div>
          {recentPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">لا توجد نقاط مسجلة</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {recentPoints.map(p => (
                <div key={p.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${p.points >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {p.points >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{Math.abs(p.points)} نقطة</span>
                  <span className="text-muted-foreground">{p.reason}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
