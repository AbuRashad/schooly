import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users, CheckCircle, XCircle, Clock, TrendingUp,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface ClassAttendance {
  id: number; name: string; total: number; present: number;
  absent: number; late: number; rate: number;
}
interface Summary {
  totalStudents: number; totalPresent: number; totalAbsent: number;
  totalLate: number; overallRate: number; date: string;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<ClassAttendance[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/attendance')
      .then(r => r.json())
      .then(d => { setClasses(d.classes); setSummary(d.summary); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout
      title="الحضور اليومي"
      subtitle={summary?.date ?? 'جارٍ التحميل...'}
    >
      <title>الحضور اليومي — School Smart Eye</title>

      {loading || !summary ? (
        <div className="flex items-center justify-center h-40">
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i} className="w-2 h-2 rounded-full bg-primary"
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
                className="rounded-2xl p-4 glass hover-lift">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${color}18`, border: `1px solid ${color}44` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Overall rate */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' as const }}
            className="rounded-2xl p-5 glass border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-bold text-foreground">نسبة الحضور الإجمالية اليوم</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">جميع الصفوف الدراسية</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-2xl font-bold text-primary">{summary.overallRate}%</span>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-muted">
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
            className="rounded-2xl overflow-hidden border border-border/50">
            <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
              <p className="text-sm font-bold text-foreground">تفاصيل الحضور لكل صف</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/50">
                    {['الصف', 'الإجمالي', 'حاضر', 'غائب', 'متأخر', 'نسبة الحضور'].map(h => (
                      <th key={h} className="text-right px-4 py-3 text-xs font-bold text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {classes.map((c, i) => (
                    <motion.tr key={c.id}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.04, ease: 'easeOut' as const }}
                      className="hover:bg-muted/20 transition-colors border-b border-border/30">
                      <td className="px-4 py-3 font-bold text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.total}</td>
                      <td className="px-4 py-3 font-bold text-green-500">{c.present}</td>
                      <td className="px-4 py-3 font-bold text-red-500">{c.absent}</td>
                      <td className="px-4 py-3 font-bold text-yellow-500">{c.late}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full overflow-hidden bg-muted">
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
    </DashboardLayout>
  );
}
