import { useState } from "react";
import { Users, Activity, Calendar, Camera } from "lucide-react";
import { useSafetyDashboardSocket } from "@/hooks/useSafetyDashboardSocket";
import {
  useSSILive,
  useSSIHistory,
  useUnits,
  useAnalyticsOverview,
  useReportsList,
  useReportsStats,
  useStudentPortal,
  useAgentInsights,
} from "@/hooks/useSSIData";
import type { NavPage } from "@/types/monitoring";

// Monitoring components (from SchoolSmartEYE)
import { ComputerVisionDashboard } from "@/components/monitoring/raw/ComputerVisionDashboard";
import { AIInsightsPanel } from "@/components/monitoring/raw/AIInsightsPanel";
import { AnalyticsDashboard } from "@/components/monitoring/raw/AnalyticsDashboard";
import { KpiGauge } from "@/components/monitoring/raw/KpiGauge";
import { LiveAlertFeed } from "@/components/monitoring/raw/LiveAlertFeed";
import { LiveCameraGrid } from "@/components/monitoring/raw/LiveCameraGrid";
import { MetricCard } from "@/components/monitoring/raw/MetricCard";
import { ControlPanel } from "@/components/monitoring/raw/ControlPanel";
import { ParentPortalFull } from "@/components/monitoring/raw/ParentPortalFull";
import { ReportsDashboard } from "@/components/monitoring/raw/ReportsDashboard";
import { RiskHeatmap } from "@/components/monitoring/raw/RiskHeatmap";
import { SSIHistoryChart } from "@/components/monitoring/raw/SSIHistoryChart";
import { SSILivePanel } from "@/components/monitoring/raw/SSILivePanel";
import { UnitsGrid } from "@/components/monitoring/raw/UnitsGrid";
import SchoolyMonitoringSidebar from "@/components/monitoring/SchoolyMonitoringSidebar";

