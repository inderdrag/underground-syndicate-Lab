import React, { useState, useEffect } from 'react';
import {
  Layers,
  Droplets,
  RotateCw,
  Filter,
  AlertTriangle,
  Star,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../engine/soundEffects';

export interface CocaineMiniGameResult {
  stars: number;
  purityDelta: number;
  yieldDelta: number;
  feedback: string;
}

interface CocaineMiniGamesProps {
  cocaineGrams: number;
  purity: number;
  stageIndex: number; // 0: Maceration/Extraction, 1: Solvent Wash, 2: Cooling/Crystallization, 3: Sieve, 4: Press
  onCompleteMinigame: (result: CocaineMiniGameResult) => void;
  onTriggerHeatEvent?: (heat: number, msg: string) => void;
}

export const CocaineMiniGames: React.FC<CocaineMiniGamesProps> = ({
  cocaineGrams,
  purity,
  stageIndex,
  onCompleteMinigame,
  onTriggerHeatEvent
}) => {
  // --- STAGE 0: EXTRACTION ("Расслоение") ---
  const [stage1Boundary, setStage1Boundary] = useState<number>(50);
  const [stage1Drift, setStage1Drift] = useState<number>(50);
  const [stage1Timer, setStage1Timer] = useState<number>(8);
  const [stage1Active, setStage1Active] = useState<boolean>(false);

  // --- STAGE 1: PURIFICATION ("Промывка" - 3 Cycles) ---
  const [washCycle, setWashCycle] = useState<number>(1);
  const [washStep, setWashStep] = useState<1 | 2 | 3>(1);
  const [solventVolume, setSolventVolume] = useState<number>(50);
  const [isAddingSolvent, setIsAddingSolvent] = useState<boolean>(false);
  const [shakeProgress, setShakeProgress] = useState<number>(0);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isDraining, setIsDraining] = useState<boolean>(false);
  const [funnelLowerLevel, setFunnelLowerLevel] = useState<number>(45);
  const [flaskLevel, setFlaskLevel] = useState<number>(10);
  const [washPurityBonus, setWashPurityBonus] = useState<number>(0);

  // --- STAGE 2: CRYSTALLIZATION ("Охлаждение") ---
  const [coolTempC, setCoolTempC] = useState<number>(45);
  const [crystalsTapped, setCrystalsTapped] = useState<number>(0);
  const [crystalPoints, setCrystalPoints] = useState<{ id: number; x: number; y: number }[]>([]);

  // --- STAGE 3: SIEVE ("Сито") ---
  const [sieveAngle, setSieveAngle] = useState<number>(0);
  const [clumpsCaught, setClumpsCaught] = useState<number>(0);

  // --- STAGE 4: HYDRAULIC PRESS ("Пресс") ---
  const [pressPressurePsi, setPressPressurePsi] = useState<number>(20);
  const [metronomeBeat, setMetronomeBeat] = useState<boolean>(false);
  const [brickBroken, setBrickBroken] = useState<boolean>(false);

  // --- STAGE 0 EXTRACTION LOOP ---
  useEffect(() => {
    if (stageIndex !== 0 || !stage1Active) return;

    const interval = setInterval(() => {
      setStage1Timer((prev) => {
        if (prev <= 1) {
          setStage1Active(false);
          sounds.playOverrideSuccess();

          const diff = Math.abs(stage1Boundary - stage1Drift);
          let stars = 3;
          let feedback = 'Идеальное сведение слоёв фаз!';
          let purityPenalty = 0;

          if (diff > 15) {
            stars = 1;
            feedback = 'Большое отклонение от границы: -15% чистоты';
            purityPenalty = -15;
          } else if (diff > 7) {
            stars = 2;
            feedback = 'Небольшое смещение фаз: -5% чистоты';
            purityPenalty = -5;
          }

          setTimeout(() => {
            onCompleteMinigame({
              stars,
              purityDelta: purityPenalty,
              yieldDelta: 0,
              feedback
            });
          }, 500);

          return 0;
        }
        return prev - 1;
      });

      setStage1Drift((prev) => {
        const d = (Math.random() - 0.5) * 10;
        return Math.max(15, Math.min(85, prev + d));
      });
    }, 500);

    return () => clearInterval(interval);
  }, [stageIndex, stage1Active, stage1Boundary, stage1Drift, onCompleteMinigame]);

  // --- STAGE 1: WASH SHAKING TIMER LOOP ---
  useEffect(() => {
    if (stageIndex !== 1 || washStep !== 2 || !isShaking) return;

    const interval = setInterval(() => {
      setShakeProgress((prev) => {
        if (prev >= 100) {
          setIsShaking(false);
          sounds.playOverrideSuccess();
          setWashStep(3);
          return 100;
        }
        return prev + 12;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [stageIndex, washStep, isShaking]);

  // --- STAGE 1: WASH DRAINING LOOP ---
  useEffect(() => {
    if (stageIndex !== 1 || washStep !== 3 || !isDraining) return;

    const interval = setInterval(() => {
      setFunnelLowerLevel((prev) => {
        const next = Math.max(0, prev - 2.5);
        if (next <= 0) {
          setIsDraining(false);
        }
        return next;
      });

      setFlaskLevel((prev) => Math.min(85, prev + 2.0));
    }, 100);

    return () => clearInterval(interval);
  }, [stageIndex, washStep, isDraining]);

  // --- STAGE 2 CRYSTAL SPAWNER ---
  useEffect(() => {
    if (stageIndex !== 2) return;

    const interval = setInterval(() => {
      if (crystalPoints.length < 5) {
        const newPoint = {
          id: Date.now() + Math.random(),
          x: Math.floor(Math.random() * 60) + 20,
          y: Math.floor(Math.random() * 50) + 25
        };
        setCrystalPoints((prev) => [...prev, newPoint]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, crystalPoints.length]);

  // --- STAGE 4 METRONOME LOOP ---
  useEffect(() => {
    if (stageIndex !== 4) return;

    const interval = setInterval(() => {
      setMetronomeBeat((prev) => !prev);
    }, 600);

    return () => clearInterval(interval);
  }, [stageIndex]);

  // --- HANDLERS FOR STAGE 1 "ПРОМЫВКА" ---
  const handleAddSolventSubmit = () => {
    sounds.playClick();
    setIsAddingSolvent(true);

    setTimeout(() => {
      setIsAddingSolvent(false);

      if (solventVolume > 75) {
        if (onTriggerHeatEvent) {
          onTriggerHeatEvent(5, 'Утечка запаха растворителя из-за перелива!');
        }
      }

      setWashStep(2);
    }, 1000);
  };

  const handleStartShake = () => {
    sounds.playClick();
    setIsShaking(true);
  };

  const handleStartDrain = () => {
    sounds.playClick();
    setIsDraining(true);
  };

  const handleStopDrain = () => {
    sounds.playClick();
    setIsDraining(false);

    const targetBoundary = 20;
    const diff = Math.abs(funnelLowerLevel - targetBoundary);

    let stars = 3;
    let feedback = 'Идеальная 3-цикловая промывка!';
    let bonus = 8;

    if (diff > 18) {
      stars = 1;
      feedback = 'Слив остановлен слишком поздно (захвачен нижний слой)';
      bonus = 2;
    } else if (diff > 8) {
      stars = 2;
      feedback = 'Слив остановлен слишком рано (остались примеси)';
      bonus = 5;
    }

    sounds.playOverrideSuccess();
    const accumulatedBonus = washPurityBonus + bonus;

    if (washCycle >= 3) {
      setTimeout(() => {
        onCompleteMinigame({
          stars,
          purityDelta: accumulatedBonus,
          yieldDelta: 0,
          feedback
        });
      }, 800);
    } else {
      setWashPurityBonus(accumulatedBonus);
      setWashCycle((c) => c + 1);
      setWashStep(1);
      setShakeProgress(0);
      setFunnelLowerLevel(45);
      setSolventVolume(50);
    }
  };

  // --- STAGE 2 CRYSTAL TAP HANDLER ---
  const handleTapCrystalPoint = (id: number) => {
    sounds.playClick();
    setCrystalsTapped((prev) => {
      const next = prev + 1;
      if (next >= 8) {
        sounds.playOverrideSuccess();
        setTimeout(() => {
          onCompleteMinigame({
            stars: 3,
            purityDelta: 10,
            yieldDelta: 0,
            feedback: 'Формирование кристаллической соли Fishscale завершено!'
          });
        }, 800);
      }
      return next;
    });
    setCrystalPoints((prev) => prev.filter((p) => p.id !== id));
  };

  // --- STAGE 3 SIEVE CATCH HANDLER ---
  const handleSieveCatch = () => {
    sounds.playClick();
    setClumpsCaught((prev) => {
      const next = prev + 1;
      if (next >= 6) {
        sounds.playOverrideSuccess();
        setTimeout(() => {
          onCompleteMinigame({
            stars: 3,
            purityDelta: 5,
            yieldDelta: 0,
            feedback: 'Просеивание мелкой фракции завершено!'
          });
        }, 500);
      }
      return next;
    });
  };

  // --- STAGE 4 PRESS APPLY HANDLER ---
  const handlePressApply = () => {
    if (pressPressurePsi > 85) {
      sounds.playAlarmBeep();
      setBrickBroken(true);
      setTimeout(() => {
        setBrickBroken(false);
        setPressPressurePsi(35);
      }, 1500);
      return;
    }

    sounds.playClick();
    const newPress = pressPressurePsi + 15;
    setPressPressurePsi(newPress);

    if (newPress >= 65 && newPress <= 80) {
      sounds.playOverrideSuccess();
      setTimeout(() => {
        onCompleteMinigame({
          stars: 3,
          purityDelta: 8,
          yieldDelta: 0,
          feedback: 'Брикет Fishscale 96% запрессован до зеркального блеска!'
        });
      }, 800);
    }
  };

  return (
    <div className="bg-[#0b1017] border border-amber-500/30 rounded-2xl p-4 sm:p-6 space-y-5 text-white shadow-2xl relative overflow-hidden">
      {/* ================= STAGE 0: EXTRACTION ("Расслоение") ================= */}
      {stageIndex === 0 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-mono">
            Удерживайте сливной кран точно на границе раздела эфирного и водного слоёв.
          </p>

          <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-[#090e17] to-[#04060a] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 400 220" className="w-full h-full max-w-md filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <rect x="70" y="20" width="10" height="180" fill="#334155" />
              <rect x="50" y="190" width="120" height="15" rx="3" fill="#1e293b" />
              <rect x="75" y="80" width="80" height="8" fill="#475569" />

              <path d="M150,40 L250,40 L210,130 L190,130 Z" fill="rgba(255,255,255,0.06)" stroke="#cbd5e1" strokeWidth="2.5" />
              <polygon points="155,50 245,50 230,85 170,85" fill="#f59e0b" opacity="0.75" />
              <polygon points="170,85 230,85 210,130 190,130" fill="#0284c7" opacity="0.8" />

              <line x1="160" y1={85 + (stage1Boundary - 50) * 0.4} x2={240} y2={85 + (stage1Boundary - 50) * 0.4} stroke="#facc15" strokeWidth="2.5" strokeDasharray="4 2" />
              <circle cx="200" cy={85 + (stage1Drift - 50) * 0.4} r="5" fill="#f43f5e" className="animate-pulse" />

              <rect x="195" y="130" width="10" height="25" fill="#94a3b8" />
              <circle cx="200" cy="142" r="6" fill="#e2e8f0" />
            </svg>

            <div className="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-lg border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
              Таймер: {stage1Timer}с
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Положение сливного крана: {stage1Boundary}%</span>
              <span>Дрейф фазы: {Math.round(stage1Drift)}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={stage1Boundary}
              onChange={(e) => setStage1Boundary(Number(e.target.value))}
              disabled={!stage1Active}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {!stage1Active ? (
            <button
              onClick={() => {
                setStage1Active(true);
                setStage1Timer(8);
                sounds.playClick();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-lg transition-all text-sm cursor-pointer"
            >
              🚀 ВСТРЯХНУТЬ И НАЧАТЬ РАССЛОЕНИЕ ФАЗ (8 СЕК)
            </button>
          ) : (
            <div className="text-center text-xs text-amber-300 animate-pulse font-mono py-2">
              Удерживайте кран на красном маркере дрейфа фазы...
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 1: PURIFICATION ("Промывка" 3-Cycles) ================= */}
      {stageIndex === 1 && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-200">
                {washStep === 1 && `Шаг 1 из 3: Установите объём растворителя`}
                {washStep === 2 && `Шаг 2 из 3: Встряхните воронку (3 сек)`}
                {washStep === 3 && `Шаг 3 из 3: Удерживайте клапан для слива нижнего слоя`}
              </span>
            </div>
            <span className="bg-amber-500/20 px-2.5 py-0.5 rounded text-amber-300 border border-amber-500/30 font-bold">
              Цикл {washCycle} / 3
            </span>
          </div>

          <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-[#080d16] via-[#04070e] to-[#020306] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            <svg viewBox="0 0 400 240" className="w-full h-full max-w-lg filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
              <rect x="60" y="15" width="12" height="210" fill="#334155" />
              <rect x="40" y="220" width="140" height="15" rx="3" fill="#1e293b" />
              <rect x="65" y="75" width="110" height="8" fill="#475569" />

              <rect x="185" y="10" width="30" height="20" fill="#64748b" rx="2" />
              <rect x="195" y="30" width="10" height="15" fill="#94a3b8" />

              {isAddingSolvent && (
                <rect x="198" y="45" width="4" height="40" fill="#38bdf8" className="animate-pulse" />
              )}

              <polygon
                points="150,55 250,55 210,150 190,150"
                fill="rgba(255,255,255,0.08)"
                stroke="#cbd5e1"
                strokeWidth="2.5"
                className={isShaking ? 'animate-bounce' : ''}
              />

              <polygon
                points={`155,${65 - solventVolume * 0.15} 245,${65 - solventVolume * 0.15} 230,105 170,105`}
                fill="#f59e0b"
                opacity={isShaking ? '0.5' : '0.8'}
              />

              <polygon
                points={`170,105 230,105 210,${150 - (45 - funnelLowerLevel) * 0.8} 190,${150 - (45 - funnelLowerLevel) * 0.8}`}
                fill="#0284c7"
                opacity={isShaking ? '0.5' : '0.85'}
              />

              {isShaking && (
                <g>
                  <circle cx="190" cy="90" r="12" fill="#fef08a" opacity="0.6" className="animate-ping" />
                  <circle cx="210" cy="110" r="10" fill="#67e8f9" opacity="0.6" className="animate-ping" />
                </g>
              )}

              <line x1="165" y1="105" x2="235" y2="105" stroke="#facc15" strokeWidth="2.5" strokeDasharray="3 2" />

              <rect x="195" y="150" width="10" height="30" fill="#64748b" />
              <g transform={`rotate(${isDraining ? 90 : 0}, 200, 165)`}>
                <rect x="185" y="160" width="30" height="10" rx="3" fill="#ef4444" />
              </g>

              {isDraining && (
                <g>
                  <line x1="200" y1="180" x2="200" y2="205" stroke="#0284c7" strokeWidth="3" className="animate-pulse" />
                  <circle cx="200" cy="208" r="3" fill="#38bdf8" />
                </g>
              )}

              <polygon points="175,200 225,200 240,230 160,230" fill="rgba(255,255,255,0.1)" stroke="#94a3b8" strokeWidth="2" />
              <polygon points={`177,${230 - flaskLevel * 0.3} 223,${230 - flaskLevel * 0.3} 238,230 162,230`} fill="#0284c7" opacity="0.8" />
            </svg>

            {solventVolume > 75 && (
              <div className="absolute top-3 left-3 bg-rose-950/90 border border-rose-500/80 px-3 py-1.5 rounded-xl text-rose-200 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                ⚠️ ПЕРЕЛИВ! Потеря выхода из-за высокого объёма
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className={`p-4 rounded-xl border space-y-3 transition-all ${washStep === 1 ? 'bg-slate-900 border-amber-500 shadow-lg' : 'bg-slate-950/50 border-slate-800 opacity-50'}`}>
              <div className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                <span>1. Объём: {solventVolume} мл</span>
                <span className="text-emerald-400">(40-60 мл)</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                value={solventVolume}
                onChange={(e) => setSolventVolume(Number(e.target.value))}
                disabled={washStep !== 1 || isAddingSolvent}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <button
                onClick={handleAddSolventSubmit}
                disabled={washStep !== 1 || isAddingSolvent}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                  washStep === 1 && !isAddingSolvent
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Droplets className="w-4 h-4" />
                {isAddingSolvent ? 'Добавление...' : '1. Добавить растворитель'}
              </button>
            </div>

            <div className={`p-4 rounded-xl border space-y-3 transition-all ${washStep === 2 ? 'bg-slate-900 border-amber-500 shadow-lg' : 'bg-slate-950/50 border-slate-800 opacity-50'}`}>
              <div className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                <span>2. Встряхивание</span>
                <span>{shakeProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full transition-all duration-200" style={{ width: `${shakeProgress}%` }} />
              </div>
              <button
                onClick={handleStartShake}
                disabled={washStep !== 2 || isShaking}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                  washStep === 2 && !isShaking
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <RotateCw className="w-4 h-4" />
                {isShaking ? 'Встряхивание воронки...' : '2. Встряхнуть воронку (3 сек)'}
              </button>
            </div>

            <div className={`p-4 rounded-xl border space-y-3 transition-all ${washStep === 3 ? 'bg-slate-900 border-amber-500 shadow-lg' : 'bg-slate-950/50 border-slate-800 opacity-50'}`}>
              <div className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                <span>3. Слив фазы</span>
                <span className="text-cyan-400">{Math.round(funnelLowerLevel)}% остатка</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Остановите на 20% маркере!</div>
              <button
                onMouseDown={handleStartDrain}
                onMouseUp={handleStopDrain}
                onTouchStart={handleStartDrain}
                onTouchEnd={handleStopDrain}
                disabled={washStep !== 3}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                  washStep === 3
                    ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg cursor-pointer active:scale-95'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Filter className="w-4 h-4" />
                {isDraining ? 'СЛИВ... (ОТПУСТИТЕ ДЛЯ СТОПА)' : '3. Удерживать клапан слива'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 2: CRYSTALLIZATION ("Охлаждение") ================= */}
      {stageIndex === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-mono">
            Плавно понижайте температуру и касайтесь центров кристаллизации для формирования чистейших иголок Fishscale.
          </p>

          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            <svg viewBox="0 0 400 220" className="w-full h-full max-w-md filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <rect x="120" y="40" width="160" height="150" rx="6" fill="rgba(6,182,212,0.1)" stroke="#67e8f9" strokeWidth="2.5" />
              <rect x="124" y="90" width="152" height="96" fill="#f8fafc" opacity="0.8" />
            </svg>

            {crystalPoints.map((p) => (
              <button
                key={p.id}
                onClick={() => handleTapCrystalPoint(p.id)}
                className="absolute w-8 h-8 rounded-full bg-cyan-400 hover:bg-white text-slate-950 font-black text-xs border-2 border-white shadow-xl animate-ping cursor-pointer flex items-center justify-center"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                ❄️
              </button>
            ))}

            <div className="absolute bottom-3 left-4 bg-black/80 px-3 py-1 rounded-lg border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold">
              Касаний кристалла: {crystalsTapped} / 8
            </div>
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Температура охлаждения: {coolTempC}°C</span>
              <span className="text-cyan-400 font-bold">Цель: -10°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="50"
              value={coolTempC}
              onChange={(e) => setCoolTempC(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* ================= STAGE 3: SIEVE ("Сито") ================= */}
      {stageIndex === 3 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-mono">
            Ритмично качайте сито и улавливайте комки сырья, не давая им упасть в чистый лоток.
          </p>

          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            <svg viewBox="0 0 400 220" className="w-full h-full max-w-md">
              <g transform={`rotate(${sieveAngle}, 200, 100)`}>
                <rect x="100" y="80" width="200" height="20" rx="4" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
                <line x1="100" y1="90" x2="300" y2="90" stroke="#f8fafc" strokeWidth="2" strokeDasharray="3 3" />
              </g>

              <rect x="120" y="170" width="160" height="30" rx="4" fill="#1e293b" stroke="#f1f5f9" strokeWidth="2" />
              <rect x="125" y="180" width="150" height="15" fill="#f8fafc" opacity="0.9" />
            </svg>

            <button
              onClick={handleSieveCatch}
              className="absolute bottom-4 py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-xl cursor-pointer min-h-[44px]"
            >
              🧹 ПОЙМАТЬ КОМОК ({clumpsCaught} / 6)
            </button>
          </div>
        </div>
      )}

      {/* ================= STAGE 4: HYDRAULIC PRESS ("Пресс") ================= */}
      {stageIndex === 4 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-300 font-mono">
            Удерживайте давление гидравлического пресса в зеленом коридоре (65–80 PSI).
          </p>

          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
            <svg viewBox="0 0 400 220" className="w-full h-full max-w-md">
              <rect x="120" y="30" width="160" height="160" fill="none" stroke="#64748b" strokeWidth="4" rx="6" />
              <rect x="140" y="40" width="120" height={40 + pressPressurePsi * 0.6} fill="#334155" stroke="#94a3b8" strokeWidth="2" />

              <rect x="150" y="150" width="100" height="30" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
              <circle cx="200" cy="20" r="8" fill={metronomeBeat ? '#f59e0b' : '#334155'} className="transition-all duration-100" />
            </svg>

            {brickBroken && (
              <div className="absolute inset-0 bg-rose-950/90 flex flex-col items-center justify-center text-rose-200 font-black text-sm p-4 text-center">
                <AlertTriangle className="w-10 h-10 text-rose-500 mb-2 animate-bounce" />
                <span>БРИКЕТ РАССЫПАЛСЯ ИЗ-ЗА ПЕРЕГРУЗА! (-20% ВЕСА)</span>
              </div>
            )}
          </div>

          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span>Давление пресса: {pressPressurePsi} PSI</span>
              <span className="text-amber-400 font-bold">Цель: 65 - 80 PSI</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={pressPressurePsi}
              onChange={(e) => setPressPressurePsi(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            onClick={handlePressApply}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-xl cursor-pointer transition-all min-h-[44px]"
          >
            🏋️ ЗАФИКСИРОВАТЬ ДАВЛЕНИЕ ПРЕССА
          </button>
        </div>
      )}
    </div>
  );
};
