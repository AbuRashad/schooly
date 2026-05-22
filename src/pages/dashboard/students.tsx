import { useState, useEffect, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Search, Filter, TrendingUp, TrendingDown,
  BarChart2, CalendarCheck, LogOut, Menu, X, ChevronRight,
  Plus, Pencil, Trash2, AlertTriangle, FileBarChart, ScanFace,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import StudentFormModal from "@/components/dashboard/StudentFormModal";

interface Student {
  id: string; name: string; class: string; grade: number;
  attendance: number; status: string; gpa: number;
}

function normalizeStudentStatus(value: string): string {
  const v = String(value ?? '').toLowerCase();
  if (v === 'excellent' || v === 'good' || v === 'average' || v === 'warning' || v === 'danger') return v;
  return 'average';
}

function normalizeStudentsPayload(raw: unknown): { students: Student[]; total: number } {
  if (raw && typeof raw === 'object' && Array.isArray((raw as { students?: unknown[] }).students)) {
    const payload = raw as { students: Array<Partial<Student>>; total?: unknown };
    const normalized = payload.students.map((s, i) => {
      const grade = Number(s.grade ?? 0);
      const attendance = Number(s.attendance ?? 0);
      return {
        id: String(s.id ?? `student-${i + 1}`),
        name: String(s.name ?? 'طالب بدون اسم'),
        class: String(s.class ?? 'غير محدد'),
        grade: Number.isFinite(grade) ? grade : 0,
        attendance: Number.isFinite(attendance) ? attendance : 0,
        status: normalizeStudentStatus(String(s.status ?? 'average')),
        gpa: Number.isFinite(Number(s.gpa)) ? Number(s.gpa) : Math.max(0, Math.min(4, Math.round((Number.isFinite(grade) ? grade : 0) / 25 * 10) / 10)),
      };
    });
    return {
      students: normalized,
      total: Number.isFinite(Number(payload.total)) ? Number(payload.total) : normalized.length,
    };
  }

  if (Array.isArray(raw)) {
    const normalized = raw.map((item, i) => {
      const row = item as {
        student_id?: unknown;
        name?: unknown;
        grade?: unknown;
        class_section?: unknown;
        is_active?: unknown;
      };
      const gradeText = String(row.grade ?? '').trim();
      const numericFromGrade = Number(gradeText.replace(/[^\d.]/g, ''));
      const grade = Number.isFinite(numericFromGrade) ? numericFromGrade : 75;
      const isActive = Boolean(row.is_active ?? true);
      const attendance = isActive ? 90 : 0;
      const status = isActive ? (grade >= 85 ? 'excellent' : grade >= 70 ? 'good' : 'average') : 'danger';
      return {
        id: String(row.student_id ?? `student-${i + 1}`),
        name: String(row.name ?? 'طالب بدون اسم'),
        class: String(row.class_section ?? 'غير محدد'),
        grade,
        attendance,
        status,
        gpa: Math.max(0, Math.min(4, Math.round((grade / 25) * 10) / 10)),
      };
    });
    return { students: normalized, total: normalized.length };
  }

  return { students: [], total: 0 };
}

const STATUS_CFG: Record<string, { label: string; color: string; bg: string }> = {
  excellent: { label: 'ممتاز',  color: '#22C55E', bg: '#22C55E18' },
  good:      { label: 'جيد',    color: '#00C2FF', bg: '#00C2FF18' },
  average:   { label: 'متوسط',  color: '#F59E0B', bg: '#F59E0B18' },
  warning:   { label: 'تحذير',  color: '#F97316', bg: '#F9731618' },
  danger:    { label: 'خطر',    color: '#EF4444', bg: '#EF444418' },
};

const CLASSES = ['8أ','8ب','9أ','9ب','10أ','10ب','11أ','11ب'];

const NAV = [
  { icon: BarChart2,    label: 'نظرة عامة',    path: '/dashboard' },
  { icon: Users,        label: 'الطلاب',        path: '/dashboard/students' },
  { icon: CalendarCheck,label: 'الحضور',        path: '/dashboard/attendance' },
  { icon: FileBarChart, label: 'التقارير',      path: '/dashboard/reports' },
  { icon: ScanFace,     label: 'الحضور الذكي',  path: '/dashboard/face-attendance' },
];

/* ── Sidebar ─────────────────────────────────────────────────────── */
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

/* ── Delete Confirm Dialog ───────────────────────────────────────── */
function DeleteConfirmDialog({
  student, onConfirm, onCancel, loading,
}: {
  student: Student; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.18, ease: 'easeOut' as const }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
          style={{
            background: 'linear-gradient(135deg,#1a0a0a 0%,#0f0606 100%)',
            border: '1px solid rgba(239,68,68,0.25)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">تأكيد الحذف</h3>
              <p className="text-[11px] text-white/40">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>
          <p className="text-sm text-white/60">
            هل أنت متأكد من حذف الطالب <span className="text-white font-bold">{student.name}</span>؟
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              إلغاء
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: loading ? 'rgba(239,68,68,0.3)' : '#EF4444', boxShadow: loading ? 'none' : '0 4px 15px rgba(239,68,68,0.3)' }}>
              {loading ? 'جارٍ الحذف...' : 'حذف الطالب'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ── Toast ───────────────────────────────────────────────────────── */
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: 20, x: '-50%' }}
      className="fixed bottom-6 left-1/2 z-[60] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap"
      style={{
        background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        border: `1px solid ${type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
        color: type === 'success' ? '#22C55E' : '#EF4444',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {type === 'success' ? '✓' : '✕'} {message}
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const fetchStudents = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (classFilter) params.set('classFilter', classFilter);
    if (statusFilter) params.set('status', statusFilter);
    const query = params.toString();
    fetch(`/api/v1/students${query ? `?${query}` : ''}`)
      .then(async (r) => {
        const body = await r.json().catch(() => []);
        if (!r.ok) throw new Error(String((body as { detail?: unknown })?.detail ?? 'Failed to fetch students'));
        return body;
      })
      .then((d) => {
        const normalized = normalizeStudentsPayload(d);
        setStudents(normalized.students);
        setTotal(normalized.total);
      })
      .catch(() => showToast('تعذّر تحميل بيانات الطلاب', 'error'))
      .finally(() => {
        setStudents((prev) => (Array.isArray(prev) ? prev : []));
      })
      .finally(() => setLoading(false));
  }, [search, classFilter, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/v1/students/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return showToast(String((data as { detail?: unknown })?.detail ?? 'فشل الحذف'), 'error');
      }
      showToast('تم حذف الطالب بنجاح', 'success');
      fetchStudents();
    } catch {
      showToast('تعذّر الاتصال بالخادم', 'error');
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  }

  function openAdd() { setEditStudent(null); setFormOpen(true); }
  function openEdit(s: Student) { setEditStudent(s); setFormOpen(true); }

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden" style={{ background: '#060f1e', color: 'white' }}>
      <title>الطلاب — School Smart Eye</title>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,15,30,0.95)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.05)' }}>
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">إدارة الطلاب</h1>
              <p className="text-[11px] text-white/35">عرض وبحث وفلترة بيانات الطلاب</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* زر إضافة طالب */}
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #00C2FF, #0065FF)',
                boxShadow: '0 4px 15px rgba(0,194,255,0.3)',
              }}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">إضافة طالب</span>
            </motion.button>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#00C2FF22,#22C55E22)', border: '1.5px solid #00C2FF55' }}>
              👁️
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-2 flex-1 min-w-48 rounded-xl px-3 py-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search className="w-4 h-4 text-white/30 flex-shrink-0" />
              <input
                type="text" placeholder="ابحث باسم الطالب أو الصف..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-white/30 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/30" />
              <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: classFilter ? 'white' : 'rgba(255,255,255,0.3)' }}>
                <option value="">كل الصفوف</option>
                {CLASSES.map(c => <option key={c} value={c} style={{ background: '#0a1e35' }}>الصف {c}</option>)}
              </select>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: statusFilter ? 'white' : 'rgba(255,255,255,0.3)' }}>
                <option value="">كل الحالات</option>
                {Object.entries(STATUS_CFG).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: '#0a1e35' }}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Count */}
          <p className="text-xs text-white/30 mb-3">
            {loading ? 'جارٍ التحميل...' : `${total} طالب`}
          </p>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['الطالب', 'الصف', 'الدرجة', 'الحضور', 'الحالة', 'GPA', 'إجراءات'].map(h => (
                      <th key={h} className="text-right px-4 py-3 text-xs font-bold text-white/40 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          {Array.from({ length: 7 }).map((_, j) => (
                            <td key={j} className="px-4 py-3">
                              <div className="h-3 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: j === 0 ? '120px' : '50px' }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                              <Users className="w-6 h-6 text-white/20" />
                            </div>
                            <p className="text-sm text-white/30">لا يوجد طلاب مطابقون لبحثك</p>
                            {(search || classFilter || statusFilter) && (
                              <button onClick={() => { setSearch(''); setClassFilter(''); setStatusFilter(''); }}
                                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                                style={{ background: 'rgba(0,194,255,0.1)', color: '#00C2FF' }}>
                                مسح الفلاتر
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : students.map((s, i) => {
                      const st = STATUS_CFG[s.status] ?? STATUS_CFG.average;
                      return (
                        <motion.tr key={s.id}
                          layout
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 8 }}
                          transition={{ duration: 0.2, delay: i * 0.02, ease: 'easeOut' as const }}
                          className="group hover:bg-white/[0.02] transition-colors"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>

                          {/* الاسم */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                style={{ background: `${st.color}18`, color: st.color }}>
                                {s.name[0]}
                              </div>
                              <span className="text-white/80 font-medium whitespace-nowrap">{s.name}</span>
                            </div>
                          </td>

                          {/* الصف */}
                          <td className="px-4 py-3 text-white/50 whitespace-nowrap">الصف {s.class}</td>

                          {/* الدرجة */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold" style={{ color: s.grade >= 90 ? '#22C55E' : s.grade >= 75 ? '#00C2FF' : s.grade >= 60 ? '#F59E0B' : '#EF4444' }}>
                                {s.grade}%
                              </span>
                              {s.grade >= 85 ? <TrendingUp className="w-3 h-3 text-green-400" /> : s.grade < 65 ? <TrendingDown className="w-3 h-3 text-red-400" /> : null}
                            </div>
                          </td>

                          {/* الحضور */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                                <div className="h-full rounded-full" style={{ width: `${s.attendance}%`, background: s.attendance >= 90 ? '#22C55E' : s.attendance >= 75 ? '#F59E0B' : '#EF4444' }} />
                              </div>
                              <span className="text-xs text-white/50">{s.attendance}%</span>
                            </div>
                          </td>

                          {/* الحالة */}
                          <td className="px-4 py-3">
                            <span className="text-xs px-2.5 py-1 rounded-lg font-bold whitespace-nowrap"
                              style={{ background: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </td>

                          {/* GPA */}
                          <td className="px-4 py-3 font-bold" style={{ color: '#00C2FF' }}>{s.gpa.toFixed(1)}</td>

                          {/* إجراءات */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => openEdit(s)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: 'rgba(0,194,255,0.1)', color: '#00C2FF' }}
                                title="تعديل">
                                <Pencil className="w-3.5 h-3.5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={() => setDeleteTarget(s)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
                                title="حذف">
                                <Trash2 className="w-3.5 h-3.5" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Student Form Modal (إضافة + تعديل) */}
      <StudentFormModal
        open={formOpen}
        student={editStudent}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          showToast(editStudent ? 'تم تحديث بيانات الطالب بنجاح' : 'تم إضافة الطالب بنجاح', 'success');
          fetchStudents();
        }}
      />

      {/* Delete Confirm Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmDialog
            student={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
