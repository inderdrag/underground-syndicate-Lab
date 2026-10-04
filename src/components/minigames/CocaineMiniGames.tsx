import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Droplets,
  RotateCw,
  Filter,
  AlertTriangle,
  Star,
  Sparkles,
  Clock,
  CheckCircle2,
  Disc,
  Play,
  Flame,
  ShieldCheck,
  Zap,
  Box
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
  stageIndex,
  onCompleteMinigame,
  onTriggerHeatEvent
}) => {
  // --- STAGE 0: EXTRACTION ("Расслоение") ---
  const [stage0Boundary, setStage0Boundary] = useState<number>(50);
  const [stage0Drift, setStage0Drift] = useState<number>(50);
  const [stage0Timer, setStage0Timer] = useState<number>(10);
  const [stage0Active, setStage0Active] = useState<boolean>(false);
  const stage0BoundaryRef = useRef<number>(50);
  const stage0DriftRef = useRef<number>(50);
  const stage0GreenTicksRef = useRef<number>(0);
  const stage0TotalTicksRef = useRef<number>(0);
  const onCompleteMinigameRef = useRef(onCompleteMinigame);

  useEffect(() => {
    stage0BoundaryRef.current = stage0Boundary;
  }, [stage0Boundary]);

  useEffect(() => {
    stage0DriftRef.current = stage0Drift;
  }, [stage0Drift]);

  useEffect(() => {
    onCompleteMinigameRef.current = onCompleteMinigame;
  }, [onCompleteMinigame]);

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
  const [crystalPoints, setCrystalPoints] = useState<{ id: number; x: number; y: number }[]>([
    { id: 1, x: 25, y: 35 },
    { id: 2, x: 70, y: 40 },
    { id: 3, x: 45, y: 65 },
    { id: 4, x: 60, y: 25 },
  ]);

  // --- STAGE 3: SIEVE ("Сито и Фильтрация") ---
  const [clumpsCaught, setClumpsCaught] = useState<number>(0);

  // --- STAGE 4: HYDRAULIC PRESS ("Пресс 96%") ---
  const [pressPressurePsi, setPressPressurePsi] = useState<number>(30);

  // ================= STAGE 0 EXTRACTION TIMER LOOP =================
  useEffect(() => {
    if (stageIndex !== 0 || !stage0Active) return;

    const interval = setInterval(() => {
      // Check alignment difference using refs
      const diff = Math.abs(stage0BoundaryRef.current - stage0DriftRef.current);
      stage0TotalTicksRef.current += 1;
      if (diff <= 14) {
        stage0GreenTicksRef.current += 1;
      }

      // Smooth realistic phase drift
      setStage0Drift((prev) => {
        const drift = (Math.random() - 0.5) * 16;
        const nextDrift = Math.max(20, Math.min(80, prev + drift));
        stage0DriftRef.current = nextDrift;
        return nextDrift;
      });

      // 1-second countdown
      setStage0Timer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStage0Active(false);
          sounds.playOverrideSuccess();

          const total = Math.max(1, stage0TotalTicksRef.current);
          const ratio = stage0GreenTicksRef.current / total;
          const stars = ratio >= 0.6 ? 3 : ratio >= 0.35 ? 2 : 1;
          const purityBonus = Math.min(15, Math.max(5, Math.round(ratio * 15)));

          setTimeout(() => {
            onCompleteMinigameRef.current({
              stars,
              purityDelta: purityBonus,
              yieldDelta: 0,
              feedback: ratio >= 0.6
                ? `Идеальное сведение фаз эфирного экстракта! Чистота +${purityBonus}%`
                : `Фазы разделены с небольшим захватом примесей. Чистота +${purityBonus}%`
            });
          }, 400);

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, stage0Active]);

  // ================= STAGE 1: WASH SHAKING TIMER LOOP =================
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
        return prev + 15;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [stageIndex, washStep, isShaking]);

  // ================= STAGE 1: WASH DRAINING LOOP =================
  useEffect(() => {
    if (stageIndex !== 1 || washStep !== 3 || !isDraining) return;

    const interval = setInterval(() => {
      setFunnelLowerLevel((prev) => {
        const next = Math.max(0, prev - 3);
        if (next <= 0) {
          setIsDraining(false);
        }
        return next;
      });

      setFlaskLevel((prev) => Math.min(85, prev + 2.5));
    }, 100);

    return () => clearInterval(interval);
  }, [stageIndex, washStep, isDraining]);

  // ================= STAGE 2 CRYSTAL SPAWNER & COOLING =================
  useEffect(() => {
    if (stageIndex !== 2) return;

    const interval = setInterval(() => {
      setCoolTempC((prev) => Math.max(4, Math.round((prev - 0.8) * 10) / 10));

      setCrystalPoints((prev) => {
        if (prev.length < 5) {
          const newPoint = {
            id: Date.now() + Math.random(),
            x: Math.floor(Math.random() * 60) + 20,
            y: Math.floor(Math.random() * 50) + 25
          };
          return [...prev, newPoint];
        }
        return prev;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [stageIndex]);

  // --- HANDLERS FOR STAGE 1 "ПРОМЫВКА" ---
  const handleAddSolventSubmit = () => {
    sounds.playClick();
    setIsAddingSolvent(true);

    setTimeout(() => {
      setIsAddingSolvent(false);

      if (solventVolume > 75 && onTriggerHeatEvent) {
        onTriggerHeatEvent(5, 'Утечка запаха растворителя из-за перелива!');
      }

      setWashStep(2);
    }, 800);
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
      bonus = 3;
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
          feedback: `Все 3 цикла промывки завершены! Получен кристально чистый гидрохлорид (+${accumulatedBonus}%)`
        });
      }, 600);
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
    sounds.playOverrideSuccess();
    setCrystalsTapped((prev) => {
      const next = prev + 1;
      if (next >= 8) {
        setTimeout(() => {
          onCompleteMinigame({
            stars: 3,
            purityDelta: 12,
            yieldDelta: 0,
            feedback: 'Формирование кристаллической соли Fishscale HCl завершено (+12%)!'
          });
        }, 500);
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
            purityDelta: 8,
            yieldDelta: 0,
            feedback: 'Просеивание и вакуумная фильтрация тонкой фракции завершены (+8%)!'
          });
        }, 500);
      }
      return next;
    });
  };

  // --- STAGE 4 PRESS APPLY HANDLER ---
  const handleLockPress = () => {
    sounds.playOverrideSuccess();
    const diff = Math.abs(pressPressurePsi - 72);
    const stars = diff <= 8 ? 3 : diff <= 16 ? 2 : 1;
    const purityBonus = diff <= 8 ? 10 : diff <= 16 ? 6 : 3;

    setTimeout(() => {
      onCompleteMinigame({
        stars,
        purityDelta: purityBonus,
        yieldDelta: 0,
        feedback: `Брикет Fishscale 96% запрессован при давлении ${pressPressurePsi} PSI! Чистота +${purityBonus}%`
      });
    }, 500);
  };

  return (
    <div className="bg-[#0b1017] border border-amber-500/30 rounded-2xl p-4 sm:p-6 space-y-5 text-white shadow-2xl relative overflow-hidden">
      {/* ================= STAGE 0: EXTRACTION ("Расслоение") ================= */}
      {stageIndex === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                [ Этап 1 из 5: Экстракция («Расслоение») ]
              </span>
              <h3 className="text-lg font-bold text-white">Сведение границы раздела фаз</h3>
            </div>
            <span className="text-xs bg-amber-950 text-amber-300 px-3.5 py-1.5 rounded-xl border border-amber-800 font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              Таймер: {stage0Timer}с
            </span>
          </div>

          <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl text-xs text-amber-200 font-mono space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>ИНСТРУКЦИЯ:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Двигайте золотистый ползунок крана, чтобы удерживать его на <strong className="text-rose-400">красной точке дрейфа фаз</strong>. Чем точнее совмещение в течение 10 секунд, тем выше чистота алкалоида!
            </p>
          </div>

          {/* Visual Separatory Funnel */}
          <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-[#090e17] to-[#04060a] rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 400 220" className="w-full h-full max-w-md filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              {/* Stand */}
              <rect x="70" y="20" width="10" height="180" fill="#334155" />
              <rect x="50" y="190" width="120" height="15" rx="3" fill="#1e293b" />
              <rect x="75" y="80" width="80" height="8" fill="#475569" />

              {/* Glass Funnel Outline */}
              <path d="M150,40 L250,40 L210,130 L190,130 Z" fill="rgba(255,255,255,0.06)" stroke="#cbd5e1" strokeWidth="2.5" />
              
              {/* Top Organic Ether Layer (Yellow/Amber) */}
              <polygon points="155,50 245,50 230,85 170,85" fill="#f59e0b" opacity="0.75" />
              
              {/* Bottom Aqueous/Alkaline Layer (Cyan/Blue) */}
              <polygon points="170,85 230,85 210,130 190,130" fill="#0284c7" opacity="0.8" />

              {/* Boundary Guide Lines */}
              <line
                x1="160"
                y1={85 + (stage0Boundary - 50) * 0.4}
                x2="240"
                y2={85 + (stage0Boundary - 50) * 0.4}
                stroke="#facc15"
                strokeWidth="3"
                strokeDasharray="4 2"
              />
              <circle
                cx="200"
                cy={85 + (stage0Drift - 50) * 0.4}
                r="7"
                fill="#f43f5e"
                stroke="#ffffff"
                strokeWidth="1.5"
                className="animate-pulse"
              />

              {/* Stopcock valve */}
              <rect x="195" y="130" width="10" height="25" fill="#94a3b8" />
              <circle cx="200" cy="142" r="6" fill="#e2e8f0" />
            </svg>

            {/* Live Alignment HUD */}
            <div className="absolute top-3 right-3 bg-black/80 px-3 py-1.5 rounded-lg border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-2">
              {Math.abs(stage0Boundary - stage0Drift) <= 12 ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ФАЗЫ СОВМЕЩЕНЫ
                </span>
              ) : (
                <span className="text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> СМЕЩЕНИЕ: {Math.round(Math.abs(stage0Boundary - stage0Drift))}%
                </span>
              )}
            </div>
          </div>

          {/* Interactive Slider Control */}
          <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="flex justify-between text-xs text-slate-300 font-mono">
              <span className="text-amber-300 font-bold">Уровень крана: {stage0Boundary}%</span>
              <span className="text-rose-400 font-bold">Цель (дрейф): {Math.round(stage0Drift)}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="80"
              value={stage0Boundary}
              onChange={(e) => setStage0Boundary(Number(e.target.value))}
              disabled={!stage0Active}
              className="w-full accent-amber-400 cursor-pointer h-3 bg-slate-800 rounded-lg"
            />
          </div>

          {!stage0Active ? (
            <button
              onClick={() => {
                setStage0Active(true);
                setStage0Timer(10);
                stage0GreenTicksRef.current = 0;
                stage0TotalTicksRef.current = 0;
                sounds.playClick();
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>ЗАПУСТИТЬ РАССЛОЕНИЕ ФАЗ (10 СЕКУНД)</span>
            </button>
          ) : (
            <div className="text-center text-xs text-amber-300 font-mono py-2 bg-amber-950/40 border border-amber-500/30 rounded-xl animate-pulse">
              ⏱️ Идет расслоение (осталось {stage0Timer}с)... Удерживайте ползунок на красной отметке!
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 1: PURIFICATION ("Промывка" 3-Cycles) ================= */}
      {stageIndex === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                [ Этап 2 из 5: Очистка Растворителем ]
              </span>
              <h3 className="text-lg font-bold text-white">Промывка алкалоида</h3>
            </div>
            <span className="bg-amber-500/20 px-3 py-1 rounded-xl text-amber-300 border border-amber-500/30 font-bold font-mono text-xs">
              Цикл {washCycle} из 3
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-xs font-mono text-amber-200">
            {washStep === 1 && '👉 Шаг 1: Установите оптимальный объем растворителя (40–60 мл) и нажмите «Залить»'}
            {washStep === 2 && '👉 Шаг 2: Удерживайте кнопку «Встряхивать», пока шкала не заполнится до 100%'}
            {washStep === 3 && '👉 Шаг 3: Нажмите «Слить отработанный слой» и остановите кран на 20 мл'}
          </div>

          {/* Graphic Container */}
          <div className="relative aspect-[16/9] w-full bg-gradient-to-b from-[#080d16] to-[#020306] rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-2xl">
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

              {/* Solvent Layer */}
              <polygon
                points={`155,${65 - solventVolume * 0.15} 245,${65 - solventVolume * 0.15} 230,105 170,105`}
                fill="#f59e0b"
                opacity={isShaking ? '0.5' : '0.8'}
              />

              {/* Lower Layer */}
              <polygon
                points={`170,105 230,105 210,${150 - (45 - funnelLowerLevel) * 0.8} 190,${150 - (45 - funnelLowerLevel) * 0.8}`}
                fill="#0284c7"
                opacity={isShaking ? '0.5' : '0.85'}
              />

              {isDraining && (
                <g>
                  <line x1="200" y1="180" x2="200" y2="205" stroke="#0284c7" strokeWidth="3" className="animate-pulse" />
                  <circle cx="200" cy="208" r="3" fill="#38bdf8" />
                </g>
              )}

              <polygon points="175,200 225,200 240,230 160,230" fill="rgba(255,255,255,0.1)" stroke="#94a3b8" strokeWidth="2" />
              <polygon points={`177,${230 - flaskLevel * 0.3} 223,${230 - flaskLevel * 0.3} 238,230 162,230`} fill="#0284c7" opacity="0.8" />
            </svg>
          </div>

          {/* Controls per Step */}
          {washStep === 1 && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-slate-950 space-y-3">
              <div className="text-xs font-mono text-slate-300 font-bold flex justify-between">
                <span>Объём растворителя: {solventVolume} мл</span>
                <span className="text-emerald-400">Оптимум: 40–60 мл</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={solventVolume}
                onChange={(e) => setSolventVolume(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-3 bg-slate-800 rounded-lg"
              />
              <button
                onClick={handleAddSolventSubmit}
                disabled={isAddingSolvent}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs font-mono cursor-pointer active:scale-95 flex items-center justify-center gap-2"
              >
                <Droplets className="w-4 h-4" />
                <span>ЗАЛИТЬ РАСТВОРИТЕЛЬ ({solventVolume} МЛ)</span>
              </button>
            </div>
          )}

          {washStep === 2 && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-slate-950 space-y-3">
              <div className="flex justify-between text-xs font-mono text-slate-300 font-bold">
                <span>Прогресс встряхивания:</span>
                <span className="text-amber-400">{Math.round(shakeProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150"
                  style={{ width: `${shakeProgress}%` }}
                />
              </div>
              <button
                onMouseDown={() => setIsShaking(true)}
                onMouseUp={() => setIsShaking(false)}
                onTouchStart={() => setIsShaking(true)}
                onTouchEnd={() => setIsShaking(false)}
                className={`w-full py-3.5 rounded-xl font-black text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                  isShaking
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/40 scale-[0.98]'
                    : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                }`}
              >
                <RotateCw className={`w-4 h-4 ${isShaking ? 'animate-spin' : ''}`} />
                <span>{isShaking ? 'ИДЕТ ВСТРЯХИВАНИЕ...' : 'УДЕРЖИВАТЬ ДЛЯ ВСТРЯХИВАНИЯ'}</span>
              </button>
            </div>
          )}

          {washStep === 3 && (
            <div className="p-4 rounded-xl border border-amber-500/40 bg-slate-950 space-y-3">
              <div className="flex justify-between text-xs font-mono text-slate-300 font-bold">
                <span>Уровень нижнего слоя: {Math.round(funnelLowerLevel)} мл</span>
                <span className="text-emerald-400 font-bold">Цель отсечки: 20 мл</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsDraining(true)}
                  disabled={isDraining}
                  className="py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs font-mono cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Droplets className="w-4 h-4" />
                  <span>ОТКРЫТЬ СЛИВ</span>
                </button>
                <button
                  onClick={handleStopDrain}
                  className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs font-mono cursor-pointer active:scale-95 shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ЗАФИКСИРОВАТЬ СЛИВ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 2: CRYSTALLIZATION ("Охлаждение") ================= */}
      {stageIndex === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                [ Этап 3 из 5: Кристаллизация HCl ]
              </span>
              <h3 className="text-lg font-bold text-white">Осаждение кристаллов соли</h3>
            </div>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-3.5 py-1.5 rounded-xl border border-cyan-800 font-mono font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Собрано: {crystalsTapped} / 8
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Нажимайте на появляющиеся кристаллы в колбе для ускорения выпадения соли (Температура: <strong className="text-cyan-400">{coolTempC}°C</strong>).
          </p>

          <div className="relative aspect-[16/9] w-full bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            {/* Ambient Flask Graphic */}
            <div className="absolute inset-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 flex items-center justify-center">
              <span className="text-6xl select-none opacity-20">❄️</span>
            </div>

            {/* Clickable Crystal Nodes */}
            {crystalPoints.map((p) => (
              <button
                key={p.id}
                onClick={() => handleTapCrystalPoint(p.id)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 border-2 border-cyan-300 rounded-2xl flex items-center justify-center text-xl shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-pulse transition-transform hover:scale-125 active:scale-90 cursor-pointer"
              >
                💎
              </button>
            ))}
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-200"
              style={{ width: `${(crystalsTapped / 8) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ================= STAGE 3: SIEVE ("Сито") ================= */}
      {stageIndex === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                [ Этап 4 из 5: Вакуумная Фильтрация ]
              </span>
              <h3 className="text-lg font-bold text-white">Просеивание и отсечение фракции</h3>
            </div>
            <span className="text-xs bg-amber-950 text-amber-300 px-3.5 py-1.5 rounded-xl border border-amber-800 font-mono font-bold">
              Отсеяно: {clumpsCaught} / 6
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Нажимайте «Просеять фракцию», чтобы пропустить тонкую фракцию через микронное сито 200 мкм.
          </p>

          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4 shadow-inner">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 mx-auto flex items-center justify-center text-4xl shadow-lg">
              <Filter className="w-10 h-10 text-amber-400" />
            </div>

            <div className="flex justify-center gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    i < clumpsCaught
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'bg-slate-900 border-slate-700 text-slate-600'
                  }`}
                >
                  {i < clumpsCaught ? '✓' : i + 1}
                </div>
              ))}
            </div>

            <button
              onClick={handleSieveCatch}
              className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>ПРОСЕЯТЬ ФРАКЦИЮ #{clumpsCaught + 1}</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STAGE 4: HYDRAULIC PRESS ("Пресс") ================= */}
      {stageIndex === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                [ Этап 5 из 5: Гидравлический Пресс ]
              </span>
              <h3 className="text-lg font-bold text-white">Формовка брикета Fishscale 96%</h3>
            </div>
            <span className="text-xs bg-amber-950 text-amber-300 px-3.5 py-1.5 rounded-xl border border-amber-800 font-mono font-bold">
              Давление: {pressPressurePsi} PSI
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Установите давление пресса в целевой зелёный коридор <strong className="text-emerald-400">65–80 PSI</strong> и зафиксируйте брикет.
          </p>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4 text-center">
            <div className={`text-4xl font-black font-mono tracking-wider ${pressPressurePsi >= 65 && pressPressurePsi <= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {pressPressurePsi} PSI
            </div>

            <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="absolute left-[65%] w-[15%] top-0 bottom-0 bg-emerald-500/40 border-x-2 border-emerald-400" />
              <div
                className="absolute top-0 bottom-0 w-3 bg-amber-400 rounded-full transition-all duration-150"
                style={{ left: `${Math.max(2, Math.min(96, pressPressurePsi))}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => {
                  setPressPressurePsi((p) => Math.max(10, p - 15));
                  sounds.playClick();
                }}
                className="py-3 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs font-mono cursor-pointer active:scale-95"
              >
                ➖ СБРОС (-15)
              </button>
              <button
                onClick={() => {
                  setPressPressurePsi(72);
                  sounds.playClick();
                }}
                className="py-3 px-3 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl text-xs font-mono cursor-pointer shadow-md active:scale-95"
              >
                🎯 72 PSI (ОПТИМУМ)
              </button>
              <button
                onClick={() => {
                  setPressPressurePsi((p) => Math.min(98, p + 15));
                  sounds.playClick();
                }}
                className="py-3 px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs font-mono cursor-pointer shadow-lg active:scale-95"
              >
                ➕ НАЖИМ (+15)
              </button>
            </div>

            <button
              onClick={handleLockPress}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl shadow-xl transition-all text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Box className="w-5 h-5" />
              <span>ЗАПРЕССОВАТЬ И ЗАПЕЧАТАТЬ БРИКЕТ (ГОТОВО)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
