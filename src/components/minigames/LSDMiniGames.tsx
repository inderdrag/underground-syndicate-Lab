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
  Sparkles
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
  const [draggedPartId, setDraggedPartId] = useState<number | null>(null);
  const [showGhostSchematic, setShowGhostSchematic] = useState<boolean>(false);
  const [ghostUsesLeft, setGhostUsesLeft] = useState<number>(2);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [assemblyTimer, setAssemblyTimer] = useState<number>(40);
  const [leakBanner, setLeakBanner] = useState<boolean>(false);

  // --- STAGE 1: REFLUX THERMOSTAT ("Термостат") STATES ---
  const [currentTemp, setCurrentTemp] = useState<number>(batch.refluxTempC || 45.0);
  const [targetPower, setTargetPower] = useState<number>(50);
  const [draftWind, setDraftWind] = useState<number>(0);
  const [thermostatTimer, setThermostatTimer] = useState<number>(10);
  const [thermostatActive, setThermostatActive] = useState<boolean>(false);
  const [tempPurityBonus, setTempPurityBonus] = useState<number>(0);

  // --- STAGE 2: STIRRER VORTEX ("Вихрь") STATES ---
  const [currentRpm, setCurrentRpm] = useState<number>(batch.magneticStirrerRpm || 500);
  const [stirrerTimer, setStirrerTimer] = useState<number>(10);
  const [stirrerActive, setStirrerActive] = useState<boolean>(false);
  const [rpmStability, setRpmStability] = useState<number>(100);

  // --- STAGE 3: RED LIGHT CHROMATOGRAPHY ("Фракции") STATES ---
  const [bandPosition, setBandPosition] = useState<number>(10);
  const [bandDirection, setBandDirection] = useState<'down' | 'up'>('down');
  const [valveClosed, setValveClosed] = useState<boolean>(false);

  // --- STAGE 4: DOSING GRID ("Капля за каплей") STATES ---
  const [dosedGrid, setDosedGrid] = useState<boolean[]>(new Array(100).fill(false));

  // --- STAGE 0 ASSEMBLY TIMER LOOP ---
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
            feedback: 'Время сборки истекло: минимальный результат'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stageIndex, connectedPorts.length, onCompleteMinigame]);

  // --- STAGE 1 THERMOSTAT LOOP ---
  useEffect(() => {
    if (stageIndex !== 1 || !thermostatActive) return;

    const interval = setInterval(() => {
      let wind = 0;
      if (Math.random() < 0.25) {
        wind = (Math.random() - 0.5) * 6;
        setDraftWind(wind);
      }

      setCurrentTemp((prev) => {
        const drift = (targetPower - 50) * 0.25 + wind;
        const newTemp = Math.max(20, Math.min(80, prev + drift));
        if (newTemp >= 42 && newTemp <= 48) {
          setTempPurityBonus((p) => p + 1);
        }
        return newTemp;
      });

      setThermostatTimer((prev) => {
        if (prev <= 1) {
          setThermostatActive(false);
          sounds.playOverrideSuccess();
          const bonusP = Math.min(20, tempPurityBonus * 2);
          onCompleteMinigame({
            stars: bonusP >= 10 ? 3 : 2,
            purityDelta: bonusP,
            yieldDelta: 0,
            feedback: 'Термостат выдержан в оптимальной зеленой зоне!'
          });
          return 0;
        }
        return prev - 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [stageIndex, thermostatActive, targetPower, tempPurityBonus, onCompleteMinigame]);

  // --- STAGE 2 STIRRER LOOP ---
  useEffect(() => {
    if (stageIndex !== 2 || !stirrerActive) return;

    const interval = setInterval(() => {
      setStirrerTimer((prev) => {
        if (prev <= 1) {
          setStirrerActive(false);
          sounds.playOverrideSuccess();
          const stars = rpmStability > 70 ? 3 : 2;
          onCompleteMinigame({
            stars,
            purityDelta: 10,
            yieldDelta: 0,
            feedback: 'Стабильный вихрь эмульсии сформирован!'
          });
          return 0;
        }
        return prev - 1;
      });

      setCurrentRpm((prev) => {
        const decay = -15;
        const updated = Math.max(100, Math.min(900, prev + decay));
        if (updated < 450 || updated > 600) {
          setRpmStability((s) => Math.max(20, s - 4));
        } else {
          setRpmStability((s) => Math.min(100, s + 2));
        }
        return updated;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [stageIndex, stirrerActive, rpmStability, onCompleteMinigame]);

  // --- STAGE 3 CHROMATOGRAPHY BAND ANIMATION ---
  useEffect(() => {
    if (stageIndex !== 3 || valveClosed) return;

    const interval = setInterval(() => {
      setBandPosition((prev) => {
        if (prev >= 90) {
          setBandDirection('up');
          return 88;
        }
        if (prev <= 10) {
          setBandDirection('down');
          return 12;
        }
        return bandDirection === 'down' ? prev + 3 : prev - 3;
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
    const partToConnect = selectedPartId || draggedPartId;
    if (!partToConnect) return;

    const expectedPartId = slotIndex + 1;

    if (partToConnect === expectedPartId) {
      sounds.playOverrideSuccess();
      const newConnected = [...connectedPorts, partToConnect];
      setConnectedPorts(newConnected);
      setSelectedPartId(null);
      setDraggedPartId(null);

      if (newConnected.length === 5) {
        const speedBonus = assemblyTimer > 20 ? 15 : 5;
        const starRating = errorCount === 0 ? 3 : errorCount <= 2 ? 2 : 1;
        setTimeout(() => {
          onCompleteMinigame({
            stars: starRating,
            purityDelta: speedBonus,
            yieldDelta: 0,
            feedback: 'Реактор собран идеально без утечек!'
          });
        }, 500);
      }
    } else {
      sounds.playAlarmBeep();
      const nextErrors = errorCount + 1;
      setErrorCount(nextErrors);

      if (nextErrors >= 3) {
        setLeakBanner(true);
        setConnectedPorts([]);
        setSelectedPartId(null);
        setDraggedPartId(null);
        setTimeout(() => {
          setLeakBanner(false);
          setErrorCount(0);
        }, 1500);
      } else {
        setLeakBanner(true);
        setTimeout(() => setLeakBanner(false), 1000);
      }
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

    if (diff <= 5) {
      sounds.playOverrideSuccess();
      purityGain = 25;
      stars = 3;
    } else if (diff <= 15) {
      sounds.playClick();
      purityGain = 10;
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
        feedback: 'Фракционирование d-изомера успешно завершено!'
      });
    }, 1200);
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
          feedback: 'Блоттер пропитан со 100% ровностью дозировки!'
        });
      }, 500);
    }
  };

  return (
    <div className="bg-[#0b1017] border border-cyan-500/30 rounded-2xl p-4 sm:p-6 text-white space-y-5 shadow-2xl relative overflow-hidden">
      {/* ================= STAGE 0: ASSEMBLY ("Схема") ================= */}
      {stageIndex === 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-cyan-500/20 pb-3 gap-2">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                [ Шаг 1 из 5: Сборка Реактора («Схема») ]
              </span>
              <h3 className="text-lg font-bold text-white">Монтаж узлов и соединений</h3>
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
              ⚠️ ОШИБКА ПОДКЛЮЧЕНИЯ! УТЕЧКА ПРЕКУРСОРОВ (-10% ВЫХОДА)
            </div>
          )}

          {/* Interactive Assembly SVG Workbench */}
          <div className="relative aspect-[16/9] w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-inner">
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
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-mono transition-all flex items-center justify-between ${
                        isConnected
                          ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-200 shadow-lg ring-1 ring-cyan-400'
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
            <div className="w-full sm:w-2/3 bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative flex items-center justify-center min-h-[180px]">
              <div className="grid grid-cols-5 gap-2 w-full">
                {[0, 1, 2, 3, 4].map((slotIdx) => {
                  const connectedPartId = connectedPorts[slotIdx];
                  const connectedPart = PARTS_CATALOG.find((p) => p.id === connectedPartId);

                  return (
                    <div
                      key={slotIdx}
                      onClick={() => handleSlotClick(slotIdx)}
                      className={`h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
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
                [ Шаг 2 из 5: Обратный Холодильник («Термостат») ]
              </span>
              <h3 className="text-lg font-bold text-white">Регулировка температуры бани</h3>
            </div>
            <span className="text-xs bg-purple-950 text-purple-300 px-3 py-1 rounded-xl border border-purple-800 font-mono font-bold">
              Таймер: {thermostatTimer}с
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Удерживайте стрелку температуры водяной бани в зелёной зоне <strong className="text-emerald-400">(42°C – 48°C)</strong>.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="relative h-12 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center px-2">
              <div className="absolute left-[36%] right-[36%] top-1 bottom-1 bg-emerald-500/30 border-x-2 border-emerald-400 rounded-lg flex items-center justify-center">
                <span className="text-[10px] font-mono font-bold text-emerald-300">42 - 48°C</span>
              </div>
              <div
                className="absolute top-1 bottom-1 w-3 bg-amber-400 rounded-full shadow-lg transition-all duration-300"
                style={{ left: `${((currentTemp - 20) / 60) * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400">Текущая темп: <strong className="text-amber-400">{currentTemp.toFixed(1)}°C</strong></span>
              <span className="text-slate-400">Сквозняки: <strong className="text-purple-300">{draftWind.toFixed(1)}</strong></span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={targetPower}
              onChange={(e) => setTargetPower(Number(e.target.value))}
              disabled={!thermostatActive}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {!thermostatActive ? (
            <button
              onClick={() => {
                setThermostatActive(true);
                setThermostatTimer(10);
                sounds.playClick();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-black rounded-xl shadow-lg transition-all text-sm cursor-pointer"
            >
              🚀 ЗАПУСТИТЬ ТЕРМОСТАТИРОВАНИЕ (10 СЕК)
            </button>
          ) : (
            <div className="text-center text-xs text-purple-300 animate-pulse font-mono py-2">
              Удерживайте ползунок так, чтобы температура была в зелёной зоне...
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
                [ Шаг 3 из 5: Магнитная Мешалка («Вихрь») ]
              </span>
              <h3 className="text-lg font-bold text-white">Перемешивание суспензии</h3>
            </div>
            <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-800 font-mono font-bold">
              Стабильность: {rpmStability}%
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Поддерживайте обороты в коридоре <strong className="text-amber-400">450 - 600 RPM</strong> импульсами мешалки.
          </p>

          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center space-y-4">
            <div className="text-4xl font-black text-indigo-400 font-mono">{Math.round(currentRpm)} RPM</div>
            <div className="text-xs text-slate-400 font-mono">Целевой коридор: 450 - 600 RPM</div>

            {!stirrerActive ? (
              <button
                onClick={() => {
                  setStirrerActive(true);
                  setStirrerTimer(10);
                  sounds.playClick();
                }}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                🚀 ВЛЮЧИТЬ МЕШАЛКУ (10 СЕК)
              </button>
            ) : (
              <button
                onClick={() => {
                  setCurrentRpm((r) => Math.min(850, r + 80));
                  sounds.playClick();
                }}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black rounded-2xl shadow-xl border border-indigo-400 text-base transition-all cursor-pointer"
              >
                🌀 ИМПУЛЬС МЕШАЛКИ (+80 RPM)
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= STAGE 3: RED LIGHT CHROMATOGRAPHY ("Фракции") ================= */}
      {stageIndex === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider block">
                [ Шаг 4 из 5: Красный Свет Safelight («Фракции») ]
              </span>
              <h3 className="text-lg font-bold text-white">Колоночная хроматография</h3>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Отслеживайте движение яркой полосы d-ЛСД и перекройте кран, когда она окажется в золотом окне!
          </p>

          <div className="relative bg-red-950/80 border-2 border-red-600/80 h-36 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
            <div className="absolute left-[42%] right-[42%] top-0 bottom-0 bg-amber-400/20 border-x-2 border-amber-400 z-10 flex items-center justify-center">
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
            className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl shadow-xl transition-all cursor-pointer min-h-[48px] active:scale-95"
          >
            🚫 ПЕРЕКРЫТЬ КРАН ХРОМАТОГРАФИИ
          </button>
        </div>
      )}

      {/* ================= STAGE 4: DOSING GRID ("Капля за каплей") ================= */}
      {stageIndex === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                [ Шаг 5 из 5: Пропитка Блоттера («Капля за каплей») ]
              </span>
              <h3 className="text-lg font-bold text-white">Капельная пропитка листа 10×10</h3>
            </div>
            <span className="text-xs bg-cyan-950 text-cyan-300 px-3 py-1 rounded-xl border border-cyan-800 font-mono font-bold">
              Пропитано: {dosedGrid.filter(Boolean).length} / 100
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono">
            Нажимайте на каждую ячейку листа для равномерного нанесения 150 мкг дозы.
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
