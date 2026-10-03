import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Zap,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  X,
  Gauge,
  Sliders,
  Flame,
  Maximize2,
  Lock,
  Layers,
  Wind,
  Droplets,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

export type MiniGameType =
  | 'lsd_dosing'
  | 'cocaine_vacuum_seal'
  | 'powder_refinery'
  | 'mycology_inoculation';

export interface MiniGameResult {
  gameType: MiniGameType;
  success: boolean;
  score: number; // 0 to 100
  purityBonus: number;
  yieldMultiplier: number;
  message: string;
  details?: Record<string, any>;
}

interface MiniGameManagerProps {
  isOpen: boolean;
  gameType: MiniGameType;
  onClose: () => void;
  onComplete: (result: MiniGameResult) => void;
  language: Language;
  // Optional initial data override
  initialTargetDoseUg?: 150 | 300 | 600;
  initialBatchName?: string;
}

export const MiniGameManager: React.FC<MiniGameManagerProps> = ({
  isOpen,
  gameType,
  onClose,
  onComplete,
  language,
  initialTargetDoseUg = 300,
  initialBatchName,
}) => {
  const isRu = language === 'ru';

  // Modal active mini-game selector if launched in standalone menu
  const [selectedGameType, setSelectedGameType] = useState<MiniGameType>(gameType);

  useEffect(() => {
    setSelectedGameType(gameType);
  }, [gameType]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#0b0e14] border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 bg-[#070a0f]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>{isRu ? 'Центр Лабораторных Мини-Игр' : 'Crafting MiniGame Manager'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  {selectedGameType}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isRu
                  ? 'Высокоточные инженерные челленджи для фасовки, пропитки и сублимации'
                  : 'Precision manufacturing & purification interactive challenges'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Challenge Selector Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-white/5 bg-slate-950/60 overflow-x-auto no-scrollbar text-xs font-mono">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGameType('lsd_dosing');
            }}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedGameType === 'lsd_dosing'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{isRu ? 'Пропитка ЛСД' : 'LSD Dosing'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGameType('cocaine_vacuum_seal');
            }}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedGameType === 'cocaine_vacuum_seal'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isRu ? 'Вакуумирование Кокаина' : 'Cocaine Vacuum Seal'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGameType('powder_refinery');
            }}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedGameType === 'powder_refinery'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isRu ? 'Порошковый Пресс' : 'Powder Press'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setSelectedGameType('mycology_inoculation');
            }}
            className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedGameType === 'mycology_inoculation'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isRu ? 'Инокуляция Микологии' : 'Mycology Inoculation'}</span>
          </button>
        </div>

        {/* Content Body Rendering Active Challenge */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {selectedGameType === 'lsd_dosing' && (
            <LSDPrecisionDosingMiniGame
              isRu={isRu}
              initialTargetDoseUg={initialTargetDoseUg}
              onFinish={(res) => onComplete(res)}
            />
          )}

          {selectedGameType === 'cocaine_vacuum_seal' && (
            <CocaineVacuumSealMiniGame
              isRu={isRu}
              onFinish={(res) => onComplete(res)}
            />
          )}

          {selectedGameType === 'powder_refinery' && (
            <PowderRefineryMiniGame
              isRu={isRu}
              onFinish={(res) => onComplete(res)}
            />
          )}

          {selectedGameType === 'mycology_inoculation' && (
            <MycologyInoculationMiniGame
              isRu={isRu}
              onFinish={(res) => onComplete(res)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 1. MINI-GAME: PRECISION-BASED SLIDER FOR LSD BLOTTER DOSING
 * ============================================================================ */
interface LSDPrecisionDosingProps {
  isRu: boolean;
  initialTargetDoseUg: 150 | 300 | 600;
  onFinish: (result: MiniGameResult) => void;
}

const LSDPrecisionDosingMiniGame: React.FC<LSDPrecisionDosingProps> = ({
  isRu,
  initialTargetDoseUg,
  onFinish,
}) => {
  const [targetDoseUg, setTargetDoseUg] = useState<150 | 300 | 600>(initialTargetDoseUg);
  const [sliderPos, setSliderPos] = useState<number>(10);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [isDampening, setIsDampening] = useState<boolean>(false);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [scoreAcc, setScoreAcc] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Speed and target tolerance zone based on dose
  const speed = targetDoseUg === 600 ? 3.8 : targetDoseUg === 300 ? 2.4 : 1.5;
  const targetMin = targetDoseUg === 600 ? 44 : targetDoseUg === 300 ? 38 : 30;
  const targetMax = targetDoseUg === 600 ? 56 : targetDoseUg === 300 ? 62 : 70;

  // Oscillator effect
  useEffect(() => {
    const interval = setInterval(() => {
      setSliderPos((prev) => {
        const effectiveSpeed = isDampening ? speed * 0.35 : speed;
        if (prev >= 92) {
          setDirection('left');
          return 91;
        }
        if (prev <= 8) {
          setDirection('right');
          return 9;
        }
        return direction === 'right' ? prev + effectiveSpeed : prev - effectiveSpeed;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [direction, speed, isDampening]);

  const handleTriggerDrop = () => {
    const inTarget = sliderPos >= targetMin && sliderPos <= targetMax;
    const center = (targetMin + targetMax) / 2;
    const distance = Math.abs(sliderPos - center);
    const accuracy = Math.max(0, 100 - distance * 3.5);

    sounds.playClick();

    if (inTarget) {
      sounds.playOverrideSuccess();
      const newAcc = [...scoreAcc, accuracy];
      setScoreAcc(newAcc);

      if (newAcc.length >= 3 || attemptsLeft <= 1) {
        const avgScore = Math.round(newAcc.reduce((a, b) => a + b, 0) / newAcc.length);
        const purityBonus = Math.round(avgScore * 0.15);
        onFinish({
          gameType: 'lsd_dosing',
          success: true,
          score: avgScore,
          purityBonus,
          yieldMultiplier: 1.2,
          message: isRu
            ? `Идеальная калибровка пипетки! Точность пропитки: ${avgScore}% (+${purityBonus}% к чистоте).`
            : `Blotter dosing calibrated perfectly! Precision: ${avgScore}%.`,
        });
      } else {
        setAttemptsLeft((prev) => prev - 1);
        setFeedback(
          isRu
            ? `Попадание в зону! Точность капли: ${Math.round(accuracy)}%. Осталось капель: ${attemptsLeft - 1}`
            : `Target zone hit! Accuracy: ${Math.round(accuracy)}%. Drops remaining: ${attemptsLeft - 1}`
        );
        setTimeout(() => setFeedback(null), 2000);
      }
    } else {
      sounds.playAlarmBeep();
      if (attemptsLeft <= 1) {
        onFinish({
          gameType: 'lsd_dosing',
          success: false,
          score: 30,
          purityBonus: -15,
          yieldMultiplier: 0.8,
          message: isRu
            ? 'Превышен предел погрешности! Часть раствора деградировала.'
            : 'Dosing calibration limit exceeded! Solution partially degraded.',
        });
      } else {
        setAttemptsLeft((prev) => prev - 1);
        setFeedback(
          isRu
            ? `Промах! Не попали в зону ${targetMin}-${targetMax}%. Осталось попыток: ${attemptsLeft - 1}`
            : `Missed calibration window! Attempts left: ${attemptsLeft - 1}`
        );
        setTimeout(() => setFeedback(null), 2000);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Description & Target Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-purple-950/30 border border-purple-500/20 rounded-xl">
        <div>
          <h3 className="text-sm font-bold text-purple-300 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-purple-400" />
            <span>{isRu ? 'Капельная Пропитка Блоттер-Сетки' : 'Precision Blotter Dosing'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRu
              ? 'Зафиксируйте микро-пипетку точно над зелёной целевой зоной дозирования.'
              : 'Hold dampener to slow down oscillating needle and release micro-pipette in green zone.'}
          </p>
        </div>

        {/* Dose Selector */}
        <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-lg border border-white/10 font-mono text-xs">
          {[150, 300, 600].map((dose) => (
            <button
              key={dose}
              onClick={() => {
                sounds.playClick();
                setTargetDoseUg(dose as any);
                setScoreAcc([]);
                setAttemptsLeft(3);
              }}
              className={`px-2.5 py-1 rounded-md transition-all ${
                targetDoseUg === dose
                  ? 'bg-purple-500 text-white font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {dose}µg
            </button>
          ))}
        </div>
      </div>

      {/* Visual Oscillator Meter */}
      <div className="bg-[#05080c] border border-purple-500/30 rounded-2xl p-5 space-y-4 relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-emerald-500/10 to-purple-500/5 pointer-events-none" />

        {/* Top HUD */}
        <div className="flex items-center justify-between font-mono text-xs text-slate-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            {isRu ? 'Осциллятор Пипетки:' : 'Pipette Oscillator:'} {Math.round(sliderPos)}%
          </span>
          <span className="text-purple-300">
            {isRu ? 'Целевая доза:' : 'Target Dose:'} {targetDoseUg} µg / {isRu ? 'марка' : 'tab'}
          </span>
          <span className="text-amber-400 font-bold">
            {isRu ? 'Осталось капель:' : 'Drops Left:'} {attemptsLeft}/3
          </span>
        </div>

        {/* Main Slider Track */}
        <div className="relative h-14 bg-slate-900 border-2 border-white/15 rounded-xl overflow-hidden flex items-center shadow-inner">
          {/* Target Sweet Spot Zone */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/30 border-x-2 border-emerald-400 transition-all flex items-center justify-center text-[10px] font-mono font-bold text-emerald-200"
            style={{
              left: `${targetMin}%`,
              width: `${targetMax - targetMin}%`,
            }}
          >
            <span className="bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40">
              {targetMin}-{targetMax}%
            </span>
          </div>

          {/* Needle / Indicator */}
          <div
            className="absolute top-0 bottom-0 w-3 bg-purple-400 shadow-[0_0_15px_#c084fc] rounded-full transition-all duration-75 flex items-center justify-center"
            style={{ left: `calc(${sliderPos}% - 6px)` }}
          >
            <div className="w-1 h-8 bg-white rounded-full" />
          </div>
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div className="text-center font-mono text-xs text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 py-1.5 rounded-lg animate-pulse">
            {feedback}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onMouseDown={() => setIsDampening(true)}
            onMouseUp={() => setIsDampening(false)}
            onTouchStart={() => setIsDampening(true)}
            onTouchEnd={() => setIsDampening(false)}
            className={`py-3 px-4 rounded-xl border text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 select-none ${
              isDampening
                ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-[0.98]'
                : 'bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>
              {isDampening
                ? isRu
                  ? '⚡ Демпфер активирован (-65% колебаний)'
                  : '⚡ Dampener Active'
                : isRu
                ? 'Удерживайте для гидравлической стабилизации'
                : 'Hold to Dampen Oscillations'}
            </span>
          </button>

          <button
            onClick={handleTriggerDrop}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs border border-emerald-400/40 shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            <span>{isRu ? 'КАПЕЛЬНЫЙ СПУСК ПИПЕТКИ' : 'RELEASE DOSING DROP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. MINI-GAME: DRAG-AND-DROP MECHANISM FOR VACUUM-SEALING COCAINE
 * ============================================================================ */
interface CocaineVacuumSealProps {
  isRu: boolean;
  onFinish: (result: MiniGameResult) => void;
}

const CocaineVacuumSealMiniGame: React.FC<CocaineVacuumSealProps> = ({ isRu, onFinish }) => {
  const [isBrickInChamber, setIsBrickInChamber] = useState<boolean>(false);
  const [isPurgePurged, setIsPurgePurged] = useState<boolean>(false);
  const [hydraulicPressureBar, setHydraulicPressureBar] = useState<number>(0);
  const [isSealing, setIsSealing] = useState<boolean>(false);
  const [sealSuccess, setSealSuccess] = useState<boolean>(false);

  // Drag handlers for Brick
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropBrick = (e: React.DragEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsBrickInChamber(true);
  };

  const handleDropPurge = (e: React.DragEvent) => {
    e.preventDefault();
    sounds.playClick();
    setIsPurgePurged(true);
  };

  // Hold hydraulic press logic
  useEffect(() => {
    if (!isSealing) return;

    const interval = setInterval(() => {
      setHydraulicPressureBar((prev) => {
        if (prev >= 100) {
          setIsSealing(false);
          return 100;
        }
        return prev + 3;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isSealing]);

  const handleFinishSealing = () => {
    sounds.playClick();
    setIsSealing(false);

    if (hydraulicPressureBar >= 82 && hydraulicPressureBar <= 96) {
      sounds.playOverrideSuccess();
      setSealSuccess(true);
      setTimeout(() => {
        onFinish({
          gameType: 'cocaine_vacuum_seal',
          success: true,
          score: 98,
          purityBonus: 10,
          yieldMultiplier: 1.15,
          message: isRu
            ? 'Идеальная герметизация в азотной среде! Брикет 96% Fishscale запечатан.'
            : 'Ideal vacuum seal created! 96% Fishscale brick sealed.',
        });
      }, 1200);
    } else {
      sounds.playAlarmBeep();
      onFinish({
        gameType: 'cocaine_vacuum_seal',
        success: false,
        score: 45,
        purityBonus: -5,
        yieldMultiplier: 0.9,
        message: isRu
          ? 'Неоптимальное давление вакуума (требуется 82-96 Bar). Частичная разгерметизация.'
          : 'Non-optimal seal pressure. Minor brick oxidation.',
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-3.5 bg-amber-950/30 border border-amber-500/20 rounded-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>{isRu ? 'Вакуумная Запрессовка Брикетов' : 'Vacuum-Sealing Cocaine Bricks'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isRu
              ? 'Перетащите брикет и картридж инертного газа в вакуумную камеру, затем удерживайте рычаг пресса.'
              : 'Drag cocaine powder brick & nitrogen cartridge into chamber, then apply 82-96 Bar seal pressure.'}
          </p>
        </div>

        <div className="text-xs font-mono px-3 py-1 bg-black/60 rounded-lg border border-amber-500/30 text-amber-300">
          {isRu ? 'Стандарт:' : 'Standard:'} 82–96 Bar
        </div>
      </div>

      {/* Main Drag-and-Drop Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Source Items Tray */}
        <div className="bg-[#05080c] border border-white/10 rounded-2xl p-4 space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block border-b border-white/5 pb-2">
            {isRu ? '1. Компоненты для запечатки' : '1. Packaging Components'}
          </span>

          {/* Draggable Brick */}
          <div
            draggable={!isBrickInChamber}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', 'brick')}
            onClick={() => {
              if (!isBrickInChamber) {
                sounds.playClick();
                setIsBrickInChamber(true);
              }
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between ${
              isBrickInChamber
                ? 'bg-slate-900/50 border-white/5 opacity-40 select-none'
                : 'bg-amber-500/15 border-amber-500/30 hover:bg-amber-500/25 text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400/20 flex items-center justify-center font-bold font-mono text-amber-300">
                1000g
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isRu ? 'Свежий порошок Fishscale' : 'Raw Fishscale Powder'}
                </h4>
                <span className="text-[10px] text-slate-400">
                  {isBrickInChamber ? (isRu ? 'Помещен в камеру' : 'In Chamber') : isRu ? 'Перетащите в камеру' : 'Drag or click to insert'}
                </span>
              </div>
            </div>
            {isBrickInChamber ? <Check className="w-5 h-5 text-emerald-400" /> : <Maximize2 className="w-4 h-4 opacity-60" />}
          </div>

          {/* Draggable Purge Canister */}
          <div
            draggable={!isPurgePurged}
            onDragStart={(e) => e.dataTransfer.setData('text/plain', 'purge')}
            onClick={() => {
              if (!isPurgePurged) {
                sounds.playClick();
                setIsPurgePurged(true);
              }
            }}
            className={`p-3.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing flex items-center justify-between ${
              isPurgePurged
                ? 'bg-slate-900/50 border-white/5 opacity-40 select-none'
                : 'bg-cyan-500/15 border-cyan-500/30 hover:bg-cyan-500/25 text-cyan-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-400/20 flex items-center justify-center font-bold font-mono text-cyan-300">
                N2
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  {isRu ? 'Картридж Азотного Продува' : 'Nitrogen Gas Purge'}
                </h4>
                <span className="text-[10px] text-slate-400">
                  {isPurgePurged ? (isRu ? 'Подключен к коллектору' : 'Connected') : isRu ? 'Перетащите в коллектор' : 'Drag or click to connect'}
                </span>
              </div>
            </div>
            {isPurgePurged ? <Check className="w-5 h-5 text-emerald-400" /> : <Wind className="w-4 h-4 opacity-60" />}
          </div>
        </div>

        {/* Industrial Vacuum Press Chamber */}
        <div
          onDragOver={handleDragOver}
          onDrop={(e) => {
            const data = e.dataTransfer.getData('text/plain');
            if (data === 'brick') handleDropBrick(e);
            else if (data === 'purge') handleDropPurge(e);
          }}
          className="bg-[#03060a] border-2 border-dashed border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden min-h-[220px]"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono font-bold text-amber-300 flex items-center gap-2">
              <Gauge className="w-4 h-4" />
              {isRu ? '2. Вакуумная Камера Запрессовки' : '2. Vacuum Sealing Chamber'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {isBrickInChamber && isPurgePurged
                ? isRu ? 'Камера загерметизирована' : 'Chamber Sealed'
                : isRu ? 'Ожидание компонентов...' : 'Awaiting Components...'}
            </span>
          </div>

          {/* Visual Chamber Contents */}
          <div className="my-4 flex items-center justify-center gap-4 py-3 bg-black/40 rounded-xl border border-white/5">
            <div className={`w-20 h-16 rounded-lg border flex items-center justify-center font-mono text-xs transition-all ${
              isBrickInChamber
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                : 'border-dashed border-white/20 text-slate-600'
            }`}>
              {isBrickInChamber ? 'BRICK READY' : 'BRICK SLOT'}
            </div>

            <div className={`w-16 h-16 rounded-lg border flex items-center justify-center font-mono text-xs transition-all ${
              isPurgePurged
                ? 'bg-cyan-400/20 border-cyan-400/50 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                : 'border-dashed border-white/20 text-slate-600'
            }`}>
              {isPurgePurged ? 'N2 OK' : 'PURGE SLOT'}
            </div>
          </div>

          {/* Pressure Gauge & Hydraulic Seal Button */}
          {isBrickInChamber && isPurgePurged ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300">{isRu ? 'Давление пресса:' : 'Press Pressure:'}</span>
                <span className={`font-bold ${hydraulicPressureBar >= 82 && hydraulicPressureBar <= 96 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {hydraulicPressureBar} Bar
                </span>
              </div>

              <div className="relative h-6 bg-slate-900 rounded-lg overflow-hidden border border-white/15">
                {/* Green target zone */}
                <div className="absolute top-0 bottom-0 left-[82%] width-[14%] bg-emerald-500/40 border-x border-emerald-400" />
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-75"
                  style={{ width: `${hydraulicPressureBar}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onMouseDown={() => setIsSealing(true)}
                  onMouseUp={handleFinishSealing}
                  onTouchStart={() => setIsSealing(true)}
                  onTouchEnd={handleFinishSealing}
                  className="py-2.5 px-3 rounded-xl bg-amber-500 text-black font-mono font-bold text-xs hover:bg-amber-400 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Gauge className="w-4 h-4" />
                  <span>{isRu ? 'ЖМИТЕ ДЛЯ ПРЕССА' : 'HOLD HYDRAULIC PRESS'}</span>
                </button>

                <button
                  onClick={handleFinishSealing}
                  disabled={hydraulicPressureBar === 0}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-mono font-bold text-xs hover:bg-emerald-500 transition-all disabled:opacity-40"
                >
                  {isRu ? 'ФИКСИРОВАТЬ' : 'LOCK SEAL'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center font-mono text-xs text-amber-400/80 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
              {isRu ? '⚠️ Перетащите оба компонента в камеру' : '⚠️ Insert both components into chamber'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * 3. MINI-GAME: POWDER REFINERY MILLING & PRESS
 * ============================================================================ */
interface PowderRefineryProps {
  isRu: boolean;
  onFinish: (result: MiniGameResult) => void;
}

const PowderRefineryMiniGame: React.FC<PowderRefineryProps> = ({ isRu, onFinish }) => {
  const [rpm, setRpm] = useState<number>(2000);
  const [pressureBar, setPressureBar] = useState<number>(40);

  const handleCompress = () => {
    sounds.playClick();
    const rpmOk = rpm >= 2600 && rpm <= 3100;
    const pressOk = pressureBar >= 68 && pressureBar <= 78;

    if (rpmOk && pressOk) {
      sounds.playOverrideSuccess();
      onFinish({
        gameType: 'powder_refinery',
        success: true,
        score: 95,
        purityBonus: 12,
        yieldMultiplier: 1.1,
        message: isRu
          ? 'Фракционный помол и запрессовка идеальны! Выход брикетов +10%.'
          : 'Micro-milling & hydraulic lock ideal! Powder density maxed.',
      });
    } else {
      sounds.playAlarmBeep();
      onFinish({
        gameType: 'powder_refinery',
        success: false,
        score: 50,
        purityBonus: -5,
        yieldMultiplier: 0.95,
        message: isRu
          ? 'Отклонение параметров! Требуется 2600-3100 RPM и 68-78 Bar.'
          : 'Parameter mismatch. Non-uniform block compression.',
      });
    }
  };

  return (
    <div className="space-y-4 bg-[#05080c] p-4 rounded-2xl border border-emerald-500/20">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
          <Sliders className="w-4 h-4" />
          <span>{isRu ? 'Калибровка Порошковой Мельницы' : 'Powder Refinery Compression'}</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Target: 2600-3100 RPM | 68-78 Bar
        </span>
      </div>

      <div className="space-y-4">
        {/* RPM Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">{isRu ? 'Скорость помола (RPM):' : 'Milling Speed (RPM):'}</span>
            <span className={`font-bold ${rpm >= 2600 && rpm <= 3100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {rpm} RPM
            </span>
          </div>
          <input
            type="range"
            min="1500"
            max="3500"
            step="50"
            value={rpm}
            onChange={(e) => {
              sounds.playClick();
              setRpm(Number(e.target.value));
            }}
            className="w-full accent-emerald-500 bg-slate-900 rounded-lg cursor-pointer h-2"
          />
        </div>

        {/* Pressure Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300">{isRu ? 'Давление гидропресса:' : 'Press Pressure:'}</span>
            <span className={`font-bold ${pressureBar >= 68 && pressureBar <= 78 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {pressureBar} Bar
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="100"
            step="1"
            value={pressureBar}
            onChange={(e) => {
              sounds.playClick();
              setPressureBar(Number(e.target.value));
            }}
            className="w-full accent-emerald-500 bg-slate-900 rounded-lg cursor-pointer h-2"
          />
        </div>

        <button
          onClick={handleCompress}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs shadow-lg transition-all"
        >
          {isRu ? 'ЗАПУСТИТЬ ЗАПРЕССОВКУ' : 'EXECUTE COMPRESSION LOCK'}
        </button>
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. MINI-GAME: MYCOLOGY INOCULATION & STERILE SEAL
 * ============================================================================ */
interface MycologyInoculationProps {
  isRu: boolean;
  onFinish: (result: MiniGameResult) => void;
}

const MycologyInoculationMiniGame: React.FC<MycologyInoculationProps> = ({ isRu, onFinish }) => {
  const [portsInoculated, setPortsInoculated] = useState<boolean[]>([false, false, false, false]);
  const [needleTemp, setNeedleTemp] = useState<number>(25);

  const handleInoculatePort = (index: number) => {
    sounds.playClick();
    if (needleTemp < 180) {
      sounds.playAlarmBeep();
      return;
    }

    const updated = [...portsInoculated];
    updated[index] = true;
    setPortsInoculated(updated);

    if (updated.every(Boolean)) {
      sounds.playOverrideSuccess();
      onFinish({
        gameType: 'mycology_inoculation',
        success: true,
        score: 100,
        purityBonus: 15,
        yieldMultiplier: 1.25,
        message: isRu
          ? 'Стерильная инокуляция 4 портов завершена! Скорость колонизации +25%.'
          : 'Sterile 4-port inoculation completed perfectly!',
      });
    }
  };

  return (
    <div className="space-y-4 bg-[#05080c] p-4 rounded-2xl border border-cyan-500/20">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
          <Flame className="w-4 h-4" />
          <span>{isRu ? 'Стерильная Инокуляция Субстрата' : 'Sterile Syringe Inoculation'}</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          Needle Temp: {needleTemp}°C (Target &gt; 180°C)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Flame Sterilization Station */}
        <div className="p-3.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">{isRu ? 'Нагрев иглы горелкой:' : 'Burner Heat:'}</span>
            <span className={needleTemp >= 180 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {needleTemp}°C
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setNeedleTemp((prev) => Math.min(260, prev + 45));
            }}
            className="w-full py-2.5 rounded-lg bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-orange-200 font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Flame className="w-4 h-4" />
            <span>{isRu ? 'ПРОКАЛИТЬ ИГЛУ ГОРЕЛКОЙ' : 'FLAME-STERILIZE NEEDLE'}</span>
          </button>
        </div>

        {/* 4 Injection Ports Grid */}
        <div className="p-3.5 bg-black/40 border border-white/10 rounded-xl space-y-2">
          <span className="text-xs font-mono text-slate-400 block border-b border-white/5 pb-1">
            {isRu ? 'Инъекционные Порты Пакета:' : 'Substrate Injection Ports:'}
          </span>

          <div className="grid grid-cols-2 gap-2">
            {portsInoculated.map((done, idx) => (
              <button
                key={idx}
                disabled={done || needleTemp < 180}
                onClick={() => handleInoculatePort(idx)}
                className={`py-3 rounded-lg border font-mono text-xs transition-all flex items-center justify-center gap-1.5 ${
                  done
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : needleTemp >= 180
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-200 hover:bg-cyan-500/30'
                    : 'bg-slate-900 border-white/5 text-slate-600'
                }`}
              >
                {done ? <Check className="w-4 h-4 text-emerald-400" /> : `PORT #${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
