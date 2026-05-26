import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText, Download, Filter, RefreshCw,
  TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle,
  Printer,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ReportPdfTemplate from "@/components/dashboard/ReportPdfTemplate";

/* ── Types ─────────────────────────────────────────────────────────── */
interface StudentRow {
  id: number; name: string; class: string; grade: number;
  attendance: number; status: string; gpa: number;
}
interface AttendanceRow {
  id: number; className: string; date: string;
  total: number; present: number; absent: number; late: number; rate: number;
}
interface ReportData {
  type: 'students' | 'attendance';
  generatedAt: string;
  filters: Record<string, string>;
  summary: Record<string, number | string>;
  rows: StudentRow[] | AttendanceRow[];
}

/* ── Constants ─────────────────────────────────────────────────────── */
const CLASSES = ['8أ','8ب','9أ','9ب','10أ','10ب','11أ','11ب'];
const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  excellent: { label: 'ممتاز',  color: '#22C55E', bg: '#22C55E18' },
  good:      { label: 'جيد',    color: '#00C2FF', bg: '#00C2FF18' },
  average:   { label: 'متوسط',  color: '#F59E0B', bg: '#F59E0B18' },
  warning:   { label: 'تحذير',  color: '#F97316', bg: '#F9731618' },
  danger:    { label: 'خطر',    color: '#EF4444', bg: '#EF444418' },
};
/* ── Toast ──────────────────────────────────────────────────────────── */
function Toast({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) {
  const colors = {
    success: { bg: 'rgba(34,197,94,0.15)',  border: 'rgba(34,197,94,0.4)',  color: '#22C55E', icon: '✓' },
    error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  color: '#EF4444', icon: '✕' },
    info:    { bg: 'rgba(0,194,255,0.15)',  border: 'rgba(0,194,255,0.4)',  color: '#00C2FF', icon: 'ℹ' },
  };
  const c = colors[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-6 left-1/2 z-[60] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
    >
      {c.icon} {message}
    </motion.div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const [reportType, setReportType] = useState<'students' | 'attendance'>('students');
  const [classFilter, setClassFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  function showToast(message: string, type: 'success' | 'error' | 'info') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  const generateReport = useCallback(async () => {
    setLoading(true);
    setReportData(null);
    try {
      const params = new URLSearchParams({ type: reportType });
      if (classFilter) params.set('classFilter', classFilter);
      if (dateFrom)    params.set('dateFrom', dateFrom);
      if (dateTo)      params.set('dateTo', dateTo);

      const res = await fetch(`/api/dashboard/reports?${params}`);
      const data = await res.json();
      if (!res.ok) return showToast(data.error ?? 'فشل توليد التقرير', 'error');
      setReportData(data);
      showToast('تم توليد التقرير بنجاح', 'success');
    } catch {
      showToast('تعذّر الاتصال بالخادم', 'error');
    } finally {
      setLoading(false);
    }
  }, [reportType, classFilter, dateFrom, dateTo]);

  // ── تصدير PDF عبر window.print() ──────────────────────────────────
  async function handleExportPdf() {
    if (!reportData) return;
    setExporting(true);
    showToast('جارٍ تجهيز ملف PDF...', 'info');
    try {
      // نفتح نافذة طباعة مخصصة
      const content = document.getElementById('report-pdf-content');
      if (!content) return;
      const printWindow = window.open('', '_blank', 'width=1100,height=800');
      if (!printWindow) return showToast('يرجى السماح بالنوافذ المنبثقة', 'error');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8"/>
          <title>${reportType === 'students' ? 'تقرير الطلاب' : 'تقرير الحضور'} — School Smart Eye</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
            @media print {
              @page { margin: 15mm; size: A4 landscape; }
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${content.outerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        showToast('تم فتح نافذة الطباعة / التصدير', 'success');
      }, 500);
    } catch {
      showToast('فشل تصدير PDF', 'error');
    } finally {
      setExporting(false);
    }
  }

  // ── تصدير CSV ─────────────────────────────────────────────────────
  function handleExportCsv() {
    if (!reportData) return;
    let csv = '';
    if (reportData.type === 'students') {
      csv = 'الاسم,الصف,الدرجة,الحضور,الحالة,GPA\n';
      (reportData.rows as StudentRow[]).forEach(s => {
        csv += `"${s.name}","الصف ${s.class}",${s.grade}%,${s.attendance}%,${STATUS_CFG[s.status]?.label ?? s.status},${s.gpa.toFixed(1)}\n`;
      });
    } else {
      csv = 'الصف,التاريخ,الإجمالي,الحاضرون,الغائبون,المتأخرون,النسبة\n';
      (reportData.rows as AttendanceRow[]).forEach(r => {
        csv += `"الصف ${r.className}","${r.date}",${r.total},${r.present},${r.absent},${r.late},${r.rate}%\n`;
      });
    }
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportData.type === 'students' ? 'students-report' : 'attendance-report'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير ملف CSV بنجاح', 'success');
  }

  const ss = reportData?.summary as Record<string, number | string> | undefined;

  return (
    <DashboardLayout title="التقارير" subtitle="توليد وتصدير تقارير الطلاب والحضور">

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 flex flex-col gap-5">

          {/* ── Controls Panel ── */}
          <div className="rounded-2xl p-5 flex flex-col gap-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4" style={{ color: '#00C2FF' }} />
              <h2 className="text-sm font-bold text-white">إعدادات التقرير</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* نوع التقرير */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">نوع التقرير</label>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  {(['students', 'attendance'] as const).map(t => (
                    <button key={t} onClick={() => { setReportType(t); setReportData(null); }}
                      className="flex-1 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      style={reportType === t
                        ? { background: 'linear-gradient(135deg,#00C2FF,#0065FF)', color: 'white' }
                        : { background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                      {t === 'students' ? <><Users className="w-3 h-3" />الطلاب</> : <><CalendarCheck className="w-3 h-3" />الحضور</>}
                    </button>
                  ))}
                </div>
              </div>

              {/* فلتر الصف */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">الصف</label>
                <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                  className="rounded-xl px-3 py-2 text-sm outline-none w-full"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: classFilter ? 'white' : 'rgba(255,255,255,0.3)' }}>
                  <option value="">كل الصفوف</option>
                  {CLASSES.map(c => <option key={c} value={c} style={{ background: '#0a1e35' }}>الصف {c}</option>)}
                </select>
              </div>

              {/* من تاريخ (للحضور فقط) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                  {reportType === 'attendance' ? 'من تاريخ' : 'ملاحظة'}
                </label>
                {reportType === 'attendance' ? (
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }} />
                ) : (
                  <div className="rounded-xl px-3 py-2 text-xs text-white/25"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    الحالة و GPA تُحسب تلقائياً
                  </div>
                )}
              </div>

              {/* إلى تاريخ (للحضور فقط) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">
                  {reportType === 'attendance' ? 'إلى تاريخ' : ''}
                </label>
                {reportType === 'attendance' ? (
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                    className="rounded-xl px-3 py-2 text-sm outline-none w-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }} />
                ) : <div />}
              </div>
            </div>

            {/* زر التوليد */}
            <div className="flex items-center gap-3 pt-1">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={generateReport} disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
                style={{
                  background: loading ? 'rgba(0,194,255,0.3)' : 'linear-gradient(135deg,#00C2FF,#0065FF)',
                  boxShadow: loading ? 'none' : '0 4px 15px rgba(0,194,255,0.3)',
                }}>
                {loading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" />جارٍ التوليد...</>
                  : <><FileText className="w-4 h-4" />توليد التقرير</>}
              </motion.button>

              {reportData && (
                <>
                  <motion.button
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleExportPdf} disabled={exporting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <Printer className="w-4 h-4" />
                    {exporting ? 'جارٍ التصدير...' : 'طباعة / PDF'}
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleExportCsv}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <Download className="w-4 h-4" />تصدير CSV
                  </motion.button>
                </>
              )}
            </div>
          </div>

          {/* ── Empty / Loading State ── */}
          <AnimatePresence mode="wait">
            {!reportData && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 py-16"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.15)' }}>
                  <FileBarChart className="w-8 h-8" style={{ color: '#00C2FF' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white/50">لا يوجد تقرير بعد</p>
                  <p className="text-xs text-white/25 mt-1">اختر نوع التقرير والفلاتر ثم اضغط "توليد التقرير"</p>
                </div>
              </motion.div>
            )}

            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-4 py-16"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: 'rgba(0,194,255,0.08)', border: '1px solid rgba(0,194,255,0.15)' }}>
                  <RefreshCw className="w-6 h-6 animate-spin" style={{ color: '#00C2FF' }} />
                </div>
                <p className="text-sm text-white/40">جارٍ توليد التقرير...</p>
              </motion.div>
            )}

            {reportData && !loading && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4"
              >
                {/* ── Summary KPIs ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {reportData.type === 'students' ? (
                    <>
                      <KpiCard label="إجمالي الطلاب"    value={String(ss?.total ?? 0)}        color="#00C2FF" icon={<Users className="w-4 h-4" />} />
                      <KpiCard label="متوسط الدرجات"    value={`${ss?.avgGrade ?? 0}%`}       color="#22C55E" icon={<TrendingUp className="w-4 h-4" />} />
                      <KpiCard label="متوسط الحضور"     value={`${ss?.avgAttend ?? 0}%`}      color="#A855F7" icon={<CalendarCheck className="w-4 h-4" />} />
                      <KpiCard label="متوسط GPA"        value={String(ss?.avgGpa ?? '0.00')}  color="#F59E0B" icon={<FileText className="w-4 h-4" />} />
                      <KpiCard label="يحتاجون متابعة"   value={String((Number(ss?.warning ?? 0)) + (Number(ss?.danger ?? 0)))} color="#EF4444" icon={<AlertTriangle className="w-4 h-4" />} />
                    </>
                  ) : (
                    <>
                      <KpiCard label="إجمالي الطلاب"  value={String(ss?.totalAll ?? 0)}     color="#00C2FF" icon={<Users className="w-4 h-4" />} />
                      <KpiCard label="الحاضرون"        value={String(ss?.totalPresent ?? 0)} color="#22C55E" icon={<CheckCircle className="w-4 h-4" />} />
                      <KpiCard label="الغائبون"        value={String(ss?.totalAbsent ?? 0)} color="#EF4444" icon={<XCircle className="w-4 h-4" />} />
                      <KpiCard label="المتأخرون"       value={String(ss?.totalLate ?? 0)}   color="#F59E0B" icon={<Clock className="w-4 h-4" />} />
                      <KpiCard label="نسبة الحضور"     value={`${ss?.overallRate ?? 0}%`}   color="#A855F7" icon={<TrendingUp className="w-4 h-4" />} />
                    </>
                  )}
                </div>

                {/* ── Preview Table ── */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center justify-between px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: '#00C2FF' }} />
                      <span className="text-sm font-bold text-white">
                        {reportData.type === 'students' ? 'بيانات الطلاب' : 'سجلات الحضور'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                        style={{ background: 'rgba(0,194,255,0.12)', color: '#00C2FF' }}>
                        {reportData.rows.length} سجل
                      </span>
                    </div>
                    <p className="text-[11px] text-white/30">
                      {new Date(reportData.generatedAt).toLocaleTimeString('ar-EG')}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                          {(reportData.type === 'students'
                            ? ['الطالب','الصف','الدرجة','الحضور','الحالة','GPA']
                            : ['الصف','التاريخ','الإجمالي','الحاضرون','الغائبون','المتأخرون','النسبة']
                          ).map(h => (
                            <th key={h} className="text-right px-4 py-3 text-xs font-bold text-white/40 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.type === 'students'
                          ? (reportData.rows as StudentRow[]).map((s, i) => {
                            const st = STATUS_CFG[s.status] ?? STATUS_CFG.average;
                            return (
                              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors"
                                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                                      style={{ background: `${st.color}18`, color: st.color }}>{s.name[0]}</div>
                                    <span className="text-white/80 font-medium">{s.name}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-white/50">الصف {s.class}</td>
                                <td className="px-4 py-3 font-bold" style={{ color: s.grade >= 90 ? '#22C55E' : s.grade >= 75 ? '#00C2FF' : s.grade >= 60 ? '#F59E0B' : '#EF4444' }}>{s.grade}%</td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                      <div className="h-full rounded-full" style={{ width: `${s.attendance}%`, background: s.attendance >= 90 ? '#22C55E' : s.attendance >= 75 ? '#F59E0B' : '#EF4444' }} />
                                    </div>
                                    <span className="text-xs text-white/50">{s.attendance}%</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-xs px-2.5 py-1 rounded-lg font-bold" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                                </td>
                                <td className="px-4 py-3 font-bold" style={{ color: '#00C2FF' }}>{s.gpa.toFixed(1)}</td>
                              </tr>
                            );
                          })
                          : (reportData.rows as AttendanceRow[]).map((r) => (
                            <tr key={r.id} className="hover:bg-white/[0.02] transition-colors"
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td className="px-4 py-3 font-bold text-white/80">الصف {r.className}</td>
                              <td className="px-4 py-3 text-white/50">{r.date}</td>
                              <td className="px-4 py-3 text-white/60">{r.total}</td>
                              <td className="px-4 py-3 font-bold" style={{ color: '#22C55E' }}>{r.present}</td>
                              <td className="px-4 py-3 font-bold" style={{ color: '#EF4444' }}>{r.absent}</td>
                              <td className="px-4 py-3 font-bold" style={{ color: '#F59E0B' }}>{r.late}</td>
                              <td className="px-4 py-3 font-bold" style={{ color: r.rate >= 90 ? '#22C55E' : r.rate >= 75 ? '#F59E0B' : '#EF4444' }}>{r.rate}%</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      {/* Hidden PDF Template */}
      <div ref={printRef} style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
        {reportData && (
          <ReportPdfTemplate
            type={reportData.type}
            generatedAt={reportData.generatedAt}
            filters={reportData.filters}
            summary={reportData.summary as unknown as Parameters<typeof ReportPdfTemplate>[0]['summary']}
            rows={reportData.rows}
          />
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}

/* ── KPI Card ───────────────────────────────────────────────────────── */
function KpiCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: `${color}0a`, border: `1px solid ${color}25` }}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-white/40">{label}</span>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}18`, color }}>{icon}</div>
      </div>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
    </motion.div>
  );
}
