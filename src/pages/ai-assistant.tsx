import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, ChevronRight, Send, User, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Lang = "ar" | "en";
type Role = "user" | "model";

interface Message {
  id: string;
  role: Role;
  text: string;
  loading?: boolean;
}

const content = {
  ar: {
    backLabel: "الرئيسية",
    badge: "مدعوم بـ Gemini AI",
    title: "آي · Eye",
    subtitle: "مساعدك الذكي لإدارة المدارس — اسألني عن الحضور، التقارير، والأداء الأكاديمي",
    placeholder: "اسأل آي...",
    send: "إرسال",
    clear: "مسح المحادثة",
    thinking: "آي يفكر...",
    welcome: "أهلاً! أنا آي 👁️\nمساعدك الذكي من منصة School Smart Eye.\n\nأنا هنا أساعدك في إدارة المدرسة، تتبع الحضور، تحليل نتائج الطلاب، وكل ما يخص البيئة التعليمية. اسألني بدون تردد!",
    suggestions: [
      "كيف أتابع حضور الطلاب؟",
      "كيف أحلل نتائج الطلاب؟",
      "ما مميزات School Smart Eye؟",
      "كيف أرسل تقارير للأولياء؟",
    ],
    error: "عذراً، حدث خطأ. حاول مرة أخرى!",
    poweredBy: "آي · مساعد School Smart Eye الذكي",
  },
  en: {
    backLabel: "Home",
    badge: "Powered by Gemini AI",
    title: "Eye · AI Assistant",
    subtitle: "Your smart school management assistant — ask about attendance, reports & performance",
    placeholder: "Ask Eye anything...",
    send: "Send",
    clear: "Clear chat",
    thinking: "Eye is thinking...",
    welcome: "Hello! I'm Eye 👁️\nYour AI assistant from School Smart Eye platform.\n\nI'm here to help you with school management, attendance tracking, student performance analysis, and everything related to your educational environment. Ask away!",
    suggestions: [
      "How do I track student attendance?",
      "How to analyze student results?",
      "What are School Smart Eye features?",
      "How to send reports to parents?",
    ],
    error: "Sorry, something went wrong. Please try again!",
    poweredBy: "Eye · School Smart Eye AI Assistant",
  },
};

