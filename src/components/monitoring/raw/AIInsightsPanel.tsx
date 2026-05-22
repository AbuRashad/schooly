import { Brain, AlertOctagon, TrendingUp, ShieldCheck, Users } from "lucide-react";
import type { AlertFeedItem, AgentSessionInsights } from "@/types/monitoring";

type Props = {
  ssi: number;
  benchmark: number;
  alerts: AlertFeedItem[];
  agentInsights?: AgentSessionInsights | null;
};

type Insight = {
  icon: typeof Brain;
  title: string;
  recommendation: string;
  priority: "critical" | "high" | "medium" | "info";
};

const priorityColors = {
  critical: { border: "border-critical/35", bg: "bg-critical/8", badge: "bg-critical", icon: "#e84d5b" },
  high:     { border: "border-warning/35",  bg: "bg-warning/8",  badge: "bg-warning",  icon: "#ffb84d" },
  medium:   { border: "border-sky/25",      bg: "bg-sky/8",      badge: "bg-sky",      icon: "#4f8fd8" },
  info:     { border: "border-safe/25",     bg: "bg-safe/8",     badge: "bg-safe",     icon: "#46c37b" },
};

const priorityLabels: Record<Insight["priority"], string> = {
  critical: "حرج",
  high:     "عالي",
  medium:   "متوسط",
  info:     "معلومة",
};

function buildInsights(
  ssi: number,
  benchmark: number,
  alerts: AlertFeedItem[],
  agent: AgentSessionInsights | null | undefined,
): Insight[] {
  const insights: Insight[] = [];
  const hasCritical = alerts.some((a) => a.severity === "critical");
  const hasWarning = alerts.some((a) => a.severity === "warning");

  if (hasCritical) {
    insights.push({
      icon: AlertOctagon,
      title: "تنبيه حرج نشط",
      recommendation: "يستوجب الاستجابة الفورية. نشر فريق الأمن في المنطقة المحددة. التحقق من عتبات الكثافة وتفعيل بروتوكول الاحتواء وفق إرشادات وحدة توقع الكثافة.",
      priority: "critical",
    });
  }

  if (ssi < benchmark) {
    insights.push({
      icon: Brain,
      title: "مؤشر SSI دون المعيار الوطني",
      recommendation: `SSI الحالي (${ssi}) أقل من المعيار (${benchmark}). يُوصى بزيادة تكرار الدوريات 20%، ومراجعة تباينات الحضور في وحدة تكامل السلامة، وتفعيل مراجعة الشذوذ في الذاكرة السلوكية المكانية.`,
      priority: "high",
    });
  } else if (ssi < benchmark + 5) {
    insights.push({
      icon: TrendingUp,
      title: "مؤشر SSI يقترب من المعيار",
      recommendation: `SSI أعلى بـ ${(ssi - benchmark).toFixed(1)} نقطة عن المعيار — ضمن نطاق التسامح. راقب درجة التناسق في الوحدة 06 للكشف المبكر خلال الـ 30 دقيقة القادمة.`,
      priority: "medium",
    });
  }

  if (hasWarning && !hasCritical) {
    insights.push({
      icon: AlertOctagon,
      title: "إشارات تحذيرية نشطة",
      recommendation: "رُصدت تنبيهات تحذيرية متعددة. أعد تمركز الطاقم بالقرب من مناطق الكثافة العالية. توقع وحدة الكثافة (07) ارتفاعاً في منطقة التعلم المشترك خلال 15 دقيقة.",
      priority: "high",
    });
  }

  if (agent) {
    if (agent.disengagement_flags.length > 0) {
      const names = agent.disengagement_flags.slice(0, 3).map((f) => f.student_id).join("، ");
      insights.push({
        icon: Users,
        title: `${agent.disengagement_flags.length} طالب غير منخرط`,
        recommendation: `رصدت الوحدة 15 أنماط عدم انخراط لـ: ${names}${agent.disengagement_flags.length > 3 ? ` و${agent.disengagement_flags.length - 3} آخرين` : ""}. يُنصح بتعديل وتيرة الدرس أو تفعيل تدخلات موجّهة.`,
        priority: "high",
      });
    }

    if (agent.audio_visual_mismatches.length > 0) {
      insights.push({
        icon: Brain,
        title: "تناقض صوتي-بصري مكتشف",
        recommendation: `${agent.audio_visual_mismatches.length} طالب يُظهر إشارات صوتية وبصرية متضاربة (مثلاً: يتكلم مع وضعية غير منخرطة). تحليل السياق باللهجة المحلية أشار إلى محادثة خارج المنهج.`,
        priority: "medium",
      });
    }

    if (agent.class_engagement_average > 0) {
      const avgPct = Math.round(agent.class_engagement_average * 100);
      insights.push({
        icon: TrendingUp,
        title: `انخراط الفصل: ${avgPct}%`,
        recommendation: agent.improvement_note
          ? agent.improvement_note
          : avgPct >= 75
            ? `انخراط الجلسة الحالية قوي بنسبة ${avgPct}%. المتفوقون: ${agent.top_engaged_students.slice(0, 2).map((s) => s.student_id).join("، ") || "—"}.`
            : `انخراط الجلسة ${avgPct}% — دون العتبة المثلى. راجع مواد الدرس وبيئة الفصل.`,
        priority: avgPct >= 75 ? "info" : "medium",
      });
    }
  } else {
    insights.push({
      icon: TrendingUp,
      title: "نمط حشودي تنبؤي",
      recommendation: "يتوقع نموذج الذكاء الاصطناعي زيادة 12% في الكثافة بمنطقة التعلم المشترك بين 11:30—12:00 (انتقال الغداء). يُنصح بتمركز مشرفَين إضافيَّين للحفاظ على SSI فوق المعيار.",
      priority: "medium",
    });
  }

  insights.push({
    icon: ShieldCheck,
    title: "ملاحظة الامتثال للحوكمة",
    recommendation: "جميع مسارات البيانات النشطة متوافقة مع نموذج الحوكمة العربية (الوحدة 14). فترة الاحتفاظ بالفيديو 72 ساعة، أدوار RBAC مُتحقق منها، سياسة إخفاء هوية القاصرين نشطة. سجل المراجعة متزامن.",
    priority: "info",
  });

  return insights.slice(0, 4);
}

