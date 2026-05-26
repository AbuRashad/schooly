import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Camera, Brain, BarChart3, Users, Bell,
  ArrowLeft, CheckCircle2, Cpu, Lock, Globe,
} from "lucide-react";

const features = [
  { icon: Camera,      title: "مراقبة مباشرة",          desc: "15 وحدة ذكاء اصطناعي تراقب الحرم المدرسي على مدار الساعة عبر شبكة كاميرات RTSP." },
  { icon: ShieldCheck, title: "مؤشر السلامة (SSI)",       desc: "مؤشر مركّب يحسب درجة سلامة المدرسة فوريًا من 5 مصادر بيانات مستقلة." },
  { icon: Brain,       title: "ذكاء اصطناعي تنبؤي",      desc: "خوارزميات التنبؤ بكثافة الحشود والكشف المبكر عن المخاطر قبل وقوعها." },
  { icon: BarChart3,   title: "تقارير متعددة المستويات",  desc: "تقارير تشغيلية وإشرافية ووزارية مُولَّدة تلقائيًا بضغطة زر." },
  { icon: Users,       title: "بوابة أولياء الأمور",     desc: "واجهة مخصصة تمنح ولي الأمر رؤية آمنة لحضور وسلامة ابنه في الوقت الفعلي." },
  { icon: Lock,        title: "حوكمة بيانات عربية",      desc: "طبقة الوحدة 14 تضمن طمس الوجوه آليًا وتطبيق سياسات الخصوصية المحلية." },
];

const stats = [
  { value: "15",    label: "وحدة ذكاء اصطناعي" },
  { value: "99.9%", label: "وقت تشغيل مضمون" },
  { value: "<50ms", label: "زمن استجابة الإنذار" },
  { value: "4K",    label: "دقة الكاميرات المدعومة" },
];

const unitNames = [
  "التقاط الفيديو", "فهم المشهد", "تتبع المسارات", "كشف المخاطر", "الذاكرة الفضائية",
  "التماسك الجماعي", "التنبؤ بالكثافة", "الحضور والسلامة", "التنبيه والاستجابة", "لوحة التحكم",
  "التقارير الدورية", "بوابة الأولياء", "التقييم الذاتي", "حوكمة البيانات", "الذكاء التربوي",
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-heading font-bold">S</div>
            <span className="font-heading font-bold text-xl text-foreground">Schooly</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">المميزات</a>
            <a href="#stats"    className="hover:text-foreground transition-colors">الأرقام</a>
            <a href="#units"    className="hover:text-foreground transition-colors">الوحدات</a>
          </div>
          <Link to="/dashboard/login">
            <Button size="sm" className="gap-2">
              لوحة التحكم
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32 overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] rounded-full bg-primary/20 blur-[130px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-secondary/10 blur-[100px]" />
        </div>

        <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/10 px-4 py-1.5 gap-1.5">
          <Cpu className="h-3 w-3" />
          منصة مراقبة مدرسية مدعومة بالذكاء الاصطناعي
        </Badge>

        <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground leading-tight max-w-4xl">
          مدرستك أكثر
          <span className="text-primary"> أمانًا </span>
          مع Schooly
        </h1>

        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          منصة متكاملة تجمع 15 وحدة ذكاء اصطناعي لمراقبة المدارس لحظةً بلحظة، والكشف المبكر عن المخاطر، وتمكين أولياء الأمور من متابعة أبنائهم بأمان وخصوصية تامة.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link to="/dashboard/login">
            <Button size="lg" className="gap-2 px-8 schooly-glow">
              ابدأ الآن
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
          <Link to="/dashboard/monitoring">
            <Button size="lg" variant="outline" className="gap-2 px-8">
              <BarChart3 className="h-4 w-4" />
              عرض لوحة المراقبة
            </Button>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {["طمس الوجوه آليًا", "بيانات محلية 100%", "WebSocket فوري", "Docker جاهز"].map((t) => (
            <span key={t} className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3 w-3 text-green-400" />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="font-heading text-4xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-14">
          <Badge variant="outline" className="mb-4 border-border text-muted-foreground">المميزات</Badge>
          <h2 className="font-heading text-4xl font-bold">كل ما تحتاجه في منصة واحدة</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            من المراقبة الفورية إلى التقارير الوزارية — Schooly يغطي كل جوانب السلامة المدرسية.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="schooly-panel rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Units */}
      <section id="units" className="bg-card/30 border-y border-border py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 border-border text-muted-foreground">البنية التقنية</Badge>
            <h2 className="font-heading text-4xl font-bold">15 وحدة ذكاء اصطناعي مدمجة</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {unitNames.map((name, i) => (
              <div key={i} className="schooly-panel rounded-xl p-3 text-center hover:border-primary/30 transition-colors">
                <p className="text-xs font-mono text-primary mb-1">U{String(i + 1).padStart(2, "0")}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center w-full">
        <div className="schooly-panel rounded-3xl p-12 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full bg-primary/15 blur-[80px]" />
          </div>
          <Bell className="h-10 w-10 text-primary mx-auto mb-6" />
          <h2 className="font-heading text-4xl font-bold">جاهز لتحويل مدرستك؟</h2>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
            ابدأ الآن وانضم إلى المدارس التي تستخدم Schooly لضمان بيئة تعليمية آمنة.
          </p>
          <Link to="/dashboard/login" className="inline-block mt-8">
            <Button size="lg" className="gap-2 px-10 schooly-glow">
              ادخل إلى لوحة التحكم
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">S</div>
            <span className="font-heading font-semibold text-foreground">Schooly</span>
            <span>— منصة المراقبة الذكية للمدارس</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            <span>حوكمة بيانات عربية · خصوصية محلية</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
