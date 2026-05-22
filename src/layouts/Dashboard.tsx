import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu, X, Bell, User, Settings, LogOut, HelpCircle,
  LayoutDashboard, Users, CalendarCheck, FileText, ScanFace,
  Monitor, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export interface DashboardConfig {
  sidebar?: {
    logo?: { text?: string; image?: string; href?: string };
    navigation?: {
      main?: Array<{ title: string; href: string; icon?: React.ComponentType<{ className?: string }>; badge?: string | number }>;
      secondary?: Array<{ title: string; href: string; icon?: React.ComponentType<{ className?: string }> }>;
    };
    footer?: React.ReactNode;
    className?: string;
  };
  header?: {
    search?: { enabled?: boolean; placeholder?: string };
    notifications?: { enabled?: boolean; count?: number };
    user?: { name?: string; email?: string; avatar?: string; initials?: string };
    actions?: React.ReactNode;
    className?: string;
  };
  main?: {
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
    padding?: boolean;
    className?: string;
  };
}

interface DashboardProps {
  children: React.ReactNode;
  config?: DashboardConfig;
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-screen-sm", md: "max-w-screen-md", lg: "max-w-screen-lg",
  xl: "max-w-screen-xl", "2xl": "max-w-screen-2xl", full: "max-w-full",
};

const defaultNav = [
  { title: "لوحة التحكم",          href: "/dashboard",                icon: LayoutDashboard },
  { title: "المراقبة الذكية",       href: "/dashboard/monitoring",     icon: Monitor },
  { title: "الطلاب",               href: "/dashboard/students",        icon: Users },
  { title: "الحضور",               href: "/dashboard/attendance",      icon: CalendarCheck },
  { title: "حضور بالوجه",          href: "/dashboard/face-attendance", icon: ScanFace },
  { title: "التقارير",             href: "/dashboard/reports",         icon: FileText },
];

export default function Dashboard({ children, config = {}, className }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const { sidebar = {}, header = {}, main = {} } = config;
  const { logo = { text: "Schooly" }, navigation = {}, footer: sidebarFooter, className: sidebarClassName } = sidebar;
  const { notifications = { enabled: true, count: 0 }, user = { name: "المسؤول", email: "admin@schooly.app", initials: "م" }, actions: headerActions, className: headerClassName } = header;
  const { maxWidth = "full", padding = true, className: mainClassName } = main;

  const navItems = navigation.main ?? defaultNav;

  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 border-l border-border flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:inset-0",
        "bg-[hsl(214_89%_5%)]",
        sidebarOpen ? "translate-x-0" : "translate-x-full",
        sidebarClassName
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between px-4 border-b border-border">
          {logo.href ? (
            <Link to={logo.href} className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</div>
              <span className="font-heading font-bold text-foreground">{logo.text}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">S</div>
              <span className="font-heading font-bold text-foreground">{logo.text}</span>
            </div>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={i}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="flex-1">{item.title}</span>
                {'badge' in item && item.badge !== undefined && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/20 px-1 text-xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {navigation.secondary && navigation.secondary.length > 0 && (
            <>
              <div className="my-3 border-t border-border" />
              {navigation.secondary.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={i}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all"
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {sidebarFooter && <div className="border-t border-border p-4">{sidebarFooter}</div>}
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className={cn(
          "flex h-14 items-center gap-4 border-b border-border px-4 lg:px-6",
          "bg-[hsl(214_89%_7%)]",
          headerClassName
        )}>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {headerActions}

            {notifications.enabled && (
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                {notifications.count && notifications.count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-white flex items-center justify-center">
                    {notifications.count > 9 ? "9+" : notifications.count}
                  </span>
                )}
              </Button>
            )}

            <div className="relative">
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full" />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {user.initials}
                  </div>
                )}
                <span className="hidden lg:block text-sm font-medium">{user.name}</span>
                <ChevronDown className="h-3 w-3 hidden lg:block" />
              </Button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute left-0 top-full z-50 mt-2 w-52 rounded-xl border border-border bg-card shadow-lg">
                    <div className="p-2">
                      <div className="px-2 py-1.5 text-sm">
                        <div className="font-medium text-foreground">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </div>
                      <div className="my-1 border-t border-border" />
                      {[
                        { icon: User, label: "الملف الشخصي" },
                        { icon: Settings, label: "الإعدادات" },
                        { icon: HelpCircle, label: "المساعدة" },
                      ].map(({ icon: Icon, label }) => (
                        <button key={label} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors">
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                      <div className="my-1 border-t border-border" />
                      <button className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                        <LogOut className="h-4 w-4" />
                        تسجيل الخروج
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className={cn("flex-1 overflow-y-auto", padding && "p-4 lg:p-6", mainClassName)}>
          <div className={cn("mx-auto", maxWidthClasses[maxWidth])}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
