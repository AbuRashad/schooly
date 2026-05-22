import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users, CalendarCheck, BarChart2, LogOut, Menu, X,
  ChevronRight, CheckCircle, XCircle, Clock, TrendingUp, FileBarChart, ScanFace,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

interface ClassAttendance {
  id: number; name: string; total: number; present: number;
  absent: number; late: number; rate: number;
}
interface Summary {
  totalStudents: number; totalPresent: number; totalAbsent: number;
  totalLate: number; overallRate: number; date: string;
}

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
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <aside
        className={`fixed top-0 right-0 h-full w-60 z-50 flex flex-col transition-transform duration-300
          md:translate-x-0 md:static md:z-auto
          ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
        style={{ background: 'linear-gradient(180deg,#0a1e35 0%,#061525 100%)', borderLeft: '1px solid rgba(0,194,255,0.12)' }}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#00C2FF22,#22C55E22)', border: '1.5px solid #00C2FF55' }}>
            👁️
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">School Smart</p>
            <p className="text-[10px] font-bold leading-none mt-0.5" style={{ color: '#00C2FF' }}>Eye</p>
          </div>
          <button onClick={onClose} className="ms-auto text-white/30 hover:text-white md:hidden"><X className="w-4 h-4" /></button>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 mb-2">القائمة</p>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = loc.pathname === path;
            return (
              <Link key={path} to={path} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={active
                  ? { background: 'rgba(0,194,255,0.12)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.25)' }
                  : { color: 'rgba(255,255,255,0.5)' }}>
                <Icon className="w-4 h-4 flex-shrink-0" />{label}
                {active && <ChevronRight className="w-3 h-3 ms-auto" />}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-4 border-t border-white/5 flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors">
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />العودة للموقع
          </Link>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-xs text-red-400/50 hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" />تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassAttendance[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/dashboard/attendance')
      .then(r => r.json())
      .then(d => { setClasses(d.classes); setSummary(d.summary); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden" style={{ background: '#060f1e', color: 'white' }}>
      <title>الحضور اليومي — School Smart Eye</title>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,15,30,0.95)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">الحضور اليومي</h1>
              <p className="text-[11px] text-white/35">{summary?.date ?? 'جارٍ التحميل...'}</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg,#00C2FF22,#22C55E22)', border: '1.5px solid #00C2FF55' }}>
            👁️
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          {loading || !summary ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 rounded-full bg-cyan-400"
                    animate={{ opacity: [0.3,1,0.3], y: [0,-4,0] }}
                    transition={{ duration: 0.7, delay: i*0.15, repeat: Infinity }} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5 max-w-4xl">

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Users, label: 'إجمالي الطلاب', value: summary.totalStudents, color: '#00C2FF' },
                  { icon: CheckCircle, label: 'حاضر', value: summary.totalPresent, color: '#22C55E' },
                  { icon: XCircle, label: 'غائب', value: summary.totalAbsent, color: '#EF4444' },
                  { icon: Clock, label: 'متأخر', value: summary.totalLate, color: '#F59E0B' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <motion.div key={label}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: 'easeOut' as const }}
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-xs text-white/40 mt-0.5">{label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Overall rate */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' as const }}
                className="rounded-2xl p-5"
                style={{ background: 'rgba(0,194,255,0.05)', border: '1px solid rgba(0,194,255,0.2)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-white">نسبة الحضور الإجمالية اليوم</p>
                    <p className="text-[11px] text-white/40 mt-0.5">جميع الصفوف الدراسية</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-2xl font-bold" style={{ color: '#00C2FF' }}>{summary.overallRate}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${summary.overallRate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' as const }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg,#00C2FF,#22C55E)' }} />
                </div>
              </motion.div>

              {/* Classes table */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15, ease: 'easeOut' as const }}
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="px-4 py-3 border-b border-white/5" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-sm font-bold text-white">تفاصيل الحضور لكل صف</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {['الصف', 'الإجمالي', 'حاضر', 'غائب', 'متأخر', 'نسبة الحضور'].map(h => (
                          <th key={h} className="text-right px-4 py-3 text-xs font-bold text-white/40 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {classes.map((c, i) => (
                        <motion.tr key={c.id}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04, ease: 'easeOut' as const }}
                          className="hover:bg-white/[0.02] transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td className="px-4 py-3 font-bold text-white">{c.name}</td>
                          <td className="px-4 py-3 text-white/50">{c.total}</td>
                          <td className="px-4 py-3 font-bold text-green-400">{c.present}</td>
                          <td className="px-4 py-3 font-bold text-red-400">{c.absent}</td>
                          <td className="px-4 py-3 font-bold text-yellow-400">{c.late}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: `${c.rate}%`, background: c.rate >= 90 ? '#22C55E' : c.rate >= 80 ? '#F59E0B' : '#EF4444' }} />
                              </div>
                              <span className="text-xs font-bold whitespace-nowrap"
                                style={{ color: c.rate >= 90 ? '#22C55E' : c.rate >= 80 ? '#F59E0B' : '#EF4444' }}>
                                {c.rate}%
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
