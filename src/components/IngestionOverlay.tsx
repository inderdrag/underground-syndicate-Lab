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
  const currentDosageRef = useRef<DosageTier>(activeEffect?.dosageTier || 'standard');

  useEffect(() => {
    if (activeEffect?.dosageTier) {
      setCurrentDosage(activeEffect.dosageTier);
      currentDosageRef.current = activeEffect.dosageTier;
    }
  }, [activeEffect?.dosageTier]);

  // Multiplier calculated from dosage tier
  const dosageMultiplier =
    currentDosage === 'micro' ? 0.45 : currentDosage === 'standard' ? 1.0 : currentDosage === 'high' ? 1.85 : 2.9;

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

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      const currentTier = currentDosageRef.current;
      const mult = currentTier === 'micro' ? 0.45 : currentTier === 'standard' ? 1.0 : currentTier === 'high' ? 1.85 : 2.9;

      // Motion tracers for psychedelics & cocaine
      if (
        activeEffect.effectType === 'lsd_25' ||
        activeEffect.effectType === 'psilocybin' ||
        activeEffect.effectType === 'astral_mushrooms' ||
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
      } else if (activeEffect.effectType === 'astral_mushrooms') {
        // --- 6B. ASTRAL MUSHROOMS: Euphoric Bioluminescent Psychedelic Ripple & Spore Swarm ---
        const cx = w / 2;
        const cy = h / 2;

        // Pulsing Neon Bioluminescent Rings (Cyan / Violet / Emerald)
        const ringCount = Math.floor(10 * mult);
        for (let r = 0; r < ringCount; r++) {
          const baseR = ((frame * 3.2 + r * 65) % (Math.max(w, h) * 0.85)) * (mult > 1 ? 1 : 0.8);
          // Sine displacement wave on ring radius
          const waveR = baseR + Math.sin(frame * 0.05 + r) * (18 * mult);
          const opacity = Math.max(0, 1 - waveR / (Math.max(w, h) * 0.85)) * 0.55 * mult;

          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(10, waveR), 0, Math.PI * 2);
          const hue = (180 + r * 35 + Math.sin(frame * 0.03) * 40) % 360;
          ctx.strokeStyle = `hsla(${hue}, 95%, 68%, ${opacity})`;
          ctx.lineWidth = (3.5 + Math.sin(frame * 0.1 + r) * 1.5) * mult;
          ctx.stroke();
        }

        // Swarm of 50-90 Floating Glowing Bio-Spores
        const sporeCount = Math.floor(55 * mult);
        for (let s = 0; s < sporeCount; s++) {
          const orbitR = (s * 15 + frame * 1.2) % (Math.max(w, h) * 0.55);
          const angle = s * 0.35 + frame * (0.012 + (s % 5) * 0.003) * (s % 2 === 0 ? 1 : -1);
          const sx = cx + Math.cos(angle) * orbitR + Math.sin(frame * 0.02 + s) * 20;
          const sy = cy + Math.sin(angle) * orbitR + Math.cos(frame * 0.025 + s) * 20;

          const sporeRadius = (3.5 + Math.sin(frame * 0.08 + s) * 1.8) * mult;
          const sporeHue = (160 + s * 22 + frame) % 360;

          const sporeGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sporeRadius * 3);
          sporeGrad.addColorStop(0, `hsla(${sporeHue}, 100%, 75%, ${0.85 * mult})`);
          sporeGrad.addColorStop(0.5, `hsla(${sporeHue}, 100%, 55%, ${0.45 * mult})`);
          sporeGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = sporeGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, sporeRadius * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Heroic / High dose Sacred Astral Mandala
        if (mult >= 1.5) {
          ctx.save();
          ctx.translate(cx, cy);
          const petals = 8;
          ctx.rotate(frame * 0.006 * mult);
          for (let p = 0; p < petals; p++) {
            const pAngle = (p * Math.PI * 2) / petals;
            const px = Math.cos(pAngle) * (140 * mult);
            const py = Math.sin(pAngle) * (140 * mult);

            ctx.beginPath();
            ctx.arc(px, py, 60 * mult, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${(frame * 3 + p * 45) % 360}, 95%, 70%, ${0.35 * mult})`;
            ctx.lineWidth = 2 * mult;
            ctx.stroke();
          }
          ctx.restore();
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
      } else if (activeEffect.effectType === 'aurora_powder') {
        // --- 8. AURORA POWDER: Electric Cyan Strobe, Jagged Lightning & High-RPM Tachometer ---
        const cx = w / 2;
        const cy = h / 2;
        const speed = 0.22 * mult;
        const pulse = Math.sin(frame * speed) * 0.25 + 1.0;

        const grad = ctx.createRadialGradient(cx, cy, h * 0.25 * pulse, cx, cy, Math.max(w, h) * 0.75);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.5, `rgba(6, 182, 212, ${0.28 * mult})`);
        grad.addColorStop(0.85, `rgba(14, 116, 144, ${0.6 * mult})`);
        grad.addColorStop(1, `rgba(8, 47, 73, ${0.9 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        const arcCount = Math.floor(12 * mult);
        ctx.strokeStyle = '#67e8f9';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 20;
        for (let a = 0; a < arcCount; a++) {
          const side = a % 4;
          ctx.beginPath();
          let startX = side === 1 ? w - 30 : side === 3 ? 30 : Math.random() * w;
          let startY = side === 0 ? 30 : side === 2 ? h - 30 : Math.random() * h;
          ctx.moveTo(startX, startY);
          for (let seg = 0; seg < 6; seg++) {
            startX += (Math.random() - 0.5) * 90 * mult;
            startY += (Math.random() - 0.5) * 90 * mult;
            ctx.lineTo(startX, startY);
          }
          ctx.lineWidth = Math.random() * 3 + 1;
          ctx.stroke();
        }
        ctx.shadowBlur = 0;

        const sparkCount = Math.floor(55 * mult);
        for (let i = 0; i < sparkCount; i++) {
          const t = frame * 0.08 + i * 2.7;
          const sx = (Math.sin(t * 2.1 + i) * 0.48 + 0.5) * w;
          const sy = ((t * 1.5 + i * 0.4) % 1) * h;
          const sz = Math.random() * 4 + 1;
          ctx.fillStyle = i % 2 === 0 ? '#22d3ee' : '#a5f3fc';
          ctx.fillRect(sx, sy, sz, sz);
        }
      } else if (activeEffect.effectType === 'tramadol') {
        // --- 9. TRAMADOL: Nauseating Bile-Green Sea-Sickness & Rolling Toxic Vertigo Waves ---
        const cx = w / 2;
        const cy = h / 2;
        const sway = Math.sin(frame * 0.035) * (w * 0.12 * mult);
        const vertigo = frame * 0.02 * mult;

        const grad = ctx.createRadialGradient(cx + sway, cy, h * 0.15, cx, cy, Math.max(w, h) * 0.7);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.4, `rgba(132, 204, 22, ${0.25 * mult})`);
        grad.addColorStop(0.75, `rgba(101, 163, 13, ${0.55 * mult})`);
        grad.addColorStop(1, `rgba(63, 98, 18, ${0.85 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        ctx.lineWidth = 4 * mult;
        for (let wave = 0; wave < 6; wave++) {
          ctx.beginPath();
          const waveY = (h / 7) * (wave + 1) + Math.sin(frame * 0.05 + wave) * 35 * mult;
          ctx.moveTo(0, waveY);
          for (let x = 0; x < w; x += 30) {
            const yOffset = Math.sin(x * 0.01 + frame * 0.06 + wave) * (25 * mult) + Math.cos(x * 0.02 - frame * 0.04) * (15 * mult);
            ctx.lineTo(x, waveY + yOffset);
          }
          ctx.strokeStyle = `hsla(${65 + wave * 15}, 85%, 45%, ${0.4 * mult})`;
          ctx.stroke();
        }

        ctx.save();
        ctx.translate(cx + sway * 0.5, cy);
        ctx.rotate(vertigo);
        for (let s = 0; s < 4; s++) {
          ctx.beginPath();
          const spiralAngle = s * (Math.PI / 2);
          for (let r = 10; r < Math.max(w, h) * 0.5; r += 10) {
            const a = spiralAngle + r * 0.015;
            const sx = Math.cos(a) * r;
            const sy = Math.sin(a) * r;
            if (r === 10) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.strokeStyle = `rgba(190, 242, 100, ${0.3 * mult})`;
          ctx.lineWidth = 3 * mult;
          ctx.stroke();
        }
        ctx.restore();
      } else if (activeEffect.effectType === 'lyrica') {
        // --- 10. LYRICA: Double Vision Diplopia, Drunken Swaying Horizon & Vertigo Wobble ---
        const cx = w / 2;
        const cy = h / 2;
        const drunkShiftX = Math.sin(frame * 0.04) * (45 * mult);
        const drunkShiftY = Math.cos(frame * 0.03) * (25 * mult);

        ctx.strokeStyle = `rgba(168, 85, 247, ${0.35 * mult})`;
        ctx.lineWidth = 2 * mult;
        ctx.strokeRect(40 + drunkShiftX, 40 + drunkShiftY, w - 80, h - 80);
        ctx.strokeStyle = `rgba(6, 182, 212, ${0.35 * mult})`;
        ctx.strokeRect(40 - drunkShiftX, 40 - drunkShiftY, w - 80, h - 80);

        for (let b = 0; b < 5; b++) {
          const barY = (h / 6) * (b + 1) + Math.sin(frame * 0.06 + b) * (20 * mult);
          ctx.beginPath();
          ctx.moveTo(0, barY - drunkShiftY);
          ctx.lineTo(w, barY + drunkShiftY);
          ctx.strokeStyle = `rgba(216, 180, 254, ${0.25 * mult})`;
          ctx.lineWidth = 3 * mult;
          ctx.stroke();
        }

        for (let o = 0; o < 20; o++) {
          const ox = cx + Math.sin(frame * 0.02 + o) * (w * 0.38) + drunkShiftX;
          const oy = cy + Math.cos(frame * 0.025 + o * 1.5) * (h * 0.38) + drunkShiftY;
          ctx.beginPath();
          ctx.arc(ox, oy, (8 + Math.sin(frame * 0.1 + o) * 4) * mult, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(192, 132, 252, ${0.35 * mult})`;
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'neuro_fractal') {
        // --- 11. NEURO-FRACTAL: Matrix Green Binary Rain & Cybernetic Glitch Crosshairs ---
        const cx = w / 2;
        const cy = h / 2;

        ctx.fillStyle = '#22c55e';
        ctx.font = '12px monospace';
        const cols = Math.floor(w / 35);
        for (let c = 0; c < cols; c++) {
          const y = (frame * (3 + (c % 5)) + c * 80) % h;
          const char = Math.random() > 0.5 ? '1' : '0';
          ctx.fillText(char, c * 35 + 10, y);
          ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
          ctx.fillText(char, c * 35 + 10, (y - 15 + h) % h);
          ctx.fillStyle = '#4ade80';
        }

        ctx.strokeStyle = `rgba(34, 197, 94, ${0.35 * mult})`;
        ctx.lineWidth = 1.5 * mult;
        ctx.strokeRect(cx - 150 * mult, cy - 150 * mult, 300 * mult, 300 * mult);
        ctx.beginPath();
        ctx.moveTo(cx - 180 * mult, cy);
        ctx.lineTo(cx + 180 * mult, cy);
        ctx.moveTo(cx, cy - 180 * mult);
        ctx.lineTo(cx, cy + 180 * mult);
        ctx.stroke();
      } else if (activeEffect.effectType === 'xanax') {
        // --- 12. XANAX: Heavy Dark Downer Vignette & Slow Soporific Breathing ---
        const breath = Math.sin(frame * 0.02) * 0.1 + 0.9;
        const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.12 * breath, w / 2, h / 2, Math.max(w, h) * 0.65);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.5, `rgba(15, 23, 42, ${0.45 * mult})`);
        grad.addColorStop(0.85, `rgba(2, 6, 23, ${0.8 * mult})`);
        grad.addColorStop(1, `rgba(0, 0, 0, ${0.96 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (activeEffect.effectType === 'morphine') {
        // --- 13. MORPHINE / OPIOID: Warm Crimson & Amber Euphoric Dreamscape ---
        const cx = w / 2;
        const cy = h / 2;
        const pulse = Math.sin(frame * 0.03) * 0.1 + 1.0;
        const grad = ctx.createRadialGradient(cx, cy, h * 0.2 * pulse, cx, cy, Math.max(w, h) * 0.7);
        grad.addColorStop(0, `rgba(239, 68, 68, ${0.15 * mult})`);
        grad.addColorStop(0.5, `rgba(180, 83, 9, ${0.35 * mult})`);
        grad.addColorStop(1, `rgba(69, 10, 10, ${0.75 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        for (let i = 0; i < 40 * mult; i++) {
          const ex = (Math.sin(frame * 0.01 + i * 2.1) * 0.48 + 0.5) * w;
          const ey = ((h - (frame * 1.2 + i * 40) % h) + h) % h;
          ctx.beginPath();
          ctx.arc(ex, ey, (3 + Math.sin(frame * 0.1 + i) * 2) * mult, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${0.75 * mult})`;
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'codeine') {
        // --- 14. CODEINE / LEAN: Purple Syrup Dripping Down Screen & Molasses Slow Distortion ---
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `rgba(88, 28, 135, ${0.55 * mult})`);
        grad.addColorStop(0.5, `rgba(126, 34, 206, ${0.3 * mult})`);
        grad.addColorStop(1, `rgba(59, 7, 100, ${0.65 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        for (let d = 0; d < 12; d++) {
          const dx = (w / 13) * (d + 1);
          const dy = (frame * (1.5 + (d % 4) * 0.5) + d * 60) % (h + 80);
          ctx.beginPath();
          ctx.arc(dx, dy, (12 + (d % 6) * 3) * mult, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(192, 38, 211, ${0.75 * mult})`;
          ctx.fill();
        }
      } else if (activeEffect.effectType === 'ritalin') {
        // --- 15. RITALIN: Laser Hyper-Focus Orange Crosshairs & Sharp Telemetry ---
        const cx = w / 2;
        const cy = h / 2;
        ctx.strokeStyle = `rgba(249, 115, 22, ${0.75 * mult})`;
        ctx.lineWidth = 2 * mult;
        ctx.beginPath();
        ctx.arc(cx, cy, 120 * mult, 0, Math.PI * 2);
        ctx.stroke();

        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, 160 * mult, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (activeEffect.effectType === 'zolpidem') {
        // --- 16. ZOLPIDEM: Twilight Lavender Dream Veil & Shadow Figures ---
        const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, Math.max(w, h) * 0.7);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.5, `rgba(109, 40, 217, ${0.35 * mult})`);
        grad.addColorStop(1, `rgba(46, 16, 101, ${0.85 * mult})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      } else if (activeEffect.effectType === 'prozac') {
        // --- 17. PROZAC: Serene Pastel Turquoise/Pink Waves & Serotonin Shimmer ---
        for (let wLine = 0; wLine < 5; wLine++) {
          const y = (h / 6) * (wLine + 1) + Math.sin(frame * 0.03 + wLine) * 20 * mult;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.bezierCurveTo(w * 0.33, y + 30 * mult, w * 0.66, y - 30 * mult, w, y);
          ctx.strokeStyle = wLine % 2 === 0 ? `rgba(45, 212, 191, ${0.4 * mult})` : `rgba(244, 114, 182, ${0.4 * mult})`;
          ctx.lineWidth = 3 * mult;
          ctx.stroke();
        }
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
      case 'astral_mushrooms':
        return {
          backdropFilter: `saturate(${2.8 * mult}) contrast(${1.2 + 0.1 * mult}) hue-rotate(50deg)`,
          WebkitBackdropFilter: `saturate(${2.8 * mult}) contrast(${1.2 + 0.1 * mult}) hue-rotate(50deg)`,
          boxShadow: `inset 0 0 ${130 * mult}px rgba(6, 182, 212, ${0.45 * mult}), inset 0 0 ${60 * mult}px rgba(168, 85, 247, ${0.4 * mult})`,
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
      case 'aurora_powder':
        return {
          backdropFilter: `contrast(${1.35 + 0.2 * mult}) brightness(${1.2 + 0.15 * mult}) saturate(${1.6 * mult}) hue-rotate(190deg)`,
          WebkitBackdropFilter: `contrast(${1.35 + 0.2 * mult}) brightness(${1.2 + 0.15 * mult}) saturate(${1.6 * mult}) hue-rotate(190deg)`,
          boxShadow: `inset 0 0 ${140 * mult}px rgba(6, 182, 212, ${0.65 * mult})`,
        };
      case 'tramadol':
        return {
          backdropFilter: `hue-rotate(65deg) contrast(${1.3 * mult}) saturate(${1.7 * mult}) blur(${1.5 * mult}px)`,
          WebkitBackdropFilter: `hue-rotate(65deg) contrast(${1.3 * mult}) saturate(${1.7 * mult}) blur(${1.5 * mult}px)`,
          boxShadow: `inset 0 0 ${150 * mult}px rgba(132, 204, 22, ${0.7 * mult}), inset 0 0 ${80 * mult}px rgba(234, 179, 8, ${0.5 * mult})`,
        };
      case 'lyrica':
        return {
          backdropFilter: `blur(${2.2 * mult}px) contrast(${1.15 * mult}) saturate(${1.4 * mult})`,
          WebkitBackdropFilter: `blur(${2.2 * mult}px) contrast(${1.15 * mult}) saturate(${1.4 * mult})`,
          boxShadow: `inset 0 0 ${140 * mult}px rgba(168, 85, 247, ${0.55 * mult})`,
        };
      case 'neuro_fractal':
        return {
          backdropFilter: `contrast(${1.3 * mult}) saturate(${2.0 * mult}) hue-rotate(90deg)`,
          WebkitBackdropFilter: `contrast(${1.3 * mult}) saturate(${2.0 * mult}) hue-rotate(90deg)`,
          boxShadow: `inset 0 0 ${140 * mult}px rgba(34, 197, 94, ${0.5 * mult})`,
        };
      case 'xanax':
        return {
          backdropFilter: `grayscale(${0.55 * mult}) brightness(${Math.max(0.6, 0.85 - 0.15 * mult)}) contrast(1.15)`,
          WebkitBackdropFilter: `grayscale(${0.55 * mult}) brightness(${Math.max(0.6, 0.85 - 0.15 * mult)}) contrast(1.15)`,
          boxShadow: `inset 0 0 ${180 * mult}px rgba(0, 0, 0, ${0.85 * mult})`,
        };
      case 'morphine':
        return {
          backdropFilter: `brightness(${1.1 * mult}) saturate(${1.5 * mult}) sepia(0.3)`,
          WebkitBackdropFilter: `brightness(${1.1 * mult}) saturate(${1.5 * mult}) sepia(0.3)`,
          boxShadow: `inset 0 0 ${140 * mult}px rgba(220, 38, 38, ${0.55 * mult})`,
        };
      case 'codeine':
        return {
          backdropFilter: `hue-rotate(280deg) saturate(${2.5 * mult}) contrast(${1.2 * mult})`,
          WebkitBackdropFilter: `hue-rotate(280deg) saturate(${2.5 * mult}) contrast(${1.2 * mult})`,
          boxShadow: `inset 0 0 ${160 * mult}px rgba(147, 51, 234, ${0.65 * mult})`,
        };
      case 'ritalin':
        return {
          backdropFilter: `contrast(${1.4 * mult}) brightness(${1.15 * mult}) saturate(${1.3 * mult})`,
          WebkitBackdropFilter: `contrast(${1.4 * mult}) brightness(${1.15 * mult}) saturate(${1.3 * mult})`,
          boxShadow: `inset 0 0 ${110 * mult}px rgba(249, 115, 22, ${0.55 * mult})`,
        };
      case 'zolpidem':
        return {
          backdropFilter: `blur(${1.8 * mult}px) hue-rotate(260deg) brightness(0.85)`,
          WebkitBackdropFilter: `blur(${1.8 * mult}px) hue-rotate(260deg) brightness(0.85)`,
          boxShadow: `inset 0 0 ${150 * mult}px rgba(91, 33, 182, ${0.6 * mult})`,
        };
      case 'prozac':
        return {
          backdropFilter: `saturate(${1.4 * mult}) brightness(${1.08 * mult}) hue-rotate(15deg)`,
          WebkitBackdropFilter: `saturate(${1.4 * mult}) brightness(${1.08 * mult}) hue-rotate(15deg)`,
          boxShadow: `inset 0 0 ${120 * mult}px rgba(45, 212, 191, ${0.45 * mult})`,
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
                    currentDosageRef.current = tier;
                    if (onSelectSample && activeEffect) {
                      onSelectSample(activeEffect.effectType, tier);
                    }
                  }}
                  className={`py-1.5 px-1 rounded-md border text-center transition-all cursor-pointer active:scale-95 ${
                    currentDosage === tier
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tier === 'micro' ? 'Микро' : tier === 'standard' ? 'Стандарт' : tier === 'high' ? 'Высокая' : 'Овердрайв'}
                </button>
              ))}
            </div>
          </div>

          {/* Euphoria, Hallucinations & Addiction gauges */}
          <div className="space-y-2 pt-2 border-t border-white/10 font-mono text-[10px]">
            {/* Euphoria Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Эйфорическое ощущение:</span>
                </span>
                <span className="font-bold text-emerald-300">
                  {currentDosage === 'micro' ? '35%' : currentDosage === 'standard' ? '70%' : currentDosage === 'high' ? '95%' : '100%'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-pulse transition-all duration-300"
                  style={{
                    width: currentDosage === 'micro' ? '35%' : currentDosage === 'standard' ? '70%' : currentDosage === 'high' ? '95%' : '100%',
                  }}
                />
              </div>
            </div>

            {/* Hallucination Intensity Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1 text-purple-400 font-bold">
                  <Flame className="w-3 h-3 text-purple-400" />
                  <span>Интенсивность галлюцинаций:</span>
                </span>
                <span className="font-bold text-purple-300">
                  {currentDosage === 'micro' ? '20%' : currentDosage === 'standard' ? '60%' : currentDosage === 'high' ? '90%' : '100%'}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-violet-400 transition-all duration-300"
                  style={{
                    width: currentDosage === 'micro' ? '20%' : currentDosage === 'standard' ? '60%' : currentDosage === 'high' ? '90%' : '100%',
                  }}
                />
              </div>
            </div>

            {/* Addiction / Tolerance Indicator */}
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <ShieldAlert className="w-3 h-3 text-amber-400" />
                  <span>Риск зависимости:</span>
                </span>
                <span className="font-bold text-amber-300">
                  +{currentDosage === 'micro' ? '2%' : currentDosage === 'standard' ? '8%' : currentDosage === 'high' ? '18%' : '32%'} к зависимости
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
                  style={{
                    width: currentDosage === 'micro' ? '15%' : currentDosage === 'standard' ? '40%' : currentDosage === 'high' ? '75%' : '100%',
                  }}
                />
              </div>
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
