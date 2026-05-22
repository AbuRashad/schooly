import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  Target,
  Heart,
  Code2,
  Cpu,
} from "lucide-react";

type Lang = "ar" | "en";

const content = {
  ar: {
    backLabel: "الرئيسية",
    badge: "من أنا",
    title: "عبدالله رشاد عوينه",
    subtitle: "مطور ومبتكر في مجال التعليم الرقمي",
    bio1:
      "أنا عبدالله رشاد عوينه، مطور ومنشئ منصة School Smart Eye — منصة تعليمية ذكية تجمع بين الذكاء الاصطناعي وأحدث تقنيات التعلم الرقمي لتقديم تجربة تعليمية استثنائية.",
    bio2:
      "أؤمن بأن التعليم هو أقوى أداة لتغيير العالم، وأن الذكاء الاصطناعي يمكنه جعل التعليم الجيد متاحاً للجميع بغض النظر عن موقعهم أو إمكانياتهم.",
    valuesTitle: "قيمي ومبادئي",
    values: [
      {
        icon: GraduationCap,
        title: "التعليم أولاً",
        desc: "كل قرار تقني أتخذه يبدأ بسؤال واحد: هل سيفيد المتعلم؟",
        color: "#00C2FF",
      },
      {
        icon: Lightbulb,
        title: "الابتكار المستمر",
        desc: "أسعى دائماً لإيجاد حلول جديدة لمشكلات تعليمية قديمة.",
        color: "#22C55E",
      },
      {
        icon: Target,
        title: "النتائج الملموسة",
        desc: "أقيس النجاح بتحسن أداء الطلاب وليس بعدد الميزات.",
        color: "#A855F7",
      },
      {
        icon: Heart,
        title: "الشغف بالتعليم",
        desc: "أبني School Smart Eye لأنني أؤمن حقاً بقدرة التعليم على تغيير الحياة.",
        color: "#F59E0B",
      },
    ],
    skillsTitle: "مهاراتي التقنية",
    skills: [
      { label: "React & TypeScript", pct: 92 },
      { label: "AI & Machine Learning", pct: 80 },
      { label: "UI/UX Design", pct: 85 },
      { label: "Node.js & Backend", pct: 75 },
      { label: "EdTech Architecture", pct: 88 },
    ],
    timelineTitle: "رحلتي",
    timeline: [
      { year: "2022", text: "بدأت رحلتي في تطوير الويب وتعلمت أساسيات البرمجة." },
      { year: "2023", text: "اكتشفت شغفي بالجمع بين التعليم والتكنولوجيا." },
      { year: "2024", text: "بدأت العمل على الفكرة الأولى لمنصة School Smart Eye." },
      { year: "2025", text: "أطلقت النسخة التجريبية الأولى وبدأت في جمع الملاحظات." },
      { year: "2026", text: "School Smart Eye الآن منصة متكاملة بالذكاء الاصطناعي." },
    ],
    ctaTitle: "هل تريد التواصل معي؟",
    ctaBtn: "تواصل الآن",
    featuresLink: "استكشف المميزات",
  },
  en: {
    backLabel: "Home",
    badge: "About Me",
    title: "Abdallah Rashad Oweina",
    subtitle: "Developer & Innovator in Digital Education",
    bio1:
      "I'm Abdallah Rashad Oweina, developer and creator of School Smart Eye — an intelligent education platform that combines AI with cutting-edge digital learning technologies to deliver an exceptional educational experience.",
    bio2:
      "I believe education is the most powerful tool for changing the world, and that AI can make quality education accessible to everyone regardless of their location or resources.",
    valuesTitle: "My Values & Principles",
    values: [
      {
        icon: GraduationCap,
        title: "Education First",
        desc: "Every technical decision I make starts with one question: will this benefit the learner?",
        color: "#00C2FF",
      },
      {
        icon: Lightbulb,
        title: "Continuous Innovation",
        desc: "I'm always looking for new solutions to old educational problems.",
        color: "#22C55E",
      },
      {
        icon: Target,
        title: "Tangible Results",
        desc: "I measure success by improved student performance, not feature count.",
        color: "#A855F7",
      },
      {
        icon: Heart,
        title: "Passion for Education",
        desc: "I build School Smart Eye because I genuinely believe in education's power to change lives.",
        color: "#F59E0B",
      },
    ],
    skillsTitle: "Technical Skills",
    skills: [
      { label: "React & TypeScript", pct: 92 },
      { label: "AI & Machine Learning", pct: 80 },
      { label: "UI/UX Design", pct: 85 },
      { label: "Node.js & Backend", pct: 75 },
      { label: "EdTech Architecture", pct: 88 },
    ],
    timelineTitle: "My Journey",
    timeline: [
      { year: "2022", text: "Started my web development journey and learned programming fundamentals." },
      { year: "2023", text: "Discovered my passion for combining education and technology." },
      { year: "2024", text: "Started working on the initial concept for School Smart Eye." },
      { year: "2025", text: "Launched the first beta and began collecting feedback." },
      { year: "2026", text: "School Smart Eye is now a full AI-powered platform." },
    ],
    ctaTitle: "Want to get in touch?",
    ctaBtn: "Contact Me",
    featuresLink: "Explore Features",
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

export default function AboutPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = content[lang];
  const isRtl = lang === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <>
      <title>About — School Smart Eye</title>
      <meta
        name="description"
        content="Learn about Abdallah Rashad Oweina, creator of School Smart Eye AI-powered education platform."
      />

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

        {/* Glow */}
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
            <Link to="/features" className="hidden md:inline-flex text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5">
              {lang === "ar" ? "المميزات" : "Features"}
            </Link>
            <Link to="/contact" className="hidden md:inline-flex text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5">
              {lang === "ar" ? "تواصل" : "Contact"}
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

        {/* ── Hero ── */}
        <section className="relative z-10 px-6 md:px-16 pt-20 pb-16 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" as const }}
              className="flex-shrink-0"
            >
              <div
                className="w-44 h-44 md:w-52 md:h-52 rounded-3xl flex items-center justify-center relative"
                style={{
                  border: "3px solid #00C2FF",
                  boxShadow: "0 0 48px #00C2FF33",
                  background: "linear-gradient(135deg, #0A2540, #0d3a5c)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-3xl opacity-20"
                  style={{ background: "radial-gradient(circle at 50% 50%, #00C2FF, transparent 70%)" }}
                />
                <span
                  className="text-5xl font-bold relative z-10"
                  style={{
                    fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                    background: "linear-gradient(90deg, #ffffff, #00C2FF, #22C55E)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                  }}
                >
                  AR
                </span>
              </div>
            </motion.div>

            {/* Text */}
            <div>
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
                <span
                  className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full border"
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
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{
                  fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                  background: "linear-gradient(90deg, #ffffff 0%, #00C2FF 60%, #22C55E 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {t.title}
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-white/50 text-base mb-6"
              >
                {t.subtitle}
              </motion.p>

              <motion.p
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-white/70 leading-relaxed mb-4 max-w-xl"
              >
                {t.bio1}
              </motion.p>

              <motion.p
                custom={4}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="text-white/55 leading-relaxed max-w-xl"
              >
                {t.bio2}
              </motion.p>
            </div>
          </div>
        </section>

        {/* ── Values ── */}
        <section className="relative z-10 px-6 md:px-16 py-16 max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="text-2xl md:text-3xl font-bold mb-10 text-center"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            {t.valuesTitle}
          </motion.h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {t.values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl p-5 border cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderColor: `${v.color}22`,
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${v.color}18`, border: `1px solid ${v.color}44` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: v.color }} />
                  </div>
                  <h3
                    className="font-semibold mb-2 text-sm"
                    style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)", color: v.color }}
                  >
                    {v.title}
                  </h3>
                  <p className="text-xs text-white/50 leading-relaxed">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Skills ── */}
        <section className="relative z-10 px-6 md:px-16 py-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="text-2xl md:text-3xl font-bold mb-10 text-center"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            {t.skillsTitle}
          </motion.h2>

          <div className="flex flex-col gap-5">
            {t.skills.map((skill, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {i === 0 && <Code2 className="w-4 h-4 opacity-50" />}
                    {i === 1 && <Cpu className="w-4 h-4 opacity-50" />}
                    {i > 1 && <div className="w-4 h-4" />}
                    <span className="text-sm font-medium text-white/80">{skill.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#00C2FF" }}>{skill.pct}%</span>
                </div>
                <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #00C2FF, #22C55E)" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: i * 0.1, ease: "easeOut" as const }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Timeline ── */}
        <section className="relative z-10 px-6 md:px-16 py-16 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" as const }}
            className="text-2xl md:text-3xl font-bold mb-12 text-center"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            {t.timelineTitle}
          </motion.h2>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute top-0 bottom-0 w-px"
              style={{
                background: "linear-gradient(to bottom, #00C2FF44, transparent)",
                [isRtl ? "right" : "left"]: "20px",
              }}
            />

            <div className="flex flex-col gap-8">
              {t.timeline.map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="flex items-start gap-6"
                  style={{ paddingInlineStart: "52px" }}
                >
                  {/* Dot */}
                  <div
                    className="absolute w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: "#00C2FF18",
                      border: "2px solid #00C2FF66",
                      color: "#00C2FF",
                      [isRtl ? "right" : "left"]: "0px",
                      fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                    }}
                  >
                    {item.year.slice(2)}
                  </div>

                  <div>
                    <span
                      className="text-xs font-bold tracking-widest mb-1 block"
                      style={{ color: "#00C2FF" }}
                    >
                      {item.year}
                    </span>
                    <p className="text-white/65 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
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
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 32px #00C2FF66" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{ background: "#00C2FF", color: "#001F3F" }}
                >
                  {t.ctaBtn}
                </motion.button>
              </Link>
              <Link to="/features">
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.12)" }}
                  whileTap={{ scale: 0.97 }}
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-white/30 text-white transition-all duration-200"
                >
                  {t.featuresLink}
                </motion.button>
              </Link>
            </div>
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
