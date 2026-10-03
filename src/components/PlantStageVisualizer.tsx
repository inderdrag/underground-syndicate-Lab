import React, { useState, useEffect } from 'react';
import { Sparkles, ZoomIn, Play, Pause, RotateCcw, Droplets, Sun, Info, CheckCircle2 } from 'lucide-react';
import { PlantStage } from '../types/game';
import { Language } from '../i18n/translations';

export type GrowthStageKey = 'seedling' | 'vegetative' | 'flowering' | 'ready_harvest';

interface PlantStageVisualizerProps {
  stage: PlantStage;
  progress: number;
  health: number;
  strainName?: string;
  lightWattage?: number;
  language: Language;
}

export const PlantStageVisualizer: React.FC<PlantStageVisualizerProps> = ({
  stage,
  progress,
  health,
  strainName = 'Cannabis Specimen',
  lightWattage = 600,
  language,
}) => {
  const [isMicroscopeOpen, setIsMicroscopeOpen] = useState<boolean>(false);
  const [isTimelapsePlaying, setIsTimelapsePlaying] = useState<boolean>(false);
  const [timelapseProgress, setTimelapseProgress] = useState<number>(progress);

  // Sync timelapse with actual progress when not in active playback
  useEffect(() => {
    if (!isTimelapsePlaying) {
      setTimelapseProgress(progress);
    }
  }, [progress, isTimelapsePlaying]);

  // Handle timelapse auto-play
  useEffect(() => {
    if (!isTimelapsePlaying) return;
    const interval = setInterval(() => {
      setTimelapseProgress((prev) => {
        if (prev >= 100) {
          setIsTimelapsePlaying(false);
          return 100;
        }
        return Math.min(100, prev + 2.5);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isTimelapsePlaying]);

  const effectiveProgress = isTimelapsePlaying ? timelapseProgress : progress;

  // Derive visual stage from progress
  const visualStage: GrowthStageKey =
    effectiveProgress < 22
      ? 'seedling'
      : effectiveProgress < 55
      ? 'vegetative'
      : effectiveProgress < 85
      ? 'flowering'
      : 'ready_harvest';

  const stageDescriptions: Record<
    Language,
    Record<
      GrowthStageKey,
      {
        title: string;
        desc: string;
        pistils: string;
        trichomes: string;
        optimalLight: string;
      }
    >
  > = {
    ru: {
      seedling: {
        title: 'Фаза сеянца (Seedling)',
        desc: 'Прорастание семени в почве, появление первых семядолей и зубчатой пары листьев. Высокая влажность (65-70%) и мягкий спектр.',
        pistils: 'Стигмы отсутствуют',
        trichomes: 'Трихомы не сформированы',
        optimalLight: 'Спектр 6500K (Холодный белый)',
      },
      vegetative: {
        title: 'Вегетативная фаза (Vegetation)',
        desc: 'Интенсивный рост биомассы, формирование мощного стебля и 7-палых веерных листьев. Пик потребления азота (N) и фотосинтеза.',
        pistils: 'Ранние предцветы в междоузлиях',
        trichomes: 'Первичные железистые волоски',
        optimalLight: '18/6 световой день, активный вегетативный LED',
      },
      flowering: {
        title: 'Фаза цветения (Flowering)',
        desc: 'Формирование плотных чашечек (calyxes), появление сотен белых волосков-стигм. Начинается активная выработка каннабиноидов.',
        pistils: 'Белые и кремовые стигмы 80%',
        trichomes: 'Прозрачные стеклянные головки (60%)',
        optimalLight: '12/12 цикл, теплый спектр 2700K-3000K',
      },
      ready_harvest: {
        title: 'Пик созревания и Харвест (Ripening)',
        desc: 'Каменные шишки, покрытые плотным слоем морозных трихом. Пестики закручиваются в янтарно-оранжевые спирали. Пик ТГК и терпенов.',
        pistils: 'Оранжевые и медные волоски 90%',
        trichomes: 'Молочные (70%) + Янтарные (30%) — Пик качества',
        optimalLight: 'Финальный промыв (Flush), темнота 24ч перед срезом',
      },
    },
    en: {
      seedling: {
        title: 'Seedling Stage',
        desc: 'Cotyledon emergence and first serrated true leaves. Requires gentle humidity (65-70%) and seedling illumination.',
        pistils: 'No pistils present',
        trichomes: 'No trichomes formed',
        optimalLight: '6500K Cool White spectrum',
      },
      vegetative: {
        title: 'Vegetative Growth',
        desc: 'Rapid structural foliage development with 7-finger fan leaves. High Nitrogen uptake and canopy expansion.',
        pistils: 'Early pre-flowers at nodes',
        trichomes: 'Initial glandular hairs',
        optimalLight: '18/6 light schedule, high PAR coverage',
      },
      flowering: {
        title: 'Flowering & Budding',
        desc: 'Calyx development and explosion of white pistil hairs. Onset of active resin biosynthesis.',
        pistils: '80% White & Cream stigmas',
        trichomes: 'Clear crystal resin heads (60%)',
        optimalLight: '12/12 schedule, 2700K warm bloom spectrum',
      },
      ready_harvest: {
        title: 'Trichome Ripening & Harvest',
        desc: 'Dense, rock-hard frosty colas. Pistils turn burnt orange. Trichomes shift to cloudy and amber.',
        pistils: '90% Burnt copper pistils',
        trichomes: 'Cloudy (70%) + Amber (30%) — Peak Potency',
        optimalLight: 'Pre-harvest flush & 24h darkness cure',
      },
    },
  };

  const currentDesc = stageDescriptions[language][visualStage];

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg space-y-0">
      {/* Visual Canvas Display Area */}
      <div className="relative aspect-video sm:aspect-[21/9] w-full bg-[#05080c] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
        {/* Ambient Grow Light Backlight Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            visualStage === 'seedling'
              ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.18),transparent_70%)]'
              : visualStage === 'vegetative'
              ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(34,197,94,0.22),transparent_65%)]'
              : visualStage === 'flowering'
              ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.2),transparent_65%)]'
              : 'bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.25),rgba(16,185,129,0.15),transparent_75%)]'
          }`}
        />

        {/* Grow Tent Light Fixture Top Bar Overlay */}
        <div className="absolute top-2 inset-x-8 flex items-center justify-between pointer-events-none opacity-60 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1">
            <Sun className="w-3 h-3 text-amber-400" />
            {lightWattage}W LED FIXTURE · {visualStage === 'flowering' || visualStage === 'ready_harvest' ? '2700K BLOOM' : '6500K VEG'}
          </span>
          <span className="flex items-center gap-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            RH: {visualStage === 'seedling' ? '68%' : visualStage === 'vegetative' ? '58%' : '42%'}
          </span>
        </div>

        {/* Dynamic Vector/Canvas Stage Visual */}
        <div className="relative z-10 w-full h-full max-w-lg mx-auto flex items-center justify-center p-3">
          {/* 1. SEEDLING STAGE (0-22%) */}
          {visualStage === 'seedling' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <defs>
                <radialGradient id="soilGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#2e1a0d" />
                  <stop offset="100%" stopColor="#0f0905" />
                </radialGradient>
                <linearGradient id="stemGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="60%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Substrate Soil Base */}
              <ellipse cx="150" cy="155" rx="110" ry="22" fill="url(#soilGlow)" stroke="#451a03" strokeWidth="1" />
              <circle cx="120" cy="150" r="3" fill="#1e1108" />
              <circle cx="180" cy="154" r="4" fill="#1e1108" />
              <circle cx="145" cy="162" r="2.5" fill="#382012" />

              {/* Emerging Sprout Stem */}
              <path d="M 150 152 Q 148 115 150 85" stroke="url(#stemGrad)" strokeWidth="5.5" strokeLinecap="round" fill="none" />

              {/* Cotyledon Rounded Leaves (Baby Leaves) */}
              <ellipse cx="140" cy="85" rx="14" ry="8" fill="#10b981" transform="rotate(-20 140 85)" />
              <ellipse cx="160" cy="85" rx="14" ry="8" fill="#059669" transform="rotate(20 160 85)" />

              {/* First Pair of Serrated True Cannabis Leaves */}
              <path d="M 150 82 Q 115 62 108 55 Q 128 72 150 80" fill="#34d399" stroke="#059669" strokeWidth="1" />
              <path d="M 150 82 Q 185 62 192 55 Q 172 72 150 80" fill="#10b981" stroke="#047857" strokeWidth="1" />
              <path d="M 150 78 Q 150 48 147 42 Q 153 58 150 78" fill="#6ee7b7" />

              {/* Water Dew Droplet Glistening */}
              <circle cx="112" cy="58" r="2.2" fill="#e0f2fe" opacity="0.9" />
              <circle cx="185" cy="62" r="1.8" fill="#e0f2fe" opacity="0.85" />
            </svg>
          )}

          {/* 2. VEGETATIVE STAGE (22-55%) */}
          {visualStage === 'vegetative' && (
            <svg viewBox="0 0 320 200" className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
              <defs>
                <linearGradient id="vegLeafLight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="60%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#14532d" />
                </linearGradient>
                <linearGradient id="vegLeafDark" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#052e16" />
                </linearGradient>
              </defs>

              {/* Robust Woody Stalk */}
              <path d="M 160 190 Q 158 120 160 65" stroke="#15803d" strokeWidth="8" strokeLinecap="round" fill="none" />
              <path d="M 160 130 Q 120 115 95 105" stroke="#166534" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 160 120 Q 200 105 225 95" stroke="#166534" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 160 90 Q 130 80 110 70" stroke="#15803d" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 160 85 Q 190 75 210 65" stroke="#15803d" strokeWidth="4" strokeLinecap="round" fill="none" />

              {/* Left Fan Leaf (7 fingers) */}
              <g transform="translate(95, 105) rotate(-35)">
                <path d="M 0 0 Q -35 -20 -60 0 Q -35 15 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q -45 -35 -70 -20 Q -40 -5 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q -25 -45 -55 -40 Q -25 -20 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q 0 -50 -30 -60 Q -5 -30 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q 25 -45 5 -60 Q 5 -30 0 0" fill="url(#vegLeafLight)" />
              </g>

              {/* Right Fan Leaf (7 fingers) */}
              <g transform="translate(225, 95) rotate(35)">
                <path d="M 0 0 Q 35 -20 60 0 Q 35 15 0 0" fill="url(#vegLeafDark)" />
                <path d="M 0 0 Q 45 -35 70 -20 Q 40 -5 0 0" fill="url(#vegLeafDark)" />
                <path d="M 0 0 Q 25 -45 55 -40 Q 25 -20 0 0" fill="url(#vegLeafDark)" />
                <path d="M 0 0 Q 0 -50 30 -60 Q 5 -30 0 0" fill="url(#vegLeafDark)" />
                <path d="M 0 0 Q -25 -45 -5 -60 Q -5 -30 0 0" fill="url(#vegLeafDark)" />
              </g>

              {/* Center Top Canopy */}
              <g transform="translate(160, 65)">
                <path d="M 0 0 Q -40 -35 -50 -55 Q -25 -30 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q 40 -35 50 -55 Q 25 -30 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q 0 -55 0 -75 Q 10 -45 0 0" fill="#4ade80" />
                <path d="M 0 0 Q -25 -50 -25 -70 Q -5 -40 0 0" fill="url(#vegLeafLight)" />
                <path d="M 0 0 Q 25 -50 25 -70 Q 5 -40 0 0" fill="url(#vegLeafLight)" />
              </g>
            </svg>
          )}

          {/* 3. FLOWERING STAGE (55-85%) */}
          {visualStage === 'flowering' && (
            <svg viewBox="0 0 320 200" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
              <defs>
                <radialGradient id="bloomBud" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="70%" stopColor="#15803d" />
                  <stop offset="100%" stopColor="#052e16" />
                </radialGradient>
              </defs>

              {/* Stem */}
              <path d="M 160 195 L 160 45" stroke="#166534" strokeWidth="9" strokeLinecap="round" />

              {/* Bud Colas Swelling Along Main Stem */}
              <ellipse cx="160" cy="140" rx="35" ry="25" fill="url(#bloomBud)" />
              <ellipse cx="160" cy="105" rx="38" ry="28" fill="url(#bloomBud)" />
              <ellipse cx="160" cy="70" rx="32" ry="32" fill="url(#bloomBud)" />

              {/* Sugar Leaves protruding from Buds */}
              <path d="M 125 105 Q 85 95 90 75 Q 115 90 125 105" fill="#15803d" />
              <path d="M 195 105 Q 235 95 230 75 Q 205 90 195 105" fill="#15803d" />
              <path d="M 130 65 Q 95 45 110 35 Q 130 50 130 65" fill="#16a34a" />
              <path d="M 190 65 Q 225 45 210 35 Q 190 50 190 65" fill="#16a34a" />

              {/* Abundant White and Cream Pistil Hairs (Stigmas) */}
              <path d="M 150 100 Q 130 90 120 105" stroke="#fef08a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 170 100 Q 190 90 200 105" stroke="#fef08a" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 155 70 Q 135 55 125 65" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 165 70 Q 185 55 195 65" stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              <path d="M 160 50 Q 150 30 162 25" stroke="#fef08a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              <path d="M 160 50 Q 170 30 158 25" stroke="#ffffff" strokeWidth="2.4" fill="none" strokeLinecap="round" />

              {/* Early Glistening Trichome Glands */}
              <circle cx="145" cy="85" r="1.8" fill="#ffffff" opacity="0.9" />
              <circle cx="175" cy="85" r="1.8" fill="#ffffff" opacity="0.9" />
              <circle cx="160" cy="95" r="2.0" fill="#ffffff" opacity="0.95" />
              <circle cx="150" cy="130" r="1.8" fill="#ffffff" opacity="0.8" />
              <circle cx="170" cy="130" r="1.8" fill="#ffffff" opacity="0.8" />
            </svg>
          )}

          {/* 4. READY HARVEST STAGE (85-100%) - ULTRA DETAILED LIKE USER'S REFERENCE */}
          {visualStage === 'ready_harvest' && (
            <svg viewBox="0 0 340 220" className="w-full h-full filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]">
              <defs>
                <radialGradient id="denseBudCore" cx="45%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="50%" stopColor="#14532d" />
                  <stop offset="85%" stopColor="#052e16" />
                  <stop offset="100%" stopColor="#021a0c" />
                </radialGradient>
                <filter id="trichomeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Main Thick Cured Bud Cola */}
              <g transform="translate(170, 110)">
                {/* Secondary Bottom Calyx Clumps */}
                <ellipse cx="-35" cy="40" rx="30" ry="24" fill="url(#denseBudCore)" />
                <ellipse cx="35" cy="40" rx="30" ry="24" fill="url(#denseBudCore)" />
                <ellipse cx="0" cy="45" rx="38" ry="26" fill="url(#denseBudCore)" />

                {/* Mid Tier Calyx Clusters */}
                <ellipse cx="-25" cy="5" rx="35" ry="28" fill="url(#denseBudCore)" />
                <ellipse cx="25" cy="5" rx="35" ry="28" fill="url(#denseBudCore)" />
                <ellipse cx="0" cy="-5" rx="42" ry="32" fill="url(#denseBudCore)" />

                {/* Top Apex Crown */}
                <ellipse cx="-15" cy="-45" rx="28" ry="24" fill="url(#denseBudCore)" />
                <ellipse cx="15" cy="-45" rx="28" ry="24" fill="url(#denseBudCore)" />
                <ellipse cx="0" cy="-60" rx="26" ry="22" fill="url(#denseBudCore)" />

                {/* Frosty Sugar Leaves with Trichomes */}
                <path d="M -40 -10 Q -80 -25 -70 -5 Q -45 5 -40 -10" fill="#14532d" stroke="#052e16" strokeWidth="1" />
                <path d="M 40 -10 Q 80 -25 70 -5 Q 45 5 40 -10" fill="#14532d" stroke="#052e16" strokeWidth="1" />
                <path d="M -30 -50 Q -60 -80 -40 -70 Q -25 -55 -30 -50" fill="#15803d" />
                <path d="M 30 -50 Q 60 -80 40 -70 Q 25 -55 30 -50" fill="#15803d" />

                {/* Burnt Orange & Copper Curled Pistils (Like uploaded reference) */}
                <path d="M -25 -65 Q -45 -85 -30 -90 Q -20 -80 -22 -65" stroke="#ea580c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M 25 -65 Q 45 -85 30 -90 Q 20 -80 22 -65" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M -35 -15 Q -65 -30 -55 -10 Q -40 -5 -35 -15" stroke="#c2410c" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M 35 -15 Q 65 -30 55 -10 Q 40 -5 35 -15" stroke="#ea580c" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M 0 -25 Q -25 -10 -15 15" stroke="#f97316" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <path d="M 10 20 Q 35 35 15 50" stroke="#c2410c" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <path d="M -15 20 Q -35 35 -15 50" stroke="#ea580c" strokeWidth="2.6" fill="none" strokeLinecap="round" />

                {/* Heavy Diamond Frosting of Milky & Amber Trichomes */}
                <circle cx="-15" cy="-60" r="2.5" fill="#f8fafc" filter="url(#trichomeGlow)" />
                <circle cx="15" cy="-60" r="2.5" fill="#fef3c7" filter="url(#trichomeGlow)" />
                <circle cx="0" cy="-45" r="3.2" fill="#ffffff" filter="url(#trichomeGlow)" />
                <circle cx="-25" cy="-30" r="2.8" fill="#fde68a" filter="url(#trichomeGlow)" />
                <circle cx="25" cy="-30" r="2.8" fill="#ffffff" filter="url(#trichomeGlow)" />
                <circle cx="-10" cy="-5" r="3.4" fill="#ffffff" filter="url(#trichomeGlow)" />
                <circle cx="15" cy="-10" r="3.0" fill="#fde68a" filter="url(#trichomeGlow)" />
                <circle cx="-35" cy="15" r="2.8" fill="#f8fafc" filter="url(#trichomeGlow)" />
                <circle cx="35" cy="15" r="2.8" fill="#fef3c7" filter="url(#trichomeGlow)" />
                <circle cx="0" cy="25" r="3.2" fill="#ffffff" filter="url(#trichomeGlow)" />
                <circle cx="-18" cy="45" r="2.6" fill="#fde68a" filter="url(#trichomeGlow)" />
                <circle cx="18" cy="45" r="2.6" fill="#ffffff" filter="url(#trichomeGlow)" />
              </g>
            </svg>
          )}
        </div>

        {/* Live Stage Floating Pill & Progress Indicator */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            {currentDesc.title}
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
            {Math.round(effectiveProgress)}%
          </span>
        </div>

        {/* Action Controls Overlay (Microscope & Timelapse) */}
        <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
          <button
            onClick={() => setIsMicroscopeOpen(true)}
            className="p-2 rounded-xl bg-black/80 hover:bg-black/95 text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono shadow-md"
            title="Микроскоп трихом (100x Macro)"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">100x Микроскоп</span>
          </button>

          <button
            onClick={() => {
              if (isTimelapsePlaying) {
                setIsTimelapsePlaying(false);
              } else {
                setTimelapseProgress(0);
                setIsTimelapsePlaying(true);
              }
            }}
            className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 backdrop-blur-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono shadow-md"
            title="Запустить таймлапс роста"
          >
            {isTimelapsePlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Пауза</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Таймлапс роста</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stage Botanical Details & Parameters */}
      <div className="p-4 space-y-3 bg-[#0d131d]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{strainName}</span>
              <span className="text-xs font-mono text-slate-400">· {currentDesc.title}</span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {currentDesc.desc}
            </p>
          </div>
          <div className="text-right text-xs font-mono shrink-0">
            <span className="text-slate-400">Жизнеспособность: </span>
            <strong className="text-emerald-400 font-bold">{health}%</strong>
          </div>
        </div>

        {/* 4 Stage Timeline Steps Selector */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-xs font-mono">
          {(['seedling', 'vegetative', 'flowering', 'ready_harvest'] as GrowthStageKey[]).map((st, idx) => {
            const isCurrent = visualStage === st;
            const titles: Record<GrowthStageKey, string> = {
              seedling: '1. Сеянец',
              vegetative: '2. Вегетация',
              flowering: '3. Цветение',
              ready_harvest: '4. Харвест',
            };
            const targetProgs: Record<GrowthStageKey, number> = {
              seedling: 10,
              vegetative: 38,
              flowering: 70,
              ready_harvest: 98,
            };
            return (
              <button
                key={st}
                onClick={() => {
                  setIsTimelapsePlaying(false);
                  setTimelapseProgress(targetProgs[st]);
                }}
                className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm font-bold'
                    : 'bg-[#121824] border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="truncate text-[11px]">{titles[st]}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {idx === 0 ? '0-22%' : idx === 1 ? '22-55%' : idx === 2 ? '55-85%' : '85-100%'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Botanical Inspection Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-[#121824] border border-white/5">
            <span className="text-slate-400 block text-[10px]">Волоски / Стигмы:</span>
            <span className="text-amber-300 font-semibold">{currentDesc.pistils}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121824] border border-white/5">
            <span className="text-slate-400 block text-[10px]">Статус смолы и трихом:</span>
            <span className="text-cyan-300 font-semibold">{currentDesc.trichomes}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#121824] border border-white/5">
            <span className="text-slate-400 block text-[10px]">Оптимальный режим:</span>
            <span className="text-slate-200">{currentDesc.optimalLight}</span>
          </div>
        </div>
      </div>

      {/* 100x Microscope Modal Overlay */}
      {isMicroscopeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b1018] border border-white/15 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">
                  100x Микроскоп трихом (Trichome Macro Lens)
                </h3>
              </div>
              <button
                onClick={() => setIsMicroscopeOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Circular Microscope Lens View */}
            <div className="relative w-64 h-64 mx-auto rounded-full border-4 border-cyan-500/40 bg-black overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.25)] flex items-center justify-center">
              {/* Microscope Crosshair & Scale Ring */}
              <div className="absolute inset-0 border border-cyan-400/20 rounded-full pointer-events-none" />
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-400/25 pointer-events-none" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-400/25 pointer-events-none" />

              {/* High-res rendered trichome gland heads */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Background tissue */}
                <rect width="200" height="200" fill="#04210f" />

                {/* Stalk 1 & Head (Milky) */}
                <path d="M 60 180 Q 75 120 70 80" stroke="#a7f3d0" strokeWidth="12" strokeLinecap="round" opacity="0.85" />
                <circle cx="70" cy="70" r="22" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" filter="drop-shadow(0 0 8px rgba(255,255,255,0.7))" />

                {/* Stalk 2 & Head (Amber Peak THC) */}
                <path d="M 130 180 Q 125 110 135 75" stroke="#a7f3d0" strokeWidth="14" strokeLinecap="round" opacity="0.85" />
                <circle cx="138" cy="65" r="24" fill="#f59e0b" stroke="#d97706" strokeWidth="2.5" filter="drop-shadow(0 0 10px rgba(245,158,11,0.8))" />

                {/* Stalk 3 (Clear immature) */}
                <path d="M 175 190 Q 165 140 170 110" stroke="#6ee7b7" strokeWidth="10" strokeLinecap="round" opacity="0.7" />
                <circle cx="170" cy="105" r="16" fill="#38bdf8" opacity="0.75" stroke="#bae6fd" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Trichome Legend */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#121824] border border-white/5">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block" />
                  <span>Прозрачные (Недозрелые)</span>
                </span>
                <span className="text-slate-400">10%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#121824] border border-white/5">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-white inline-block shadow-[0_0_8px_white]" />
                  <span>Молочные (Пик ТГК)</span>
                </span>
                <span className="text-emerald-400 font-bold">60%</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-[#121824] border border-white/5">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-[0_0_8px_orange]" />
                  <span>Янтарные (Терпены и КБД)</span>
                </span>
                <span className="text-amber-400 font-bold">30%</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              Идеальное окно для срезки: 70% молочных и 30% янтарных головок.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
