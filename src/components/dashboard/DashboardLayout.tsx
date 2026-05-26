import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, GraduationCap, BookOpen, CalendarCheck, LogOut, Menu, X,
  ChevronRight, BarChart2, ScanFace, Wand2, Calendar, Heart,
  Package, MapPin, Bell, FileBarChart, Trophy, AlertTriangle,
  Info, CheckCircle,
} from 'lucide-react';
import { authClient } from '@/lib/auth/auth-client';
import { useTheme } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';

const NAV = [
  { icon: BarChart2,     label: 'نظرة عامة',         path: '/dashboard' },
  { icon: Users,         label: 'الطلاب',            path: '/dashboard/students' },
  { icon: CalendarCheck, label: 'الحضور',            path: '/dashboard/attendance' },
  { icon: ScanFace,      label: 'الحضور الذكي',      path: '/dashboard/face-attendance' },
  { icon: FileBarChart,  label: 'التقارير',           path: '/dashboard/reports' },
  { icon: Wand2,         label: 'مخطط الدروس',        path: '/dashboard/lesson-planner' },
  { icon: Calendar,      label: 'الجدول الذكي',       path: '/dashboard/timetable' },
  { icon: Heart,         label: 'المزاج',             path: '/dashboard/mood' },
  { icon: Users,         label: 'الواجبات التعاونية', path: '/dashboard/peer-review' },
  { icon: Package,       label: 'المخزون',            path: '/dashboard/inventory' },
  { icon: MapPin,        label: 'خريطة المدرسة',      path: '/campus-map' },
];

/* ── Notification Type ──────────────────────────────────────── */
interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  severity: string;
  time: string;
  read: boolean;
}

/* ── Sidebar ────────────────────────────────────────────────── */
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  async function handleSignOut() {
    await authClient.signOut();
    navigate('/dashboard/login');
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 right-0 h-full w-60 z-50 flex flex-col transition-transform duration-300
          md:translate-x-0 md:static md:z-auto
          ${open ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
        style={{
          background: isDark
            ? 'linear-gradient(180deg, #0a1e35 0%, #061525 100%)'
            : 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          borderLeft: isDark
            ? '1px solid rgba(0,194,255,0.12)'
            : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border/50">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#00C2FF22,#22C55E22)',
              border: '1.5px solid #00C2FF55',
            }}
          >
            👁️
          </div>
          <div>
            <p className={`text-sm font-bold leading-none ${isDark ? 'text-white' : 'text-foreground'}`}>
              School Smart
            </p>
            <p className="text-[10px] font-bold leading-none mt-0.5" style={{ color: '#00C2FF' }}>
              Eye
            </p>
          </div>
          <button
            onClick={onClose}
            className={`ms-auto md:hidden ${isDark ? 'text-white/30 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          <p className={`text-[10px] font-bold uppercase tracking-widest px-3 mb-2 ${isDark ? 'text-white/25' : 'text-muted-foreground/40'}`}>
            القائمة
          </p>
          {NAV.map(({ icon: Icon, label, path }) => {
            const active = loc.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={active
                  ? {
                      background: 'rgba(0,194,255,0.12)',
                      color: '#00C2FF',
                      border: '1px solid rgba(0,194,255,0.25)',
                    }
                  : {
                      color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(128,128,128,0.6)',
                    }
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{label}</span>
                {active && <ChevronRight className="w-3 h-3 ms-auto flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-border/50 flex flex-col gap-2">
          <Link
            to="/"
            className={`flex items-center gap-2 text-xs transition-colors ${isDark ? 'text-white/30 hover:text-white/60' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            العودة للموقع
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── Notification Panel ─────────────────────────────────────── */
function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => {
        setNotifications(d.notifications ?? []);
        setUnreadCount(d.unreadCount ?? 0);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const severityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    if (severity === 'medium') return <Info className="w-3.5 h-3.5 text-yellow-500" />;
    return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-xl flex items-center justify-center relative bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 z-50 rounded-2xl glass-strong border border-border/50 shadow-lg overflow-hidden"
            style={{ transformOrigin: 'top left' }}
          >
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <p className="text-sm font-bold text-foreground">الإشعارات</p>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 font-bold">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={`${n.type}-${n.id}`}
                    className="px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 bg-muted">
                        {severityIcon(n.severity)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Topbar ─────────────────────────────────────────────────── */
function Topbar({
  title,
  subtitle,
  onMenuClick,
  children,
}: {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
  children?: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="flex items-center justify-between px-5 py-3.5 flex-shrink-0 glass-strong border-b border-border/30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className={`md:hidden w-8 h-8 rounded-lg flex items-center justify-center bg-muted/50 ${isDark ? 'text-white/50 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Menu className="w-4 h-4" />
        </button>
        <div>
          <h1 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-foreground'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-[11px] ${isDark ? 'text-white/35' : 'text-muted-foreground/70'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        <ThemeToggle />
        <NotificationPanel />
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30">
          👁️
        </div>
      </div>
    </header>
  );
}

/* ── Layout ─────────────────────────────────────────────────── */
export default function DashboardLayout({
  title,
  subtitle,
  children,
  topbarActions,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  topbarActions?: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          title={title}
          subtitle={subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        >
          {topbarActions}
        </Topbar>
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5">
          {children}
        </div>
      </main>
    </div>
  );
}
