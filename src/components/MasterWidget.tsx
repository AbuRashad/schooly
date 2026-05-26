import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Minimize2, User, Sparkles, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Role = "user" | "model";

interface Message {
  id: string;
  role: Role;
  text: string;
  loading?: boolean;
}

const WELCOME: Record<string, string> = {
  ar: "أهلاً! أنا آي 👁️\nمساعدك الذكي من School Smart Eye.\nاسألني عن إدارة المدارس، الحضور، التقارير، أو أي شيء تعليمي!",
  en: "Hey! I'm Eye 👁️\nYour AI assistant from School Smart Eye.\nAsk me about school management, attendance, reports, or anything education!",
};

const SUGGESTIONS: Record<string, string[]> = {
  ar: ["كيف أتابع حضور الطلاب؟", "كيف أحلل نتائج الطلاب؟", "ما مميزات المنصة؟"],
  en: ["How do I track student attendance?", "How to analyze student results?", "What are the platform features?"],
};

const UI: Record<string, Record<string, string>> = {
  ar: {
    placeholder: "اسأل آي...",
    error: "حدث خطأ، حاول مرة أخرى!",
    clear: "مسح",
    open: "اسأل آي",
  },
  en: {
    placeholder: "Ask Eye...",
    error: "Something went wrong, try again!",
    clear: "Clear",
    open: "Ask Eye",
  },
};

interface MasterWidgetProps {
  lang?: "ar" | "en";
}

export default function MasterWidget({ lang = "ar" }: MasterWidgetProps) {
  const isRtl = lang === "ar";
  const ui = UI[lang];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "model", text: WELCOME[lang] },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset on lang change
  useEffect(() => {
    setMessages([{ id: "welcome", role: "model", text: WELCOME[lang] }]);
  }, [lang]);

  useEffect(() => {
    if (open) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: text.trim() };
    const loadingMsg: Message = { id: "loading", role: "model", text: "", loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" && !m.loading)
        .map((m) => ({ role: m.role, text: m.text }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang }),
      });

      const data = (await res.json()) as { text?: string; error?: string };

      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({
            id: Date.now().toString() + "-model",
            role: "model",
            text: data.text ?? ui.error,
          })
      );
    } catch {
      setMessages((prev) =>
        prev
          .filter((m) => m.id !== "loading")
          .concat({ id: Date.now().toString() + "-err", role: "model", text: ui.error })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () =>
    setMessages([{ id: "welcome", role: "model", text: WELCOME[lang] }]);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed bottom-6 z-50"
      style={{ [isRtl ? "left" : "right"]: "24px" }}
    >
      {/* ── Chat panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.22, ease: "easeOut" as const }}
            className="mb-4 flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: "340px",
              height: "480px",
              background: "linear-gradient(160deg, #0d2a45 0%, #001F3F 100%)",
              border: "1px solid rgba(0,194,255,0.2)",
              boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,194,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #00C2FF22, #22C55E22)",
                    border: "1.5px solid #00C2FF55",
                  }}
                >
                  👁️
                </div>
                <div>
                  <p
                    className="text-sm font-bold leading-none text-white"
                    style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
                  >
                    آي · Eye
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    <span className="text-[10px] text-white/40">School Smart Eye AI</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearChat}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                  title={ui.clear}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" as const }}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-xs"
                      style={
                        msg.role === "model"
                          ? {
                              background: "linear-gradient(135deg, #00C2FF22, #22C55E22)",
                              border: "1px solid #00C2FF44",
                            }
                          : {
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }
                      }
                    >
                      {msg.role === "model" ? "👁️" : <User className="w-3 h-3 text-white/60" />}
                    </div>

                    {/* Bubble */}
                    <div
                      className="max-w-[82%] rounded-xl px-3 py-2 text-xs leading-relaxed"
                      style={
                        msg.role === "model"
                          ? {
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(0,194,255,0.12)",
                              borderStartStartRadius: "4px",
                              color: "rgba(255,255,255,0.85)",
                            }
                          : {
                              background: "#00C2FF",
                              color: "#001F3F",
                              borderEndEndRadius: "4px",
                              fontWeight: 500,
                            }
                      }
                    >
                      {msg.loading ? (
                        <div className="flex items-center gap-1 py-0.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              className="w-1 h-1 rounded-full"
                              style={{ background: "#00C2FF" }}
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                              transition={{ duration: 0.7, delay: i * 0.15, repeat: Infinity }}
                            />
                          ))}
                        </div>
                      ) : msg.role === "model" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-1 last:mb-0 whitespace-pre-wrap">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold" style={{ color: "#00C2FF" }}>{children}</strong>,
                            em: ({ children }) => <em className="italic text-white/70">{children}</em>,
                            code: ({ children }) => (
                              <code
                                className="px-1 py-0.5 rounded text-[10px] font-mono"
                                style={{ background: "rgba(0,194,255,0.12)", color: "#00C2FF" }}
                              >
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre
                                className="rounded-lg p-2 my-1 overflow-x-auto text-[10px] font-mono leading-relaxed"
                                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,194,255,0.15)" }}
                              >
                                {children}
                              </pre>
                            ),
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1">{children}</ol>,
                            li: ({ children }) => <li className="text-white/80">{children}</li>,
                            h1: ({ children }) => <h1 className="font-bold text-sm mb-1" style={{ color: "#00C2FF" }}>{children}</h1>,
                            h2: ({ children }) => <h2 className="font-bold text-xs mb-1" style={{ color: "#00C2FF" }}>{children}</h2>,
                            h3: ({ children }) => <h3 className="font-semibold text-xs mb-1 text-white/90">{children}</h3>,
                            blockquote: ({ children }) => (
                              <blockquote
                                className="border-s-2 ps-2 my-1 text-white/60 italic"
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

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                {SUGGESTIONS[lang].map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-150 hover:border-[#00C2FF] hover:text-white text-white/45"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              className="px-3 pb-3 pt-2 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,194,255,0.18)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage(input);
                  }}
                  placeholder={ui.placeholder}
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-xs text-white placeholder-white/25 outline-none disabled:opacity-50"
                />
                <motion.button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  whileHover={input.trim() && !isLoading ? { scale: 1.1 } : {}}
                  whileTap={input.trim() && !isLoading ? { scale: 0.9 } : {}}
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:opacity-30"
                  style={{ background: "#00C2FF", color: "#001F3F" }}
                >
                  <Send className="w-3 h-3" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FAB button ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08, boxShadow: "0 0 32px #00C2FF66" }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2.5 px-4 py-3 rounded-2xl font-bold text-sm shadow-lg transition-all duration-200"
        style={{
          background: open
            ? "rgba(255,255,255,0.1)"
            : "linear-gradient(135deg, #00C2FF, #0065ff)",
          color: open ? "rgba(255,255,255,0.7)" : "#001F3F",
          border: open ? "1px solid rgba(255,255,255,0.2)" : "none",
          boxShadow: open ? "none" : "0 4px 24px rgba(0,194,255,0.4)",
          fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {ui.open}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
