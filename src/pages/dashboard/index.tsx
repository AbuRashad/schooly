import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users, GraduationCap, BookOpen, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Info, Bell, Eye, BarChart2,
  CalendarCheck, LogOut, Menu, X, ChevronRight, FileBarChart, ScanFace,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

// ── Types ──────────────────────────────────────────────────────────────
interface Stats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  attendanceToday: number;
  attendanceTrend: number[];
  performanceTrend: number[];
  weekDays: string[];
  gradeDistribution: { grade: string; count: number; color: string }[];
  recentAlerts: { id: string; type: string; message: string; time: string; severity: string }[];
}

const DEFAULT_STATS: Stats = {
  totalStudents: 0,
  totalTeachers: 0,
  totalClasses: 0,
  attendanceToday: 0,
  attendanceTrend: [0, 0, 0, 0, 0, 0, 0],
  performanceTrend: [0, 0, 0, 0, 0, 0, 0],
  weekDays: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'اليوم'],
  gradeDistribution: [],
  recentAlerts: [],
};

function normalizeStats(raw: unknown): Stats {
  const data = (raw && typeof raw === 'object') ? (raw as Partial<Stats>) : {};
  const snapshotAlerts = Array.isArray((raw as { liveAlerts?: unknown[] } | null)?.liveAlerts)
    ? ((raw as { liveAlerts: Array<{ id?: unknown; severity?: unknown; message?: unknown; computed_at?: unknown }> }).liveAlerts)
    : [];
  const derivedRecentAlerts = snapshotAlerts.map((a, i) => ({
    id: String(a?.id ?? `alert-${i + 1}`),
    type: String(a?.severity ?? 'info'),
    message: String(a?.message ?? 'لا توجد تنبيهات حالياً'),
    time: String(a?.computed_at ?? 'الآن'),
    severity: String(a?.severity ?? 'low'),
  }));

  const normalizedSeverity = (value: string): string => {
    if (value === 'critical') return 'high';
    if (value === 'warning') return 'medium';
    if (value === 'stable') return 'low';
    return value;
  };

  return {
    totalStudents: Number(data.totalStudents ?? 0),
    totalTeachers: Number(data.totalTeachers ?? 0),
    totalClasses: Number(data.totalClasses ?? 0),
    attendanceToday: Number(data.attendanceToday ?? 0),
    attendanceTrend: Array.isArray(data.attendanceTrend) && data.attendanceTrend.length > 0
      ? data.attendanceTrend.map((v) => Number(v ?? 0))
      : DEFAULT_STATS.attendanceTrend,
    performanceTrend: Array.isArray(data.performanceTrend) && data.performanceTrend.length > 0
      ? data.performanceTrend.map((v) => Number(v ?? 0))
      : DEFAULT_STATS.performanceTrend,
    weekDays: Array.isArray(data.weekDays) && data.weekDays.length > 0
      ? data.weekDays.map((d) => String(d ?? ''))
      : DEFAULT_STATS.weekDays,
    gradeDistribution: Array.isArray(data.gradeDistribution)
      ? data.gradeDistribution.map((g) => ({
          grade: String(g?.grade ?? ''),
          count: Number(g?.count ?? 0),
          color: String(g?.color ?? '#00C2FF'),
        }))
      : [],
    recentAlerts: Array.isArray(data.recentAlerts)
      ? data.recentAlerts.map((a, i) => ({
          id: String(a?.id ?? `alert-${i + 1}`),
          type: String(a?.type ?? 'info'),
          message: String(a?.message ?? 'لا توجد تنبيهات حالياً'),
          time: String(a?.time ?? 'الآن'),
          severity: normalizedSeverity(String(a?.severity ?? 'low')),
        }))
      : derivedRecentAlerts.map((a) => ({ ...a, severity: normalizedSeverity(a.severity) })),
  };
}

// ── Mini sparkline ─────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(' ').at(-1)!.split(',')[0]} cy={pts.split(' ').at(-1)!.split(',')[1]} r="3" fill={color} />
    </svg>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────
