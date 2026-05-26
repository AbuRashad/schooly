import { cn } from "@/lib/utils";
import type { NavPage } from "@/types/monitoring";
import {
  LayoutDashboard,
  ShieldCheck,
  Cpu,
  BarChart3,
  FileText,
  Camera,
  Users,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  Eye,
} from "lucide-react";

interface Props {
  schoolName: string;
  status: "connected" | "reconnecting" | "offline";
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
}

const nav: { page: NavPage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { page: "dashboard", label: "لوحة التحكم",         icon: LayoutDashboard },
  { page: "ssi",       label: "مؤشر السلامة",        icon: ShieldCheck },
  { page: "units",     label: "الوحدات التشغيلية",   icon: Cpu },
  { page: "analytics", label: "التحليلات",            icon: BarChart3 },
  { page: "reports",   label: "التقارير",             icon: FileText },
  { page: "cameras",   label: "الكاميرات المباشرة",  icon: Camera },
  { page: "portal",    label: "بوابة أولياء الأمور", icon: Users },
  { page: "computer-vision", label: "الرؤية الحاسوبية",   icon: Eye },
  { page: "control",   label: "لوحة الإدارة",        icon: Settings },
];

const statusConfig = {
  connected:    { icon: Wifi,      color: "text-green-400",  label: "متصل" },
  reconnecting: { icon: RefreshCw, color: "text-yellow-400", label: "إعادة الاتصال" },
  offline:      { icon: WifiOff,   color: "text-red-400",    label: "غير متصل" },
};

export default function SchoolyMonitoringSidebar({ schoolName, status, activePage, onNavigate }: Props) {
  const { icon: StatusIcon, color, label: statusLabel } = statusConfig[status];

  return (
    <aside className="schooly-panel rounded-2xl p-4 flex flex-col gap-2 h-fit sticky top-4">
      {/* Brand */}
      <div className="px-2 py-3 border-b border-border mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold text-sm">S</div>
          <div>
            <p className="text-xs font-heading font-bold text-foreground tracking-wide">Schooly</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{schoolName}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 mt-2 text-xs", color)}>
          <StatusIcon className="h-3 w-3" />
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5">
        {nav.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => onNavigate(page)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all text-right w-full",
              activePage === page
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
