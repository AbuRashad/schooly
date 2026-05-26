import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, User, BookOpen, BarChart2, CalendarCheck, Loader2 } from "lucide-react";

interface Student {
  id: string; name: string; class: string; grade: number;
  attendance: number; status: string; gpa: number;
}

interface Props {
  open: boolean;
  student?: Student | null; // null = إضافة جديد، Student = تعديل
  onClose: () => void;
  onSaved: () => void;
}

const CLASSES = ['8أ','8ب','9أ','9ب','10أ','10ب','11أ','11ب'];

export default function StudentFormModal({ open, student, onClose, onSaved }: Props) {
  const isEdit = !!student;

  const [name, setName] = useState('');
  const [cls, setCls] = useState('8أ');
  const [grade, setGrade] = useState('');
  const [attendance, setAttendance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // تعبئة الحقول عند التعديل
  useEffect(() => {
    if (student) {
      setName(student.name);
      setCls(student.class);
      setGrade(String(student.grade));
      setAttendance(String(student.attendance));
    } else {
      setName(''); setCls('8أ'); setGrade(''); setAttendance('');
    }
    setError('');
  }, [student, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const gradeNum = Number(grade);
    const attendanceNum = Number(attendance);

    if (!name.trim()) return setError('اسم الطالب مطلوب');
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) return setError('الدرجة يجب أن تكون بين 0 و 100');
    if (isNaN(attendanceNum) || attendanceNum < 0 || attendanceNum > 100) return setError('نسبة الحضور يجب أن تكون بين 0 و 100');

    setLoading(true);
    try {
      const url = isEdit
        ? `/api/v1/students/${student!.id}`
        : '/api/v1/students';
      const method = isEdit ? 'PATCH' : 'POST';

      const payload = isEdit
        ? {
            name: name.trim(),
            grade: cls,
            class_section: cls,
            is_active: attendanceNum > 0,
          }
        : {
            student_id: `STD-${Date.now()}`,
            name: name.trim(),
            grade: cls,
            class_section: cls,
            parent_id: 'PARENT-001',
            photo_initial: name.trim().slice(0, 1) || 'S',
            is_active: attendanceNum > 0,
          };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error ?? 'حدث خطأ غير متوقع');

      onSaved();
      onClose();
    } catch {
      setError('تعذّر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' as const }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-2xl p-6 flex flex-col gap-5"
              style={{
                background: 'linear-gradient(135deg, #0a1e35 0%, #061525 100%)',
                border: '1px solid rgba(0,194,255,0.2)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(0,194,255,0.05)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(0,194,255,0.12)', border: '1px solid rgba(0,194,255,0.25)' }}>
                    <User className="w-4 h-4" style={{ color: '#00C2FF' }} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
                    </h2>
                    <p className="text-[11px] text-white/35">
                      {isEdit ? `تعديل: ${student!.name}` : 'أدخل بيانات الطالب الجديد'}
                    </p>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* اسم الطالب */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 flex items-center gap-1.5">
                    <User className="w-3 h-3" /> اسم الطالب
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: أحمد محمد السيد"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(0,194,255,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>

                {/* الصف */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-white/50 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> الصف الدراسي
                  </label>
                  <select
                    value={cls}
                    onChange={e => setCls(e.target.value)}
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {CLASSES.map(c => (
                      <option key={c} value={c} style={{ background: '#0a1e35' }}>الصف {c}</option>
                    ))}
                  </select>
                </div>

                {/* الدرجة + الحضور */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-white/50 flex items-center gap-1.5">
                      <BarChart2 className="w-3 h-3" /> الدرجة %
                    </label>
                    <input
                      type="number" min="0" max="100"
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                      placeholder="0 – 100"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,194,255,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-white/50 flex items-center gap-1.5">
                      <CalendarCheck className="w-3 h-3" /> الحضور %
                    </label>
                    <input
                      type="number" min="0" max="100"
                      value={attendance}
                      onChange={e => setAttendance(e.target.value)}
                      placeholder="0 – 100"
                      className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                      onFocus={e => e.target.style.borderColor = 'rgba(0,194,255,0.5)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                </div>

                {/* ملاحظة الحالة */}
                <p className="text-[11px] text-white/25 -mt-1">
                  * الحالة و GPA تُحسب تلقائياً بناءً على الدرجة والحضور
                </p>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs px-3 py-2 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    إلغاء
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: loading ? 'rgba(0,194,255,0.3)' : 'linear-gradient(135deg, #00C2FF, #0065FF)',
                      color: 'white',
                      boxShadow: loading ? 'none' : '0 4px 15px rgba(0,194,255,0.3)',
                    }}>
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
