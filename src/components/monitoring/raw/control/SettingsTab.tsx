import { useCallback, useEffect, useState } from "react";
import { Save, RefreshCw, SlidersHorizontal } from "lucide-react";
import type { SystemSettings } from "@/types/monitoring";
import { api } from "./api";
import { Field, inputCls, type Flash } from "./ui";

export function SettingsTab({ flash }: { flash: Flash }) {
  const [current, setCurrent] = useState<SystemSettings | null>(null);
  const [draft, setDraft] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    try {
      const s = await api<SystemSettings>("/settings");
      setCurrent(s);
      setDraft(s);
    } catch (e) {
      flash("err", `فشل تحميل الإعدادات: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => { reload(); }, [reload]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setBusy(true);
    try {
      const updated = await api<SystemSettings>("/settings", {
        method: "PATCH",
        body: JSON.stringify(draft),
      });
      setCurrent(updated);
      setDraft(updated);
      flash("ok", "تم حفظ الإعدادات — مطبَّقة فوراً");
    } catch (e) {
      flash("err", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="rounded-2xl border border-white/10 bg-panel/60 px-4 py-8 text-center text-sm text-mist/60">
        جارٍ تحميل الإعدادات…
      </div>
    );
  }

  const dirty = current && JSON.stringify(current) !== JSON.stringify(draft);

  const set = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) =>
    setDraft({ ...draft, [key]: value });

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-panel/60 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4 text-cobalt" /> استيعاب الكاميرات
        </h3>
        <p className="mt-1 text-xs text-mist/60">
          التغييرات تُطبَّق على الكاميرات المسجلة حديثاً (العمال الحاليون يحتفظون بإعداداتهم).
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="الحد الأقصى للإطارات/ث" hint="0.5 — 60">
            <input
              type="number" step="0.5" min={0.5} max={60}
              value={draft.camera_max_fps}
              onChange={(e) => set("camera_max_fps", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="جودة JPEG" hint="10 — 100">
            <input
              type="number" min={10} max={100}
              value={draft.camera_jpeg_quality}
              onChange={(e) => set("camera_jpeg_quality", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="ثواني إعادة الاتصال" hint="التأخير قبل إعادة المحاولة عند انقطاع الاتصال">
            <input
              type="number" step="0.5" min={0.5} max={120}
              value={draft.camera_reconnect_seconds}
              onChange={(e) => set("camera_reconnect_seconds", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-mist/80">
          <input
            type="checkbox"
            checked={draft.camera_anonymize_faces}
            onChange={(e) => set("camera_anonymize_faces", e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-white/10 text-cobalt"
          />
          إخفاء الوجه مُفعَّل افتراضياً (الوحدة 14 — الحوكمة العربية)
        </label>
      </div>

      <div className="rounded-2xl border border-white/10 bg-panel/60 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
          <SlidersHorizontal className="h-4 w-4 text-cobalt" /> السلامة والاحتفاظ
        </h3>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="معيار SSI" hint="الهدف لمؤشر سلامة المدرسة">
            <input
              type="number" step="0.1" min={0} max={100}
              value={draft.ssi_benchmark}
              onChange={(e) => set("ssi_benchmark", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="مدة الاحتفاظ بالفيديو (ساعة)" hint="الحد الأقصى 720 (30 يوماً)">
            <input
              type="number" min={1} max={720}
              value={draft.video_ttl_hours}
              onChange={(e) => set("video_ttl_hours", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
          <Field label="حد البطارية المنخفضة %" hint="دون هذه النسبة تظهر تحذيرات">
            <input
              type="number" min={1} max={99}
              value={draft.bracelet_low_battery_percent}
              onChange={(e) => set("bracelet_low_battery_percent", Number(e.target.value))}
              className={inputCls}
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={reload}
          disabled={busy}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-mist/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" /> استعادة
        </button>
        <button
          type="submit"
          disabled={busy || !dirty}
          className="flex items-center gap-2 rounded-xl bg-cobalt px-5 py-2 text-sm font-semibold text-white transition hover:bg-cobalt/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {dirty ? "حفظ التغييرات" : "محفوظ"}
        </button>
      </div>
    </form>
  );
}
