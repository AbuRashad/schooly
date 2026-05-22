import { useState } from "react";
import {
  Eye, Shield, Brain, Activity, Users, AlertTriangle,
  FileText, Download, CheckCircle, Clock, BookOpen,
  Car, Coffee, Dumbbell, FlaskConical, BookMarked,
  DoorOpen, Footprints, Camera, Zap, TrendingUp,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ZoneType =
  | "gate" | "classroom" | "hallway" | "playground"
  | "cafeteria" | "parking" | "library" | "lab"
  | "restroom" | "staffroom" | "sports";

type CvCapability = {
  id: string;
  label: string;
  active: boolean;
};

type SchoolZone = {
  id: string;
  label: string;
  type: ZoneType;
  cameraCount: number;
  capabilities: CvCapability[];
  riskLevel: "low" | "medium" | "high";
  detectionsToday: number;
};

type ReportCategory = {
  id: string;
  title: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  reports: ReportItem[];
};

type ReportItem = {
  id: string;
  title: string;
  description: string;
  frequency: string;
  sources: string[];
  status: "available" | "scheduled" | "beta";
};

type CvModule = {
  id: string;
  name: string;
  unit: string;
  description: string;
  detectionTypes: string[];
  accuracy: number;
  status: "active" | "degraded" | "offline";
  detectionsToday: number;
};

// ── Static Data ───────────────────────────────────────────────────────────────

const ZONES: SchoolZone[] = [
  {
    id: "zone-gate",
    label: "البوابة الرئيسية",
    type: "gate",
    cameraCount: 4,
    riskLevel: "medium",
    detectionsToday: 847,
    capabilities: [
      { id: "face-recog", label: "التعرف على الوجه", active: true },
      { id: "crowd-count", label: "عد الحشود", active: true },
      { id: "unknown-person", label: "كشف الغرباء", active: true },
      { id: "vehicle-detect", label: "رصد السيارات", active: true },
      { id: "late-arrival", label: "تتبع التأخر", active: true },
    ],
  },
  {
    id: "zone-classroom",
    label: "الفصول الدراسية",
    type: "classroom",
    cameraCount: 18,
    riskLevel: "low",
    detectionsToday: 2341,
    capabilities: [
      { id: "attention", label: "قياس الانتباه", active: true },
      { id: "face-attend", label: "حضور بالوجه", active: true },
      { id: "phone-use", label: "كشف الهاتف", active: true },
      { id: "posture", label: "تحليل الوضعية", active: true },
      { id: "sleeping", label: "كشف النوم", active: true },
      { id: "engagement", label: "مستوى التفاعل", active: true },
    ],
  },
  {
    id: "zone-hallway",
    label: "الممرات والأروقة",
    type: "hallway",
    cameraCount: 12,
    riskLevel: "medium",
    detectionsToday: 1589,
    capabilities: [
      { id: "crowd-density", label: "كثافة الحشود", active: true },
      { id: "running", label: "كشف الجري", active: true },
      { id: "loitering", label: "كشف التسكع", active: true },
      { id: "flow-analysis", label: "تحليل تدفق الحركة", active: true },
      { id: "fighting", label: "كشف النزاعات", active: true },
    ],
  },
  {
    id: "zone-playground",
    label: "الفناء والملعب",
    type: "playground",
    cameraCount: 6,
    riskLevel: "high",
    detectionsToday: 978,
    capabilities: [
      { id: "fight-detect", label: "كشف المشاجرات", active: true },
      { id: "fall-detect", label: "كشف السقوط", active: true },
      { id: "crowd-anom", label: "الشذوذ الحشدي", active: true },
      { id: "zone-violation", label: "انتهاك المناطق", active: true },
      { id: "group-behavior", label: "تحليل السلوك الجماعي", active: true },
    ],
  },
  {
    id: "zone-cafeteria",
    label: "الكافيتريا / المقصف",
    type: "cafeteria",
    cameraCount: 5,
    riskLevel: "low",
    detectionsToday: 612,
    capabilities: [
      { id: "queue-mgmt", label: "إدارة الطوابير", active: true },
      { id: "capacity", label: "رصد الطاقة الاستيعابية", active: true },
      { id: "crowd-density", label: "كثافة الحشود", active: true },
    ],
  },
  {
    id: "zone-parking",
    label: "مواقف السيارات",
    type: "parking",
    cameraCount: 3,
    riskLevel: "medium",
    detectionsToday: 289,
    capabilities: [
      { id: "vehicle-count", label: "عد السيارات", active: true },
      { id: "unknown-vehicle", label: "سيارات غير معروفة", active: true },
      { id: "plate-detect", label: "رصد اللوحات", active: false },
    ],
  },
  {
    id: "zone-library",
    label: "المكتبة",
    type: "library",
    cameraCount: 2,
    riskLevel: "low",
    detectionsToday: 134,
    capabilities: [
      { id: "occupancy", label: "رصد الإشغال", active: true },
      { id: "face-recog", label: "التعرف على الوجه", active: true },
    ],
  },
  {
    id: "zone-lab",
    label: "المختبرات",
    type: "lab",
    cameraCount: 4,
    riskLevel: "high",
    detectionsToday: 201,
    capabilities: [
      { id: "safety-gear", label: "كشف معدات السلامة", active: true },
      { id: "unauthorized", label: "دخول غير مصرح", active: true },
      { id: "hazard-detect", label: "كشف المخاطر", active: false },
    ],
  },
  {
    id: "zone-sports",
    label: "الملعب الرياضي",
    type: "sports",
    cameraCount: 4,
    riskLevel: "medium",
    detectionsToday: 445,
    capabilities: [
      { id: "fall-detect", label: "كشف السقوط", active: true },
      { id: "headcount", label: "عد الحاضرين", active: true },
      { id: "fight-detect", label: "كشف النزاعات", active: true },
    ],
  },
];

const CV_MODULES: CvModule[] = [
  {
    id: "face-detection",
    name: "كشف الوجوه",
    unit: "الوحدة 03",
    description: "رصد وتحديد مواقع الوجوه في الإطار الحي",
    detectionTypes: ["وجه بشري", "زاوية الرأس", "تعبيرات الوجه"],
    accuracy: 97.2,
    status: "active",
    detectionsToday: 5843,
  },
  {
    id: "face-recognition",
    name: "التعرف على الوجه",
    unit: "الوحدة 04",
    description: "مطابقة الوجوه مع قاعدة بيانات الطلاب والموظفين",
    detectionTypes: ["طالب معروف", "موظف", "شخص غريب"],
    accuracy: 94.8,
    status: "active",
    detectionsToday: 1247,
  },
  {
    id: "crowd-density",
    name: "تحليل كثافة الحشود",
    unit: "الوحدة 02",
    description: "قياس كثافة الحشود وتوقع الازدحام",
    detectionTypes: ["كثافة منخفضة", "كثافة متوسطة", "كثافة عالية", "ازدحام"],
    accuracy: 91.5,
    status: "active",
    detectionsToday: 3219,
  },
  {
    id: "behavioral",
    name: "تحليل السلوك",
    unit: "الوحدة 05",
    description: "رصد الأنماط السلوكية والحركية للطلاب",
    detectionTypes: ["مشاجرة", "سقوط", "جري في الممر", "تسكع"],
    accuracy: 88.3,
    status: "active",
    detectionsToday: 156,
  },
  {
    id: "engagement",
    name: "مستوى الانخراط الدراسي",
    unit: "الوحدة 07",
    description: "تقييم انتباه الطلاب وتفاعلهم داخل الفصل",
    detectionTypes: ["منتبه", "متفاعل", "مشتت", "نائم"],
    accuracy: 86.7,
    status: "active",
    detectionsToday: 2341,
  },
  {
    id: "emotion",
    name: "الذكاء الوجداني",
    unit: "الوحدة 08",
    description: "تحليل الحالات الانفعالية والمزاجية العامة",
    detectionTypes: ["إيجابي", "محايد", "سلبي", "قلق"],
    accuracy: 82.1,
    status: "active",
    detectionsToday: 987,
  },
  {
    id: "object-detect",
    name: "كشف الأجسام المشبوهة",
    unit: "الوحدة 05-B",
    description: "رصد الهواتف، والأجسام غير المصرح بها",
    detectionTypes: ["هاتف محمول", "جسم غير معروف", "أداة حادة"],
    accuracy: 79.4,
    status: "active",
    detectionsToday: 43,
  },
  {
    id: "flow-analysis",
    name: "تحليل تدفق الحركة",
    unit: "الوحدة 02-B",
    description: "تتبع مسارات الحركة واكتشاف الاختناقات",
    detectionTypes: ["تدفق طبيعي", "ازدحام", "تدفق عكسي", "اختناق"],
    accuracy: 93.6,
    status: "active",
    detectionsToday: 1589,
  },
];

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: "attendance",
    title: "تقارير الحضور والغياب",
    color: "text-blue-400",
    icon: Users,
    reports: [
      {
        id: "r-att-01",
        title: "الحضور اليومي بالتعرف على الوجه",
        description: "تقرير شامل بحضور وغياب كل طالب محدد بالتعرف على الوجه عند البوابة وداخل الفصول",
        frequency: "يومي",
        sources: ["الوحدة 03", "الوحدة 04", "الوحدة 06", "كاميرات البوابة"],
        status: "available",
      },
      {
        id: "r-att-02",
        title: "تقرير التأخر اليومي",
        description: "قائمة الطلاب المتأخرين مع توقيت الوصول الفعلي ومقارنته بوقت الحضور المقرر",
        frequency: "يومي",
        sources: ["كاميرات البوابة", "الوحدة 06", "الوحدة 04"],
        status: "available",
      },
      {
        id: "r-att-03",
        title: "إحصاءات الحضور الأسبوعية والشهرية",
        description: "تحليل اتجاهات الحضور لكل صف وكل طالب مع مؤشرات الغياب المتكرر",
        frequency: "أسبوعي / شهري",
        sources: ["الوحدة 06", "الوحدة 04", "جميع الكاميرات"],
        status: "available",
      },
      {
        id: "r-att-04",
        title: "تقرير الخروج المبكر",
        description: "رصد الطلاب الذين غادروا قبل نهاية اليوم الدراسي مع توثيق الوقت والمنطقة",
        frequency: "يومي",
        sources: ["كاميرات البوابة", "الوحدة 04", "الوحدة 10"],
        status: "available",
      },
    ],
  },
  {
    id: "safety",
    title: "تقارير الأمان والسلامة",
    color: "text-red-400",
    icon: Shield,
    reports: [
      {
        id: "r-saf-01",
        title: "تقرير الحوادث اليومي",
        description: "توثيق كامل لكل الحوادث المرصودة (مشاجرات، سقوط، دخول غير مصرح) مع الفيديو والتوقيت والمنطقة",
        frequency: "يومي",
        sources: ["الوحدة 05", "جميع الكاميرات", "الوحدة 09"],
        status: "available",
      },
      {
        id: "r-saf-02",
        title: "تقرير الدخول غير المصرح به",
        description: "تنبيهات وتوثيق لكل شخص غير معروف رصد دخوله إلى الحرم المدرسي",
        frequency: "فوري + يومي",
        sources: ["الوحدة 04", "كاميرات البوابة", "الوحدة 14"],
        status: "available",
      },
      {
        id: "r-saf-03",
        title: "تقرير النزاعات والمشاجرات",
        description: "تحليل مفصل لحوادث العنف المرصودة مع خريطة حرارية للمناطق الأكثر خطورة",
        frequency: "يومي / أسبوعي",
        sources: ["الوحدة 05", "كاميرات الفناء", "كاميرات الممرات"],
        status: "available",
      },
      {
        id: "r-saf-04",
        title: "تقرير تمارين الإخلاء الطارئ",
        description: "تحليل أداء خطط الإخلاء مع مؤشرات الوقت والكثافة وإتاحة المخارج",
        frequency: "عند التنفيذ",
        sources: ["الوحدة 11", "جميع الكاميرات", "الوحدة 02"],
        status: "available",
      },
      {
        id: "r-saf-05",
        title: "تقرير تحليل الكثافة الحشدية",
        description: "تتبع مناطق الازدحام خلال اليوم الدراسي مع توقع نقاط الاختناق",
        frequency: "يومي / أسبوعي",
        sources: ["الوحدة 02", "الوحدة 12", "جميع الكاميرات"],
        status: "available",
      },
      {
        id: "r-saf-06",
        title: "تقرير مخاطر المختبرات",
        description: "رصد الالتزام بمعدات الحماية الشخصية والسلوك الآمن داخل المختبرات",
        frequency: "يومي",
        sources: ["كاميرات المختبر", "الوحدة 05"],
        status: "beta",
      },
    ],
  },
  {
    id: "behavior",
    title: "تقارير الانضباط السلوكي",
    color: "text-orange-400",
    icon: AlertTriangle,
    reports: [
      {
        id: "r-beh-01",
        title: "تقرير استخدام الهاتف في الفصل",
        description: "إحصاء ومواعيد استخدام الهاتف المحمول خلال وقت الدراسة لكل فصل",
        frequency: "يومي",
        sources: ["الوحدة 05-B", "كاميرات الفصول"],
        status: "available",
      },
      {
        id: "r-beh-02",
        title: "تقرير التسكع في الممرات",
        description: "رصد الطلاب المتواجدين في الممرات خارج أوقات الفسحة مع التوقيت والمنطقة",
        frequency: "يومي",
        sources: ["كاميرات الممرات", "الوحدة 05"],
        status: "available",
      },
      {
        id: "r-beh-03",
        title: "تقرير انتهاكات المناطق المحظورة",
        description: "توثيق دخول الطلاب إلى مناطق غير مصرح لهم بدخولها",
        frequency: "يومي",
        sources: ["جميع الكاميرات", "الوحدة 05"],
        status: "available",
      },
      {
        id: "r-beh-04",
        title: "تقرير الجري في الممرات",
        description: "رصد الجري والسلوك الخطير في الممرات والمناطق الداخلية",
        frequency: "يومي",
        sources: ["كاميرات الممرات", "الوحدة 05"],
        status: "available",
      },
    ],
  },
  {
    id: "academic",
    title: "تقارير الانخراط الأكاديمي",
    color: "text-purple-400",
    icon: Brain,
    reports: [
      {
        id: "r-acad-01",
        title: "تقرير مستوى الانتباه بالفصل",
        description: "قياس مستوى انتباه وتركيز الطلاب بشكل جماعي لكل حصة دراسية",
        frequency: "يومي / لكل حصة",
        sources: ["الوحدة 07", "كاميرات الفصول"],
        status: "available",
      },
      {
        id: "r-acad-02",
        title: "تقرير الطلاب المشتتين والنائمين",
        description: "قائمة بالطلاب الذين رصد النظام عليهم انعدام التركيز أو النوم خلال الحصص",
        frequency: "يومي",
        sources: ["الوحدة 07", "الوحدة 08"],
        status: "available",
      },
      {
        id: "r-acad-03",
        title: "تقرير مقارنة الانخراط عبر الفصول",
        description: "مقارنة مستوى انخراط الطلاب بين مختلف الفصول والمعلمين",
        frequency: "أسبوعي",
        sources: ["الوحدة 07", "الوحدة 15"],
        status: "available",
      },
      {
        id: "r-acad-04",
        title: "تقرير الأداء الأكاديمي التنبؤي",
        description: "توقع مبكر للطلاب في خطر أكاديمي بناءً على أنماط الانخراط والحضور",
        frequency: "أسبوعي",
        sources: ["الوحدة 15", "الوحدة 07", "الوحدة 06"],
        status: "available",
      },
    ],
  },
  {
    id: "traffic",
    title: "تقارير حركة المرور والتدفق",
    color: "text-cyan-400",
    icon: Activity,
    reports: [
      {
        id: "r-trk-01",
        title: "خريطة الحرارة اليومية للحركة",
        description: "تصور بصري لأكثر المناطق ازدحاماً خلال اليوم الدراسي بالساعة",
        frequency: "يومي",
        sources: ["الوحدة 02", "الوحدة 12", "جميع الكاميرات"],
        status: "available",
      },
      {
        id: "r-trk-02",
        title: "تقرير أوقات الذروة بكل منطقة",
        description: "تحليل أوقات الذروة والفراغ لكل منطقة في الحرم المدرسي",
        frequency: "يومي / أسبوعي",
        sources: ["الوحدة 02", "الوحدة 13"],
        status: "available",
      },
      {
        id: "r-trk-03",
        title: "تقرير تحليل وقت الانصراف",
        description: "تحليل حركة الخروج وقت الانصراف لرصد الازدحام وتوجيه خطط التحسين",
        frequency: "يومي",
        sources: ["كاميرات البوابة", "الوحدة 02"],
        status: "available",
      },
      {
        id: "r-trk-04",
        title: "تقرير نقاط الاختناق في الممرات",
        description: "تحديد المواقع التي يتكرر فيها الازدحام مع اقتراحات لإعادة توزيع الحركة",
        frequency: "أسبوعي",
        sources: ["كاميرات الممرات", "الوحدة 02", "الوحدة 13"],
        status: "available",
      },
    ],
  },
  {
    id: "emotion",
    title: "تقارير المناخ الوجداني",
    color: "text-pink-400",
    icon: TrendingUp,
    reports: [
      {
        id: "r-emo-01",
        title: "تقرير المناخ العام للمدرسة",
        description: "قياس الحالة الوجدانية السائدة في المدرسة يومياً بناءً على تحليل تعبيرات الوجه",
        frequency: "يومي",
        sources: ["الوحدة 08", "الوحدة 13"],
        status: "available",
      },
      {
        id: "r-emo-02",
        title: "تقرير رصد علامات التنمر",
        description: "كشف مؤشرات التنمر من خلال أنماط السلوك والتعبيرات الوجدانية",
        frequency: "أسبوعي",
        sources: ["الوحدة 05", "الوحدة 08", "كاميرات الفناء"],
        status: "beta",
      },
    ],
  },
  {
    id: "parent",
    title: "تقارير أولياء الأمور",
    color: "text-green-400",
    icon: BookOpen,
    reports: [
      {
        id: "r-par-01",
        title: "إشعار وصول ومغادرة الطالب",
        description: "إشعار فوري لولي الأمر عند دخول وخروج الطالب من المدرسة مع التوقيت",
        frequency: "فوري",
        sources: ["كاميرات البوابة", "الوحدة 04", "الوحدة 06"],
        status: "available",
      },
      {
        id: "r-par-02",
        title: "ملخص السلوك الأسبوعي",
        description: "تقرير شامل يصف سلوك الطالب خلال الأسبوع (حضور، انتباه، حوادث)",
        frequency: "أسبوعي",
        sources: ["الوحدة 05", "الوحدة 07", "الوحدة 06"],
        status: "available",
      },
      {
        id: "r-par-03",
        title: "تنبيهات الحوادث الفورية",
        description: "إشعار عاجل لولي الأمر عند تورط الطالب في حادثة تستدعي الاهتمام",
        frequency: "فوري",
        sources: ["الوحدة 05", "الوحدة 09"],
        status: "available",
      },
    ],
  },
  {
    id: "admin",
    title: "التقارير الإدارية والوزارية",
    color: "text-yellow-400",
    icon: FileText,
    reports: [
      {
        id: "r-adm-01",
        title: "تقرير مؤشر سلامة المدرسة (SSI)",
        description: "تقرير تفصيلي بمؤشر SSI الشهري مع مقارنة بالمعيار الوطني وتوصيات التحسين",
        frequency: "شهري",
        sources: ["الوحدة 09", "جميع الوحدات"],
        status: "available",
      },
      {
        id: "r-adm-02",
        title: "تقرير الامتثال لمعايير السلامة",
        description: "تقييم مدى التزام المدرسة بمتطلبات السلامة المدرسية الوزارية",
        frequency: "ربع سنوي",
        sources: ["الوحدة 09", "الوحدة 11", "الوحدة 14"],
        status: "available",
      },
      {
        id: "r-adm-03",
        title: "تقرير أداء منظومة المراقبة",
        description: "إحصاءات تشغيلية لكل الكاميرات والوحدات مع معدل الوقوف والجاهزية",
        frequency: "أسبوعي",
        sources: ["الوحدة 01", "جميع الكاميرات"],
        status: "available",
      },
      {
        id: "r-adm-04",
        title: "التقرير السنوي للوزارة",
        description: "تقرير إجمالي سنوي بجميع إحصاءات المدرسة لرفعه للجهات التعليمية",
        frequency: "سنوي",
        sources: ["جميع الوحدات", "جميع الكاميرات"],
        status: "available",
      },
    ],
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

const zoneIcons: Record<ZoneType, React.ComponentType<{ className?: string }>> = {
  gate: DoorOpen,
  classroom: BookMarked,
  hallway: Footprints,
  playground: Dumbbell,
  cafeteria: Coffee,
  parking: Car,
  library: BookOpen,
  lab: FlaskConical,
  restroom: Users,
  staffroom: Users,
  sports: Dumbbell,
};

const riskColors: Record<SchoolZone["riskLevel"], string> = {
  low: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
};

const riskLabels: Record<SchoolZone["riskLevel"], string> = {
  low: "منخفض",
  medium: "متوسط",
  high: "مرتفع",
};

const statusColors: Record<CvModule["status"], string> = {
  active: "text-green-400 bg-green-400/10",
  degraded: "text-yellow-400 bg-yellow-400/10",
  offline: "text-red-400 bg-red-400/10",
};

const statusLabels: Record<CvModule["status"], string> = {
  active: "نشط",
  degraded: "متدهور",
  offline: "غير متصل",
};

const reportStatusColors: Record<ReportItem["status"], string> = {
  available: "text-green-400 bg-green-400/10 border-green-400/20",
  scheduled: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  beta: "text-purple-400 bg-purple-400/10 border-purple-400/20",
};

const reportStatusLabels: Record<ReportItem["status"], string> = {
  available: "متاح",
  scheduled: "مجدول",
  beta: "تجريبي",
};

function ZoneCard({ zone }: { zone: SchoolZone }) {
  const ZoneIcon = zoneIcons[zone.type];
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ZoneIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{zone.label}</p>
            <p className="text-xs text-muted-foreground">{zone.cameraCount} كاميرا</p>
          </div>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${riskColors[zone.riskLevel]}`}>
          خطر {riskLabels[zone.riskLevel]}
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {zone.capabilities.map((cap) => (
          <span
            key={cap.id}
            className={`text-[10px] px-2 py-0.5 rounded-full border ${cap.active ? "bg-primary/10 text-primary border-primary/20" : "bg-muted/30 text-muted-foreground border-border"}`}
          >
            {cap.label}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-xs text-muted-foreground">اكتشافات اليوم</span>
        <span className="text-sm font-bold text-foreground">{zone.detectionsToday.toLocaleString()}</span>
      </div>
    </div>
  );
}

function CvModuleCard({ mod }: { mod: CvModule }) {
  return (
    <div className="rounded-2xl border border-border bg-card/50 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{mod.name}</p>
          <p className="text-xs text-muted-foreground">{mod.unit}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[mod.status]}`}>
          {statusLabels[mod.status]}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{mod.description}</p>

      <div className="flex flex-wrap gap-1">
        {mod.detectionTypes.map((t) => (
          <span key={t} className="text-[10px] bg-muted/40 text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
            {t}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
        <div>
          <p className="text-[10px] text-muted-foreground">الدقة</p>
          <p className="text-sm font-bold text-foreground">{mod.accuracy}%</p>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-muted-foreground">اليوم</p>
          <p className="text-sm font-bold text-foreground">{mod.detectionsToday.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function ReportCategorySection({ category }: { category: ReportCategory }) {
  const CategoryIcon = category.icon;
  return (
    <div className="rounded-2xl border border-border bg-card/30 overflow-hidden">
      <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
        <CategoryIcon className={`h-5 w-5 ${category.color}`} />
        <h3 className="text-base font-semibold text-foreground">{category.title}</h3>
        <span className="mr-auto text-xs text-muted-foreground">{category.reports.length} تقرير</span>
      </div>
      <div className="divide-y divide-border/30">
        {category.reports.map((report) => (
          <div key={report.id} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
            <CheckCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">{report.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${reportStatusColors[report.status]}`}>
                  {reportStatusLabels[report.status]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{report.frequency}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {report.sources.map((src) => (
                    <span key={src} className="text-[10px] bg-primary/10 text-primary/80 px-1.5 py-0.5 rounded-md">
                      {src}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button className="shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/40 rounded-lg px-2.5 py-1.5 transition-colors">
              <Download className="h-3 w-3" />
              تصدير
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

type Tab = "zones" | "modules" | "reports";

export function ComputerVisionDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("zones");

  const totalDetections = ZONES.reduce((s, z) => s + z.detectionsToday, 0);
  const totalCameras = ZONES.reduce((s, z) => s + z.cameraCount, 0);
  const totalReports = REPORT_CATEGORIES.reduce((s, c) => s + c.reports.length, 0);
  const activeModules = CV_MODULES.filter((m) => m.status === "active").length;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "zones",   label: "تغطية المناطق",      icon: Camera },
    { id: "modules", label: "وحدات الكشف النشطة", icon: Zap },
    { id: "reports", label: "كتالوج التقارير",     icon: FileText },
  ];

  return (
    <div className="space-y-4">
      {/* Summary KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "إجمالي الاكتشافات اليوم",  value: totalDetections.toLocaleString(), sub: "عبر كل المناطق",    color: "text-blue-400",   icon: Eye },
          { label: "الكاميرات النشطة",           value: totalCameras,                    sub: "في 9 مناطق",        color: "text-green-400",  icon: Camera },
          { label: "وحدات الكشف النشطة",        value: activeModules,                   sub: `من ${CV_MODULES.length} وحدة`, color: "text-purple-400", icon: Zap },
          { label: "إجمالي التقارير المتاحة",   value: totalReports,                    sub: "في 8 فئات",         color: "text-yellow-400", icon: FileText },
        ].map(({ label, value, sub, color, icon: Icon }) => (
          <div key={label} className="schooly-panel rounded-2xl p-4 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-current/10`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-heading font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-muted-foreground">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="schooly-panel rounded-2xl p-1.5 flex gap-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Zone Coverage */}
      {activeTab === "zones" && (
        <div className="space-y-4">
          <div className="schooly-panel rounded-2xl px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">تغطية المناطق</p>
            <h3 className="mt-1 text-lg font-heading font-semibold">الرؤية الحاسوبية في كل مكان بالمدرسة</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {ZONES.length} مناطق مراقبة بـ {totalCameras} كاميرا توفر رصداً شاملاً بقدرات كشف متخصصة لكل بيئة.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {ZONES.map((zone) => <ZoneCard key={zone.id} zone={zone} />)}
          </div>
        </div>
      )}

      {/* Tab: CV Modules */}
      {activeTab === "modules" && (
        <div className="space-y-4">
          <div className="schooly-panel rounded-2xl px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">وحدات الكشف</p>
            <h3 className="mt-1 text-lg font-heading font-semibold">{CV_MODULES.length} وحدة رؤية حاسوبية متخصصة</h3>
            <p className="text-sm text-muted-foreground mt-1">
              كل وحدة تعالج تدفقات الفيديو بشكل مستقل وتغذي نتائجها مباشرةً في مؤشر SSI وطبقة التنبيهات.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {CV_MODULES.map((mod) => <CvModuleCard key={mod.id} mod={mod} />)}
          </div>
        </div>
      )}

      {/* Tab: Reports Catalog */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="schooly-panel rounded-2xl px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">كتالوج التقارير</p>
            <h3 className="mt-1 text-lg font-heading font-semibold">{totalReports} تقريراً تولدها الرؤية الحاسوبية الشاملة</h3>
            <p className="text-sm text-muted-foreground mt-1">
              بمراقبة كل مكان في المدرسة، يستطيع النظام توليد هذه التقارير تلقائياً لصالح الإدارة وأولياء الأمور والجهات الوزارية.
            </p>
          </div>
          <div className="space-y-3">
            {REPORT_CATEGORIES.map((cat) => (
              <ReportCategorySection key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