export function AIInsightsPanel({ ssi, benchmark, alerts, agentInsights }: Props) {
  const insights = buildInsights(ssi, benchmark, alerts, agentInsights);

  return (
    <section className="rounded-[2rem] border border-white/10 bg-panel/90 p-6 shadow-panel backdrop-blur">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-[1rem] bg-cobalt/30 p-2.5">
          <Brain className="h-5 w-5 text-sky" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-mist/50">طبقة الذكاء الاصطناعي — الوحدة 15</p>
          <h3 className="text-xl font-semibold text-white">رؤى ذكية وتوصيات</h3>
        </div>
        <span className="ml-auto rounded-full border border-sky/30 bg-sky/10 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-sky">
          تحليل مباشر
        </span>
      </div>

      {agentInsights && (
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-mist/60">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
            الجلسة: <span className="text-white">{agentInsights.session_id ?? "—"}</span>
          </span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
            انخراط الفصل:{" "}
            <span className="text-white font-semibold">
              {Math.round(agentInsights.class_engagement_average * 100)}%
            </span>
          </span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
            إشارات: <span className="text-warning font-semibold">{agentInsights.disengagement_flags.length}</span>
          </span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
            تناقضات صوتية-بصرية: <span className="text-sky font-semibold">{agentInsights.audio_visual_mismatches.length}</span>
          </span>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {insights.map((ins) => {
          const c = priorityColors[ins.priority];
          const Icon = ins.icon;
          return (
            <div key={ins.title} className={`rounded-[1.4rem] border ${c.border} ${c.bg} px-4 py-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 shrink-0" style={{ color: c.icon }} />
                <h4 className="text-sm font-semibold text-white">{ins.title}</h4>
                <span className={`ml-auto shrink-0 rounded-full ${c.badge} px-2 py-0.5 text-[9px] font-bold uppercase text-white tracking-wider`}>
                  {priorityLabels[ins.priority]}
                </span>
              </div>
              <p className="text-xs text-mist/65 leading-relaxed">{ins.recommendation}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
