import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ScanFace, UserCheck, UserX, Camera, CheckCircle,
  Clock, RefreshCw, Search, Zap, Shield, Activity,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import FaceCamera, { type RecognizedFace } from '@/components/dashboard/FaceCamera';

interface Student { id: number; name: string; class: string; grade: number; attendance: number; status: string; gpa: number; }
interface AttendanceLog { id: number; studentId: number; name: string; class: string; date: string; time: string; confidence: string; }

const NAV = []; // Removed - now handled by DashboardLayout

/* ── Recognition Flash Card ─────────────────────────────────────────── */
function RecognitionCard({ face, onDone }: { face: RecognizedFace; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  const pct = Math.round(face.confidence * 100);
  const initials = face.name.split(' ').map(w => w[0]).join('').slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: -40, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="fixed top-5 left-1/2 z-[70] -translate-x-1/2"
      style={{ width: 'min(90vw, 340px)' }}
    >
      <div
        className="rounded-2xl px-5 py-4 flex items-center gap-4"
        style={{
          background: 'linear-gradient(135deg, rgba(6,30,15,0.97), rgba(6,20,30,0.97))',
          border: '1.5px solid rgba(34,197,94,0.5)',
          boxShadow: '0 0 40px rgba(34,197,94,0.25), 0 20px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
            style={{
              background: 'linear-gradient(135deg,rgba(34,197,94,0.3),rgba(0,194,255,0.2))',
              border: '2px solid rgba(34,197,94,0.5)',
              color: '#22C55E',
            }}
          >
            {initials}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: '#22C55E', border: '2px solid #060f1e' }}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          {/* Ripple */}
          <div
            className="absolute inset-0 rounded-2xl animate-ping"
            style={{ background: 'rgba(34,197,94,0.2)', animationDuration: '1.2s' }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-base font-black text-white truncate">{face.name}</p>
          </div>
          <p className="text-xs text-white/50 mb-2">الصف {face.class} · تم تسجيل الحضور</p>
          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#22C55E,#00C2FF)' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs font-bold" style={{ color: '#22C55E' }}>{pct}%</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Animated Counter ────────────────────────────────────────────────── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    const end = value;
    const dur = 600;
    const t0 = Date.now();
    const frame = () => {
      const p = Math.min(1, (Date.now() - t0) / dur);
      setDisplay(Math.round(start + (end - start) * p));
      if (p < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    prev.current = value;
  }, [value]);
  return <>{display}{suffix}</>;
}

/* ── Main ────────────────────────────────────────────────────────────── */
export default function FaceAttendancePage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'register'>('scan');

  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Recognition popup
  const [recognitionEvent, setRecognitionEvent] = useState<RecognizedFace | null>(null);
  const [lastRecognized, setLastRecognized] = useState<RecognizedFace | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetch('/api/dashboard/students?limit=200')
      .then(r => r.json())
      .then(d => setStudents(d.students ?? []));
  }, []);

  const fetchLogs = useCallback(() => {
    setLogsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/dashboard/face/logs?date=${today}`)
      .then(r => r.json())
      .then(d => setLogs(d.logs ?? []))
      .finally(() => setLogsLoading(false));
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleRecognized = useCallback(async (face: RecognizedFace) => {
    setLastRecognized(face);
    setRecognitionEvent(face);

    const res = await fetch('/api/dashboard/face/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: face.studentId, confidence: face.confidence }),
    });
    const data = await res.json();
    if (res.ok && !data.alreadyLogged) {
      fetchLogs();
    }
  }, [fetchLogs]);

  const filteredStudents = students.filter(s =>
    s.name.includes(studentSearch) || s.class.includes(studentSearch)
  );

  const avgConf = logs.length
    ? Math.round(logs.reduce((a, l) => a + Number(l.confidence), 0) / logs.length)
    : 0;

  const today = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <DashboardLayout title="الحضور الذكي" subtitle="التعرف على الوجوه وتسجيل الحضور">
      <title>الحضور الذكي — School Smart Eye</title>

      {/* Recognition popup */}
      <AnimatePresence>
        {recognitionEvent && (
          <RecognitionCard
            key={recognitionEvent.studentId + recognitionEvent.confidence}
            face={recognitionEvent}
            onDone={() => setRecognitionEvent(null)}
          />
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(6,15,30,0.95)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => {}}
              className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/50"
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <Menu className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <ScanFace className="w-4 h-4" style={{ color: '#00C2FF' }} />
                الحضور الذكي بالتعرف على الوجه
              </h1>
              <p className="text-[11px] text-white/35">{today}</p>
            </div>
          </div>
          {/* Active scanning indicator */}
          {activeTab === 'scan' && (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-bold"
              style={{
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.25)',
                color: '#22C55E',
              }}
            >
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">نظام المسح نشط</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* ── Left: Camera ── */}
            <div className="flex flex-col gap-4">
              {/* Tabs */}
              <div
                className="flex rounded-xl overflow-hidden p-1 gap-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {([['scan', 'مسح الحضور', ScanFace, '#00C2FF'], ['register', 'تسجيل وجه', Camera, '#A855F7']] as const).map(([tab, label, Icon, accent]) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all"
                    style={activeTab === tab
                      ? { background: `linear-gradient(135deg,${accent}cc,${accent}88)`, color: 'white', boxShadow: `0 2px 12px ${accent}44` }
                      : { color: 'rgba(255,255,255,0.4)' }}
                  >
                    <Icon className="w-4 h-4" />{label}
                  </button>
                ))}
              </div>

              {/* Register: student selector */}
              {activeTab === 'register' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-4 flex flex-col gap-3"
                  style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}
                >
                  <p className="text-xs font-bold" style={{ color: 'rgba(168,85,247,0.8)' }}>اختر الطالب لتسجيل وجهه</p>
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <Search className="w-3.5 h-3.5 text-white/30" />
                    <input
                      type="text"
                      placeholder="ابحث بالاسم أو الصف..."
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/25 outline-none"
                    />
                  </div>
                  <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
                    {filteredStudents.slice(0, 20).map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStudent(s)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-right transition-all"
                        style={selectedStudent?.id === s.id
                          ? { background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: '#A855F7' }
                          : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: 'rgba(168,85,247,0.15)', color: '#A855F7' }}
                        >
                          {s.name[0]}
                        </div>
                        <span className="flex-1 font-medium">{s.name}</span>
                        <span className="text-xs opacity-50">الصف {s.class}</span>
                        {selectedStudent?.id === s.id && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                  {selectedStudent && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', color: '#A855F7' }}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      تم اختيار: {selectedStudent.name} — الصف {selectedStudent.class}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Camera */}
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {activeTab === 'scan' ? (
                    <FaceCamera mode="scan" onRecognized={handleRecognized} />
                  ) : (
                    <FaceCamera
                      mode="register"
                      registerStudentId={selectedStudent?.id}
                      registerStudentName={selectedStudent?.name}
                      onRegistered={() => showToast(`تم تسجيل وجه ${selectedStudent?.name} بنجاح`)}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Last recognized mini card */}
              <AnimatePresence>
                {lastRecognized && activeTab === 'scan' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                      style={{ background: 'rgba(34,197,94,0.15)', color: '#22C55E' }}
                    >
                      {lastRecognized.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{lastRecognized.name}</p>
                      <p className="text-xs text-white/40">
                        الصف {lastRecognized.class} · ثقة {Math.round(lastRecognized.confidence * 100)}%
                      </p>
                    </div>
                    <UserCheck className="w-5 h-5 text-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Right: Stats + Log ── */}
            <div className="flex flex-col gap-4">
              {/* KPI cards */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  className="rounded-xl p-3 text-center relative overflow-hidden"
                  style={{ background: 'rgba(0,194,255,0.07)', border: '1px solid rgba(0,194,255,0.2)' }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-2 right-2 opacity-20">
                    <Users className="w-8 h-8" style={{ color: '#00C2FF' }} />
                  </div>
                  <p className="text-2xl font-black" style={{ color: '#00C2FF' }}>
                    <Counter value={logs.length} />
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">حضروا اليوم</p>
                </motion.div>

                <motion.div
                  className="rounded-xl p-3 text-center relative overflow-hidden"
                  style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-2 right-2 opacity-20">
                    <Shield className="w-8 h-8" style={{ color: '#22C55E' }} />
                  </div>
                  <p className="text-2xl font-black" style={{ color: '#22C55E' }}>
                    <Counter value={avgConf} suffix="%" />
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">متوسط الثقة</p>
                </motion.div>

                <motion.div
                  className="rounded-xl p-3 text-center relative overflow-hidden"
                  style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-2 right-2 opacity-20">
                    <Zap className="w-8 h-8" style={{ color: '#F59E0B' }} />
                  </div>
                  <p className="text-2xl font-black" style={{ color: '#F59E0B' }}>
                    {logs.length ? logs[logs.length - 1]?.time : '--'}
                  </p>
                  <p className="text-[11px] text-white/40 mt-0.5">آخر تسجيل</p>
                </motion.div>
              </div>

              {/* Attendance log */}
              <div
                className="flex-1 rounded-2xl overflow-hidden flex flex-col"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4" style={{ color: '#00C2FF' }} />
                    <span className="text-sm font-bold text-white">سجل الحضور اليوم</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-lg font-bold"
                      style={{ background: 'rgba(0,194,255,0.12)', color: '#00C2FF' }}
                    >
                      {logs.length} طالب
                    </span>
                  </div>
                  <button
                    onClick={fetchLogs}
                    disabled={logsLoading}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto" style={{ maxHeight: '360px' }}>
                  {logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-12">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <UserX className="w-7 h-7 text-white/20" />
                      </div>
                      <p className="text-sm text-white/30">لا يوجد حضور مسجّل اليوم بعد</p>
                      <p className="text-xs text-white/20">ابدأ مسح الوجوه لتسجيل الحضور تلقائياً</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <AnimatePresence initial={false}>
                        {logs.map((log, i) => {
                          const conf = Math.round(Number(log.confidence));
                          const confColor = conf >= 80 ? '#22C55E' : conf >= 60 ? '#F59E0B' : '#EF4444';
                          return (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, x: -16, backgroundColor: 'rgba(34,197,94,0.08)' }}
                              animate={{ opacity: 1, x: 0, backgroundColor: 'rgba(255,255,255,0)' }}
                              transition={{ delay: i < 5 ? 0 : 0, duration: 0.35, ease: 'easeOut' }}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.025] transition-colors"
                              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                            >
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
                                style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E' }}
                              >
                                {log.name[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{log.name}</p>
                                <p className="text-[11px] text-white/35">الصف {log.class}</p>
                              </div>
                              {/* Confidence bar */}
                              <div className="flex flex-col items-end gap-1.5 w-16">
                                <div
                                  className="w-full h-1 rounded-full overflow-hidden"
                                  style={{ background: 'rgba(255,255,255,0.08)' }}
                                >
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${conf}%`, background: confColor }}
                                  />
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: confColor }}>
                                  {conf}%
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                <div className="flex items-center gap-1 text-[11px] font-bold" style={{ color: '#22C55E' }}>
                                  <CheckCircle className="w-3 h-3" />حاضر
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-white/30">
                                  <Clock className="w-3 h-3" />{log.time}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* How to use */}
              <div
                className="rounded-xl p-4 flex flex-col gap-2"
                style={{ background: 'rgba(0,194,255,0.04)', border: '1px solid rgba(0,194,255,0.1)' }}
              >
                <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: '#00C2FF' }}>
                  <Zap className="w-3.5 h-3.5" />كيفية الاستخدام
                </p>
                <div className="flex flex-col gap-1.5 text-[11px] text-white/40">
                  <p>① <span className="text-white/60">تسجيل الوجه:</span> اختر الطالب ← اضغط التبويب ← التقط الصورة</p>
                  <p>② <span className="text-white/60">مسح الحضور:</span> افتح تبويب المسح ← ضع الطالب أمام الكاميرا</p>
                  <p>③ <span className="text-white/60">الدقة:</span> يحتاج إضاءة جيدة ووجه واضح في المنتصف</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[60] px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap"
            style={{
              background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              border: `1px solid ${toast.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              color: toast.type === 'success' ? '#22C55E' : '#EF4444',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {toast.type === 'success' ? '✓' : '✕'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
