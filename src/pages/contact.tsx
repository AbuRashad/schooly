import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronRight, Mail, MessageSquare, User, Send, Github, Linkedin, Twitter, CheckCircle2 } from "lucide-react";

type Lang = "ar" | "en";

const content = {
  ar: {
    backLabel: "الرئيسية",
    badge: "تواصل معي",
    title: "يسعدني سماعك",
    subtitle: "سواء كان لديك سؤال عن المنصة، أو فكرة للتعاون، أو مجرد تريد أن تقول مرحباً — أنا هنا.",
    form: {
      name: "الاسم الكامل",
      namePlaceholder: "أدخل اسمك",
      email: "البريد الإلكتروني",
      emailPlaceholder: "example@email.com",
      subject: "الموضوع",
      subjectPlaceholder: "كيف يمكنني مساعدتك؟",
      message: "الرسالة",
      messagePlaceholder: "اكتب رسالتك هنا...",
      send: "إرسال الرسالة",
      sending: "جارٍ الإرسال...",
      success: "تم إرسال رسالتك بنجاح! سأرد عليك قريباً.",
    },
    infoTitle: "معلومات التواصل",
    info: [
      { icon: Mail, label: "البريد الإلكتروني", value: "abdallah@ictmaster.app" },
      { icon: MessageSquare, label: "الرد المعتاد", value: "خلال 24 ساعة" },
    ],
    socialTitle: "تابعني على",
    subjects: ["سؤال عام", "اقتراح ميزة", "تعاون", "دعم تقني", "أخرى"],
  },
  en: {
    backLabel: "Home",
    badge: "Contact",
    title: "I'd love to hear from you",
    subtitle: "Whether you have a question about the platform, an idea for collaboration, or just want to say hello — I'm here.",
    form: {
      name: "Full Name",
      namePlaceholder: "Enter your name",
      email: "Email Address",
      emailPlaceholder: "example@email.com",
      subject: "Subject",
      subjectPlaceholder: "How can I help you?",
      message: "Message",
      messagePlaceholder: "Write your message here...",
      send: "Send Message",
      sending: "Sending...",
      success: "Your message was sent successfully! I'll get back to you soon.",
    },
    infoTitle: "Contact Info",
    info: [
      { icon: Mail, label: "Email", value: "abdallah@ictmaster.app" },
      { icon: MessageSquare, label: "Typical reply", value: "Within 24 hours" },
    ],
    socialTitle: "Follow me on",
    subjects: ["General question", "Feature suggestion", "Collaboration", "Technical support", "Other"],
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

const inputClass =
  "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 focus:ring-2";
const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
};
const inputFocusRing = "focus:ring-[#00C2FF44]";

export default function ContactPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = content[lang];
  const isRtl = lang === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <>
      <title>Contact — School Smart Eye</title>
      <meta name="description" content="Get in touch with Abdallah Rashad Oweina, creator of School Smart Eye." />

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
            <Link to="/about" className="hidden md:inline-flex text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5">
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

        {/* ── Hero ── */}
        <section className="relative z-10 text-center px-6 md:px-16 pt-20 pb-12 max-w-3xl mx-auto">
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
            className="text-4xl md:text-6xl font-bold leading-tight mb-5"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            {t.title}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-white/50 text-lg leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </section>

        {/* ── Main Content ── */}
        <section className="relative z-10 px-6 md:px-16 pb-24 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 items-start">

            {/* ── Form ── */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="md:col-span-3 rounded-3xl p-8 border"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(0,194,255,0.15)",
              }}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut" as const }}
                  className="flex flex-col items-center justify-center py-16 text-center gap-5"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: "#22C55E18", border: "2px solid #22C55E44" }}
                  >
                    <CheckCircle2 className="w-8 h-8" style={{ color: "#22C55E" }} />
                  </div>
                  <p
                    className="text-lg font-semibold"
                    style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
                  >
                    {t.form.success}
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4"
                  >
                    {lang === "ar" ? "إرسال رسالة أخرى" : "Send another message"}
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {/* Name + Email row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {t.form.name}
                      </label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder={t.form.namePlaceholder}
                        className={`${inputClass} ${inputFocusRing}`}
                        style={inputStyle}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {t.form.email}
                      </label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder={t.form.emailPlaceholder}
                        className={`${inputClass} ${inputFocusRing}`}
                        style={inputStyle}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white/60">
                      {t.form.subject}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {t.subjects.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setForm({ ...form, subject: s })}
                          className="text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 font-medium"
                          style={
                            form.subject === s
                              ? { background: "#00C2FF22", borderColor: "#00C2FF", color: "#00C2FF" }
                              : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)" }
                          }
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-white/60 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {t.form.message}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder={t.form.messagePlaceholder}
                      className={`${inputClass} ${inputFocusRing} resize-none`}
                      style={inputStyle}
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.02, boxShadow: "0 0 28px #00C2FF55" } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60"
                    style={{ background: "#00C2FF", color: "#001F3F" }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        {t.form.sending}
                      </span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t.form.send}
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* ── Sidebar ── */}
            <motion.div
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="md:col-span-2 flex flex-col gap-5"
            >
              {/* Info card */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(0,194,255,0.12)" }}
              >
                <h3
                  className="font-bold mb-5 text-sm"
                  style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)", color: "#00C2FF" }}
                >
                  {t.infoTitle}
                </h3>
                <div className="flex flex-col gap-4">
                  {t.info.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "#00C2FF14", border: "1px solid #00C2FF30" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: "#00C2FF" }} />
                        </div>
                        <div>
                          <p className="text-xs text-white/40">{item.label}</p>
                          <p className="text-sm font-medium text-white/85">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Social card */}
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(0,194,255,0.12)" }}
              >
                <h3
                  className="font-bold mb-5 text-sm"
                  style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)", color: "#00C2FF" }}
                >
                  {t.socialTitle}
                </h3>
                <div className="flex gap-3">
                  {[
                    { icon: Github, label: "GitHub", href: "#" },
                    { icon: Linkedin, label: "LinkedIn", href: "#" },
                    { icon: Twitter, label: "Twitter", href: "#" },
                  ].map(({ icon: Icon, label, href }) => (
                    <motion.a
                      key={label}
                      href={href}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                      aria-label={label}
                    >
                      <Icon className="w-4 h-4 text-white/70" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Avatar card */}
              <div
                className="rounded-2xl p-6 border flex items-center gap-4"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(34,197,94,0.15)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
                  style={{
                    background: "linear-gradient(135deg, #0A2540, #0d3a5c)",
                    border: "2px solid #00C2FF66",
                    color: "#00C2FF",
                    fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
                  }}
                >
                  AR
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">Abdallah Rashad Oweina</p>
                  <p className="text-xs text-white/40">School Smart Eye · Founder</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="relative z-10 text-center text-white/30 text-sm pb-8 pt-4 border-t border-white/10">
          © 2026 School Smart Eye
        </footer>
      </div>
    </>
  );
}