export default function MonitoringPage() {
  const [page, setPage] = useState<NavPage>("dashboard");
  const snapshot = useSafetyDashboardSocket();
  const { data: ssiLive } = useSSILive();
  const ssiHistory = useSSIHistory();
  const units = useUnits();
  const { data: analytics } = useAnalyticsOverview();
  const reports = useReportsList();
  const reportStats = useReportsStats();
  const studentData = useStudentPortal();
  const { data: agentInsights } = useAgentInsights();

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <SchoolyMonitoringSidebar
        schoolName={snapshot.schoolName}
        status={snapshot.websocketStatus}
        activePage={page}
        onNavigate={setPage}
      />

      <main className="grid gap-4 content-start">
        {/* Backend offline banner */}
        {!snapshot.fetchedFromBackend && snapshot.backendError && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Backend Status</p>
            <h2 className="mt-1 text-lg font-semibold">Dashboard Disconnected</h2>
            <p className="mt-1 text-sm text-muted-foreground">{snapshot.backendError}</p>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {page === "dashboard" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">لوحة التحكم</p>
                  <h2 className="mt-1 text-2xl font-heading font-semibold">المراقبة الفورية والتحليل التنبؤي</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {snapshot.fetchedFromBackend
                      ? "بيانات حية متصلة بالخادم."
                      : "في انتظار الاتصال بالخادم..."}
                  </p>
                </div>
                <div className="rounded-full border border-border bg-muted/30 px-4 py-2 text-sm text-muted-foreground">
                  المعيار الوطني: {snapshot.benchmark}
                </div>
              </div>
            </div>

            {analytics && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="إجمالي الطلاب" value={analytics.total_students.toLocaleString()} subtitle="مسجل ومتتبع" icon={Users} color="blue" trend="stable" trendValue="لا تغيير" />
                <MetricCard title="نسبة الحضور" value={`${analytics.attendance_rate.toFixed(1)}%`} subtitle="حضور اليوم" icon={Calendar} color="green" trend="up" trendValue="+1.2%" />
                <MetricCard title="الكاميرات النشطة" value={analytics.active_cameras} subtitle={`من ${analytics.total_units * 2} كاميرا`} icon={Camera} color="blue" trend="stable" trendValue="طبيعي" />
                <MetricCard title="وقت التشغيل" value={`${analytics.uptime_percent.toFixed(1)}%`} subtitle="SLA لمدة 30 يومًا" icon={Activity} color="green" trend="up" trendValue="SLA ✓" />
              </div>
            )}

            <div className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
              <KpiGauge value={snapshot.ssi} benchmark={snapshot.benchmark} />
              <LiveAlertFeed alerts={snapshot.liveAlerts} />
            </div>

            <RiskHeatmap cells={snapshot.heatmapCells} availableTimeSlots={snapshot.availableTimeSlots} />
            <AIInsightsPanel ssi={snapshot.ssi} benchmark={snapshot.benchmark} alerts={snapshot.liveAlerts} agentInsights={agentInsights} />
          </>
        )}

        {/* ── SSI ANALYSIS ── */}
        {page === "ssi" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">تحليل</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">مؤشر سلامة المدرسة — تحليل معمق</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                مؤشر SSI محسوب من وحدات 05 و06 و07 و08 بصيغة مركبة مرجحة.
              </p>
            </div>
            {ssiLive ? (
              <SSILivePanel data={ssiLive} />
            ) : (
              <div className="schooly-panel rounded-2xl px-6 py-8 text-center text-muted-foreground">
                جارٍ الاتصال بنقطة نهاية SSI...
              </div>
            )}
            {ssiHistory ? (
              <SSIHistoryChart
                scores={ssiHistory.scores}
                benchmark={ssiHistory.benchmark}
                average={ssiHistory.average}
                trend={ssiHistory.trend}
              />
            ) : (
              <div className="schooly-panel rounded-2xl px-6 py-8 text-center text-muted-foreground">
                جارٍ تحميل السجل (30 يومًا)...
              </div>
            )}
          </>
        )}

        {/* ── UNITS ── */}
        {page === "units" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">النظام</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">15 وحدة تشغيلية متكاملة</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                كل وحدة وحدة مستقلة ومترابطة تساهم في مؤشر السلامة وطبقة الحوكمة.
              </p>
            </div>
            <UnitsGrid units={units.length > 0 ? units : Array.from({ length: 15 }, (_, i) => ({
              unit_id: i + 1,
              name: `الوحدة ${i + 1}`,
              category: "—",
              status: "active" as const,
            }))} />
          </>
        )}

        {/* ── ANALYTICS ── */}
        {page === "analytics" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">التحليلات</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">نظرة عامة على تحليلات النظام</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                مقاييس أداء شاملة عبر الحضور والأمن والكاميرات والامتثال.
              </p>
            </div>
            <AnalyticsDashboard data={analytics} />
          </>
        )}

        {/* ── REPORTS ── */}
        {page === "reports" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">التقارير</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">التقارير الدورية متعددة المستويات</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                تقارير تشغيلية وتحليلية وإشرافية ووزارية مدعومة بالوحدة 11.
              </p>
            </div>
            <ReportsDashboard reports={reports} stats={reportStats} />
          </>
        )}

        {/* ── CAMERAS ── */}
        {page === "cameras" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">الكاميرات المباشرة</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">التغذية المباشرة — الوحدة 01</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                بث مباشر من كاميرات RTSP / HTTP عبر الحرم المدرسي. يتم طمس جميع الوجوه آنيًا بواسطة طبقة حوكمة البيانات (الوحدة 14).
              </p>
            </div>
            <LiveCameraGrid />
          </>
        )}

        {/* ── PORTAL ── */}
        {page === "portal" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">بوابة أولياء الأمور</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">البوابة الذكية لأولياء الأمور — الوحدة 12</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                إشعارات الحضور والسلامة الخاضعة للخصوصية للأولياء. مدعومة بنموذج حوكمة البيانات (الوحدة 14).
              </p>
            </div>
            <ParentPortalFull data={studentData} />
          </>
        )}

        {/* ── COMPUTER VISION ── */}
        {page === "computer-vision" && (
          <>
            <div className="schooly-panel rounded-2xl px-6 py-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">الرؤية الحاسوبية</p>
              <h2 className="mt-1 text-2xl font-heading font-semibold">منظومة الرؤية الحاسوبية الشاملة</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                8 وحدات كشف، {58} كاميرا، و{34} تقريراً تلقائياً — تغطية كاملة لكل مكان في الحرم المدرسي.
              </p>
            </div>
            <ComputerVisionDashboard />
          </>
        )}

        {/* ── CONTROL ── */}
        {page === "control" && <ControlPanel />}
      </main>
    </div>
  );
}
