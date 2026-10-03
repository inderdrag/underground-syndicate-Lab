import React from 'react';
import { MushroomBatch, MycologyStage, GameState } from '../types/game';
import { Flame, Syringe, Moon, Droplets, Wind, Scissors, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductionStepper } from './ProductionStepper';

interface MushroomGrowthInteractiveProps {
  batch: MushroomBatch;
  gameState: GameState;
  onUpdateBatch: (batchId: string, updates: Partial<MushroomBatch>) => void;
  onAdvanceStage: (batchId: string) => void;
  onHarvestBatch: (batchId: string) => void;
  language: Language;
}

export const MushroomGrowthInteractive: React.FC<MushroomGrowthInteractiveProps> = ({
  batch,
  gameState,
  onUpdateBatch,
  onAdvanceStage,
  onHarvestBatch,
  language,
}) => {
  const isSterilizationOptimal = batch.sterilizationPressurePsi >= 14 && batch.sterilizationPressurePsi <= 16;
  const isTempOptimal = batch.temperatureC >= 23 && batch.temperatureC <= 27;
  const isHumidityOptimal = batch.humidityPercent >= 88 && batch.humidityPercent <= 96;

  const stageTitles: Record<MycologyStage, { titleRu: string; descRu: string; color: string }> = {
    sterilization: {
      titleRu: '1. Автоклавирование и стерилизация зерна (15 PSI)',
      descRu: 'Термическая обработка питательного зернового субстрата в скороварке под давлением 15 PSI для устранения спор плесени.',
      color: 'text-amber-400 border-amber-500/30',
    },
    inoculation: {
      titleRu: '2. Инокуляция спорами в Still Air Box',
      descRu: 'Внесение взвеси спор Golden Teacher через стерильную инъекционную мембрану в перчаточном боксе.',
      color: 'text-cyan-400 border-cyan-500/30',
    },
    incubation: {
      titleRu: '3. Инкубация и колонизация мицелия (25°C)',
      descRu: 'Разрастание ризоморфного белоснежного мицелия в темноте при строго контролируемой температуре.',
      color: 'text-purple-400 border-purple-500/30',
    },
    fruiting: {
      titleRu: '4. Плодоношение в монотубе (FAE & 92% Влажность)',
      descRu: 'Появление примордий, рост золотистых шляпок и созревание плодовых тел под мягким рассеянным светом.',
      color: 'text-emerald-400 border-emerald-500/30',
    },
    harvested: {
      titleRu: '5. Готовый урожай Psilocybe Cubensis',
      descRu: 'Спелые плодовые тела готовы к бережному сбору, сушке и извлечению чистого псилоцибина.',
      color: 'text-teal-300 border-teal-500/30',
    },
  };

  const currentStageInfo = stageTitles[batch.stage] || stageTitles.sterilization;

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl space-y-0">
      {/* Unified Stylized Production Stepper Progress Bar */}
      <div className="p-3 border-b border-white/[0.06] bg-[#070b10]">
        <ProductionStepper
          domain="mycology"
          currentStepId={batch.stage}
          progressPercent={batch.progress}
        />
      </div>

      {/* Visual Canvas of the Current Stage */}
      <div className="relative aspect-[21/9] w-full bg-[#03060a] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
        {/* Ambient Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            batch.stage === 'sterilization'
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.15),transparent_65%)]'
              : batch.stage === 'inoculation'
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.18),transparent_65%)]'
              : batch.stage === 'incubation'
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_65%)]'
              : 'bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_65%)]'
          }`}
        />

        {/* Top HUD */}
        <div className="absolute top-2.5 inset-x-4 flex items-center justify-between pointer-events-none text-[10px] font-mono text-slate-300 z-10">
          <span className="flex items-center gap-1.5 bg-black/75 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {batch.name}
          </span>
          <span className="bg-black/75 px-2 py-0.5 rounded-lg border border-white/10 text-emerald-400">
            Потенциал: {batch.potency}% · ~{batch.yieldGrams}g
          </span>
        </div>

        {/* Stage Illustrations */}
        <div className="relative z-10 w-full h-full max-w-sm mx-auto flex items-center justify-center p-2">
          {/* 1. STERILIZATION: Autoclave & Pressure Gauge */}
          {batch.stage === 'sterilization' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              {/* Autoclave Vessel Body */}
              <ellipse cx="150" cy="150" rx="90" ry="22" fill="#1e293b" stroke="#475569" strokeWidth="2" />
              <rect x="60" y="55" width="180" height="95" rx="10" fill="#334155" stroke="#64748b" strokeWidth="2" />
              <ellipse cx="150" cy="55" rx="90" ry="18" fill="#475569" stroke="#94a3b8" strokeWidth="2" />

              {/* Steel Clamps */}
              <rect x="52" y="50" width="12" height="20" rx="2" fill="#94a3b8" />
              <rect x="236" y="50" width="12" height="20" rx="2" fill="#94a3b8" />

              {/* Pressure Gauge Dial */}
              <g transform="translate(150, 42)">
                <circle cx="0" cy="0" r="20" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
                <circle cx="0" cy="0" r="16" fill="#f8fafc" />
                {/* Needle pointing to 15 PSI */}
                <line x1="0" y1="0" x2="6" y2="-11" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                <circle cx="0" cy="0" r="2.5" fill="#0f172a" />
                <text x="-10" y="9" fontSize="6" fontWeight="bold" fill="#0f172a" fontFamily="monospace">15 PSI</text>
              </g>

              {/* Steam Plume */}
              <path d="M 210 40 Q 215 20 225 15 Q 235 25 240 10" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.6" strokeLinecap="round" />
            </svg>
          )}

          {/* 2. INOCULATION: Still Air Box & Syringe Injection */}
          {batch.stage === 'inoculation' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              {/* Acrylic Box Enclosure */}
              <polygon points="40,30 260,30 240,160 60,160" fill="rgba(6,182,212,0.06)" stroke="#0891b2" strokeWidth="1.5" />
              {/* Glove Ports */}
              <ellipse cx="100" cy="120" rx="22" ry="28" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
              <ellipse cx="200" cy="120" rx="22" ry="28" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />

              {/* Grain Jar in center */}
              <rect x="130" y="80" width="40" height="60" rx="4" fill="rgba(245,158,11,0.2)" stroke="#ca8a04" strokeWidth="1.5" />
              <rect x="133" y="74" width="34" height="6" rx="1" fill="#cbd5e1" />

              {/* Spore Syringe Needle */}
              <line x1="185" y1="35" x2="150" y2="76" stroke="#e2e8f0" strokeWidth="2.5" />
              <rect x="180" y="25" width="35" height="12" rx="2" fill="#06b6d4" stroke="#e2e8f0" strokeWidth="1" transform="rotate(-40 180 25)" />
              <circle cx="150" cy="76" r="3" fill="#38bdf8" />
            </svg>
          )}

          {/* 3. INCUBATION: Grain Jar Colonized by White Rhizomorphic Mycelium */}
          {batch.stage === 'incubation' && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.85)]">
              {/* Mason Jar */}
              <rect x="110" y="35" width="80" height="120" rx="12" fill="rgba(30,41,59,0.7)" stroke="#64748b" strokeWidth="2" />
              <rect x="120" y="25" width="60" height="10" rx="3" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />

              {/* Golden Rye Grain Base */}
              <rect x="115" y="55" width="70" height="95" rx="6" fill="#78350f" opacity="0.8" />
              {/* Grain Speckles */}
              <circle cx="130" cy="75" r="3" fill="#d97706" />
              <circle cx="160" cy="85" r="3.5" fill="#b45309" />
              <circle cx="140" cy="115" r="3" fill="#d97706" />
              <circle cx="165" cy="130" r="3.2" fill="#b45309" />

              {/* Spreading White Mycelium Hyphae Network */}
              <g stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round">
                <path d="M 150 100 Q 135 85 125 70" />
                <path d="M 150 100 Q 165 80 172 65" />
                <path d="M 150 100 Q 138 120 128 135" />
                <path d="M 150 100 Q 162 125 170 140" />
                <path d="M 135 85 Q 145 75 155 60" />
                <path d="M 165 80 Q 155 70 145 55" />
              </g>
              <circle cx="150" cy="100" r="8" fill="#ffffff" filter="drop-shadow(0 0 6px #38bdf8)" />
            </svg>
          )}

          {/* 4. FRUITING: Monotub with Forest of Golden Teacher Mushrooms */}
          {(batch.stage === 'fruiting' || batch.stage === 'harvested') && (
            <svg viewBox="0 0 300 180" className="w-full h-full filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)]">
              <defs>
                <radialGradient id="shroomCapGrad" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#b45309" />
                  <stop offset="90%" stopColor="#78350f" />
                </radialGradient>
              </defs>

              {/* Substrate Bulk Bed */}
              <rect x="50" y="130" width="200" height="35" rx="6" fill="#1c1917" stroke="#44403c" strokeWidth="1.5" />
              <rect x="55" y="132" width="190" height="8" rx="2" fill="#f8fafc" opacity="0.75" />

              {/* Shroom 1 (Center Large) */}
              <g transform="translate(150, 130)">
                <path d="M 0 0 Q -4 -35 0 -65" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" fill="none" />
                <path d="M -2 -25 Q -4 -10 -1 0" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.6" />
                <ellipse cx="0" cy="-68" rx="30" ry="18" fill="url(#shroomCapGrad)" />
                <ellipse cx="0" cy="-55" rx="27" ry="6" fill="#451a03" />
              </g>

              {/* Shroom 2 (Left Mid) */}
              <g transform="translate(105, 130)">
                <path d="M 10 0 Q -10 -25 -15 -48" stroke="#f1f5f9" strokeWidth="7.5" strokeLinecap="round" fill="none" />
                <ellipse cx="-16" cy="-50" rx="22" ry="14" fill="url(#shroomCapGrad)" transform="rotate(-15 -16 -50)" />
              </g>

              {/* Shroom 3 (Right Mid) */}
              <g transform="translate(195, 130)">
                <path d="M -10 0 Q 12 -25 18 -45" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" fill="none" />
                <ellipse cx="20" cy="-48" rx="20" ry="13" fill="url(#shroomCapGrad)" transform="rotate(15 20 -48)" />
              </g>

              {/* Small Primordia / Pins */}
              <ellipse cx="80" cy="128" rx="5" ry="8" fill="#b45309" />
              <ellipse cx="225" cy="128" rx="6" ry="9" fill="#b45309" />
            </svg>
          )}
        </div>

        {/* Floating Stage Indicator */}
        <div className="absolute bottom-2.5 left-4 flex items-center gap-2 z-10">
          <span className="px-3 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-cyan-400">
            {currentStageInfo.titleRu}
          </span>
          <span className="px-2 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
            {Math.round(batch.progress)}%
          </span>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="p-4 space-y-4">
        {/* Stage Description */}
        <p className="text-xs text-slate-300 font-medium leading-relaxed">
          {currentStageInfo.descRu}
        </p>

        {/* Parameters Controls */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
          {batch.stage === 'sterilization' && (
            <>
              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Давление:</span>
                  <strong className={isSterilizationOptimal ? 'text-emerald-400' : 'text-amber-400'}>
                    {batch.sterilizationPressurePsi} PSI
                  </strong>
                </div>
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => onUpdateBatch(batch.id, { sterilizationPressurePsi: 15 })}
                    className="w-full py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40 text-[10px] font-bold cursor-pointer hover:bg-amber-500/30"
                  >
                    Калибровать (15 PSI)
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Время автоклава:</span>
                  <strong className="text-cyan-400">{batch.sterilizationTimeMin} мин</strong>
                </div>
                <div className="text-[10px] text-slate-500">Норма: 90 минут</div>
              </div>
            </>
          )}

          {batch.stage === 'incubation' && (
            <>
              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Температура:</span>
                  <strong className={isTempOptimal ? 'text-emerald-400' : 'text-amber-400'}>
                    {batch.temperatureC}°C
                  </strong>
                </div>
                <div className="flex gap-1 pt-1">
                  <button
                    onClick={() => onUpdateBatch(batch.id, { temperatureC: 25 })}
                    className="w-full py-1 bg-purple-500/20 text-purple-300 rounded border border-purple-500/40 text-[10px] font-bold cursor-pointer hover:bg-purple-500/30"
                  >
                    Термостат 25°C
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Режим освещения:</span>
                  <strong className="text-purple-400">{batch.inDarkness ? 'Полная темнота' : 'Свет'}</strong>
                </div>
                <button
                  onClick={() => onUpdateBatch(batch.id, { inDarkness: !batch.inDarkness })}
                  className="w-full py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 text-[10px] cursor-pointer"
                >
                  Переключить
                </button>
              </div>
            </>
          )}

          {batch.stage === 'fruiting' && (
            <>
              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Влажность:</span>
                  <strong className={isHumidityOptimal ? 'text-emerald-400' : 'text-amber-400'}>
                    {batch.humidityPercent}%
                  </strong>
                </div>
                <button
                  onClick={() => onUpdateBatch(batch.id, { humidityPercent: 92 })}
                  className="w-full py-1 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/40 text-[10px] font-bold cursor-pointer hover:bg-cyan-500/30"
                >
                  Увлажнение (92%)
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/10 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Обдув FAE:</span>
                  <strong className="text-cyan-400">{batch.faeRate}%</strong>
                </div>
                <button
                  onClick={() => onUpdateBatch(batch.id, { faeRate: 85 })}
                  className="w-full py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded border border-white/10 text-[10px] cursor-pointer"
                >
                  Вентиляция 85%
                </button>
              </div>
            </>
          )}

          {/* Action Step Advancement Button */}
          <div className="col-span-2 flex items-center gap-2">
            {batch.stage !== 'harvested' ? (
              <button
                onClick={() => {
                  sounds.playPsychedelicChime();
                  onAdvanceStage(batch.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98"
              >
                <Zap className="w-4 h-4" />
                <span>
                  {batch.stage === 'sterilization'
                    ? 'Завершить автоклав ➔ Инокуляция'
                    : batch.stage === 'inoculation'
                    ? 'Ввести споры ➔ Инкубатор'
                    : batch.stage === 'incubation'
                    ? 'Мицелий готов ➔ Монотуб'
                    : 'Созрели ➔ К сбору'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sounds.playHarvest();
                  onHarvestBatch(batch.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md animate-bounce"
              >
                <Scissors className="w-4 h-4" />
                <span>Собрать урожай грибов (~{batch.yieldGrams}г)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
