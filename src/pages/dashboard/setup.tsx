import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function DashboardSetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json() as { error?: string; success?: boolean };
      if (!res.ok) {
        setError(data.error ?? "حدث خطأ");
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/dashboard/login"), 2000);
      }
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "radial-gradient(ellipse at 60% 0%, #22C55E0a 0%, transparent 60%), #060f1e",
      }}
    >
      <title>إعداد حساب المدير — School Smart Eye</title>

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,194,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,194,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{
              background: "linear-gradient(135deg, #22C55E18, #00C2FF18)",
              border: "1.5px solid #22C55E44",
              boxShadow: "0 0 32px #22C55E18",
            }}
          >
            👁️
          </div>
          <h1
            className="text-xl font-bold text-white"
            style={{ fontFamily: "var(--font-heading, 'Space Grotesk', sans-serif)" }}
          >
            School Smart <span style={{ color: "#00C2FF" }}>Eye</span>
          </h1>
          <p className="text-xs text-white/40 mt-1">إعداد حساب المدير الأول</p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "#22C55E18", border: "1px solid #22C55E44" }}>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm font-bold text-white">تم إنشاء الحساب بنجاح!</p>
              <p className="text-xs text-white/40">جارٍ التوجيه لصفحة الدخول...</p>
            </motion.div>
          ) : (
            <>
              <h2 className="text-base font-bold text-white mb-1">إنشاء حساب المدير</h2>
              <p className="text-xs text-white/35 mb-6">أنشئ حسابك للوصول للوحة التحكم</p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/50">الاسم الكامل</label>
                  <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${name ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.08)"}` }}>
                    <User className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="مدير المدرسة" required
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none" />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/50">البريد الإلكتروني</label>
                  <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${email ? "rgba(0,194,255,0.4)" : "rgba(255,255,255,0.08)"}` }}>
                    <Mail className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@school.edu" required
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none" />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-white/50">كلمة المرور</label>
                  <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${password ? "rgba(0,194,255,0.4)" : "rgba(255,255,255,0.08)"}` }}>
                    <Lock className="w-4 h-4 text-white/30 flex-shrink-0" />
                    <input type={showPassword ? "text" : "password"} value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="8 أحرف على الأقل" required minLength={8}
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/20 outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-white/25 hover:text-white/60 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                    style={{ background: "#EF444418", border: "1px solid #EF444440" }}>
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </motion.div>
                )}

                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold mt-1"
                  style={{
                    background: loading ? "rgba(34,197,94,0.2)" : "linear-gradient(135deg, #22C55E, #16a34a)",
                    color: "white",
                    boxShadow: loading ? "none" : "0 4px 20px #22C55E30",
                  }}>
                  {loading ? (
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/60"
                          animate={{ opacity: [0.3,1,0.3], y: [0,-3,0] }}
                          transition={{ duration: 0.6, delay: i*0.12, repeat: Infinity }} />
                      ))}
                    </div>
                  ) : (
                    <>إنشاء الحساب <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-5 flex flex-col gap-2">
          <Link to="/dashboard/login" className="text-xs text-white/25 hover:text-white/50 transition-colors">
            لديك حساب بالفعل؟ سجّل الدخول
          </Link>
          <Link to="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            ← العودة للموقع
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
