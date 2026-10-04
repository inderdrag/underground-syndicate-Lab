import React, { useState, useEffect, useRef } from 'react';
import { PharmaDrugRecipe, MiniGameType } from '../../data/pharma_recipes_config';
import {
  Sliders,
  Timer,
  Flame,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  Zap,
  Activity,
  Award,
  Clock,
  Layers,
  Box,
  RotateCw,
  Check,
  Disc
} from 'lucide-react';
import { sounds } from '../../engine/soundEffects';

export interface PharmaCraftBatchOutcome {
  batchNumber: string;
  qualityScore: number; // 0 - 100%
  isDefective: boolean;
  defectReason?: string;
  producedUnits: number;
  finalValueMultiplier: number;
}

interface PharmaCraftingMiniGamesProps {
  recipe: PharmaDrugRecipe;
  onCraftCompleted: (outcome: PharmaCraftBatchOutcome) => void;
  onCancel: () => void;
}

export const PharmaCraftingMiniGames: React.FC<PharmaCraftingMiniGamesProps> = ({
  recipe,
  onCraftCompleted,
  onCancel
}) => {
  const batchNumRef = useRef<string>(`BATCH-#${Math.floor(100000 + Math.random() * 900000)}`);

  // --- SLIDER STATES ---
  const [sliderVal, setSliderVal] = useState<number>(50);
  const [sliderInertia, setSliderInertia] = useState<number>(0);
  const [goldenTarget] = useState<number>(Math.floor(40 + Math.random() * 20)); // 40-60
  const goldenTolerance = recipe.miniGameType === 'slider_precise' ? 4 : 10;

  // --- RHYTHM STATES ---
  const [rhythmBeat, setRhythmBeat] = useState<boolean>(false);
  const [rhythmScore, setRhythmScore] = useState<number>(0);
  const [overheatGauge, setOverheatGauge] = useState<number>(0);
  const [rhythmHitsLeft, setRhythmHitsLeft] = useState<number>(6);

  // --- LONG BREW STATES ---
  const [brewTimer, setBrewTimer] = useState<number>(recipe.craftTimeSeconds || 15);
  const [interfered, setInterfered] = useState<boolean>(false);

  // --- POWER / RISK BALANCE ---
  const [powerSetting, setPowerSetting] = useState<number>(50);

  // --- STERILITY STATES ---
  const [cleanlinessScore, setCleanlinessScore] = useState<number>(100);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  // --- NEW TABLET PRESS & GRANULATOR MINI-GAME STATES ---
  const [pressStage, setPressStage] = useState<'granulate' | 'punch' | 'package'>('granulate');
  const [granuleMoisture, setGranuleMoisture] = useState<number>(30); // Target: 45-55
  const [pistonPos, setPistonPos] = useState<number>(0); // 0 to 100 oscillation
  const [pressScore, setPressScore] = useState<number>(0);
  const [tabletsPressed, setTabletsPressed] = useState<number>(0);
  const [pressedPillList, setPressedPillList] = useState<{ id: number; quality: 'perfect' | 'good' | 'chipped' }[]>([]);

  // Tablet press piston oscillation loop
  useEffect(() => {
    if (recipe.miniGameType !== 'tablet_press' || pressStage !== 'punch') return;

    const interval = setInterval(() => {
      setPistonPos(prev => (prev + 8) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, [recipe.miniGameType, pressStage]);

  // Slow slider inertia effect
  useEffect(() => {
    if (recipe.miniGameType !== 'slider_slow') return;

    const interval = setInterval(() => {
      setSliderVal(prev => {
        const drift = (Math.random() - 0.5) * 4;
        return Math.max(10, Math.min(90, prev + drift + sliderInertia * 0.1));
      });
    }, 200);

    return () => clearInterval(interval);
  }, [recipe.miniGameType, sliderInertia]);

  // Rhythm beat ticker
  useEffect(() => {
    if (recipe.miniGameType !== 'rhythm' && recipe.miniGameType !== 'rhythm_overheat') return;

    const interval = setInterval(() => {
      setRhythmBeat(prev => !prev);
    }, 700);

    return () => clearInterval(interval);
  }, [recipe.miniGameType]);

  // Long brew ticker
  useEffect(() => {
    if (recipe.miniGameType !== 'long_brew') return;

    const interval = setInterval(() => {
      setBrewTimer(prev => {
        if (prev <= 1) {
          sounds.playOverrideSuccess();
          const bonus = interfered ? 0 : 25;
          const finalScore = Math.min(100, 75 + bonus);
          finishBatch(finalScore);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [recipe.miniGameType, interfered]);

  // Sterility particle spawner
  useEffect(() => {
    if (recipe.miniGameType !== 'sterility') return;

    const interval = setInterval(() => {
      if (particles.length < 5) {
        const p = { id: Date.now(), x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 70) + 15 };
        setParticles(prev => [...prev, p]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [recipe.miniGameType, particles]);

  const finishBatch = (qualityScore: number, defectReason?: string) => {
    const isDefective = qualityScore < 40 || !!defectReason;
    const finalMult = isDefective ? 0.3 : 0.8 + (qualityScore / 100) * 0.5;

    onCraftCompleted({
      batchNumber: batchNumRef.current,
      qualityScore: Math.round(qualityScore),
      isDefective,
      defectReason,
      producedUnits: recipe.rarity === 'legendary' ? 1 : recipe.rarity === 'epic' ? 5 : 10,
      finalValueMultiplier: finalMult
    });
  };

  // HANDLERS
  const handleSliderFinish = () => {
    const diff = Math.abs(sliderVal - goldenTarget);
    let score = 100 - diff * 4;
    if (score < 20) score = 20;

    if (diff <= goldenTolerance) {
      sounds.playOverrideSuccess();
    } else {
      sounds.playClick();
    }
    finishBatch(score);
  };

  const handleRhythmTap = () => {
    if (rhythmBeat) {
      sounds.playClick();
      setRhythmScore(s => s + 15);
      setOverheatGauge(g => Math.max(0, g - 5));
    } else {
      sounds.playAlarmBeep();
      setOverheatGauge(g => g + 20);
    }

    setRhythmHitsLeft(h => {
      const next = h - 1;
      if (next <= 0) {
        if (overheatGauge > 75) {
          finishBatch(25, 'Перегрев линии прессования!');
        } else {
          sounds.playOverrideSuccess();
          finishBatch(Math.min(100, 60 + rhythmScore));
        }
      }
      return next;
    });
  };

  const handleCleanParticle = (id: number) => {
    sounds.playClick();
    setParticles(prev => prev.filter(p => p.id !== id));
    setCleanlinessScore(c => Math.min(100, c + 5));
  };

  const handlePowerRiskFinish = () => {
    sounds.playClick();
    const isOverstrained = powerSetting > 80;
    if (isOverstrained && Math.random() < 0.4) {
      finishBatch(30, 'Откат из-за повышенного риска мощности!');
    } else {
      sounds.playOverrideSuccess();
      finishBatch(Math.min(100, 50 + powerSetting * 0.5));
    }
  };

  // TABLET PRESS HANDLERS
  const handleGranulateAdvance = () => {
    sounds.playClick();
    const isMoistureIdeal = granuleMoisture >= 45 && granuleMoisture <= 55;
    const initialScore = isMoistureIdeal ? 50 : 30;
    setPressScore(initialScore);
    setPressStage('punch');
  };

  const handlePunchStamp = () => {
    // Punch window: pistonPos between 40 and 60 is sweet spot!
    const isSweetSpot = pistonPos >= 40 && pistonPos <= 60;
    sounds.playClick();

    let pillQuality: 'perfect' | 'good' | 'chipped' = 'good';
    let addedScore = 15;

    if (isSweetSpot) {
      pillQuality = 'perfect';
      addedScore = 25;
      sounds.playOverrideSuccess();
    } else if (pistonPos < 20 || pistonPos > 80) {
      pillQuality = 'chipped';
      addedScore = 5;
      sounds.playAlarmBeep();
    }

    setPressedPillList(prev => [...prev, { id: Date.now(), quality: pillQuality }]);
    setPressScore(s => s + addedScore);

    const nextCount = tabletsPressed + 1;
    setTabletsPressed(nextCount);

    if (nextCount >= 3) {
      setPressStage('package');
    }
  };

  const handlePackageFinish = () => {
    sounds.playOverrideSuccess();
    const finalQuality = Math.min(100, Math.max(30, pressScore));
    finishBatch(finalQuality);
  };

  return (
    <div className="bg-[#0e1726] border border-cyan-500/30 rounded-2xl p-5 text-white space-y-4 shadow-2xl">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base text-cyan-200">
            Крафт: {recipe.name} ({batchNumRef.current})
          </h3>
        </div>
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-white">Отмена</button>
      </div>

      {/* NEW: TABLET PRESS & GRANULATOR MINI-GAME */}
      {recipe.miniGameType === 'tablet_press' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className={`font-bold ${pressStage === 'granulate' ? 'text-emerald-400' : 'text-slate-500'}`}>
              1. Увлажнение порошка
            </span>
            <span className="text-slate-600">➔</span>
            <span className={`font-bold ${pressStage === 'punch' ? 'text-cyan-400' : 'text-slate-500'}`}>
              2. Прессование таблеток
            </span>
            <span className="text-slate-600">➔</span>
            <span className={`font-bold ${pressStage === 'package' ? 'text-purple-400' : 'text-slate-500'}`}>
              3. Запечатка в блистер
            </span>
          </div>

          {/* STAGE 1: GRANULATION */}
          {pressStage === 'granulate' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                Отрегулируйте влажность гранулята до <strong>целевой зоны (45% — 55%)</strong> перед подачей в матрицу пресса.
              </p>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Влажность смеси:</span>
                  <span className={`font-mono font-bold text-base ${granuleMoisture >= 45 && granuleMoisture <= 55 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {granuleMoisture}% {granuleMoisture >= 45 && granuleMoisture <= 55 ? '✓ (ИДЕАЛЬНО)' : ''}
                  </span>
                </div>

                <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div className="absolute top-0 bottom-0 bg-emerald-500/40 border-x border-emerald-400" style={{ left: '45%', width: '10%' }} />
                  <div className="absolute top-0 bottom-0 w-2 bg-cyan-400 rounded" style={{ left: `${granuleMoisture}%` }} />
                </div>

                <input
                  type="range"
                  min="10"
                  max="90"
                  value={granuleMoisture}
                  onChange={e => setGranuleMoisture(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleGranulateAdvance}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/30"
              >
                ПОДАТЬ ГРАНУЛЯТ В МАТРИЦУ ПРЕССА ➔
              </button>
            </div>
          )}

          {/* STAGE 2: PUNCHING & COMPRESSION */}
          {pressStage === 'punch' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                Нажимайте <strong>«ПРЕССОВАТЬ»</strong> в момент, когда гидравлический пуансон попадает в зеленый сектор матрицы! ({tabletsPressed}/3 штамповок)
              </p>

              {/* Interactive SVG Tablet Press Visual */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 relative flex flex-col items-center justify-center min-h-[160px]">
                <svg className="w-full h-32" viewBox="0 0 300 120">
                  {/* Outer Frame */}
                  <rect x="50" y="10" width="200" height="100" rx="10" fill="#0f172a" stroke="#334155" strokeWidth="2" />

                  {/* Puncher guide */}
                  <rect x="135" y="15" width="30" height="90" fill="#1e293b" stroke="#475569" />

                  {/* Green Sweet Spot Zone */}
                  <rect x="130" y="50" width="40" height="20" fill="#10b981" opacity="0.3" rx="2" />
                  <line x1="120" y1="60" x2="180" y2="60" stroke="#10b981" strokeDasharray="3,3" strokeWidth="1.5" />

                  {/* Moving Piston Head */}
                  <rect
                    x="133"
                    y={15 + (pistonPos / 100) * 70}
                    width="34"
                    height="12"
                    fill={pistonPos >= 40 && pistonPos <= 60 ? '#38bdf8' : '#f43f5e'}
                    rx="2"
                    className="transition-all duration-75"
                  />

                  {/* Embossing Die Stamp Base */}
                  <ellipse cx="150" cy="95" rx="18" ry="6" fill="#64748b" />

                  {/* Tablet Icon falling if stamped */}
                  {pressedPillList.map((pill, idx) => (
                    <circle
                      key={pill.id}
                      cx={190 + idx * 22}
                      cy="92"
                      r="8"
                      fill={pill.quality === 'perfect' ? '#10b981' : pill.quality === 'good' ? '#38bdf8' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                    />
                  ))}
                </svg>

                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Положение пуансона: <span className="text-cyan-300 font-bold">{pistonPos}%</span>
                </div>
              </div>

              <button
                onClick={handlePunchStamp}
                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-base rounded-xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                <Disc className="w-5 h-5 animate-spin" /> ПРЕССОВАТЬ ТАБЛЕТКУ ({tabletsPressed + 1}/3)
              </button>
            </div>
          )}

          {/* STAGE 3: BLISTER PACKAGING */}
          {pressStage === 'package' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="font-bold text-emerald-300 text-sm">Таблетки отпрессованы и заклеймены!</h4>
                <p className="text-xs text-slate-300">
                  Готовая партитура высшего качества. Нажмите «Запечатать в Блистер» для завершения.
                </p>

                <div className="flex justify-center gap-2 pt-2">
                  {pressedPillList.map((pill, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                      Таблетка #{idx + 1}: {pill.quality === 'perfect' ? '⭐ Идеально' : '✓ Норма'}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handlePackageFinish}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-purple-600/30"
              >
                ЗАПЕЧАТАТЬ В БЛИСТЕР И СДАТЬ НА СКЛАД
              </button>
            </div>
          )}
        </div>
      )}

      {/* 1. SLIDER MINI-GAME */}
      {(recipe.miniGameType === 'slider_normal' || recipe.miniGameType === 'slider_slow' || recipe.miniGameType === 'slider_precise') && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Удерживайте ползунок в <strong className="text-emerald-400">золотой зоне ({goldenTarget}%)</strong>.
            {recipe.miniGameType === 'slider_slow' && ' (Повышенная инерция!)'}
            {recipe.miniGameType === 'slider_precise' && ' (Узкий допуск!)'}
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="relative h-6 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="absolute top-0 bottom-0 bg-emerald-500/40 border-x border-emerald-400"
                style={{ left: `${goldenTarget - goldenTolerance}%`, width: `${goldenTolerance * 2}%` }}
              />
              <div
                className="absolute top-0 bottom-0 w-2 bg-cyan-400 rounded"
                style={{ left: `${sliderVal}%` }}
              />
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={sliderVal}
              onChange={e => {
                setSliderVal(Number(e.target.value));
                setSliderInertia(Number(e.target.value) - sliderVal);
              }}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handleSliderFinish}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95"
          >
            ФИКСИРОВАТЬ РЕЗУЛЬТАТ (ЗОЛОТАЯ ЗОНА)
          </button>
        </div>
      )}

      {/* 2. RHYTHM MINI-GAME */}
      {(recipe.miniGameType === 'rhythm' || recipe.miniGameType === 'rhythm_overheat') && (
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-300">
            Нажимайте в такт вспышкам ритма! Ошибки накапливают перегрев. Осталось ударов: {rhythmHitsLeft}
          </p>

          {recipe.miniGameType === 'rhythm_overheat' && (
            <div className="text-xs text-amber-400">Перегрев: {overheatGauge}%</div>
          )}

          <div className="flex justify-center my-4">
            <div
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
                rhythmBeat ? 'bg-cyan-500 border-cyan-200 scale-110 shadow-cyan-500/50 shadow-2xl' : 'bg-slate-900 border-slate-700'
              }`}
            >
              <Zap className={`w-8 h-8 ${rhythmBeat ? 'text-white' : 'text-slate-600'}`} />
            </div>
          </div>

          <button
            onClick={handleRhythmTap}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-base rounded-xl transition-all active:scale-95 shadow-xl"
          >
            🎵 УДАР В ТАКТ РИТМА
          </button>
        </div>
      )}

      {/* 3. LONG BREW MINI-GAME */}
      {recipe.miniGameType === 'long_brew' && (
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-300">
            Долгая варка антидепрессанта. Не вмешивайтесь в процесс, чтобы получить бонус терпения (+25% к качеству)!
          </p>

          <div className="text-4xl font-black text-amber-400 my-4 flex items-center justify-center gap-2">
            <Clock className="w-8 h-8 animate-spin text-amber-400" />
            <span>{brewTimer} сек</span>
          </div>

          <button
            onClick={() => {
              setInterfered(true);
              sounds.playClick();
            }}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-lg border border-slate-700"
          >
            Помешать раствор (Сбросит бонус терпения)
          </button>
        </div>
      )}

      {/* 4. POWER / RISK BALANCE */}
      {recipe.miniGameType === 'power_risk_balance' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Чем выше мощность реактора, тем выше выход, но растет шанс осложнений и небрака!
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Сила: {powerSetting}%</span>
              <span>Риск: {powerSetting > 70 ? 'ВЫСОКИЙ' : 'НИЗКИЙ'}</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={powerSetting}
              onChange={e => setPowerSetting(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handlePowerRiskFinish}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95"
          >
            ЗАПУСТИТЬ СИНТЕЗ С ТЕКУЩЕЙ МОЩНОСТЬЮ
          </button>
        </div>
      )}

      {/* 5. STERILITY CLEAN ROOM */}
      {recipe.miniGameType === 'sterility' && (
        <div className="space-y-4">
          <div className="flex justify-between text-xs text-emerald-300">
            <span>Стерильность: {cleanlinessScore}%</span>
            <span>Частиц: {particles.length}</span>
          </div>

          <div className="relative bg-slate-950 border border-emerald-800 h-44 rounded-xl overflow-hidden p-2">
            {particles.map(p => (
              <button
                key={p.id}
                onClick={() => handleCleanParticle(p.id)}
                className="absolute w-6 h-6 bg-emerald-500 hover:bg-white text-slate-950 rounded-full font-bold text-[10px] shadow-lg animate-bounce border border-white"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                🧫
              </button>
            ))}
          </div>

          <button
            onClick={() => finishBatch(cleanlinessScore)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg active:scale-95"
          >
            ЗАВЕРШИТЬ СТЕРИЛЬНУЮ ФАСОВКУ В АМПУЛЫ
          </button>
        </div>
      )}
    </div>
  );
};
