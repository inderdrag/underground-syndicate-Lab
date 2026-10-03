import React, { useState, useEffect } from 'react';
import { LSDSynthesisBatch, SynthesisStage, GameState } from '../types/game';
import { FlaskConical, Beaker, Lightbulb, Grid, CheckCircle2, Zap, ShieldAlert, Sparkles, Flame, HeartPulse } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductionStepper } from './ProductionStepper';

interface LSDSynthesisInteractiveProps {
  batch: LSDSynthesisBatch;
  gameState: GameState;
  onUpdateBatch: (batchId: string, updates: Partial<LSDSynthesisBatch>) => void;
  onAdvanceStage: (batchId: string) => void;
  onCompleteDosing: (batchId: string) => void;
  onTriggerOverdose?: (substanceName: string, fee: number) => void;
  language: Language;
}

export const LSDSynthesisInteractive: React.FC<LSDSynthesisInteractiveProps> = ({
  batch,
  gameState,
  onUpdateBatch,
  onAdvanceStage,
  onCompleteDosing,
  onTriggerOverdose,
  language,
}) => {
  const isTempOptimal = batch.refluxTempC >= 42 && batch.refluxTempC <= 48;
  const isRpmOptimal = batch.magneticStirrerRpm >= 450 && batch.magneticStirrerRpm <= 600;

  // Precision Dosing Mini-game state
  const [selectedDoseUg, setSelectedDoseUg] = useState<150 | 300 | 600>(150);
  const [isDosingMiniGame, setIsDosingMiniGame] = useState<boolean>(false);
  const [pipettePos, setPipettePos] = useState<number>(15);
  const [pipetteDirection, setPipetteDirection] = useState<'right' | 'left'>('right');

  // Animation loop for dosing pipette needle
  useEffect(() => {
    if (!isDosingMiniGame || batch.stage !== 'dosing') return;

    const interval = setInterval(() => {
      setPipettePos((prev) => {
        const speed = selectedDoseUg === 600 ? 4.5 : selectedDoseUg === 300 ? 2.8 : 1.8;
        if (prev >= 88) {
          setPipetteDirection('left');
          return 87;
        }
        if (prev <= 12) {
          setPipetteDirection('right');
          return 13;
        }
        return pipetteDirection === 'right' ? prev + speed : prev - speed;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isDosingMiniGame, batch.stage, pipetteDirection, selectedDoseUg]);

  const handleAttemptDosingCalibration = () => {
    const minZone = selectedDoseUg === 600 ? 44 : selectedDoseUg === 300 ? 38 : 30;
    const maxZone = selectedDoseUg === 600 ? 56 : selectedDoseUg === 300 ? 62 : 70;

    const isSuccess = pipettePos >= minZone && pipettePos <= maxZone;

    if (isSuccess) {
      sounds.playOverrideSuccess();
      onUpdateBatch(batch.id, {
        blotterDoseUg: selectedDoseUg,
        purity: Math.min(100, batch.purity + (selectedDoseUg === 600 ? 6 : 2)),
      });
      setIsDosingMiniGame(false);
      onAdvanceStage(batch.id);
    } else {
      sounds.playAlarmBeep();
      if (selectedDoseUg === 600) {
        // Critical Overdose Failure on Extreme Dosing!
        if (onTriggerOverdose) {
          onTriggerOverdose('ЛСД-25 (Сверхмощный Овердрайв 600 мкг)', 250);
        }
        onUpdateBatch(batch.id, { purity: 20 });
      } else {
        // Minor penalty
        onUpdateBatch(batch.id, { purity: Math.max(40, batch.purity - 15) });
      }
      setIsDosingMiniGame(false);
    }
  };

  const stageTitles: Record<SynthesisStage, { titleRu: string; descRu: string; color: string }> = {
    precursor_extraction: {
      titleRu: '1. Экстракция алкалоидов спорыньи (Claviceps)',
      descRu: 'Выделение кристаллического эрготамина и пептидных алкалоидов из культуры спорыньи с помощью безводного растворителя.',
      color: 'text-indigo-400 border-indigo-500/30',
    },
    reaction: {
      titleRu: '2. Пептидная конденсация с диэтиламином (45°C, 500 RPM)',
      descRu: 'Конденсация эрготамина с диэтиламином под обратным холодильником в среде сухого инертного газа.',
      color: 'text-purple-400 border-purple-500/30',
    },
    purification: {
      titleRu: '3. Колоночная хроматография в красном свете Safelight',
      descRu: 'Очистка на силикагеле для изоляции чистого d-изомера ЛСД-25 без фотодеградации ультрафиолетом.',
      color: 'text-rose-400 border-rose-500/30',
    },
    dosing: {
      titleRu: '4. Пропитка блоттер-листов «Bicycle 1943» (150 мкг)',
      descRu: 'Калиброванное нанесение спиртового раствора тартрата ЛСД на сетку 900 перфорированных марок.',
      color: 'text-amber-400 border-amber-500/30',
    },
    completed: {
      titleRu: '5. Готовые кристаллические марки ЛСД-25',
      descRu: 'Высокочистый продукт 98% фармацевтического качества готов к вакуумной упаковке и распределению.',
      color: 'text-pink-400 border-pink-500/30',
    },
  };

  const currentStageInfo = stageTitles[batch.stage] || stageTitles.precursor_extraction;

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl space-y-0">
      {/* Unified Stylized Production Stepper Progress Bar */}
      <div className="p-3 border-b border-white/[0.06] bg-[#070b10]">
        <ProductionStepper
          domain="lsd"
          currentStepId={batch.stage}
          progressPercent={batch.progress}
        />
      </div>

      {/* Visual Canvas of Laboratory Glassware & Apparatus */}
      <div className="relative aspect-[21/9] w-full bg-[#03060a] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
        {/* Safelight or Ambient Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            batch.safelightActive
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.22),transparent_70%)]'
              : 'bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.18),transparent_65%)]'
          }`}
        />

        {/* Top HUD */}
        <div className="absolute top-2.5 inset-x-4 flex items-center justify-between pointer-events-none text-[10px] font-mono text-slate-300 z-10">
          <span className="flex items-center gap-1.5 bg-black/75 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            LSD-25 Synthetic Batch
          </span>
          <span className="bg-black/75 px-2 py-0.5 rounded-lg border border-white/10 text-pink-400">
            Чистота: {batch.purity}% d-LSD · Деградация: {batch.uvDegradation}%
          </span>
        </div>

        {/* Vector Lab Apparatus Drawings */}
        <div className="relative z-10 w-full h-full max-w-sm mx-auto flex items-center justify-center p-2">
          {/* 1. EXTRACTION: Separatory Funnel & Erlenmeyer Flask */}
          {batch.stage === 'precursor_extraction' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              {/* Stand */}
              <line x1="80" y1="20" x2="80" y2="160" stroke="#64748b" strokeWidth="4" />
              <line x1="60" y1="160" x2="160" y2="160" stroke="#64748b" strokeWidth="6" />

              {/* Separatory Funnel */}
              <polygon points="120,40 160,40 145,110 135,110" fill="rgba(168,85,247,0.15)" stroke="#c084fc" strokeWidth="1.5" />
              {/* Organic Top Layer */}
              <polygon points="124,55 156,55 150,75 130,75" fill="#7e22ce" opacity="0.8" />
              {/* Aqueous Bottom Layer */}
              <polygon points="130,75 150,75 142,105 138,105" fill="#e879f9" opacity="0.6" />
              {/* Stopcock */}
              <circle cx="140" cy="115" r="4" fill="#64748b" />
              <line x1="132" y1="115" x2="148" y2="115" stroke="#94a3b8" strokeWidth="3" />

              {/* Erlenmeyer Flask collecting extract */}
              <polygon points="130,130 150,130 165,160 115,160" fill="rgba(168,85,247,0.3)" stroke="#c084fc" strokeWidth="1.5" />
              <polygon points="122,148 158,148 162,158 118,158" fill="#d946ef" />
            </svg>
          )}

          {/* 2. REACTION: Reflux Condenser & Magnetic Stirrer Hotplate */}
          {batch.stage === 'reaction' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              {/* Magnetic Stirrer Base */}
              <rect x="100" y="140" width="100" height="25" rx="4" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <circle cx="120" cy="152" r="5" fill="#38bdf8" />
              <text x="135" y="155" fill="#94a3b8" fontSize="8" fontFamily="monospace">45°C / 500 RPM</text>

              {/* Round Bottom Reaction Flask */}
              <ellipse cx="150" cy="120" rx="32" ry="24" fill="rgba(168,85,247,0.3)" stroke="#c084fc" strokeWidth="2" />
              <ellipse cx="150" cy="126" rx="28" ry="14" fill="#a855f7" />
              {/* Magnetic Stir Bar Spinning Vortex */}
              <rect x="142" y="126" width="16" height="4" rx="2" fill="#ffffff" transform="rotate(25 150 128)" />

              {/* Liebig Reflux Condenser Tube */}
              <rect x="144" y="30" width="12" height="70" fill="rgba(56,189,248,0.2)" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="140" y1="45" x2="144" y2="45" stroke="#38bdf8" strokeWidth="2" />
              <line x1="156" y1="80" x2="160" y2="80" stroke="#38bdf8" strokeWidth="2" />
            </svg>
          )}

          {/* 3. PURIFICATION: Flash Silica Column & Red Safelight */}
          {batch.stage === 'purification' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              {/* Red Safelight Bulb in corner */}
              <g transform="translate(60, 40)">
                <circle cx="0" cy="0" r="16" fill="#ef4444" filter="drop-shadow(0 0 12px #ef4444)" />
                <circle cx="0" cy="0" r="10" fill="#fca5a5" />
              </g>

              {/* Chromatography Column */}
              <rect x="142" y="30" width="16" height="110" rx="3" fill="rgba(255,255,255,0.15)" stroke="#cbd5e1" strokeWidth="1.5" />
              {/* Silica Gel White Bed */}
              <rect x="144" y="45" width="12" height="85" fill="#f8fafc" opacity="0.75" />
              {/* Purified d-LSD Luminescent Band */}
              <rect x="144" y="80" width="12" height="14" fill="#38bdf8" filter="drop-shadow(0 0 8px #38bdf8)" />

              {/* Collection Flask at bottom */}
              <polygon points="140,145 160,145 170,165 130,165" fill="rgba(56,189,248,0.3)" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="150" cy="142" r="2" fill="#38bdf8" />
            </svg>
          )}

          {/* 4. DOSING & COMPLETED: Perforated Bicycle 1943 Blotter Sheet */}
          {(batch.stage === 'dosing' || batch.stage === 'completed') && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
              <defs>
                <linearGradient id="bicycleSky" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>

              <g transform="translate(150, 90) rotate(-15)">
                {/* Yellow Frame */}
                <rect x="-70" y="-45" width="140" height="90" rx="4" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
                {/* Art Area */}
                <rect x="-64" y="-39" width="128" height="78" fill="url(#bicycleSky)" />
                {/* Swiss Alps Hills */}
                <path d="M -64 15 Q -30 -10 0 20 Q 30 -5 64 20 L 64 39 L -64 39 Z" fill="#15803d" />

                {/* Cyclist Icon */}
                <circle cx="-14" cy="0" r="5" fill="#ffffff" />
                <path d="M -14 5 L -6 16 L 8 16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="-18" cy="18" r="7" stroke="#ffffff" strokeWidth="2" fill="none" />
                <circle cx="14" cy="18" r="7" stroke="#ffffff" strokeWidth="2" fill="none" />

                <text x="22" y="32" fill="#1e1b4b" fontSize="12" fontWeight="bold" fontFamily="monospace">1943</text>

                {/* Perforation Grid Lines */}
                <line x1="-35" y1="-39" x2="-35" y2="39" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
                <line x1="0" y1="-39" x2="0" y2="39" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
                <line x1="35" y1="-39" x2="35" y2="39" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
                <line x1="-64" y1="-12" x2="64" y2="-12" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
                <line x1="-64" y1="12" x2="64" y2="12" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
              </g>
            </svg>
          )}
        </div>

        {/* Floating Stage Indicator */}
        <div className="absolute bottom-2.5 left-4 flex items-center gap-2 z-10">
          <span className="px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-purple-400">
            {currentStageInfo.titleRu}
          </span>
          <span className="px-2 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
            {Math.round(batch.progress)}%
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-4 space-y-3">
        {/* Step-by-step clear guidance banner */}
        <div className="p-3 bg-[#080d16] border border-purple-500/30 rounded-xl flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-purple-300 font-mono">
              {batch.stage === 'precursor_extraction' && '💡 Шаг 1 из 4: Подготовка раствора спорыньи'}
              {batch.stage === 'reaction' && '💡 Шаг 2 из 4: Настройка реактора (Температура и Обороты)'}
              {batch.stage === 'purification' && '💡 Шаг 3 из 4: Колоночная очистка и Защита от УФ'}
              {batch.stage === 'dosing' && '💡 Шаг 4 из 4: Нанесение тартрата на блоттер-сетку'}
              {batch.stage === 'completed' && '✨ Партия готова к отправке на склад!'}
            </span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {batch.stage === 'precursor_extraction' &&
                'Экстракция задействует безводный растворитель. Нажмите «Экстрагировать ➔ Конденсация» снизу, чтобы перейти к реактору.'}
              {batch.stage === 'reaction' &&
                'Нажмите «Нагрев 45°C» и «Скорость 500 RPM» для оптимальной реакции, затем нажмите «Синтез завершен ➔ Хроматография».'}
              {batch.stage === 'purification' &&
                'ОБЯЗАТЕЛЬНО нажмите кнопку «Переключить Safelight», чтобы включить красный неактиничный свет! Без него ультрафиолет портят продукт.'}
              {batch.stage === 'dosing' &&
                'Раствор калибруется по стандарту 150 мкг/марку на 900 перфораций. Нажмите «Завершить калибровку ➔ Готово».'}
              {batch.stage === 'completed' &&
                'Нажмите кнопку ниже, чтобы забрать готовый арт-лист ЛСД-25 (900 марок) стоимостью ~$3,850 в инвентарь.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {batch.stage === 'reaction' && (
            <>
              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Температура:</span>
                  <strong className={isTempOptimal ? 'text-emerald-400' : 'text-amber-400'}>
                    {batch.refluxTempC}°C
                  </strong>
                </div>
                <button
                  onClick={() => onUpdateBatch(batch.id, { refluxTempC: 45 })}
                  className="w-full py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/40 text-[10px] font-bold cursor-pointer hover:bg-purple-500/30"
                >
                  Нагрев 45°C
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Магнитная мешалка:</span>
                  <strong className={isRpmOptimal ? 'text-emerald-400' : 'text-amber-400'}>
                    {batch.magneticStirrerRpm} RPM
                  </strong>
                </div>
                <button
                  onClick={() => onUpdateBatch(batch.id, { magneticStirrerRpm: 500 })}
                  className="w-full py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40 text-[10px] font-bold cursor-pointer hover:bg-cyan-500/30"
                >
                  Скорость 500 RPM
                </button>
              </div>
            </>
          )}

          {batch.stage === 'purification' && (
            <>
              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Красный свет Safelight:</span>
                  <strong className={batch.safelightActive ? 'text-emerald-400' : 'text-rose-500'}>
                    {batch.safelightActive ? 'ВКЛЮЧЕН (Защита)' : 'ВЫКЛЮЧЕН'}
                  </strong>
                </div>
                <button
                  onClick={() => onUpdateBatch(batch.id, { safelightActive: !batch.safelightActive })}
                  className="w-full py-1 bg-rose-500/20 text-rose-300 rounded border border-rose-500/40 text-[10px] font-bold cursor-pointer hover:bg-rose-500/30"
                >
                  Переключить Safelight
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Фракция чистоты:</span>
                  <strong className="text-pink-400">{batch.purity}%</strong>
                </div>
                <div className="text-[10px] text-slate-500">УФ-деградация: 0%</div>
              </div>
            </>
          )}

          {batch.stage === 'dosing' && (
            <div className="col-span-2 space-y-3 p-3 bg-[#080d16] border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-amber-300">Выберите дозировку на марку (концентрация):</span>
                <span className="text-slate-400">Стоимость листа растет от мощности</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setSelectedDoseUg(150)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedDoseUg === 150
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">150 мкг</div>
                  <div className="text-[10px] opacity-75">Стандарт ($3,850)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDoseUg(300)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                    selectedDoseUg === 300
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">300 мкг</div>
                  <div className="text-[10px] opacity-75">Высокая ($5,200)</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDoseUg(600)}
                  className={`p-2 rounded-lg border text-center transition-all cursor-pointer relative overflow-hidden ${
                    selectedDoseUg === 600
                      ? 'bg-rose-500/25 border-rose-500 text-rose-300 font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'bg-black/30 border-white/10 text-slate-400 hover:text-rose-300'
                  }`}
                >
                  <div className="font-bold flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    <span>600 мкг</span>
                  </div>
                  <div className="text-[9px] text-rose-400 font-bold">Овердрайв ($7,800)</div>
                </button>
              </div>

              {selectedDoseUg === 600 && (
                <div className="p-2 bg-rose-950/60 border border-rose-500/40 rounded-lg text-[11px] text-rose-200 font-mono flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    ⚠️ <strong>СВЕРХСИЛЬНАЯ ДОЗИРОВКА:</strong> Ошибка в калибровке принесет критическую передозировку и реанимацию ($250)! Требуется идеальное попадание пипетки.
                  </span>
                </div>
              )}

              {/* Dosing Mini-game slider */}
              {isDosingMiniGame ? (
                <div className="space-y-2 pt-2 border-t border-white/10 font-mono">
                  <div className="flex justify-between text-[11px] text-slate-300 font-bold">
                    <span>КАЛИБРОВКА КАПЕЛЬНОЙ ПИПЕТКИ:</span>
                    <span className="text-amber-400 font-mono">{Math.round(pipettePos)}%</span>
                  </div>

                  {/* Visual Bar */}
                  <div className="relative h-7 w-full bg-black/80 rounded-xl border border-white/20 overflow-hidden flex items-center">
                    {/* Target Zone Green Highlight */}
                    <div
                      className="absolute top-0 bottom-0 bg-emerald-500/35 border-x-2 border-emerald-400/80 animate-pulse"
                      style={{
                        left: `${selectedDoseUg === 600 ? 44 : selectedDoseUg === 300 ? 38 : 30}%`,
                        width: `${selectedDoseUg === 600 ? 12 : selectedDoseUg === 300 ? 24 : 40}%`,
                      }}
                    />

                    {/* Oscillating Needle */}
                    <div
                      className="absolute top-0 bottom-0 w-2 bg-amber-400 shadow-[0_0_12px_#fbbf24] transition-all duration-30 z-10"
                      style={{ left: `${pipettePos}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAttemptDosingCalibration}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 animate-pulse"
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>[ СТОП ] ЗАФИКСИРОВАТЬ ТОЧНУЮ ДОЗИРОВКУ ({selectedDoseUg} мкг)</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDosingMiniGame(true)}
                  className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold font-mono transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>НАЧАТЬ ТОЧНУЮ КАЛИБРОВКУ ПРОПИТКИ ({selectedDoseUg} мкг)</span>
                </button>
              )}
            </div>
          )}

          {/* Action Step Advancement Button */}
          <div className="col-span-2 flex items-center gap-2">
            {batch.stage !== 'completed' ? (
              <button
                onClick={() => {
                  sounds.playLabReaction();
                  onAdvanceStage(batch.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {batch.stage === 'precursor_extraction'
                    ? 'Экстрагировать ➔ Конденсация'
                    : batch.stage === 'reaction'
                    ? 'Синтез завершен ➔ Хроматография'
                    : batch.stage === 'purification'
                    ? 'Очищено ➔ Пропитка блоттера'
                    : 'Завершить калибровку ➔ Готово'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.playHarvest();
                  onCompleteDosing(batch.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Упаковать готовый лист ЛСД-25 (900 марок)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
