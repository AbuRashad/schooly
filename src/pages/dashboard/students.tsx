import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users, Search, Filter, TrendingUp, TrendingDown,
  Plus, Pencil, Trash2, AlertTriangle, X, Eye,
  Download,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
    return { students: normalized, total: Number.isFinite(Number(payload.total)) ? Number(payload.total) : normalized.length };
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

const CLASSES = ['1/أ','2/أ'];

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
        <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 glass-strong border border-destructive/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-destructive/15 border border-destructive/25">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">تأكيد الحذف</h3>
              <p className="text-[11px] text-muted-foreground">هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف الطالب <span className="text-foreground font-bold">{student.name}</span>؟
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-colors bg-muted border border-border">
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
      className={`fixed bottom-6 left-1/2 z-[60] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap backdrop-blur-md border shadow-lg
        ${type === 'success' ? 'bg-green-500/15 border-green-500/40 text-green-500' : 'bg-red-500/15 border-red-500/40 text-red-500'}`}
    >
      {type === 'success' ? '✓' : '✕'} {message}
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────── */
export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    fetch(`/api/dashboard/students${query ? `?${query}` : ''}`)
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
        setLoading(false);
      });
  }, [search, classFilter, statusFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/dashboard/students/${deleteTarget.id}`, { method: 'DELETE' });
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

  function exportCSV() {
    const headers = ['الاسم', 'الصف', 'الدرجة', 'الحضور', 'الحالة', 'GPA'];
    const rows = students.map(s => [
      s.name, s.class, s.grade + '%', s.attendance + '%',
      STATUS_CFG[s.status]?.label ?? s.status, s.gpa.toFixed(1)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تصدير الملف بنجاح', 'success');
  }

  return (
    <DashboardLayout
      title="إدارة الطلاب"
      subtitle="عرض وبحث وفلترة بيانات الطلاب"
      topbarActions={
        <div className="flex items-center gap-2">
          {students.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-foreground bg-muted border border-border/50 hover:bg-muted/80"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </motion.button>
          )}
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
        </div>
      }
    >
      <title>الطلاب — School Smart Eye</title>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-2 flex-1 min-w-48 rounded-xl px-3 py-2 bg-muted/40 border border-border/50">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text" placeholder="ابحث باسم الطالب أو الصف..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none bg-muted/40 border border-border/50 text-foreground">
            <option value="">كل الصفوف</option>
            {CLASSES.map(c => <option key={c} value={c}>الصف {c}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm outline-none bg-muted/40 border border-border/50 text-foreground">
            <option value="">كل الحالات</option>
            {Object.entries(STATUS_CFG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground mb-3">
        {loading ? 'جارٍ التحميل...' : `${total} طالب`}
      </p>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                {['الطالب', 'الصف', 'الدرجة', 'الحضور', 'الحالة', 'GPA', 'إجراءات'].map(h => (
                  <th key={h} className="text-right px-4 py-3 text-xs font-bold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/30">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-3 rounded-full animate-pulse bg-muted" style={{ width: j === 0 ? '120px' : '50px' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-muted border border-border">
                          <Users className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm text-muted-foreground">لا يوجد طلاب مطابقون لبحثك</p>
                        {(search || classFilter || statusFilter) && (
                          <button onClick={() => { setSearch(''); setClassFilter(''); setStatusFilter(''); }}
                            className="text-xs px-3 py-1.5 rounded-lg transition-colors bg-primary/10 text-primary hover:bg-primary/20">
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
                      className="group hover:bg-muted/30 transition-colors border-b border-border/30">

                      {/* الاسم */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/dashboard/students/${s.id}`)}
                          className="flex items-center gap-2.5 group/name"
                        >
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: st.bg, color: st.color }}>
                            {s.name[0]}
                          </div>
                          <span className="text-foreground/80 font-medium whitespace-nowrap group-hover/name:text-primary transition-colors">{s.name}</span>
                          <Eye className="w-3 h-3 text-muted-foreground opacity-0 group-hover/name:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* الصف */}
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">الصف {s.class}</td>

                      {/* الدرجة */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold" style={{ color: s.grade >= 90 ? '#22C55E' : s.grade >= 75 ? '#00C2FF' : s.grade >= 60 ? '#F59E0B' : '#EF4444' }}>
                            {s.grade}%
                          </span>
                          {s.grade >= 85 ? <TrendingUp className="w-3 h-3 text-green-500" /> : s.grade < 65 ? <TrendingDown className="w-3 h-3 text-red-500" /> : null}
                        </div>
                      </td>

                      {/* الحضور */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden bg-muted">
                            <div className="h-full rounded-full" style={{ width: `${s.attendance}%`, background: s.attendance >= 90 ? '#22C55E' : s.attendance >= 75 ? '#F59E0B' : '#EF4444' }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{s.attendance}%</span>
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
                      <td className="px-4 py-3 font-bold text-primary">{s.gpa.toFixed(1)}</td>

                      {/* إجراءات */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/dashboard/students/${s.id}`)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            title="عرض التفاصيل">
                            <Eye className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => openEdit(s)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-primary/10 text-primary hover:bg-primary/20"
                            title="تعديل">
                            <Pencil className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteTarget(s)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
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

      {/* Student Form Modal */}
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
    </DashboardLayout>
  );
}
