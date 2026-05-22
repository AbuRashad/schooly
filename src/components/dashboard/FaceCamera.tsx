import { useRef, useEffect, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { CameraOff, Loader2, Camera, CheckCircle, XCircle } from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

export interface RecognizedFace {
  studentId: number;
  name: string;
  class: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
}

interface Props {
  mode: 'register' | 'scan';
  registerStudentId?: number;
  registerStudentName?: string;
  onRegistered?: () => void;
  onRecognized?: (face: RecognizedFace) => void;
}

type LoadState = 'idle' | 'loading-models' | 'starting-camera' | 'ready' | 'error';

function playBeep(freq = 880, duration = 120) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch { /* ignore */ }
}

function drawCorners(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, progress = 1, lw = 3
) {
  const size = Math.min(w, h) * 0.22 * progress;
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  const arms: [number, number, number, number, number, number][] = [
    [x, y + size, x, y, x + size, y],
    [x + w - size, y, x + w, y, x + w, y + size],
    [x + w, y + h - size, x + w, y + h, x + w - size, y + h],
    [x + size, y + h, x, y + h, x, y + h - size],
  ];
  for (const [x1, y1, x2, y2, x3, y3] of arms) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();
  }
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  color: string, alpha: number
) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 24 * alpha;
  ctx.strokeStyle = color.replace(')', `,${alpha * 0.5})`).replace('rgb', 'rgba');
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

