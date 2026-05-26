import { Users, Activity, Camera, Shield, AlertTriangle, Calendar, Gauge, CheckCircle } from "lucide-react";
import { MetricCard } from "./MetricCard";
import type { AnalyticsOverview } from "@/types/monitoring";

type Props = { data: AnalyticsOverview | null };

export function AnalyticsDashboard({ data }: Props) {
  if (!data) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-panel/70 px-6 py-12 text-center text-mist/50 shadow-panel">
        جارٍ تحميل التحليلات…
      </div>
    );
  }

  const patrolWidth = `${data.patrol_efficiency}%`;
  const complianceWidth = `${data.compliance_score}%`;

  return (
    <div className="space-y-4">
      {/* الصف الأول — 4 مقاييس رئيسية */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="إجمالي الطلاب"
          value={data.total_students.toLocaleString()}
          subtitle="مسجل ومتتبع"
          icon={Users}
          color="blue"
          trend="stable"
          trendValue="لا تغيير"
        />
        <MetricCard
          title="نسبة الحضور"
          value={data.attendance_rate.toFixed(1)}
          unit="%"
          subtitle="حضور اليوم"
          icon={Calendar}
          color="green"
          trend="up"
          trendValue="+1.2% أمس"
        />
        <MetricCard
          title="الكاميرات النشطة"
          value={data.active_cameras}
          subtitle={`من ${data.total_units * 2} كاميرا`}
          icon={Camera}
          color="blue"
          trend="stable"
          trendValue="طبيعي"
        />
        <MetricCard
          title="وقت التشغيل"
          value={data.uptime_percent.toFixed(1)}
          unit="%"
          subtitle="آخر 30 يومًا"
          icon={Activity}
          color="green"
          trend="up"
          trendValue="SLA ✓"
        />
      </div>

      {/* الصف الثاني — 4 مقاييس تشغيلية */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="حوادث اليوم"
          value={data.incidents_today}
          subtitle="رُصدت بالذكاء الاصطناعي"
          icon={AlertTriangle}
          color={data.incidents_today > 5 ? "red" : data.incidents_today > 2 ? "orange" : "green"}
          trend={data.incidents_today > 3 ? "up" : "down"}
          trendValue={`${data.incidents_week} هذا الأسبوع`}
        />
        <MetricCard
          title="حوادث الأسبوع"
          value={data.incidents_week}
          subtitle="مجموع 7 أيام"
          icon={Shield}
          color="orange"
          trend="down"
          trendValue="−4 عن الأسبوع الماضي"
        />
        <MetricCard
          title="متوسط كثافة الحشود"
          value={(data.avg_crowd_density * 100).toFixed(0)}
          unit="%"
          subtitle={`ذروة: ${data.peak_density_zone}`}
          icon={Gauge}
          color={data.avg_crowd_density > 0.7 ? "red" : data.avg_crowd_density > 0.5 ? "orange" : "blue"}
          trend="stable"
          trendValue="ضمن الحد المسموح"
        />
        <MetricCard
          title="درجة الامتثال"
          value={data.compliance_score.toFixed(1)}
          unit="%"
          subtitle="توافق مع اللوائح"
          icon={CheckCircle}
          color="green"
          trend="up"
          trendValue="+0.3 نقطة"
        />
      </div>

      {/* الصف الثالث — ملخص ذكاء النظام */}
      <section className="rounded-[2rem] border border-white/10 bg-panel/90 p-6 shadow-panel backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-mist/50">ملخص ذكاء النظام</p>
        <h3 className="mt-2 text-xl font-semibold text-white">نظرة عامة على الأداء التشغيلي</h3>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* كفاءة الدوريات */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-mist/70">كفاءة الدوريات</span>
              <span className="text-sm font-bold text-white">{data.patrol_efficiency.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: patrolWidth, background: "linear-gradient(90deg, #4f8fd8, #46c37b)" }}
              />
            </div>
            <p className="mt-1.5 text-xs text-mist/45">متوسط وقت الاستجابة: 2.4 دقيقة · التغطية: 100%</p>
          </div>

          {/* الامتثال للحوكمة */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-mist/70">امتثال الحوكمة العربية</span>
              <span className="text-sm font-bold text-white">{data.compliance_score.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: complianceWidth, background: "linear-gradient(90deg, #9b6dff, #46c37b)" }}
              />
            </div>
            <p className="mt-1.5 text-xs text-mist/45">RBAC · احتفاظ 72س · إخفاء الهوية · سجل مراجعة</p>
          </div>

          {/* منطقة الذروة */}
          <div className="rounded-[1.4rem] border border-warning/20 bg-warning/5 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-mist/45">منطقة الكثافة القصوى</p>
            <p className="mt-2 text-lg font-semibold text-white">{data.peak_density_zone}</p>
            <p className="text-xs text-mist/55 mt-1">متوسط الكثافة {(data.avg_crowd_density * 100).toFixed(0)}% · المراقبة نشطة</p>
          </div>

          {/* التنبيهات المحلولة */}
          <div className="rounded-[1.4rem] border border-safe/20 bg-safe/5 px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-mist/45">التنبيهات المحلولة اليوم</p>
            <p className="mt-2 text-lg font-semibold text-white">{data.alerts_resolved_today} تنبيه</p>
            <p className="text-xs text-mist/55 mt-1">متوسط وقت الحل: 4.1 دقيقة · 100% محلولة</p>
          </div>
        </div>
      </section>
    </div>
  );
}