export default function AIAssistantPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = content[lang];
  const isRtl = lang === "ar";
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "model", text: t.welcome },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update welcome message when lang changes
  useEffect(() => {
    setMessages([{ id: "welcome", role: "model", text: content[lang].welcome }]);
  }, [lang]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    const loadingMsg: Message = { id: "loading", role: "model", text: "", loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history excluding welcome + loading
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" && !m.loading)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang }),
      });

      const data = await res.json() as { text?: string; error?: string };

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({
            id: Date.now().toString() + "-model",
            role: "model",
            text: data.text ?? t.error,
          })
      );
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({ id: Date.now().toString() + "-err", role: "model", text: t.error })
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{ id: "welcome", role: "model", text: t.welcome }]);
    setInput("");
  };

  return (
    <>
      <title>AI Assistant — School Smart Eye</title>
      <meta name="description" content="School Smart Eye AI-powered educational assistant powered by Google Gemini." />

      <div
        dir={isRtl ? "rtl" : "ltr"}
        className="h-screen flex flex-col text-white font-sans relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0A2540 0%, #001F3F 100%)" }}
      >
        {/* Grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#00C2FF 1px, transparent 1px), linear-gradient(90deg, #00C2FF 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* ── Navbar ── */}
        <nav className="relative z-10 flex justify-between items-center px-4 md:px-8 py-4 border-b border-white/10 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
          >
            <BackIcon className="w-4 h-4" />
            {t.backLabel}
          </Link>

          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
              style={{
                background: "linear-gradient(135deg, #00C2FF22, #22C55E22)",
                border: "1.5px solid #00C2FF55",
              }}
            >
              👁️
            </div>
            <div>
              <span
                className="text-base font-bold block leading-none"
                style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
              >
                {t.title}
              </span>
              <span className="text-[10px] text-white/35 leading-none">School Smart Eye</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="hidden md:flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs px-3 py-1.5"
              title={t.clear}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {t.clear}
            </button>
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200"
            >
              {lang === "ar" ? "EN" : "AR"}
              <ChevronRight className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </nav>

        {/* ── Hero strip ── */}
        <div className="relative z-10 text-center py-4 px-4 flex-shrink-0 border-b border-white/5">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#00C2FF" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#00C2FF" }}>
              {t.badge}
            </span>
          </div>
          <p className="text-white/35 text-xs">{t.subtitle}</p>
        </div>

        {/* ── Messages ── */}
        <div className="relative z-10 flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-3xl mx-auto flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" as const }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-base"
                    style={
                      msg.role === "model"
                        ? {
                            background: "linear-gradient(135deg, #00C2FF22, #22C55E22)",
                            border: "1.5px solid #00C2FF55",
                          }
                        : { background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }
                    }
                  >
                    {msg.role === "model" ? (
                      <span>👁️</span>
                    ) : (
                      <User className="w-4 h-4 text-white/70" />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={
                      msg.role === "model"
                        ? {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(0,194,255,0.15)",
                            borderStartStartRadius: "4px",
                          }
                        : {
                            background: "#00C2FF",
                            color: "#001F3F",
                            borderEndEndRadius: "4px",
                          }
                    }
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-1.5 py-0.5">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: "#00C2FF" }}
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 0.8, delay: i * 0.15, repeat: Infinity }}
                          />
                        ))}
                      </div>
                    ) : msg.role === "model" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 whitespace-pre-wrap">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold" style={{ color: "#00C2FF" }}>{children}</strong>,
                          em: ({ children }) => <em className="italic text-white/70">{children}</em>,
                          code: ({ children }) => (
                            <code
                              className="px-1.5 py-0.5 rounded text-xs font-mono"
                              style={{ background: "rgba(0,194,255,0.12)", color: "#00C2FF" }}
                            >
                              {children}
                            </code>
                          ),
                          pre: ({ children }) => (
                            <pre
                              className="rounded-xl p-3 my-2 overflow-x-auto text-xs font-mono leading-relaxed"
                              style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,194,255,0.18)" }}
                            >
                              {children}
                            </pre>
                          ),
                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                          li: ({ children }) => <li className="text-white/80">{children}</li>,
                          h1: ({ children }) => <h1 className="font-bold text-base mb-2" style={{ color: "#00C2FF" }}>{children}</h1>,
                          h2: ({ children }) => <h2 className="font-bold text-sm mb-1.5" style={{ color: "#00C2FF" }}>{children}</h2>,
                          h3: ({ children }) => <h3 className="font-semibold text-sm mb-1 text-white/90">{children}</h3>,
                          blockquote: ({ children }) => (
                            <blockquote
                              className="border-s-2 ps-3 my-2 text-white/60 italic"
                              style={{ borderColor: "#00C2FF55" }}
                            >
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Suggestions ── */}
        {messages.length <= 1 && (
          <div className="relative z-10 px-4 md:px-8 pb-3 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex flex-wrap gap-2 justify-center">
              {t.suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 hover:border-[#00C2FF] hover:text-white text-white/50"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.12)" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Input ── */}
        <div className="relative z-10 px-4 md:px-8 pb-6 pt-3 flex-shrink-0 border-t border-white/10">
          <div className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-3 rounded-2xl px-4 py-3"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,194,255,0.2)",
              }}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.placeholder}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none resize-none max-h-32 leading-relaxed disabled:opacity-50"
                style={{ minHeight: "24px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
              <motion.button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                whileHover={input.trim() && !isLoading ? { scale: 1.08 } : {}}
                whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30"
                style={{ background: "#00C2FF", color: "#001F3F" }}
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
            <p className="text-center text-white/20 text-xs mt-2">
              {t.poweredBy}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
