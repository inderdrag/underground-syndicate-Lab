import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { FlaskConical, Beaker, ShieldAlert, Sparkles, Plus, CheckCircle2, Zap, Gauge, Flame, Wind, Sliders, Layers } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductionStepper } from './ProductionStepper';

export type CocaineStage =
  | 'maceration'
  | 'solvent_wash'
  | 'acid_conversion'
  | 'vacuum_filtration'
  | 'crystallized';

export interface CocaineBatch {
  id: string;
  stage: CocaineStage;
  progress: number;
  purity: number; // e.g. 96%
  yieldGrams: number; // e.g. 50g
  hclAdded: boolean;
  vacuumPsi: number;
  tempC?: number;
  phValue?: number;
}

interface CocaineRefiningInteractiveProps {
  batch: CocaineBatch;
  gameState: GameState;
  onUpdateBatch: (updates: Partial<CocaineBatch>) => void;
  onAdvanceStage: () => void;
  onFinishCocaineBatch: (yieldGrams: number) => void;
  language: Language;
}

export const CocaineRefiningInteractive: React.FC<CocaineRefiningInteractiveProps> = ({
  batch,
  gameState,
  onUpdateBatch,
  onAdvanceStage,
  onFinishCocaineBatch,
  language,
}) => {
  // Local stage mini-controls state
  const [macerationTemp, setMacerationTemp] = useState<number>(batch.tempC || 40.0);
  const [funnelValveOpen, setFunnelValveOpen] = useState<boolean>(false);
  const [drainProgress, setDrainProgress] = useState<number>(0);
  const [titrationPh, setTitrationPh] = useState<number>(batch.phValue || 5.8);
  const [vacuumBar, setVacuumBar] = useState<number>(0);

  // Maceration temperature oscillation simulation
  useEffect(() => {
    if (batch.stage !== 'maceration') return;
    const interval = setInterval(() => {
      setMacerationTemp((prev) => {
        const drift = (Math.random() - 0.48) * 0.4;
        const next = Math.max(30, Math.min(55, prev + drift));
        onUpdateBatch({ tempC: next });
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [batch.stage]);

  // Funnel draining loop
  useEffect(() => {
    if (!funnelValveOpen || batch.stage !== 'solvent_wash') return;
    const interval = setInterval(() => {
      setDrainProgress((prev) => {
        if (prev >= 100) {
          setFunnelValveOpen(false);
          return 100;
        }
        return prev + 2.5;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [funnelValveOpen, batch.stage]);

  const handleTitrateAcid = (delta: number) => {
    sounds.playClick();
    const nextPh = Math.max(1.0, Math.min(8.0, Math.round((titrationPh + delta) * 10) / 10));
    setTitrationPh(nextPh);
    onUpdateBatch({ phValue: nextPh });

    if (nextPh >= 2.8 && nextPh <= 3.2) {
      sounds.playOverrideSuccess();
      onUpdateBatch({ purity: Math.min(99, batch.purity + 2) });
    }
  };

  const stageTitles: Record<CocaineStage, { titleRu: string; descRu: string }> = {
    maceration: {
      titleRu: '1. Щелочная мацерация и термо-рециркуляция',
      descRu: 'Выщелачивание алкалоидов из растительного сырья карбонатом калия при 38°C–44°C.',
    },
    solvent_wash: {
      titleRu: '2. Промывка органическим растворителем и разделение фаз',
      descRu: 'Гравитационное разделение органической фазы от водного остатка в делительной воронке.',
    },
    acid_conversion: {
      titleRu: '3. Кислотная HCl микро-титрация (Target: 2.8–3.2 pH)',
      descRu: 'Капельное добавление концентрированной соляной кислоты до точки кристаллизации соли.',
    },
    vacuum_filtration: {
      titleRu: '4. Вакуумная фильтрация Бюхнера & Промывка ацетоном',
      descRu: 'Отсос маточного раствора под вакуумом -25 inHg и промывка ледяным ацетоном от эфирных масел.',
    },
    crystallized: {
      titleRu: '5. Сушка кристаллов Fishscale 96% в стеклянной чаше',
      descRu: 'Чистейшие чешуйчатые кристаллы гидрохлорида кокаина высушены и готовы к фасовке.',
    },
  };

  const currentInfo = stageTitles[batch.stage] || stageTitles.maceration;

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl space-y-0">
      {/* Production Stepper Progress Bar */}
      <div className="p-3 border-b border-white/[0.06] bg-[#070b10]">
        <ProductionStepper
          domain="cocaine"
          currentStepId={batch.stage}
          progressPercent={batch.progress}
        />
      </div>

      {/* Visual Canvas of the Cocaine Purification Laboratory */}
      <div className="relative aspect-[21/9] w-full bg-[#03060a] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
        {/* Amber Ambient Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.18),transparent_65%)] pointer-events-none" />

        {/* Top HUD */}
        <div className="absolute top-2.5 inset-x-4 flex items-center justify-between pointer-events-none text-[10px] font-mono text-slate-300 z-10">
          <span className="flex items-center gap-1.5 bg-black/75 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Cocaine HCl Multi-Stage Refinery
          </span>
          <span className="bg-black/75 px-2 py-0.5 rounded-lg border border-white/10 text-amber-300">
            Чистота: {batch.purity}% Fishscale · Выход: ~{batch.yieldGrams}g
          </span>
        </div>

        {/* Vector Lab Stage Drawings */}
        <div className="relative z-10 w-full h-full max-w-sm mx-auto flex items-center justify-center p-2">
          {/* STAGE 1: Maceration Reactor */}
          {batch.stage === 'maceration' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              <rect x="100" y="40" width="100" height="110" rx="8" fill="rgba(245,158,11,0.15)" stroke="#ca8a04" strokeWidth="2" />
              <rect x="104" y="80" width="92" height="66" rx="4" fill="#854d0e" opacity="0.8" />
              <line x1="150" y1="20" x2="150" y2="100" stroke="#f59e0b" strokeWidth="2" />
              <path d="M130,110 Q150,100 170,110" stroke="#fef08a" strokeWidth="2" fill="none" />
              <circle cx="130" cy="110" r="4" fill="#ca8a04" />
              <circle cx="165" cy="120" r="3.5" fill="#ca8a04" />
            </svg>
          )}

          {/* STAGE 2: Separatory Funnel Wash */}
          {batch.stage === 'solvent_wash' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              <polygon points="120,30 180,30 160,110 140,110" fill="rgba(255,255,255,0.08)" stroke="#fbbf24" strokeWidth="2" />
              <rect x="126" y="40" width="48" height="30" fill="#ca8a04" opacity="0.8" />
              <rect x="131" y="70" width="38" height="30" fill="#0284c7" opacity="0.7" />
              <rect x="146" y="110" width="8" height="25" fill="#e2e8f0" />
              <line x1="140" y1="122" x2="160" y2="122" stroke="#f43f5e" strokeWidth="3" />
            </svg>
          )}

          {/* STAGE 3: Acid Conversion Micro-Titration */}
          {batch.stage === 'acid_conversion' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              <rect x="110" y="50" width="80" height="100" rx="4" fill="rgba(255,255,255,0.1)" stroke="#cbd5e1" strokeWidth="2" />
              <rect x="114" y="90" width="72" height="56" rx="2" fill="#f8fafc" opacity="0.85" />
              <circle cx="150" cy="65" r="3" fill="#fef08a" />
              <circle cx="150" cy="78" r="3" fill="#fef08a" />
              <line x1="150" y1="30" x2="150" y2="60" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}

          {/* STAGE 4: Büchner Funnel Filtration */}
          {batch.stage === 'vacuum_filtration' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              <polygon points="115,30 185,30 160,75 140,75" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="2" />
              <rect x="125" y="40" width="50" height="15" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
              <polygon points="135,75 165,75 190,150 110,150" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" strokeWidth="2" />
              <line x1="165" y1="85" x2="210" y2="85" stroke="#64748b" strokeWidth="4" />
              <text x="215" y="88" fill="#38bdf8" fontSize="8" fontFamily="monospace">-25 inHg</text>
            </svg>
          )}

          {/* STAGE 5: Fishscale Borosilicate Glass Dish */}
          {batch.stage === 'crystallized' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]">
              <g transform="translate(150, 95)">
                <polygon points="-80,-30 0,-55 80,-30 0,-5" fill="none" stroke="#67e8f9" strokeWidth="2.5" opacity="0.8" />
                <polygon points="-80,-30 -80,15 0,40 80,15 80,-30 0,-5" fill="rgba(6,182,212,0.06)" stroke="#38bdf8" strokeWidth="2" />
                <line x1="0" y1="-5" x2="0" y2="40" stroke="#38bdf8" strokeWidth="2" />
                <polygon points="-38,-8 -20,-30 -8,-16 -12,8 -30,12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1" />
                <polygon points="-8,-16 18,-32 28,-10 14,10 -10,8" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <polygon points="16,-10 36,-22 45,-2 32,15 14,10" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              </g>
            </svg>
          )}
        </div>

        {/* Floating Stage Indicator */}
        <div className="absolute bottom-2.5 left-4 flex items-center gap-2 z-10">
          <span className="px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-amber-400">
            {currentInfo.titleRu}
          </span>
          <span className="px-2 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
            {Math.round(batch.progress)}%
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar Per Stage */}
      <div className="p-4 space-y-4">
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {currentInfo.descRu}
        </p>

        {/* Interactive Controls per Stage */}
        {batch.stage === 'maceration' && (
          <div className="p-3 bg-[#070a0f] border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Температура термостата:</span>
              <span className={`font-bold ${macerationTemp >= 38 && macerationTemp <= 44 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {macerationTemp.toFixed(1)}°C (Цель: 38–44°C)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMacerationTemp((prev) => Math.max(30, prev - 1.5))}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300 hover:bg-white/10"
              >
                -1.5°C
              </button>
              <button
                onClick={() => setMacerationTemp((prev) => Math.min(60, prev + 1.5))}
                className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300 hover:bg-white/10"
              >
                +1.5°C
              </button>
              <span className="text-[10px] font-mono text-slate-400">
                {macerationTemp >= 38 && macerationTemp <= 44 ? '✅ Оптимальный нагрев' : '⚠️ Отклонение от нормы'}
              </span>
            </div>
          </div>
        )}

        {batch.stage === 'solvent_wash' && (
          <div className="p-3 bg-[#070a0f] border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Слив водного слоя из воронки:</span>
              <span className="text-amber-300 font-bold">{Math.round(drainProgress)}%</span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setFunnelValveOpen(!funnelValveOpen);
              }}
              className={`w-full py-2 rounded-lg font-mono text-xs font-bold transition-all ${
                funnelValveOpen ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {funnelValveOpen ? 'ОСТАНОВИТЬ СЛИВ КЛАПАНА' : 'ОТКРЫТЬ СЛИВНОЙ КЛАПАН ВОРОНКИ'}
            </button>
          </div>
        )}

        {batch.stage === 'acid_conversion' && (
          <div className="p-3 bg-[#070a0f] border border-amber-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Кислотность раствора (pH):</span>
              <span className={`font-bold ${titrationPh >= 2.8 && titrationPh <= 3.2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                pH {titrationPh.toFixed(1)} (Цель: 2.8 – 3.2 pH)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTitrateAcid(-0.2)}
                className="flex-1 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-lg text-xs font-mono font-bold text-amber-300 hover:bg-amber-500/30"
              >
                + Капля HCl (-0.2 pH)
              </button>
              <button
                onClick={() => handleTitrateAcid(0.2)}
                className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-slate-300 hover:bg-white/10"
              >
                + Разбавитель (+0.2 pH)
              </button>
            </div>
          </div>
        )}

        {batch.stage === 'vacuum_filtration' && (
          <div className="p-3 bg-[#070a0f] border border-cyan-500/30 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Вакуумная откачка Бюхнера:</span>
              <span className="text-cyan-400 font-bold">{vacuumBar} inHg</span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setVacuumBar((prev) => Math.min(28, prev + 5));
              }}
              className="w-full py-2 bg-cyan-500 text-slate-950 font-mono text-xs font-bold rounded-lg hover:bg-cyan-400 transition-all"
            >
              НАКАЧАТЬ ВАКУУМНЫЙ НАСОС (-25 inHg)
            </button>
          </div>
        )}

        {/* Global Progress Action Button */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Чистота:</span>
              <strong className="text-amber-400">{batch.purity}% Fishscale</strong>
            </div>
            <div className="text-[10px] text-slate-500">Лабораторный грейд</div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Выход кристалла:</span>
              <strong className="text-emerald-400">~{batch.yieldGrams} грамм</strong>
            </div>
            <div className="text-[10px] text-slate-500">Высокая концентрация</div>
          </div>

          <div className="col-span-2 flex items-center gap-2">
            {batch.stage !== 'crystallized' ? (
              <button
                onClick={() => {
                  sounds.playLabReaction();
                  onAdvanceStage();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {batch.stage === 'maceration'
                    ? 'Мацерация завершена ➔ Промывка растворителем'
                    : batch.stage === 'solvent_wash'
                    ? 'Фазы разделены ➔ HCl Конверсия'
                    : batch.stage === 'acid_conversion'
                    ? 'Соль выпала ➔ Вакуумная фильтрация'
                    : 'Фильтрация завершена ➔ Кристаллизация'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.playCash();
                  onFinishCocaineBatch(batch.yieldGrams);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Собрать кристаллы кокаина (+{batch.yieldGrams}г на склад)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
