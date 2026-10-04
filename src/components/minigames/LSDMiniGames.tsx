import React, { useState, useEffect } from 'react';
import { LSDSynthesisBatch } from '../../types/game';
import {
  Wrench,
  Flame,
  RotateCw,
  Eye,
  Grid,
  AlertTriangle,
  Zap,
  Activity,
  Pipette,
  Gauge,
  Thermometer,
  ShieldAlert,
  Wind,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { sounds } from '../../engine/soundEffects';

export interface LSDMiniGameResult {
  stars: number;
  purityDelta: number;
  yieldDelta: number;
  feedback: string;
}

interface LSDMiniGamesProps {
  batch: LSDSynthesisBatch;
  stageIndex: number; // 0: Assembly, 1: Reflux, 2: Stirrer, 3: Chromatography, 4: Dosing
  onCompleteMinigame: (result: LSDMiniGameResult) => void;
}

interface AssemblyPart {
  id: number;
  name: string;
  shape: 'circle' | 'square' | 'hexagon' | 'triangle' | 'diamond';
  color: string;
}

const PARTS_CATALOG: AssemblyPart[] = [
  { id: 1, name: 'Вход инертного газа N2', shape: 'circle', color: '#38bdf8' },
  { id: 2, name: 'Патрубок эрготамина', shape: 'square', color: '#a855f7' },
  { id: 3, name: 'Магнитная мешалка', shape: 'hexagon', color: '#eab308' },
  { id: 4, name: 'Обратный холодильник', shape: 'triangle', color: '#ef4444' },
  { id: 5, name: 'Сборник тартрата', shape: 'diamond', color: '#10b981' }
];

export const LSDMiniGames: React.FC<LSDMiniGamesProps> = ({
  batch,
  stageIndex,
  onCompleteMinigame
}) => {
  // --- STAGE 0: ASSEMBLY ("Схема") STATES ---
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [connectedPorts, setConnectedPorts] = useState<number[]>([]);
  const [showGhostSchematic, setShowGhostSchematic] = useState<boolean>(false);
  const [ghostUsesLeft, setGhostUsesLeft] = useState<number>(2);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [assemblyTimer, setAssemblyTimer] = useState<number>(30);
  const [leakBanner, setLeakBanner] = useState<boolean>(false);

  // --- STAGE 1: REFLUX THERMOSTAT ("Термостат") STATES ---
  const [targetTemp, setTargetTemp] = useState<number>(45.0);
  const [currentTemp, setCurrentTemp] = useState<number>(batch.refluxTempC || 45.0);
  const [thermostatTimer, setThermostatTimer] = useState<number>(30);
  const [thermostatActive, setThermostatActive] = useState<boolean>(false);
  const [thermostatGreenTicks, setThermostatGreenTicks] = useState<number>(0);

  // --- STAGE 2: STIRRER VORTEX ("Вихрь") STATES ---
  const [currentRpm, setCurrentRpm] = useState<number>(batch.magneticStirrerRpm || 520);
  const [stirrerTimer, setStirrerTimer] = useState<number>(30);
  const [stirrerActive, setStirrerActive] = useState<boolean>(false);
  const [stirrerGreenTicks, setStirrerGreenTicks] = useState<number>(0);

  // --- STAGE 3: RED LIGHT CHROMATOGRAPHY ("Фракции") STATES ---
  const [bandPosition, setBandPosition] = useState<number>(15);
  const [bandDirection, setBandDirection] = useState<'down' | 'up'>('down');
  const [valveClosed, setValveClosed] = useState<boolean>(false);

  // --- STAGE 4: DOSING GRID ("Капля за каплей") STATES ---
  const [dosedGrid, setDosedGrid] = useState<boolean[]>(new Array(100).fill(false));

  // ================= STAGE 0 ASSEMBLY TIMER LOOP =================
  useEffect(() => {
    if (stageIndex !== 0 || connectedPorts.length === 5) return;

    const interval = setInterval(() => {
      setAssemblyTimer((prev) => {
        if (prev <= 1) {
          sounds.playAlarmBeep();
          onCompleteMinigame({
            stars: 1,
            purityDelta: 5,
            yieldDelta: 0,
            feedback: 'Время сборки истекло: часть узлов смонтирована по умолчанию'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, connectedPorts.length, onCompleteMinigame]);

  // ================= STAGE 1 THERMOSTAT TIMER LOOP (30 SECONDS) =================
  useEffect(() => {
    if (stageIndex !== 1 || !thermostatActive) return;

    const interval = setInterval(() => {
      // Smooth temperature drift toward targetTemp
      setCurrentTemp((prev) => {
        const diff = targetTemp - prev;
        const drift = diff * 0.35 + (Math.random() - 0.5) * 0.6;
        const nextTemp = Math.max(20, Math.min(80, prev + drift));

        if (nextTemp >= 42.0 && nextTemp <= 48.0) {
          setThermostatGreenTicks((g) => g + 1);
        }
        return nextTemp;
      });

      setThermostatTimer((prev) => {
        if (prev <= 1) {
          setThermostatActive(false);
          sounds.playOverrideSuccess();

          const greenRatio = thermostatGreenTicks / 30;
          const stars = greenRatio >= 0.6 ? 3 : greenRatio >= 0.3 ? 2 : 1;
          const purityBonus = Math.min(25, Math.max(10, Math.round(greenRatio * 25)));

          onCompleteMinigame({
            stars,
            purityDelta: purityBonus,
            yieldDelta: 0,
            feedback: `Термостат выдержан в зелёной зоне (42-48°C)! Чистота +${purityBonus}%`
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, thermostatActive, targetTemp, thermostatGreenTicks, onCompleteMinigame]);

  // ================= STAGE 2 STIRRER TIMER LOOP (30 SECONDS) =================
  useEffect(() => {
    if (stageIndex !== 2 || !stirrerActive) return;

    const interval = setInterval(() => {
      // Smooth natural RPM decay (-20 RPM per second)
      setCurrentRpm((prev) => {
        const nextRpm = Math.max(100, Math.min(900, prev - 18 + (Math.random() - 0.5) * 6));
        if (nextRpm >= 450 && nextRpm <= 600) {
          setStirrerGreenTicks((g) => g + 1);
        }
        return nextRpm;
      });

      setStirrerTimer((prev) => {
        if (prev <= 1) {
          setStirrerActive(false);
          sounds.playOverrideSuccess();

          const greenRatio = stirrerGreenTicks / 30;
          const stars = greenRatio >= 0.6 ? 3 : greenRatio >= 0.3 ? 2 : 1;
          const purityBonus = Math.min(20, Math.max(10, Math.round(greenRatio * 20)));

          onCompleteMinigame({
            stars,
            purityDelta: purityBonus,
            yieldDelta: 0,
            feedback: `Вихрь эмульсии выдержан в коридоре 450-600 RPM! Чистота +${purityBonus}%`
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, stirrerActive, stirrerGreenTicks, onCompleteMinigame]);

  // ================= STAGE 3 CHROMATOGRAPHY BAND ANIMATION =================
  useEffect(() => {
    if (stageIndex !== 3 || valveClosed) return;

    const interval = setInterval(() => {
      setBandPosition((prev) => {
        if (prev >= 88) {
          setBandDirection('up');
          return 85;
        }
        if (prev <= 12) {
          setBandDirection('down');
          return 15;
        }
        return bandDirection === 'down' ? prev + 3.5 : prev - 3.5;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [stageIndex, bandDirection, valveClosed]);

  // --- STAGE 0 HANDLERS ---
  const handlePartClick = (partId: number) => {
    if (connectedPorts.includes(partId)) return;
    sounds.playClick();
    setSelectedPartId(partId === selectedPartId ? null : partId);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (!selectedPartId) return;

    const expectedPartId = slotIndex + 1;

    if (selectedPartId === expectedPartId) {
      sounds.playOverrideSuccess();
      const newConnected = [...connectedPorts, selectedPartId];
      setConnectedPorts(newConnected);
      setSelectedPartId(null);

      if (newConnected.length === 5) {
        const starRating = errorCount === 0 ? 3 : errorCount <= 2 ? 2 : 1;
        setTimeout(() => {
          onCompleteMinigame({
            stars: starRating,
            purityDelta: 15,
            yieldDelta: 0,
            feedback: 'Реактор собран идеально и герметично!'
          });
        }, 500);
      }
    } else {
      sounds.playAlarmBeep();
      const nextErrors = errorCount + 1;
      setErrorCount(nextErrors);
      setLeakBanner(true);
      setTimeout(() => setLeakBanner(false), 1200);
    }
  };

  const handleShowGhostSchematic = () => {
    if (ghostUsesLeft <= 0 || showGhostSchematic) return;
    sounds.playClick();
    setGhostUsesLeft((g) => g - 1);
    setShowGhostSchematic(true);
    setTimeout(() => setShowGhostSchematic(false), 4000);
  };

  // --- STAGE 3 HANDLERS ---
  const handleCloseChromatographyValve = () => {
    setValveClosed(true);
    const diff = Math.abs(bandPosition - 50);
    let purityGain = 0;
    let stars = 3;

    if (diff <= 8) {
      sounds.playOverrideSuccess();
      purityGain = 25;
      stars = 3;
    } else if (diff <= 18) {
      sounds.playClick();
      purityGain = 15;
      stars = 2;
    } else {
      sounds.playAlarmBeep();
      purityGain = 5;
      stars = 1;
    }

    setTimeout(() => {
      onCompleteMinigame({
        stars,
        purityDelta: purityGain,
        yieldDelta: 0,
        feedback: `Фракционирование d-изомера завершено с точностью ${(100 - diff * 2).toFixed(0)}%!`
      });
    }, 1000);
  };

  // --- STAGE 4 DOSING GRID HANDLERS ---
  const handleCellDose = (index: number) => {
    if (dosedGrid[index]) return;

    sounds.playClick();
    const newGrid = [...dosedGrid];
    newGrid[index] = true;
    setDosedGrid(newGrid);

    const count = newGrid.filter(Boolean).length;
    if (count === 100) {
      sounds.playOverrideSuccess();
      setTimeout(() => {
        onCompleteMinigame({
          stars: 3,
          purityDelta: 10,
          yieldDelta: 1,
          feedback: 'Блоттер 10×10 пропитан со 100% точностью дозировки 150 мкг!'
        });
      }, 500);
    }
  };

  const handleAutoDoseAll = () => {
    sounds.playOverrideSuccess();
    setDosedGrid(new Array(100).fill(true));
    setTimeout(() => {
      onCompleteMinigame({
        stars: 3,
        purityDelta: 10,
        yieldDelta: 1,
        feedback: 'Автоматическая пропитка листа 10×10 завершена идеально!'
      });
    }, 500);
  };

  return (
    <div className="bg-[#0b1017] border border-cyan-500/30 rounded-2xl p-4 sm:p-6 text-white space-y-5 shadow-2xl relative overflow-hidden font-sans">
      {/* ================= STAGE 0: ASSEMBLY ("Схема") ================= */}
      {stageIndex === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cyan-500/20 pb-3 gap-2">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                [ Этап 1 из 5: Сборка Реактора («Схема») ]
              </span>
              <h3 className="text-lg font-bold text-white">Монтаж узлов стеклянного контура</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShowGhostSchematic}
                disabled={ghostUsesLeft <= 0 || showGhostSchematic}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                👁️ Показать схему ({ghostUsesLeft})
              </button>
              <span className="text-xs bg-cyan-950 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-800 font-mono font-bold">
                Таймер: {assemblyTimer}с
              </span>
            </div>
          </div>

          {leakBanner && (
            <div className="bg-rose-950/90 border border-rose-500 p-3 rounded-xl text-rose-200 text-xs font-bold font-mono animate-bounce text-center">
              ⚠️ ОШИБКА ПОДКЛЮЧЕНИЯ! Выберите правильный узел для этого слота.
            </div>
          )}

          {/* Workbench */}
          <div className="relative w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-inner">
            {/* Parts Tray */}
            <div className="w-full sm:w-1/3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
              <div className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                Лоток с узлами:
              </div>
              <div className="space-y-1.5">
                {PARTS_CATALOG.map((part) => {
                  const isConnected = connectedPorts.includes(part.id);
                  const isSelected = selectedPartId === part.id;

                  return (
                    <button
                      key={part.id}
                      onClick={() => handlePartClick(part.id)}
                      disabled={isConnected}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                        isConnected
                          ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-lg ring-2 ring-cyan-400'
                          : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span className="truncate">{part.name}</span>
                      <span className="w-3 h-3 rounded-full shrink-0 ml-2" style={{ backgroundColor: part.color }} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stand with 5 Target Slots */}
            <div className="w-full sm:w-2/3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative min-h-[220px] flex items-center justify-center">
              <div className="grid grid-cols-5 gap-2 w-full">
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const connectedPartId = connectedPorts[slotIdx];
                  const connectedPart = PARTS_CATALOG.find((p) => p.id === connectedPartId);

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`h-28 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1.5 cursor-pointer transition-all ${
                        connectedPart
                          ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-300'
                          : showGhostSchematic
                          ? 'bg-cyan-950/60 border-cyan-400 animate-pulse'
                          : 'bg-slate-950/60 border-slate-700 hover:border-cyan-500'
                      }`}
                    >
                      {connectedPart ? (
                        <div className="text-center space-y-1">
                          <span className="w-5 h-5 rounded-full inline-block" style={{ backgroundColor: connectedPart.color }} />
                          <div className="text-[9px] font-mono font-bold truncate leading-tight">{connectedPart.name}</div>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono text-slate-500 text-center">Слот {slotIdx + 1}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= STAGE 1: REFLUX THERMOSTAT ("Термостат") ================= */}
      {stageIndex === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
                [ Этап 2 из 5: Обратный Холодильник («Термостат») ]
              </span>
              <h3 className="text-lg font-bold text-white">Регулировка температуры водяной бани</h3>
            </div>
            <span className="text-xs bg-purple-950 text-purple-300 px-3.5 py-1.5 rounded-xl border border-purple-800 font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400 animate-spin" />
              Таймер: {thermostatTimer}с
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Удерживайте температуру водяной бани в зелёной зоне <strong className="text-emerald-400">(42°C – 48°C)</strong> во время реакционного прогрева.
          </p>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5 shadow-inner">
            {/* Temperature Gauge Bar */}
            <div className="relative h-14 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center px-2">
              {/* Green Zone (42°C to 48°C = 36.6% to 46.6% of 20-80°C range) */}
              <div className="absolute left-[36.6%] w-[10%] top-1 bottom-1 bg-emerald-500/30 border-x-2 border-emerald-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <span className="text-[10px] font-mono font-bold text-emerald-300 whitespace-nowrap">42–48°C</span>
              </div>

              {/* Current Temperature Indicator Needle */}
              <div
                className="absolute top-1 bottom-1 w-3.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-300"
                style={{ left: `${Math.max(2, Math.min(95, ((currentTemp - 20) / 60) * 100))}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">
                Текущая температура: <strong className={`text-sm font-bold ${currentTemp >= 42 && currentTemp <= 48 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentTemp.toFixed(1)}°C</strong>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${currentTemp >= 42 && currentTemp <= 48 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                {currentTemp >= 42 && currentTemp <= 48 ? '✓ В ЗЕЛЁНОЙ ЗОНЕ' : currentTemp < 42 ? '❄️ ТРЕБУЕТСЯ НАГРЕВ' : '🔥 ПЕРЕГРЕВ'}
              </span>
            </div>

            {/* Slider Control */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>20°C (Охлаждение)</span>
                <span className="text-purple-300 font-bold">Цель: {targetTemp.toFixed(1)}°C</span>
                <span>80°C (Нагрев)</span>
              </div>

              <input
                type="range"
                min="20"
                max="80"
                step="0.5"
                value={targetTemp}
                onChange={(e) => setTargetTemp(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Preset Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => { setTargetTemp(30); sounds.playClick(); }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                ❄️ 30°C
              </button>
              <button
                onClick={() => { setTargetTemp(45); sounds.playClick(); }}
                className="px-4 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono font-bold cursor-pointer shadow-md"
              >
                🎯 45°C (Оптимум)
              </button>
              <button
                onClick={() => { setTargetTemp(60); sounds.playClick(); }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs font-mono font-bold cursor-pointer"
              >
                🔥 60°C
              </button>
            </div>
          </div>

          {!thermostatActive ? (
            <button
              onClick={() => {
                setThermostatActive(true);
                setThermostatTimer(30);
                sounds.playClick();
              }}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black rounded-2xl shadow-xl transition-all text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>ЗАПУСТИТЬ ТЕРМОСТАТИРОВАНИЕ (30 СЕКУНД)</span>
            </button>
          ) : (
            <div className="text-center text-xs text-purple-300 font-mono py-2 bg-purple-950/40 border border-purple-500/30 rounded-xl animate-pulse">
              ⏱️ Идёт реакция (30 сек)... Двигайте ползунок, поддерживая температуру в диапазоне 42–48°C!
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 2: STIRRER VORTEX ("Вихрь") ================= */}
      {stageIndex === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-indigo-400 font-bold uppercase tracking-wider block">
                [ Этап 3 из 5: Магнитная Мешалка («Вихрь») ]
              </span>
              <h3 className="text-lg font-bold text-white">Перемешивание эмульсии</h3>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 px-3.5 py-1.5 rounded-xl border border-indigo-800 font-mono font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              Таймер: {stirrerTimer}с
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Поддерживайте обороты магнитного якоря в целевом коридоре <strong className="text-amber-400">450 - 600 RPM</strong>.
          </p>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-5 shadow-inner">
            <div className="space-y-1">
              <div className={`text-4xl font-black font-mono tracking-wider ${currentRpm >= 450 && currentRpm <= 600 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                {Math.round(currentRpm)} RPM
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {currentRpm >= 450 && currentRpm <= 600 ? '✓ Оптимальный вихрь эмульсии' : currentRpm < 450 ? '⚠️ Низкие обороты (Осаждение)' : '⚠️ Перегрузка вихря'}
              </div>
            </div>

            {/* Gauge Bar */}
            <div className="relative h-6 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div className="absolute left-[38.8%] w-[18.7%] top-0 bottom-0 bg-emerald-500/30 border-x-2 border-emerald-400" />
              <div
                className="absolute top-0 bottom-0 w-2.5 bg-indigo-400 rounded-full transition-all duration-200"
                style={{ left: `${Math.max(2, Math.min(96, ((currentRpm - 100) / 800) * 100))}%` }}
              />
            </div>

            {/* Controls */}
            {stirrerActive && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <button
                  onClick={() => {
                    setCurrentRpm((r) => Math.max(100, r - 50));
                    sounds.playClick();
                  }}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold rounded-xl text-xs font-mono cursor-pointer active:scale-95"
                >
                  🛑 ТОРМОЗ (-50 RPM)
                </button>
                <button
                  onClick={() => {
                    setCurrentRpm(520);
                    sounds.playClick();
                  }}
                  className="py-3 px-4 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold rounded-xl text-xs font-mono cursor-pointer shadow-md active:scale-95"
                >
                  🎯 СТАБИЛИЗАТОР (520 RPM)
                </button>
                <button
                  onClick={() => {
                    setCurrentRpm((r) => Math.min(900, r + 50));
                    sounds.playClick();
                  }}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs font-mono cursor-pointer shadow-lg active:scale-95"
                >
                  🌀 ИМПУЛЬС (+50 RPM)
                </button>
              </div>
            )}
          </div>

          {!stirrerActive ? (
            <button
              onClick={() => {
                setStirrerActive(true);
                setStirrerTimer(30);
                sounds.playClick();
              }}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white font-black rounded-2xl shadow-xl transition-all text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2 min-h-[48px]"
            >
              <RotateCw className="w-5 h-5 text-white" />
              <span>ВКЛЮЧИТЬ МЕШАЛКУ (30 СЕКУНД)</span>
            </button>
          ) : (
            <div className="text-center text-xs text-indigo-300 font-mono py-2 bg-indigo-950/40 border border-indigo-500/30 rounded-xl animate-pulse">
              ⏱️ Мешалка работает (30 сек)... Нажимайте кнопки Импульса или Тормоза для поддержания 450–600 RPM!
            </div>
          )}
        </div>
      )}

      {/* ================= STAGE 3: RED LIGHT CHROMATOGRAPHY ("Фракции") ================= */}
      {stageIndex === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider block">
                [ Этап 4 из 5: Красный Свет Safelight («Фракции») ]
              </span>
              <h3 className="text-lg font-bold text-white">Колоночная хроматография</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Отслеживайте движение яркой полосы d-ЛСД и перекройте кран, когда она окажется в золотом окне!
          </p>

          <div className="relative bg-red-950/80 border-2 border-red-600/80 h-36 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute left-[42%] right-[42%] top-0 bottom-0 bg-amber-400/25 border-x-2 border-amber-400 z-10 flex items-center justify-center">
              <span className="text-[10px] font-mono text-amber-300 font-bold uppercase">Фокус d-ЛСД</span>
            </div>

            <div
              className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-red-500 via-amber-300 to-red-500 rounded-full shadow-2xl transition-all duration-75"
              style={{ left: `${bandPosition}%` }}
            />
          </div>

          <button
            onClick={handleCloseChromatographyValve}
            disabled={valveClosed}
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer min-h-[48px] active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldAlert className="w-5 h-5 text-white" />
            <span>🚫 ПЕРЕКРЫТЬ КРАН ХРОМАТОГРАФИИ</span>
          </button>
        </div>
      )}

      {/* ================= STAGE 4: DOSING GRID ("Капля за каплей") ================= */}
      {stageIndex === 4 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cyan-500/20 pb-3 gap-2">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                [ Этап 5 из 5: Пропитка Блоттера («Капля за каплей») ]
              </span>
              <h3 className="text-lg font-bold text-white">Капельная пропитка листа 10×10 (100 марок)</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAutoDoseAll}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>АВТО-ПРОПИТКА ВСЕХ 100</span>
              </button>
              <span className="text-xs bg-cyan-950 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-800 font-mono font-bold">
                {dosedGrid.filter(Boolean).length} / 100
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Нажимайте на ячейки для дозирования 150 мкг или нажмите «АВТО-ПРОПИТКА»!
          </p>

          <div className="grid grid-cols-10 gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-2xl max-w-md mx-auto">
            {dosedGrid.map((isDosed, idx) => (
              <button
                key={idx}
                onClick={() => handleCellDose(idx)}
                className={`aspect-square rounded-md border text-[9px] font-mono font-bold transition-all cursor-pointer ${
                  isDosed
                    ? 'bg-cyan-500 border-cyan-300 shadow-md shadow-cyan-500/50 scale-95'
                    : 'bg-slate-900 border-slate-800 hover:border-cyan-500/50'
                }`}
              >
                {isDosed ? '💧' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