function BarChart({ data, days, color }: { data: number[]; days: string[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(v / max) * 80}px` }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: "easeOut" as const }}
            className="w-full rounded-t-md"
            style={{ background: i === data.length - 1 ? color : `${color}55`, minHeight: 4 }}
          />
          <span className="text-[9px] text-white/30 truncate w-full text-center">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut chart ────────────────────────────────────────────────────────
function DonutChart({ data }: { data: { grade: string; count: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.count, 0);
  let offset = 0;
  const r = 40, cx = 50, cy = 50, stroke = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100">
        {data.map((d, i) => {
          const pct = d.count / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * circ}
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
            />
          );
          offset += pct;
          return el;
        })}
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{total}</text>
        <text x="50" y="58" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="7">طالب</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {data.map((d) => (
          <div key={d.grade} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="text-[11px] text-white/60">{d.grade}</span>
            <span className="text-[11px] font-bold text-white ms-auto ps-2">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar nav ────────────────────────────────────────────────────────
const NAV = [
  { icon: BarChart2,    label: 'نظرة عامة',    path: '/dashboard' },
  { icon: Users,        label: 'الطلاب',        path: '/dashboard/students' },
  { icon: CalendarCheck,label: 'الحضور',        path: '/dashboard/attendance' },
  { icon: FileBarChart, label: 'التقارير',      path: '/dashboard/reports' },
  { icon: ScanFace,     label: 'الحضور الذكي',  path: '/dashboard/face-attendance' },
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const loc = useLocation();
  const navigate = useNavigate();

  async function handleSignOut() {
    await authClient.signOut();
    navigate("/dashboard/login");
  }
  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 right-0 h-full w-60 z-50 flex flex-col transition-transform duration-300
          md:translate-x-0 md:static md:z-auto
          ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
        style={{
          background: 'linear-gradient(180deg, #0a1e35 0%, #061525 100%)',
          borderLeft: '1px solid rgba(0,194,255,0.12)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00C2FF22,#22C55E22)', border: '1.5px solid #00C2FF55' }}
          >
            👁️
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">School Smart</p>
            <p className="text-[10px] font-bold leading-none mt-0.5" style={{ color: '#00C2FF' }}>Eye</p>
          </div>
          <button onClick={onClose} className="ms-auto text-white/30 hover:text-white md:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 mb-2">القائمة</p>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = loc.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={active
                  ? { background: 'rgba(0,194,255,0.12)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.25)' }
                  : { color: 'rgba(255,255,255,0.5)' }
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ms-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-white/5 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            العودة للموقع
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-red-400/50 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, color, trend, trendData,
}: {
  icon: React.ElementType; label: string; value: string; sub: string;
  color: string; trend?: 'up' | 'down'; trendData?: number[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18`, border: `1px solid ${color}44` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        {trendData && <Sparkline data={trendData} color={color} />}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/40 mt-0.5">{label}</p>
      </div>
      <div className="flex items-center gap-1">
        {trend === 'up'
          ? <TrendingUp className="w-3 h-3 text-green-400" />
          : trend === 'down'
          ? <TrendingDown className="w-3 h-3 text-red-400" />
          : null}
        <span className="text-[11px] text-white/35">{sub}</span>
      </div>
    </motion.div>
  );
}

