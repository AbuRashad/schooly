import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Eye,
  Bot,
  BarChart3,
  ShieldCheck,
  Zap,
  Globe,
  BrainCircuit,
  LineChart,
  Users,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

type Lang = "ar" | "en";

const content = {
  ar: {
    nav: "School Smart Eye",
    backLabel: "الرئيسية",
    badge: "المميزات",
    title: "كل ما تحتاجه في منصة واحدة",
    subtitle:
      "مبني بالذكاء الاصطناعي من الأساس — School Smart Eye يجمع المراقبة والتعلم والتحليلات في تجربة تعليمية متكاملة.",
    mainFeatures: [
      {
        icon: Eye,
        title: "المراقبة الذكية",
        desc: "تتبع تقدم كل طالب في الوقت الفعلي. يرصد النظام مستوى التفاعل، ومعدلات الإتمام، ومؤشرات الأداء تلقائياً.",
        points: [
          "تتبع الحضور والمشاركة",
          "تنبيهات فورية عند انخفاض الأداء",
          "لوحة تحكم مخصصة للمعلم",
        ],
        color: "#00C2FF",
      },
      {
        icon: Bot,
        title: "المساعد الذكي",
        desc: "مساعد تعليمي يعمل بالذكاء الاصطناعي يتكيف مع أسلوب تعلم كل طالب ويقدم شرحاً مخصصاً على مدار الساعة.",
        points: [
          "إجابات فورية على أسئلة الطلاب",
          "شرح تكيفي حسب مستوى الطالب",
          "دعم متعدد اللغات",
        ],
        color: "#22C55E",
      },
      {
        icon: BarChart3,
        title: "التحليلات المتقدمة",
        desc: "لوحات بيانات شاملة تحول الأرقام إلى رؤى قابلة للتنفيذ لتحسين النتائج التعليمية.",
        points: [
          "تقارير أداء تفصيلية",
          "مقارنة بين الفصول والمجموعات",
          "توقعات مبنية على الذكاء الاصطناعي",
        ],
        color: "#A855F7",
      },
    ],
    extraTitle: "مميزات إضافية",
    extras: [
      { icon: ShieldCheck, title: "أمان من الدرجة الأولى", desc: "تشفير كامل وحماية بيانات الطلاب." },
      { icon: Zap, title: "أداء فائق السرعة", desc: "منصة محسّنة تعمل بسلاسة على جميع الأجهزة." },
      { icon: Globe, title: "متعدد اللغات", desc: "دعم كامل للعربية والإنجليزية وأكثر من 10 لغات." },
      { icon: BrainCircuit, title: "تعلم تكيفي", desc: "المحتوى يتشكل تلقائياً حسب مستوى كل طالب." },
      { icon: LineChart, title: "تقارير مباشرة", desc: "بيانات حية يمكن تصديرها بصيغ متعددة." },
      { icon: Users, title: "إدارة الفصول", desc: "أدوات متكاملة لإدارة الطلاب والمجموعات." },
    ],
    ctaTitle: "جاهز للبدء؟",
    ctaBtn: "ابدأ مجاناً",
  },
  en: {
    nav: "School Smart Eye",
    backLabel: "Home",
    badge: "Features",
    title: "Everything you need in one platform",
    subtitle:
      "Built AI-first — School Smart Eye combines monitoring, learning, and analytics into one seamless educational experience.",
    mainFeatures: [
      {
        icon: Eye,
        title: "Smart Monitoring",
        desc: "Track every student's progress in real time. The system automatically captures engagement levels, completion rates, and performance indicators.",
        points: [
          "Attendance & participation tracking",
          "Instant alerts on performance drops",
          "Customizable teacher dashboard",
        ],
        color: "#00C2FF",
      },
      {
        icon: Bot,
        title: "AI Assistant",
        desc: "An AI-powered learning companion that adapts to each student's style and delivers personalized explanations around the clock.",
        points: [
          "Instant answers to student questions",
          "Adaptive explanations by level",
          "Multi-language support",
        ],
        color: "#22C55E",
      },
      {
        icon: BarChart3,
        title: "Advanced Analytics",
        desc: "Comprehensive dashboards that turn raw numbers into actionable insights to improve educational outcomes.",
        points: [
          "Detailed performance reports",
          "Cross-class & group comparisons",
          "AI-powered outcome predictions",
        ],
        color: "#A855F7",
      },
    ],
    extraTitle: "More powerful features",
    extras: [
      { icon: ShieldCheck, title: "Enterprise Security", desc: "Full encryption and student data protection." },
      { icon: Zap, title: "Blazing Fast", desc: "Optimized platform that runs smoothly on all devices." },
      { icon: Globe, title: "Multi-language", desc: "Full Arabic & English support plus 10+ languages." },
      { icon: BrainCircuit, title: "Adaptive Learning", desc: "Content automatically shapes itself to each student." },
      { icon: LineChart, title: "Live Reports", desc: "Real-time data exportable in multiple formats." },
      { icon: Users, title: "Class Management", desc: "Integrated tools for managing students and groups." },
    ],
    ctaTitle: "Ready to get started?",
    ctaBtn: "Start for free",
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

export default function FeaturesPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = content[lang];
  const isRtl = lang === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <>
      <title>Features — School Smart Eye</title>
      <meta name="description" content="Explore School Smart Eye's AI-powered features: Smart Monitoring, AI Assistant, and Advanced Analytics." />

      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="min-h-screen text-white font-sans relative overflow-x-hidden"
        style={{ background: "linear-gradient(135deg, #0A2540 0%, #001F3F 100%)" }}
      >
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#00C2FF 1px, transparent 1px), linear-gradient(90deg, #00C2FF 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top glow */}
        <div
          className="pointer-events-none absolute top-[-80px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #00C2FF 0%, transparent 70%)" }}
        />

        {/* ── Navbar ── */}
        <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-5 border-b border-white/10">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            <BackIcon className="w-4 h-4" />
            {t.backLabel}
          </Link>

          <span
            className="text-xl font-bold tracking-tight absolute left-1/2 -translate-x-1/2"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            School Smart <span style={{ color: "#00C2FF" }}>Eye</span>
          </span>

          <div className="flex items-center gap-3">
            <Link
              to="/about"
              className="hidden md:inline-flex text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5"
            >
              {lang === "ar" ? "من أنا" : "About"}
            </Link>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200"
            >
              {lang === "ar" ? "EN" : "AR"}
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </div>
        </nav>
        <section className="relative z-10 text-center px-6 md:px-16 pt-20 pb-16 max-w-4xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase mb-5 px-3 py-1 rounded-full border"
              style={{ color: "#00C2FF", borderColor: "#00C2FF44", background: "#00C2FF11" }}
            >
              {t.badge}
            </span>
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            {t.title}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/55 text-lg leading-relaxed max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </section>

        {/* ── Main Features ── */}
        <section className="relative z-10 px-6 md:px-16 pb-24 max-w-6xl mx-auto">
          <div className="flex flex-col gap-8">
            {t.mainFeatures.map((feature, i) => {
              const Icon = feature.icon;
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 items-center rounded-3xl p-8 md:p-12 border`}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    borderColor: `${feature.color}22`,
                  }}
                >
                  {/* Icon side */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center"
                      style={{
                        background: `${feature.color}15`,
                        border: `2px solid ${feature.color}44`,
                        boxShadow: `0 0 32px ${feature.color}22`,
                      }}
                    >
                      <Icon className="w-9 h-9" style={{ color: feature.color }} />
                    </div>
                  </div>

                  {/* Text side */}
                  <div className="flex-1">
                    <h2
                      className="text-2xl md:text-3xl font-bold mb-3"
                      style={{
                        fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                        color: feature.color,
                      }}
                    >
                      {feature.title}
                    </h2>
                    <p className="text-white/60 leading-relaxed mb-5 text-base">{feature.desc}</p>
                    <ul className="flex flex-col gap-2">
                      {feature.points.map((point, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-sm text-white/75">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: feature.color }}
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Extra Features Grid ── */}
        <section className="relative z-10 px-6 md:px-16 pb-24 max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="text-2xl md:text-3xl font-bold text-center mb-10"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            {t.extraTitle}
          </motion.h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {t.extras.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl p-5 border cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(0,194,255,0.12)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: "#00C2FF14", border: "1px solid #00C2FF30" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "#00C2FF" }} />
                  </div>
                  <h3
                    className="font-semibold mb-1 text-sm"
                    style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative z-10 px-6 md:px-16 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="inline-block rounded-3xl px-10 py-14 max-w-xl w-full"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,194,255,0.15)",
            }}
          >
            <h2
              className="text-3xl font-bold mb-8"
              style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
            >
              {t.ctaTitle}
            </h2>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 32px #00C2FF66" }}
              whileTap={{ scale: 0.97 }}
              className="px-9 py-4 rounded-xl text-base font-bold transition-all duration-200"
              style={{ background: "#00C2FF", color: "#001F3F" }}
            >
              {t.ctaBtn}
            </motion.button>
          </motion.div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-10 text-center text-white/30 text-sm pb-8 pt-4 border-t border-white/10">
          © 2026 School Smart Eye
        </footer>
      </div>
    </>
  );
}
