import React, { useEffect, useRef, useState } from 'react';
import { ActiveDrugEffect, DrugEffectType, DosageTier } from '../types/game';
import { Sparkles, X, Activity, Eye, Zap, Volume2, ShieldAlert, Flame, HeartPulse, Gauge } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

interface IngestionOverlayProps {
  activeEffect: ActiveDrugEffect | null;
  onClearEffect: () => void;
  onSelectSample: (effectType: DrugEffectType, dosage?: DosageTier) => void;
  language: Language;
}

export const IngestionOverlay: React.FC<IngestionOverlayProps> = ({
  activeEffect,
  onClearEffect,
  onSelectSample,
  language,
}) => {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [inversionCycle, setInversionCycle] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentDosage, setCurrentDosage] = useState<DosageTier>(activeEffect?.dosageTier || 'standard');

  useEffect(() => {
    if (activeEffect?.dosageTier) {
      setCurrentDosage(activeEffect.dosageTier);
    }
  }, [activeEffect?.dosageTier]);

  // Multiplier calculated from dosage tier
  const dosageMultiplier =
    currentDosage === 'micro' ? 0.5 : currentDosage === 'standard' ? 1.0 : currentDosage === 'high' ? 1.8 : 2.8;

  // Trigger procedural audio on ingestion
  useEffect(() => {
    if (activeEffect) {
      sounds.playSubstanceIngest(activeEffect.effectType);
    }
  }, [activeEffect?.effectType]);

  // Synchronize duration countdown
  useEffect(() => {
    if (!activeEffect) {
      setTimeRemaining(0);
      return;
    }

    setTimeRemaining(activeEffect.durationSeconds);
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onClearEffect();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeEffect, onClearEffect]);

  // Rapid 3.5-second LSD color inversion cycle
  useEffect(() => {
    if (!activeEffect || activeEffect.effectType !== 'lsd_25') {
      setInversionCycle(false);
      return;
    }

    const interval = setInterval(() => {
      setInversionCycle((prev) => !prev);
    }, 3500);

    return () => clearInterval(interval);
  }, [activeEffect]);

  // Canvas Shader / Visualizer Loop
  useEffect(() => {
    if (!activeEffect) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const mult = dosageMultiplier;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      // Motion tracers for psychedelics & cocaine
      if (
        activeEffect.effectType === 'lsd_25' ||
        activeEffect.effectType === 'psilocybin' ||
        activeEffect.effectType === 'cocaine'
      ) {
        ctx.fillStyle = 'rgba(11, 14, 20, 0.22)';
        ctx.fillRect(0, 0, w, h);
      } else {
        ctx.clearRect(0, 0, w, h);
      }

      // --- 1. COCAINE: Electric Golden Lightning, High Focus Scope & Tachycardia Heartbeat Ring ---
      if (activeEffect.effectType === 'cocaine') {
        const cx = w / 2;
        const cy = h / 2;
        const heartSpeed = 0.12 * mult;
        const pulse = Math.sin(frame * heartSpeed) * 0.15 + 1.0;

        // Tunnel vision dark golden vignette
        const grad = ctx.createRadialGradient(cx, cy, h * 0.28 * pulse, cx, cy, Math.max(w, h) * 0.75);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.5, `rgba(180, 130, 10, ${0.25 * mult})`);
        grad.addColorStop(0.85, `rgba(40, 30, 0, ${0.65 * mult})`);
        grad.addColorStop(1, `rgba(10, 8, 2, ${0.92 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Peripheral golden lightning arcs
        const arcCount = Math.floor(8 * mult);
        ctx.strokeStyle = '#fef08a';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 15;
        for (let a = 0; a < arcCount; a++) {
          const side = a % 4; // 0: top, 1: right, 2: bottom, 3: left
          ctx.beginPath();
          let startX = side === 1 ? w - 40 : side === 3 ? 40 : Math.random() * w;
          let startY = side === 0 ? 40 : side === 2 ? h - 40 : Math.random() * h;
          ctx.moveTo(startX, startY);

          for (let seg = 0; seg < 5; seg++) {
            startX += (Math.random() - 0.5) * 80 * mult;
            startY += (Math.random() - 0.5) * 80 * mult;
            ctx.lineTo(startX, startY);
          }
          ctx.lineWidth = Math.random() * 2.5 + 1;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Central Focus Scope & Dilated Iris Ring
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.arc(0, 0, 140 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.4 * mult})`;
        ctx.lineWidth = 2 * mult;
        ctx.setLineDash([8, 12]);
        ctx.stroke();

        // Crosshairs
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(250, 204, 21, ${0.25 * mult})`;
        ctx.beginPath();
        ctx.moveTo(-160 * pulse, 0);
        ctx.lineTo(-110 * pulse, 0);
        ctx.moveTo(110 * pulse, 0);
        ctx.lineTo(160 * pulse, 0);
        ctx.moveTo(0, -160 * pulse);
        ctx.lineTo(0, -110 * pulse);
        ctx.moveTo(0, 110 * pulse);
        ctx.lineTo(0, 160 * pulse);
        ctx.stroke();
        ctx.restore();

        // 50 Crystalline white sparkles drifting at high velocity
        const sparkCount = Math.floor(35 * mult);
        for (let i = 0; i < sparkCount; i++) {
          const t = frame * 0.04 + i * 3.7;
          const sx = (Math.sin(t * 1.5 + i) * 0.48 + 0.5) * w;
          const sy = ((t * 0.9 + i * 0.3) % 1) * h;
          const sz = Math.random() * 3 + 1;

          ctx.fillStyle = i % 3 === 0 ? '#fef08a' : '#ffffff';
          ctx.fillRect(sx, sy, sz, sz);
        }
      } else if (activeEffect.effectType === 'white_widow') {
        // --- 2. WHITE WIDOW: Heavy Milky Fog, Pulsing Vignette & Sparkling Trichome Crystals ---
        const pulse = Math.sin(frame * 0.03) * 0.08 + 1.0;
        const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.15 * pulse, w / 2, h / 2, Math.max(w, h) * 0.72);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        grad.addColorStop(0.5, `rgba(230, 245, 255, ${0.18 * mult})`);
        grad.addColorStop(0.85, `rgba(240, 250, 255, ${0.45 * mult})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${0.65 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Breathing temporal dilation wave ripple
        const waveX = (Math.sin(frame * 0.015) * 0.5 + 0.5) * w;
        const waveGrad = ctx.createLinearGradient(waveX - 120, 0, waveX + 120, 0);
        waveGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        waveGrad.addColorStop(0.5, `rgba(220, 240, 255, ${0.2 * mult})`);
        waveGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = waveGrad;
        ctx.fillRect(0, 0, w, h);

        // Floating trichome resin crystals
        const particleCount = Math.floor(40 * mult);
        for (let i = 0; i < particleCount; i++) {
          const t = frame * 0.007 + i * 2.3;
          const x = (Math.sin(t * 0.7 + i) * 0.48 + 0.5) * w;
          const y = ((t * 0.35 + i * 0.17) % 1) * h;
          const r = (Math.sin(t * 1.8) * 0.5 + 0.5) * 3.5 * mult + 1.5;

          const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
          halo.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          halo.addColorStop(0.5, 'rgba(210, 240, 255, 0.35)');
          halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(x, y, r * 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'amnesia_haze') {
        // --- 3. AMNESIA HAZE: Blinding Sunburst Rays, High-Velocity Warp Trails & Shimmer ---
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);
        const rays = 24;
        const spin = frame * 0.02 * mult;
        for (let i = 0; i < rays; i++) {
          const angle = (i * Math.PI * 2) / rays + spin;
          const rayPulse = Math.sin(frame * 0.08 + i) * 0.04 + 0.08;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle - 0.08) * Math.max(w, h), Math.sin(angle - 0.08) * Math.max(w, h));
          ctx.lineTo(Math.cos(angle + 0.08) * Math.max(w, h), Math.sin(angle + 0.08) * Math.max(w, h));
          ctx.closePath();
          ctx.fillStyle =
            i % 2 === 0 ? `rgba(250, 204, 21, ${rayPulse * mult})` : `rgba(234, 179, 8, ${rayPulse * 0.8 * mult})`;
          ctx.fill();
        }
        ctx.restore();

        const streakCount = Math.floor(35 * mult);
        ctx.save();
        ctx.translate(cx, cy);
        for (let s = 0; s < streakCount; s++) {
          const sAngle = (s * 137.5 * Math.PI) / 180;
          const speed = (frame * 12 + s * 95) % Math.max(w, h);
          const len = 35 * mult + (s % 5) * 10;
          const x1 = Math.cos(sAngle) * speed;
          const y1 = Math.sin(sAngle) * speed;
          const x2 = Math.cos(sAngle) * (speed + len);
          const y2 = Math.sin(sAngle) * (speed + len);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = `rgba(253, 224, 71, ${0.45 * mult})`;
          ctx.lineWidth = (s % 3 === 0 ? 3 : 1.5) * mult;
          ctx.stroke();
        }
        ctx.restore();
      } else if (activeEffect.effectType === 'gorilla_glue') {
        // --- 4. GORILLA GLUE #4: Deep Couch-Lock Dark Tunnel Vision & Sticky Amber Resin Drips ---
        const heartbeat = Math.sin(frame * 0.05) * 0.08 + 1.0;
        const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.22 * heartbeat, w / 2, h / 2, Math.max(w, h) * 0.65);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.5, `rgba(4, 18, 10, ${0.45 * mult})`);
        grad.addColorStop(0.8, `rgba(2, 10, 5, ${0.75 * mult})`);
        grad.addColorStop(1, `rgba(0, 4, 1, ${0.94 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const dripCount = 14;
        for (let d = 0; d < dripCount; d++) {
          const dx = (w / dripCount) * (d + 0.5);
          const dripLen = Math.sin(frame * 0.02 + d * 1.5) * 25 * mult + 60 * mult;
          const dripWidth = 8 + (d % 3) * 4;

          const dripGrad = ctx.createLinearGradient(dx, 0, dx, dripLen);
          dripGrad.addColorStop(0, 'rgba(217, 119, 6, 0.7)');
          dripGrad.addColorStop(0.8, 'rgba(180, 83, 9, 0.85)');
          dripGrad.addColorStop(1, 'rgba(245, 158, 11, 0.95)');

          ctx.fillStyle = dripGrad;
          ctx.beginPath();
          ctx.moveTo(dx - dripWidth / 2, 0);
          ctx.lineTo(dx + dripWidth / 2, 0);
          ctx.lineTo(dx + dripWidth / 3, dripLen - dripWidth);
          ctx.arc(dx, dripLen - dripWidth / 2, dripWidth / 2, 0, Math.PI);
          ctx.closePath();
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'purple_haze') {
        // --- 5. PURPLE HAZE: Ultraviolet Psychedelic Shift & Floating Neon Orbs ---
        const grad = ctx.createLinearGradient(0, 0, w, h);
        const shift = Math.sin(frame * 0.02) * 0.5 + 0.5;
        grad.addColorStop(0, `rgba(147, 51, 234, ${0.25 * mult * shift})`);
        grad.addColorStop(0.5, `rgba(219, 39, 119, ${0.35 * mult})`);
        grad.addColorStop(1, `rgba(79, 70, 229, ${0.28 * mult * (1 - shift)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const orbCount = Math.floor(25 * mult);
        for (let o = 0; o < orbCount; o++) {
          const ox = (Math.sin(frame * 0.01 + o * 1.7) * 0.45 + 0.5) * w;
          const oy = (Math.cos(frame * 0.012 + o * 2.1) * 0.45 + 0.5) * h;
          const or = (Math.sin(frame * 0.03 + o) * 0.5 + 0.5) * 40 * mult + 20;

          const orbGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, or);
          orbGrad.addColorStop(0, `rgba(244, 114, 182, ${0.45 * mult})`);
          orbGrad.addColorStop(0.6, `rgba(168, 85, 247, ${0.25 * mult})`);
          orbGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          ctx.fillStyle = orbGrad;
          ctx.beginPath();
          ctx.arc(ox, oy, or, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'psilocybin') {
        // --- 6. PSILOCYBIN: Liquid Melting Waves & Organic Shimmer Rings ---
        const cx = w / 2;
        const cy = h / 2;
        const ringCount = Math.floor(8 * mult);
        for (let r = 0; r < ringCount; r++) {
          const radius = ((frame * 2.5 + r * 70) % (Math.max(w, h) * 0.7)) * (mult > 1 ? 1 : 0.8);
          const opacity = Math.max(0, 1 - radius / (Math.max(w, h) * 0.7)) * 0.45 * mult;

          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(${(frame * 2 + r * 45) % 360}, 90%, 65%, ${opacity})`;
          ctx.lineWidth = 3.5 * mult;
          ctx.stroke();
        }

        const sporeCount = Math.floor(30 * mult);
        for (let s = 0; s < sporeCount; s++) {
          const sx = (Math.sin(frame * 0.015 + s * 2.3) * 0.4 + 0.5) * w;
          const sy = (Math.cos(frame * 0.018 + s * 1.9) * 0.4 + 0.5) * h;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 * mult, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${(frame * 3 + s * 30) % 360}, 100%, 75%, ${0.6 * mult})`;
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'lsd_25') {
        // --- 7. LSD-25: Multi-ring Sacred Geometry Fractal Kaleidoscope ---
        const cx = w / 2;
        const cy = h / 2;
        ctx.save();
        ctx.translate(cx, cy);

        const rings = Math.floor(5 * (mult >= 2 ? 1.5 : 1));
        const petals = 12;
        for (let ring = 1; ring <= rings; ring++) {
          const rad = (ring * 80 + Math.sin(frame * 0.04 + ring) * 20) * (mult * 0.7);
          const rotSpeed = frame * (0.008 * (ring % 2 === 0 ? 1 : -1)) * mult;

          ctx.save();
          ctx.rotate(rotSpeed);
          for (let p = 0; p < petals; p++) {
            const pAngle = (p * Math.PI * 2) / petals;
            const px = Math.cos(pAngle) * rad;
            const py = Math.sin(pAngle) * rad;
            const petalRad = 35 * mult;

            ctx.beginPath();
            ctx.arc(px, py, petalRad, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${(frame * 2 + ring * 40 + p * 30) % 360}, 100%, 70%, ${0.45 * mult})`;
            ctx.lineWidth = 2.5 * mult;
            ctx.stroke();
          }
          ctx.restore();
        }
        ctx.restore();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [activeEffect, dosageMultiplier]);

  // Fullscreen Backdrop Filter applied across the live app UI
  const getBackdropFilterStyle = (): React.CSSProperties => {
    if (!activeEffect) return {};

    const mult = dosageMultiplier;

    switch (activeEffect.effectType) {
      case 'cocaine':
        return {
          backdropFilter: `contrast(${1.25 + 0.15 * mult}) brightness(${1.15 + 0.1 * mult}) saturate(${1.35 * mult})`,
          WebkitBackdropFilter: `contrast(${1.25 + 0.15 * mult}) brightness(${1.15 + 0.1 * mult}) saturate(${1.35 * mult})`,
          boxShadow: `inset 0 0 ${110 * mult}px rgba(250, 204, 21, ${0.45 * mult})`,
        };
      case 'white_widow':
        return {
          backdropFilter: `contrast(${1.08 * mult}) brightness(${1.05 + 0.08 * mult}) saturate(${1.15 * mult})`,
          WebkitBackdropFilter: `contrast(${1.08 * mult}) brightness(${1.05 + 0.08 * mult}) saturate(${1.15 * mult})`,
          boxShadow: `inset 0 0 ${120 * mult}px rgba(240, 250, 255, ${0.35 * mult})`,
        };
      case 'amnesia_haze':
        return {
          backdropFilter: `brightness(${1.15 + 0.15 * mult}) contrast(${1.1 + 0.15 * mult}) saturate(${1.5 * mult}) hue-rotate(-10deg)`,
          WebkitBackdropFilter: `brightness(${1.15 + 0.15 * mult}) contrast(${1.1 + 0.15 * mult}) saturate(${1.5 * mult}) hue-rotate(-10deg)`,
          boxShadow: `inset 0 0 ${100 * mult}px rgba(250, 204, 21, ${0.35 * mult})`,
        };
      case 'gorilla_glue':
        return {
          backdropFilter: `blur(${1.2 * mult}px) contrast(${1.15 * mult}) saturate(${1.25 * mult})`,
          WebkitBackdropFilter: `blur(${1.2 * mult}px) contrast(${1.15 * mult}) saturate(${1.25 * mult})`,
          boxShadow: `inset 0 0 ${130 * mult}px rgba(0, 0, 0, ${0.75 * mult})`,
        };
      case 'purple_haze':
        return {
          backdropFilter: `hue-rotate(275deg) saturate(${2.2 * mult}) contrast(${1.15 + 0.1 * mult})`,
          WebkitBackdropFilter: `hue-rotate(275deg) saturate(${2.2 * mult}) contrast(${1.15 + 0.1 * mult})`,
          boxShadow: `inset 0 0 ${130 * mult}px rgba(168, 85, 247, ${0.45 * mult})`,
        };
      case 'psilocybin':
        return {
          backdropFilter: `saturate(${2.5 * mult}) contrast(${1.2 * mult}) hue-rotate(40deg)`,
          WebkitBackdropFilter: `saturate(${2.5 * mult}) contrast(${1.2 * mult}) hue-rotate(40deg)`,
          boxShadow: `inset 0 0 ${120 * mult}px rgba(6, 182, 212, ${0.45 * mult})`,
        };
      case 'lsd_25':
        return {
          backdropFilter: inversionCycle
            ? `invert(${0.85 + 0.1 * (mult - 1)}) hue-rotate(180deg) saturate(${2.8 * mult}) contrast(${1.2 + 0.15 * mult})`
            : `saturate(${2.8 * mult}) contrast(${1.25 + 0.15 * mult}) hue-rotate(70deg)`,
          WebkitBackdropFilter: inversionCycle
            ? `invert(${0.85 + 0.1 * (mult - 1)}) hue-rotate(180deg) saturate(${2.8 * mult}) contrast(${1.2 + 0.15 * mult})`
            : `saturate(${2.8 * mult}) contrast(${1.25 + 0.15 * mult}) hue-rotate(70deg)`,
          boxShadow: `inset 0 0 ${140 * mult}px rgba(236, 72, 153, ${0.5 * mult})`,
          transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        };
      default:
        return {};
    }
  };

  return (
    <>
      {/* 1. Fullscreen Backdrop Filter Warper */}
      {activeEffect && (
        <div
          className="fixed inset-0 pointer-events-none z-30 transition-all duration-700"
          style={getBackdropFilterStyle()}
        />
      )}

      {/* 2. WebGL/Canvas Particle Shader Overlay */}
      {activeEffect && (
        <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40 w-full h-full" />
      )}

      {/* 3. Ingestion Active HUD Banner with Dosage Switcher */}
      {activeEffect && (
        <div className="fixed top-4 right-4 z-50 bg-[#0b0e14]/95 border border-white/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl max-w-sm w-full space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <h4 className="font-bold text-white text-sm">
                {activeEffect.name}
              </h4>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClearEffect();
              }}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dosage Selector Strip */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase">
              <span>Дозировка:</span>
              <span className="text-amber-400 font-bold capitalize">
                {currentDosage} ({dosageMultiplier}x)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
              {(['micro', 'standard', 'high', 'heroic'] as DosageTier[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    sounds.playClick();
                    setCurrentDosage(tier);
                  }}
                  className={`py-1 px-1 rounded-md border text-center transition-all cursor-pointer ${
                    currentDosage === tier
                      ? 'bg-amber-500/25 border-amber-500/60 text-amber-300 font-bold'
                      : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {tier === 'micro' ? 'Микро' : tier === 'standard' ? 'Стандарт' : tier === 'high' ? 'Высокая' : 'Овердрайв'}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Pulse telemetry */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1 border-t border-white/10">
            <span className="flex items-center gap-1 text-emerald-400">
              <Eye className="w-3.5 h-3.5" />
              {timeRemaining} сек
            </span>

            {activeEffect.effectType === 'cocaine' && (
              <span className="flex items-center gap-1 text-rose-400 font-bold animate-pulse">
                <HeartPulse className="w-3.5 h-3.5" />
                154 BPM
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};