export default function FaceCamera({
  mode,
  registerStudentId,
  registerStudentName,
  onRegistered,
  onRecognized,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const inferRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation state in refs (no re-render needed)
  const animState = useRef({
    scanY: 0,
    scanDir: 1 as 1 | -1,
    box: null as { x: number; y: number; w: number; h: number } | null,
    cornerProg: 0,        // 0→1 bracket open animation
    flashAlpha: 0,        // recognition flash
    flashColor: '#22C55E',
    label: '',
    labelColor: '#00C2FF',
    glow: 0,
    cooldownUntil: 0,
    t: 0,
  });

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [captureResult, setCaptureResult] = useState<'success' | 'error' | null>(null);
  const [captureMsg, setCaptureMsg] = useState('');

  const loadModels = useCallback(async () => {
    if (modelsLoaded) return true;
    setLoadState('loading-models');
    setStatusMsg('جارٍ تحميل نماذج الذكاء الاصطناعي...');
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
      setModelsLoaded(true);
      return true;
    } catch {
      setLoadState('error');
      setStatusMsg('فشل تحميل النماذج. تحقق من الاتصال بالإنترنت.');
      return false;
    }
  }, [modelsLoaded]);

  const startCamera = useCallback(async () => {
    const ok = await loadModels();
    if (!ok) return;
    setLoadState('starting-camera');
    setStatusMsg('جارٍ تشغيل الكاميرا...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setLoadState('ready');
      setStatusMsg('');
    } catch {
      setLoadState('error');
      setStatusMsg('لا يمكن الوصول إلى الكاميرا. تأكد من منح الإذن.');
    }
  }, [loadModels]);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (inferRef.current) clearInterval(inferRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── Canvas animation loop ──────────────────────────────────────────
  useEffect(() => {
    if (loadState !== 'ready') return;

    function draw() {
      rafRef.current = requestAnimationFrame(draw);
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || !video.videoWidth) return;

      const vw = video.videoWidth;
      const vh = video.videoHeight;
      canvas.width = vw;
      canvas.height = vh;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, vw, vh);

      const st = animState.current;
      st.t += 0.016;

      // ── scan line ──────────────────────────────────────────────────
      st.scanY += st.scanDir * 1.8;
      if (st.scanY > vh) st.scanDir = -1;
      if (st.scanY < 0) st.scanDir = 1;

      const scanGrad = ctx.createLinearGradient(0, st.scanY - 10, 0, st.scanY + 10);
      scanGrad.addColorStop(0, 'rgba(0,194,255,0)');
      scanGrad.addColorStop(0.5, 'rgba(0,194,255,0.35)');
      scanGrad.addColorStop(1, 'rgba(0,194,255,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, st.scanY - 10, vw, 20);

      // ── subtle grid overlay ────────────────────────────────────────
      ctx.strokeStyle = 'rgba(0,194,255,0.04)';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let gx = 0; gx < vw; gx += gridSize) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, vh); ctx.stroke();
      }
      for (let gy = 0; gy < vh; gy += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(vw, gy); ctx.stroke();
      }

      // ── guide oval (no face) ───────────────────────────────────────
      if (!st.box) {
        const pulse = 0.4 + 0.15 * Math.sin(st.t * 2);
        ctx.strokeStyle = `rgba(0,194,255,${pulse})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.ellipse(vw / 2, vh * 0.45, vw * 0.18, vh * 0.26, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      const { x, y, w, h } = st.box;
      const pad = 10;
      const bx = x - pad, by = y - pad, bw = w + pad * 2, bh = h + pad * 2;

      // Animate corner brackets in
      st.cornerProg = Math.min(1, st.cornerProg + 0.08);

      // Glow pulse
      if (st.glow > 0) {
        st.glow = Math.max(0, st.glow - 0.02);
        drawGlow(ctx, bx, by, bw, bh, st.flashColor, st.glow);
      }

      // Flash overlay
      if (st.flashAlpha > 0) {
        ctx.fillStyle = st.flashColor.replace(')', `,${st.flashAlpha * 0.15})`).replace('rgb', 'rgba');
        if (!st.flashColor.startsWith('rgb')) {
          // hex color — use simple approach
          ctx.globalAlpha = st.flashAlpha * 0.15;
          ctx.fillStyle = st.flashColor;
          ctx.fillRect(bx, by, bw, bh);
          ctx.globalAlpha = 1;
        }
        st.flashAlpha = Math.max(0, st.flashAlpha - 0.03);
      }

      // Corner brackets
      drawCorners(ctx, bx, by, bw, bh, st.labelColor, st.cornerProg, 3);

      // Label background + text
      if (st.label) {
        ctx.font = 'bold 13px "Segoe UI", Arial';
        const metrics = ctx.measureText(st.label);
        const lw2 = metrics.width + 16;
        const lh = 22;
        const lx = bx + bw / 2 - lw2 / 2;
        const ly = by - lh - 6;

        ctx.fillStyle = 'rgba(6,15,30,0.85)';
        roundRect(ctx, lx, ly, lw2, lh, 6);
        ctx.fill();
        ctx.strokeStyle = st.labelColor;
        ctx.lineWidth = 1;
        roundRect(ctx, lx, ly, lw2, lh, 6);
        ctx.stroke();

        ctx.fillStyle = st.labelColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(st.label, lx + lw2 / 2, ly + lh / 2);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      }

      // Confidence arc (bottom-right of box)
      if (st.label.includes('%')) {
        const pct = parseInt(st.label.match(/(\d+)%/)?.[1] ?? '0') / 100;
        const arcX = bx + bw - 18;
        const arcY = by + bh + 18;
        ctx.beginPath();
        ctx.arc(arcX, arcY, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
        ctx.strokeStyle = st.labelColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(arcX, arcY, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loadState]);

  // ── Inference loop (scan mode) ────────────────────────────────────
  useEffect(() => {
    if (mode !== 'scan' || loadState !== 'ready') return;

    let descriptors: { studentId: number; name: string; class: string; descriptor: Float32Array }[] = [];

    fetch('/api/dashboard/face/descriptors')
      .then(r => r.json())
      .then(d => {
        descriptors = (d.descriptors ?? []).map((x: { studentId: number; name: string; class: string; descriptor: number[] }) => ({
          ...x,
          descriptor: new Float32Array(x.descriptor),
        }));
      });

    const THRESHOLD = 0.52;
    const COOLDOWN_MS = 4000;

    inferRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        const detection = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.42 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        const st = animState.current;

        if (!detection) {
          st.box = null;
          st.cornerProg = 0;
          st.label = '';
          return;
        }

        const b = detection.detection.box;
        st.box = { x: b.x, y: b.y, w: b.width, h: b.height };

        if (!descriptors.length) {
          st.label = 'لا توجد بصمات';
          st.labelColor = '#F97316';
          return;
        }

        let best = { studentId: 0, name: '', class: '', dist: 1 };
        for (const k of descriptors) {
          const d = faceapi.euclideanDistance(detection.descriptor, k.descriptor);
          if (d < best.dist) best = { ...k, dist: d };
        }

        if (best.dist < THRESHOLD) {
          const conf = 1 - best.dist;
          st.label = `${best.name}  ${Math.round(conf * 100)}%`;
          st.labelColor = '#22C55E';

          const now = Date.now();
          if (now > st.cooldownUntil) {
            st.cooldownUntil = now + COOLDOWN_MS;
            st.flashColor = '#22C55E';
            st.flashAlpha = 1;
            st.glow = 1;
            playBeep(880, 120);
            setTimeout(() => playBeep(1100, 80), 140);

            onRecognized?.({
              studentId: best.studentId,
              name: best.name,
              class: best.class,
              confidence: conf,
              box: { x: b.x, y: b.y, width: b.width, height: b.height },
            });
          }
        } else {
          st.label = 'وجه غير معرّف';
          st.labelColor = '#F97316';
        }
      } catch { /* ignore frame errors */ }
    }, 200);

    return () => { if (inferRef.current) clearInterval(inferRef.current); };
  }, [mode, loadState, onRecognized]);

  // ── Register capture ──────────────────────────────────────────────
  async function handleCapture() {
    if (!videoRef.current || loadState !== 'ready') return;
    setCapturing(true);
    setCaptureResult(null);
    try {
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 }))
        .withFaceLandmarks(true)
        .withFaceDescriptor();

      if (!det) {
        setCaptureResult('error');
        setCaptureMsg('لم يتم اكتشاف وجه. تأكد من الإضاءة الجيدة.');
        return;
      }

      const st = animState.current;
      const b = det.detection.box;
      st.box = { x: b.x, y: b.y, w: b.width, h: b.height };
      st.label = registerStudentName ?? '';
      st.labelColor = '#22C55E';
      st.flashColor = '#22C55E';
      st.flashAlpha = 1;
      st.glow = 1;

      const descriptor = Array.from(det.descriptor);
      const res = await fetch('/api/dashboard/face/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: registerStudentId, descriptor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCaptureResult('error');
        setCaptureMsg(data.error ?? 'فشل حفظ البصمة');
      } else {
        setCaptureResult('success');
        setCaptureMsg('تم تسجيل الوجه بنجاح!');
        playBeep(660, 100);
        setTimeout(() => playBeep(880, 150), 120);
        onRegistered?.();
      }
    } catch {
      setCaptureResult('error');
      setCaptureMsg('حدث خطأ أثناء معالجة الصورة');
    } finally {
      setCapturing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Video + Canvas */}
      <div
        className="relative rounded-2xl overflow-hidden bg-black"
        style={{
          border: '1px solid rgba(0,194,255,0.25)',
          aspectRatio: '4/3',
          maxHeight: '380px',
          boxShadow: '0 0 40px rgba(0,194,255,0.08)',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scaleX(-1)', pointerEvents: 'none' }}
        />

        {/* Loading / Error overlay */}
        {loadState !== 'ready' && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(6,15,30,0.9)' }}
          >
            {loadState === 'error' ? (
              <CameraOff className="w-10 h-10 text-red-400" />
            ) : (
              <div className="relative">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00C2FF' }} />
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: 'rgba(0,194,255,0.2)' }}
                />
              </div>
            )}
            <p className="text-sm text-white/60 text-center px-6">{statusMsg}</p>
            {loadState === 'error' && (
              <button
                onClick={startCamera}
                className="text-xs px-4 py-2 rounded-xl font-bold transition-all hover:scale-105"
                style={{ background: 'rgba(0,194,255,0.15)', color: '#00C2FF', border: '1px solid rgba(0,194,255,0.3)' }}
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        )}

        {/* Mode badge */}
        {loadState === 'ready' && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold"
            style={{
              background: 'rgba(6,15,30,0.85)',
              border: '1px solid rgba(0,194,255,0.35)',
              color: '#00C2FF',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {mode === 'register' ? 'وضع التسجيل' : 'مسح نشط'}
          </div>
        )}

        {/* Bottom scan indicator */}
        {mode === 'scan' && loadState === 'ready' && (
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, transparent, #00C2FF, transparent)',
              animation: 'shimmer 2s infinite',
            }}
          />
        )}
      </div>

      {/* Register button */}
      {mode === 'register' && loadState === 'ready' && (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleCapture}
            disabled={capturing || !registerStudentId}
            className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: capturing ? 'rgba(0,194,255,0.3)' : 'linear-gradient(135deg,#00C2FF,#0065FF)',
              color: 'white',
              boxShadow: capturing ? 'none' : '0 4px 20px rgba(0,194,255,0.35)',
            }}
          >
            {capturing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />جارٍ التقاط البصمة...</>
            ) : (
              <><Camera className="w-4 h-4" />تسجيل وجه الطالب</>
            )}
          </button>

          {captureResult && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: captureResult === 'success' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                border: `1px solid ${captureResult === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                color: captureResult === 'success' ? '#22C55E' : '#EF4444',
              }}
            >
              {captureResult === 'success'
                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                : <XCircle className="w-4 h-4 flex-shrink-0" />}
              {captureMsg}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.3; transform: scaleX(0.5); }
          50% { opacity: 1; transform: scaleX(1); }
          100% { opacity: 0.3; transform: scaleX(0.5); }
        }
      `}</style>
    </div>
  );
}

// Helper: rounded rect path
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