// ── Alert item ─────────────────────────────────────────────────────────
function AlertItem({ alert }: { alert: Stats['recentAlerts'][0] }) {
  const cfg = {
    high: { icon: AlertTriangle, color: '#EF4444', bg: '#EF444418' },
    medium: { icon: Info, color: '#F59E0B', bg: '#F59E0B18' },
    low: { icon: CheckCircle, color: '#22C55E', bg: '#22C55E18' },
  }[alert.severity] ?? { icon: Info, color: '#00C2FF', bg: '#00C2FF18' };
  const Icon = cfg.icon;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}>
        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-white/80 leading-snug">{alert.message}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{alert.time}</p>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/v1/dashboard/live')
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(String((body as { message?: unknown })?.message ?? 'Failed to fetch dashboard stats'));
        }
        return body;
      })
      .then((data) => setStats(normalizeStats(data)))
      .catch((error) => {
        console.error(error);
        setStats(DEFAULT_STATS);
      });
  }, []);

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden" style={{ background: '#060f1e', color: 'white' }}>
      <title>لوحة التحكم — School Smart Eye</title>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,15,30,0.95)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">نظرة عامة</h1>
              <p className="text-[11px] text-white/35">مرحباً بك في لوحة تحكم School Smart Eye</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 rounded-xl flex items-center justify-center relative"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Bell className="w-4 h-4 text-white/50" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#00C2FF22,#22C55E22)', border: '1.5px solid #00C2FF55' }}
            >
              👁️
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          {!stats ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-cyan-400"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                    transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-w-5xl">

              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard icon={Users} label="إجمالي الطلاب" value={stats.totalStudents.toLocaleString('ar')} sub="في جميع الصفوف" color="#00C2FF" />
                <KpiCard icon={GraduationCap} label="المعلمون" value={stats.totalTeachers.toString()} sub="معلم نشط" color="#22C55E" />
                <KpiCard icon={BookOpen} label="الفصول الدراسية" value={stats.totalClasses.toString()} sub="فصل دراسي" color="#A855F7" />
                <KpiCard icon={Eye} label="الحضور اليوم" value={`${stats.attendanceToday}%`} sub="نسبة الحضور" color="#F59E0B" trend="up" trendData={stats.attendanceTrend} />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Attendance chart */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' as const }}
                  className="md:col-span-2 rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-white">نسبة الحضور الأسبوعية</p>
                      <p className="text-[11px] text-white/35 mt-0.5">آخر 7 أيام دراسية</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: '#22C55E18', color: '#22C55E' }}>
                      +2.2%
                    </span>
                  </div>
                  <BarChart data={stats.attendanceTrend} days={stats.weekDays} color="#00C2FF" />
                </motion.div>

                {/* Grade distribution */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' as const }}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <p className="text-sm font-bold text-white mb-1">توزيع الدرجات</p>
                  <p className="text-[11px] text-white/35 mb-4">جميع الطلاب</p>
                  <DonutChart data={stats.gradeDistribution} />
                </motion.div>
              </div>

              {/* Performance + Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Performance trend */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: 'easeOut' as const }}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-white">متوسط الأداء الأكاديمي</p>
                      <p className="text-[11px] text-white/35 mt-0.5">آخر 7 أسابيع</p>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <BarChart data={stats.performanceTrend} days={['أ1','أ2','أ3','أ4','أ5','أ6','أ7']} color="#A855F7" />
                </motion.div>

                {/* Alerts */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.25, ease: 'easeOut' as const }}
                  className="rounded-2xl p-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-white">التنبيهات الأخيرة</p>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ background: '#EF444418', color: '#EF4444' }}
                    >
                      {stats.recentAlerts.filter(a => a.severity === 'high').length} عاجل
                    </span>
                  </div>
                  <div>
                    {stats.recentAlerts.map((a) => <AlertItem key={a.id} alert={a} />)}
                  </div>
                </motion.div>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/students">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all"
                    style={{ background: 'rgba(0,194,255,0.06)', border: '1px solid rgba(0,194,255,0.2)' }}
                  >
                    <Users className="w-5 h-5" style={{ color: '#00C2FF' }} />
                    <div>
                      <p className="text-sm font-bold text-white">إدارة الطلاب</p>
                      <p className="text-[11px] text-white/40">عرض وبحث وفلترة</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 ms-auto" />
                  </motion.div>
                </Link>
                <Link to="/dashboard/attendance">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all"
                    style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <CalendarCheck className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="text-sm font-bold text-white">الحضور اليومي</p>
                      <p className="text-[11px] text-white/40">تقرير اليوم</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 ms-auto" />
                  </motion.div>
                </Link>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
