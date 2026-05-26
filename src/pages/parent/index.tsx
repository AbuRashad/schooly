import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell, GraduationCap, CalendarCheck, TrendingUp,
  AlertTriangle, CheckCircle, User, LogOut,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import ProgressRing from '@/components/ui/progress-ring';
import ThemeToggle from '@/components/ThemeToggle';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'attendance', title: 'محمد دخل المدرسة', time: 'منذ 10 دقائق', read: false },
  { id: 2, type: 'grade', title: 'درجة الرياضيات: 18/20', time: 'منذ ساعة', read: false },
  { id: 3, type: 'alert', title: 'غياب غير مبرر أمس', time: 'منذ 5 ساعات', read: true },
];

const MOCK_STUDENT = {
  name: 'محمد أحمد',
  class: '3/2',
  attendance: 94,
  avgGrade: 87,
  behavior: 'ممتاز',
};

export default function ParentPortalPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div dir="rtl" className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="glass-strong border-b border-border/30 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-lg">👁️</div>
            <div>
              <p className="text-sm font-bold">بوابة ولي الأمر</p>
              <p className="text-[10px] text-muted-foreground">School Smart Eye</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="relative w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button className="w-9 h-9 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        {/* Student Hero */}
        <GlassCard className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{MOCK_STUDENT.name}</h1>
              <p className="text-sm text-muted-foreground">الصف {MOCK_STUDENT.class}</p>
            </div>
          </div>
        </GlassCard>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <GlassCard className="p-5 text-center">
            <ProgressRing value={MOCK_STUDENT.attendance} size={70} color="#22C55E" />
            <p className="text-sm font-medium mt-2">نسبة الحضور</p>
          </GlassCard>
          <GlassCard className="p-5 text-center">
            <ProgressRing value={MOCK_STUDENT.avgGrade} size={70} color="#00C2FF" />
            <p className="text-sm font-medium mt-2">متوسط الدرجات</p>
          </GlassCard>
          <GlassCard className="p-5 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center mb-2">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-sm font-medium">السلوك</p>
            <p className="text-lg font-bold text-green-500">{MOCK_STUDENT.behavior}</p>
          </GlassCard>
        </div>

        {/* Notifications */}
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-bold">الإشعارات</h2>
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[11px] text-primary hover:underline">
                تعليم الكل كمقروء
              </button>
            )}
          </div>

          <div className="space-y-2">
            {notifications.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  n.read ? 'bg-muted/20' : 'bg-primary/5 border border-primary/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  n.type === 'attendance' ? 'bg-green-500/15 text-green-500'
                  : n.type === 'grade' ? 'bg-primary/15 text-primary'
                  : 'bg-red-500/15 text-red-500'
                }`}>
                  {n.type === 'attendance' ? <CalendarCheck className="w-4 h-4" />
                    : n.type === 'grade' ? <GraduationCap className="w-4 h-4" />
                    : <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${n.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                    {n.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </main>
    </div>
  );
}
