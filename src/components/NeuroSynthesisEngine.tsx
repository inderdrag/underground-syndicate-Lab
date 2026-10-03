import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import {
  Zap,
  Sparkles,
  Layers,
  Radio,
  Sliders,
  ShieldAlert,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShoppingBag,
  Activity,
  Wind,
  Gauge,
  ChevronRight,
  Key,
  TrendingUp,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { ProductionStepper } from './ProductionStepper';

interface NeuroSynthesisEngineProps {
  gameState: GameState;
  onFinishBatch: (sheetsCount: number, purity: number, marketValue: number) => void;
  onDeductCash: (amount: number) => void;
  onTriggerEmergencyFx?: () => void;
  language: Language;
}

export type NeuroStage =
  | 'procurement' // 1. Покупка материалов
  | 'assembly' // 2. Сборочный стол
  | 'reactor' // 3. Нейро-Реактор (осциллограф)
  | 'inscription' // 4. Нанесение на марки (4 фазы)
  | 'vacuum' // 5. Вакуумирование и оценка
  | 'emergency' // 6. Аварийный протокол
  | 'completed'; // 7. Результат

interface MaterialItem {
  id: string;
  nameRu: string;
  nameEn: string;
  basePrice: number;
  discountedPrice: number;
  purchased: boolean;
  connectorType: '+' | '-' | '~' | 'Ω' | 'Δ';
  slotAssigned: number | null;
}

export const NeuroSynthesisEngine: React.FC<NeuroSynthesisEngineProps> = ({
  gameState,
  onFinishBatch,
  onDeductCash,
  onTriggerEmergencyFx,
  language,
}) => {
  const t = translations[language];

  // Global Engine State
  const [stage, setStage] = useState<NeuroStage>('procurement');
  const [purity, setPurity] = useState<number>(92);
  const [stability, setStability] = useState<number>(88);
  const [instabilityRisk, setInstabilityRisk] = useState<number>(0);
  const [batchGrade, setBatchGrade] = useState<'C' | 'B' | 'A' | 'S' | 'S+'>('S');
  const [calculatedValue, setCalculatedValue] = useState<number>(12500);

  // --- STAGE 1: Procurement State ---
  const [materials, setMaterials] = useState<MaterialItem[]>([
    { id: 'lumin_base', nameRu: 'Люминовая основа', nameEn: 'Lumin Base', basePrice: 150, discountedPrice: 90, purchased: false, connectorType: '+', slotAssigned: null },
    { id: 'aether_ink', nameRu: 'Эфирные чернила', nameEn: 'Aether Ink', basePrice: 220, discountedPrice: 130, purchased: false, connectorType: '~', slotAssigned: null },
    { id: 'catalyst_x', nameRu: 'Катализатор X', nameEn: 'Catalyst-X', basePrice: 310, discountedPrice: 180, purchased: false, connectorType: 'Ω', slotAssigned: null },
    { id: 'chromo_substrate', nameRu: 'Хромо-бумага', nameEn: 'Chromo-Substrate', basePrice: 120, discountedPrice: 70, purchased: false, connectorType: 'Δ', slotAssigned: null },
    { id: 'stabilizer_z', nameRu: 'Стабилизатор Z', nameEn: 'Stabilizer-Z', basePrice: 190, discountedPrice: 110, purchased: false, connectorType: '-', slotAssigned: null },
  ]);
  const [signalPosition, setSignalPosition] = useState<number>(20);
  const [interceptSuccessMsg, setInterceptSuccessMsg] = useState<string | null>(null);

  // Wave Signal Ticker for Broker Intercept
  useEffect(() => {
    if (stage !== 'procurement') return;
    const interval = setInterval(() => {
      setSignalPosition((prev) => (prev + 4) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [stage]);

  // --- STAGE 2: Assembly Table Slots ---
  const slotsConfig: { index: number; requiredType: '+' | '-' | '~' | 'Ω' | 'Δ'; labelRu: string }[] = [
    { index: 0, requiredType: '+', labelRu: '[+] Анодный узел' },
    { index: 1, requiredType: '~', labelRu: '[~] Гармонический коннектор' },
    { index: 2, requiredType: 'Ω', labelRu: '[Ω] Резистивная шина' },
    { index: 3, requiredType: 'Δ', labelRu: '[Δ] Квантовый фазовый слой' },
    { index: 4, requiredType: '-', labelRu: '[-] Катодный заземлитель' },
  ];

  // --- STAGE 3: Neuro-Reactor Wave Synthesizer ---
  const [frequency, setFrequency] = useState<number>(60);
  const [resonance, setResonance] = useState<number>(2.5);
  const [phaseInverted, setPhaseInverted] = useState<boolean>(false);
  const [reactorCharge, setReactorCharge] = useState<number>(0);
  const [isHarmonicLocked, setIsHarmonicLocked] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Target sweet spots
  const targetFrequency = 75;
  const targetResonance = 3.8;

  // Real-Time Reactor Canvas and Charging Loop
  useEffect(() => {
    if (stage !== 'reactor') return;
    let animId: number;
    let time = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const freqDiff = Math.abs(frequency - targetFrequency);
      const resDiff = Math.abs(resonance - targetResonance);
      const isLocked = freqDiff < 8 && resDiff < 0.6 && !phaseInverted;
      setIsHarmonicLocked(isLocked);

      // Target Wave (Golden/Emerald Reference)
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * 0.035 + time * 2) * (targetResonance * 12);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Player Dual Waves
      // 1. Lumin Wave (Cyan)
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = isLocked ? 14 : 4;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * (frequency * 0.0006) + time * 2) * (resonance * 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Aether Wave (Magenta)
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ec4899';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const phaseOffset = phaseInverted ? Math.PI : 0;
        const y = h / 2 + Math.sin(x * (frequency * 0.0006) + time * 2 + phaseOffset) * (resonance * 10);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Charge Logic
      if (isLocked) {
        setReactorCharge((prev) => {
          if (prev >= 100) return 100;
          return prev + 0.45;
        });
        setPurity((prev) => Math.min(99.8, prev + 0.03));
        setStability((prev) => Math.min(99.5, prev + 0.02));
      } else {
        setInstabilityRisk((prev) => Math.min(100, prev + 0.1));
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [stage, frequency, resonance, phaseInverted]);

  // --- STAGE 4: 4-Subphase Inscription ---
  const [subPhase, setSubPhase] = useState<1 | 2 | 3 | 4>(1);
  const [warmupProgress, setWarmupProgress] = useState<number>(0);
  const [fluidProgress, setFluidProgress] = useState<number>(0);
  const [rhythmHits, setRhythmHits] = useState<number>(0);
  const [laserTargetAlign, setLaserTargetAlign] = useState<number>(0);

  // Laser target motion
  useEffect(() => {
    if (stage !== 'inscription' || subPhase !== 4) return;
    const interval = setInterval(() => {
      setLaserTargetAlign((prev) => (prev + 5) % 100);
    }, 45);
    return () => clearInterval(interval);
  }, [stage, subPhase]);

  // --- STAGE 5: Vacuum Chamber ---
  const [vacuumPressure, setVacuumPressure] = useState<number>(-5.0); // Target: -28.5 to -29.5 inHg
  const [vacuumLockDuration, setVacuumLockDuration] = useState<number>(0);
  const isVacuumOptimal = vacuumPressure <= -28.2 && vacuumPressure >= -29.8;

  useEffect(() => {
    if (stage !== 'vacuum') return;
    const interval = setInterval(() => {
      if (isVacuumOptimal) {
        setVacuumLockDuration((prev) => {
          if (prev >= 100) {
            sounds.playVacuumSeal();
            calculateFinalGrade();
            setStage('completed');
            return 100;
          }
          return prev + 15;
        });
      } else {
        setVacuumLockDuration(0);
        // Pressure slowly leaks back up towards 0 if not pumped
        setVacuumPressure((prev) => Math.min(0, prev + 0.25));
      }
    }, 200);
    return () => clearInterval(interval);
  }, [stage, isVacuumOptimal, vacuumPressure]);

  // --- STAGE 6: Emergency Overheat Protocol ---
  const [emergencyActive, setEmergencyActive] = useState<boolean>(false);
  const [emergencyCode, setEmergencyCode] = useState<string>('7419');
  const [enteredCode, setEnteredCode] = useState<string>('');
  const [emergencyTimeLeft, setEmergencyTimeLeft] = useState<number>(3.5);

  const triggerEmergencyEvent = () => {
    const code = `${Math.floor(1000 + Math.random() * 9000)}`;
    setEmergencyCode(code);
    setEnteredCode('');
    setEmergencyTimeLeft(3.5);
    setEmergencyActive(true);
    sounds.playAlarmBeep();
  };

  useEffect(() => {
    if (!emergencyActive) return;
    const timer = setInterval(() => {
      setEmergencyTimeLeft((prev) => {
        if (prev <= 0.1) {
          // Emergency failed: Penalty
          setEmergencyActive(false);
          setPurity((p) => Math.max(60, p - 18));
          setStability((s) => Math.max(50, s - 25));
          sounds.playAlarmBeep();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [emergencyActive]);

  const handleKeypadPress = (digit: string) => {
    sounds.playClick();
    const next = enteredCode + digit;
    setEnteredCode(next);
    if (next.length === emergencyCode.length) {
      if (next === emergencyCode) {
        sounds.playOverrideSuccess();
        setEmergencyActive(false);
        setStability((s) => Math.min(100, s + 10));
        setInstabilityRisk(0);
      } else {
        setEnteredCode('');
        sounds.playAlarmBeep();
      }
    }
  };

  const calculateFinalGrade = () => {
    let grade: 'C' | 'B' | 'A' | 'S' | 'S+' = 'A';
    if (purity >= 98 && stability >= 96) grade = 'S+';
    else if (purity >= 94 && stability >= 90) grade = 'S';
    else if (purity >= 85) grade = 'A';
    else if (purity >= 75) grade = 'B';
    else grade = 'C';

    const mult = grade === 'S+' ? 1.6 : grade === 'S' ? 1.35 : grade === 'A' ? 1.1 : 0.85;
    const val = Math.round(12500 * mult);
    setBatchGrade(grade);
    setCalculatedValue(val);
    sounds.playTriumphFanfare();
  };

  const handleProcureIntercept = () => {
    // Intercept discount & 100% purity
    const inSweetSpot = signalPosition >= 38 && signalPosition <= 68;
    const unbought = materials.find((m) => !m.purchased);
    if (!unbought) return;

    const cost = inSweetSpot ? unbought.discountedPrice : unbought.basePrice;
    if (gameState.cash < cost) {
      sounds.playAlarmBeep();
      setInterceptSuccessMsg(
        language === 'ru'
          ? `Недостаточно наличных ($${gameState.cash}). Заработайте средства продажей продукции!`
          : `Not enough cash ($${gameState.cash}). Earn funds by selling products on the market!`
      );
      setTimeout(() => setInterceptSuccessMsg(null), 3000);
      return;
    }

    onDeductCash(cost);
    sounds.playCash();

    setMaterials((prev) =>
      prev.map((m) => (m.id === unbought.id ? { ...m, purchased: true } : m))
    );

    if (inSweetSpot) {
      setPurity((p) => Math.min(100, p + 2.5));
      setInterceptSuccessMsg(
        language === 'ru' ? `Сигнал перехвачен! Скидка 40% и S-грейд на ${unbought.nameRu}` : `Signal Intercepted! 40% off S-grade on ${unbought.nameEn}`
      );
    } else {
      setInterceptSuccessMsg(
        language === 'ru' ? `Стандартная закупка ${unbought.nameRu}` : `Standard procurement ${unbought.nameEn}`
      );
    }
    setTimeout(() => setInterceptSuccessMsg(null), 2500);
  };

  const handleAutoAssemble = () => {
    sounds.playResonanceLock();
    setMaterials((prev) => [
      { ...prev[0], slotAssigned: 0 },
      { ...prev[1], slotAssigned: 1 },
      { ...prev[2], slotAssigned: 2 },
      { ...prev[3], slotAssigned: 3 },
      { ...prev[4], slotAssigned: 4 },
    ]);
  };

  const handleQuickHarmonicLock = () => {
    sounds.playResonanceLock();
    setFrequency(75);
    setResonance(3.8);
    setPhaseInverted(false);
  };

  const allMaterialsPurchased = materials.every((m) => m.purchased);

  // Assembly Slot Placement
  const handleAssignSlot = (materialId: string, slotIndex: number) => {
    sounds.playClick();
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === materialId) {
          return { ...m, slotAssigned: slotIndex };
        }
        if (m.slotAssigned === slotIndex) {
          return { ...m, slotAssigned: null }; // Swap out
        }
        return m;
      })
    );
  };

  // Check if assembly matrix is 100% correctly matched
  const isAssemblyComplete = slotsConfig.every((slot) => {
    const mat = materials.find((m) => m.slotAssigned === slot.index);
    return mat && mat.connectorType === slot.requiredType;
  });

  return (
    <div className="space-y-4">
      {/* Compact Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{language === 'ru' ? 'Нейро-Синтез: Кибернетический цех' : 'Neuro-Synthesis: Cybernetic Hub'}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Grade {batchGrade} · {purity.toFixed(1)}%
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'ru' ? '7 фаз абстрактного производства: маркетплейс, матрица полярностей, резонанс и упаковка' : '7 interactive production mini-games'}
            </p>
          </div>
        </div>

        {/* Global Stats Strip */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
            Чистота: <strong className="text-cyan-400">{purity.toFixed(1)}%</strong>
          </div>
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
            Стабильность: <strong className="text-emerald-400">{stability.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* Unified Production Stepper for Neuro-Synthesis */}
      <ProductionStepper
        domain="lsd"
        currentStepId={
          stage === 'procurement'
            ? 'precursor_extraction'
            : stage === 'assembly' || stage === 'reactor'
            ? 'reaction'
            : stage === 'inscription'
            ? 'purification'
            : stage === 'vacuum'
            ? 'dosing'
            : 'completed'
        }
        progressPercent={
          stage === 'procurement'
            ? (materials.filter((m) => m.purchased).length / materials.length) * 100
            : stage === 'assembly'
            ? isAssemblyComplete ? 100 : 50
            : stage === 'reactor'
            ? reactorCharge
            : stage === 'inscription'
            ? (subPhase / 4) * 100
            : stage === 'vacuum'
            ? vacuumLockDuration
            : 100
        }
      />

      {/* Emergency QTE Overlay Modal */}
      {emergencyActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg">
          <div className="bg-[#18080c] border-2 border-rose-500 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.4)] text-center animate-pulse">
            <div className="flex items-center justify-center gap-2 text-rose-400">
              <ShieldAlert className="w-6 h-6 animate-bounce" />
              <h3 className="text-lg font-black tracking-wider uppercase">КРИТИЧЕСКИЙ СКАЧОК 480V!</h3>
            </div>
            <p className="text-xs text-rose-200">
              Введите 4-значный код аварийного шунтирования за {emergencyTimeLeft.toFixed(1)} сек:
            </p>

            {/* Target Code Display */}
            <div className="py-2.5 px-4 bg-black/80 rounded-xl border border-rose-500/50 text-2xl font-mono font-bold tracking-widest text-amber-300">
              {emergencyCode}
            </div>

            {/* Entered Digits */}
            <div className="text-xs font-mono text-slate-300">
              Введено: <strong className="text-white text-lg tracking-widest">{enteredCode || '____'}</strong>
            </div>

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 text-sm font-bold font-mono">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '#'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => {
                    if (btn === 'C') setEnteredCode('');
                    else if (btn !== '#') handleKeypadPress(btn);
                  }}
                  className="p-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-100 rounded-xl active:scale-95 cursor-pointer shadow-md"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 1: Shadow Broker Procurement --- */}
      {stage === 'procurement' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>1. Теневой Маркетплейс: Перехват зашифрованных сигналов</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Куплено: <strong className="text-white">{materials.filter((m) => m.purchased).length}/5</strong>
            </span>
          </div>

          {/* Oscillating Signal Intercept Radar Bar */}
          <div className="p-4 rounded-xl bg-[#070a0f] border border-white/10 space-y-2 relative overflow-hidden">
            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>Частота перехвата брокера:</span>
              <span className="text-emerald-400 font-bold">ЗЕЛЕНАЯ ЗОНА: 40% СКИДКА + S-ГРЕЙД</span>
            </div>

            <div className="h-9 bg-neutral-900 rounded-xl relative overflow-hidden border border-white/15">
              {/* Sweet Spot Resonance Zone (40% - 65%) */}
              <div className="absolute left-[40%] width-[25%] w-1/4 inset-y-0 bg-emerald-500/30 border-x border-emerald-400/60" />
              {/* Moving Signal Cursor */}
              <div
                className="absolute top-0 bottom-0 w-3 bg-cyan-400 rounded-full shadow-[0_0_12px_#22d3ee] transition-all duration-75"
                style={{ left: `${signalPosition}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleProcureIntercept}
                  disabled={allMaterialsPurchased}
                  className={`py-2 px-5 rounded-xl font-bold font-mono text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 ${
                    allMaterialsPurchased
                      ? 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  }`}
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Захватить партию компонента (Тайминг-клик)</span>
                </button>
              </div>

              {interceptSuccessMsg && (
                <span className="text-xs font-mono text-emerald-300 font-semibold animate-pulse">
                  {interceptSuccessMsg}
                </span>
              )}
            </div>
          </div>

          {/* Materials Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className={`p-3 rounded-xl border text-xs font-mono flex flex-col justify-between space-y-2 ${
                  mat.purchased
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#0e131b] border-white/10 text-slate-400'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-xs">{mat.nameRu}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Тип: [{mat.connectorType}]</div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-[10px] font-bold">${mat.discountedPrice}</span>
                  {mat.purchased ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Куплено
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">Ожидание</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Next Stage Button */}
          {allMaterialsPurchased && (
            <button
              onClick={() => {
                sounds.playResonanceLock();
                setStage('assembly');
              }}
              className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 animate-bounce"
            >
              <span>Все материалы на складе ➔ Перейти к Сборочному столу</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* --- STAGE 2: Circuit Polarity & Connector Matrix --- */}
      {stage === 'assembly' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold font-mono">
              <Cpu className="w-4 h-4" />
              <span>2. Сборочный стол: Сопоставление полярностей и коннекторов</span>
            </div>
            <span className={`text-xs font-mono font-bold ${isAssemblyComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isAssemblyComplete ? 'Цепь замкнута (100% проводимость)' : 'Требуется сопоставить полярности'}
            </span>
          </div>

          {/* 5 Sockets Motherboard Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {slotsConfig.map((slot) => {
              const assignedMat = materials.find((m) => m.slotAssigned === slot.index);
              const isCorrect = assignedMat && assignedMat.connectorType === slot.requiredType;

              return (
                <div
                  key={slot.index}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition-all ${
                    isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : assignedMat
                      ? 'bg-rose-950/20 border-rose-500/60'
                      : 'bg-[#090d14] border-dashed border-white/20'
                  }`}
                >
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">{slot.labelRu}</span>
                    <div className="text-lg font-mono font-black text-purple-300">[{slot.requiredType}]</div>
                  </div>

                  {assignedMat ? (
                    <div className="p-2 rounded-xl bg-black/60 border border-white/10 text-center">
                      <div className="text-xs font-bold text-white">{assignedMat.nameRu}</div>
                      <button
                        onClick={() => handleAssignSlot(assignedMat.id, -1)}
                        className="text-[9px] text-rose-400 hover:text-rose-300 font-mono mt-1 cursor-pointer"
                      >
                        Снять компонент
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-[10px] text-slate-600 font-mono">Слот свободен</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unassigned Components Tray */}
          <div className="p-3 bg-[#070a0f] rounded-xl border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">Выберите компонент и поместите в слот:</span>
              <button
                onClick={handleAutoAssemble}
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold cursor-pointer"
              >
                ★ Авто-сборка цепи (100%)
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className={`p-2 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                    mat.slotAssigned !== null
                      ? 'bg-white/5 border-white/5 text-slate-600'
                      : 'bg-[#121926] border-purple-500/40 text-purple-200'
                  }`}
                >
                  <span className="font-bold">[{mat.connectorType}] {mat.nameRu}</span>
                  {mat.slotAssigned === null && (
                    <div className="flex gap-1">
                      {slotsConfig.map((s) => (
                        <button
                          key={s.index}
                          onClick={() => handleAssignSlot(mat.id, s.index)}
                          className="px-1.5 py-0.5 bg-purple-500/20 hover:bg-purple-500/40 text-[10px] text-purple-300 rounded cursor-pointer"
                        >
                          Слот {s.index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Advance to Reactor */}
          {isAssemblyComplete && (
            <button
              onClick={() => {
                sounds.playResonanceLock();
                setStage('reactor');
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 animate-bounce"
            >
              <span>Схема сбалансирована ➔ Запуск Нейро-Реактора</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* --- STAGE 3: Neuro-Reactor Oscilloscope --- */}
      {stage === 'reactor' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
              <Activity className="w-4 h-4" />
              <span>3. Нейро-Реактор: Совмещение синусоид и резонансный захват</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickHarmonicLock}
                className="text-[10px] font-mono text-emerald-300 hover:text-white border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 rounded-lg cursor-pointer font-bold"
              >
                ★ Авто-захват 75 Гц
              </button>
              <button
                onClick={triggerEmergencyEvent}
                className="text-[10px] font-mono text-rose-400 hover:text-rose-300 border border-rose-500/30 px-2 py-1 rounded-lg cursor-pointer"
              >
                Тест аварии (QTE)
              </button>
            </div>
          </div>

          {/* Oscilloscope Screen */}
          <div className="relative aspect-[21/9] w-full bg-[#03060a] rounded-xl overflow-hidden border border-white/10 flex items-center justify-center">
            <canvas ref={canvasRef} width={640} height={240} className="w-full h-full" />

            <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
              Целевая волна: <span className="text-emerald-400 font-bold">75 Гц / Q-3.8</span>
            </div>

            <div className="absolute top-2 right-3 text-[10px] font-mono">
              {isHarmonicLocked ? (
                <span className="text-emerald-400 font-bold animate-pulse">РЕЗОНАНСНЫЙ ЗАХВАТ АКТИВЕН</span>
              ) : (
                <span className="text-amber-400">СМЕЩЕНИЕ СИНУСОИД</span>
              )}
            </div>

            {/* Reactor Charge Bar */}
            <div className="absolute bottom-2 inset-x-4">
              <div className="flex justify-between text-[10px] font-mono text-slate-300 mb-1">
                <span>Заряд синтеза:</span>
                <strong className="text-cyan-400">{Math.round(reactorCharge)}%</strong>
              </div>
              <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all"
                  style={{ width: `${reactorCharge}%` }}
                />
              </div>
            </div>
          </div>

          {/* Oscilloscope Control Knobs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#090d14] rounded-xl border border-white/10 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Частота:</span>
                <strong className="text-cyan-400">{frequency} Гц</strong>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-[#090d14] rounded-xl border border-white/10 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Резонанс (Q):</span>
                <strong className="text-purple-400">{resonance.toFixed(1)}</strong>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.1"
                value={resonance}
                onChange={(e) => setResonance(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            <div className="p-3 bg-[#090d14] rounded-xl border border-white/10 flex flex-col justify-between">
              <div className="flex justify-between text-slate-400">
                <span>Фазовый сдвиг:</span>
                <strong className={phaseInverted ? 'text-rose-400' : 'text-emerald-400'}>
                  {phaseInverted ? '180° (Инверсия)' : '0° (Синфазно)'}
                </strong>
              </div>
              <button
                onClick={() => setPhaseInverted(!phaseInverted)}
                className="w-full py-1 bg-white/5 hover:bg-white/10 text-slate-200 rounded border border-white/10 text-[10px] cursor-pointer"
              >
                Переключить фазу (180°)
              </button>
            </div>
          </div>

          {/* Advance to Inscription */}
          {reactorCharge >= 100 && (
            <button
              onClick={() => {
                sounds.playResonanceLock();
                setStage('inscription');
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 animate-bounce"
            >
              <span>Синтез субстанции завершен (Чистота {purity.toFixed(1)}%) ➔ Нанесение на марки</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* --- STAGE 4: 4-Subphase Inscription --- */}
      {stage === 'inscription' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-pink-400 text-sm font-bold font-mono">
              <Sparkles className="w-4 h-4" />
              <span>4. Нанесение на марки: 4-фазная лазерная обработка (Фаза {subPhase}/4)</span>
            </div>
          </div>

          {/* Sub-phase 1: Thermal Warmup */}
          {subPhase === 1 && (
            <div className="p-6 bg-[#070a0f] rounded-xl border border-white/10 text-center space-y-4">
              <div className="text-xs font-mono text-slate-300">
                Фаза 4.1: Удерживайте или нажимайте кнопку, чтобы разогреть матрицу до 78.5°C:
              </div>
              <div className="w-24 h-24 mx-auto rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-xl font-mono font-bold text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                {Math.round(warmupProgress)}%
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setWarmupProgress((prev) => {
                    const next = Math.min(100, prev + 25);
                    if (next >= 100) {
                      sounds.playResonanceLock();
                      setSubPhase(2);
                    }
                    return next;
                  });
                }}
                className="py-2.5 px-6 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md active:scale-95"
              >
                Прогрев матрицы (+25% / Клик)
              </button>
            </div>
          )}

          {/* Sub-phase 2: Fluid Infusion */}
          {subPhase === 2 && (
            <div className="p-6 bg-[#070a0f] rounded-xl border border-white/10 text-center space-y-4">
              <div className="text-xs font-mono text-slate-300">
                Фаза 4.2: Плавная заливка эфирной субстанции по лазерной траектории:
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fluidProgress}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFluidProgress(val);
                  if (val >= 100) {
                    sounds.playResonanceLock();
                    setSubPhase(3);
                  }
                }}
                className="w-full max-w-md accent-pink-400 cursor-pointer h-3"
              />
              <div className="text-xs font-mono text-pink-400 font-bold">
                Пропитка листа: {fluidProgress}% (Сдвиньте вправо до 100%)
              </div>
            </div>
          )}

          {/* Sub-phase 3: UV Resonance Pulsing */}
          {subPhase === 3 && (
            <div className="p-6 bg-[#070a0f] rounded-xl border border-white/10 text-center space-y-4">
              <div className="text-xs font-mono text-slate-300">
                Фаза 4.3: Ритмичная УФ-фиксация (Сделайте 3 точных клика в ритм):
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm ${
                      rhythmHits >= step
                        ? 'bg-purple-500 text-slate-950 shadow-[0_0_15px_#a855f7]'
                        : 'bg-white/5 border border-white/10 text-slate-500'
                    }`}
                  >
                    {rhythmHits >= step ? '✓' : step}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  const next = rhythmHits + 1;
                  setRhythmHits(next);
                  if (next >= 3) {
                    sounds.playResonanceLock();
                    setSubPhase(4);
                  }
                }}
                className="py-2.5 px-6 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md active:scale-95"
              >
                Импульс УФ-фиксации (Клик)
              </button>
            </div>
          )}

          {/* Sub-phase 4: Laser Perforation */}
          {subPhase === 4 && (
            <div className="p-6 bg-[#070a0f] rounded-xl border border-white/10 text-center space-y-4">
              <div className="text-xs font-mono text-slate-300">
                Фаза 4.4: Лазерная перфорация сетки (Кликните в момент совпадения прицела 45-55%):
              </div>
              <div className="h-8 bg-neutral-900 rounded-xl relative overflow-hidden border border-white/15 max-w-md mx-auto">
                <div className="absolute left-[45%] w-[10%] inset-y-0 bg-emerald-500/40 border-x border-emerald-400" />
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6]"
                  style={{ left: `${laserTargetAlign}%` }}
                />
              </div>
              <button
                onClick={() => {
                  sounds.playLaserZap();
                  const inTarget = laserTargetAlign >= 45 && laserTargetAlign <= 55;
                  if (inTarget) {
                    setPurity((p) => Math.min(100, p + 2));
                    setStability((s) => Math.min(100, s + 3));
                  }
                  setStage('vacuum');
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-slate-950 font-bold text-xs cursor-pointer shadow-md active:scale-95"
              >
                Лазерный прожиг перфорации
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- STAGE 5: Cryo-Vacuum Stabilization --- */}
      {stage === 'vacuum' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
              <Wind className="w-4 h-4" />
              <span>5. Вакуумирование и Стабилизация: Удерживайте давление (-28.5 до -29.8 inHg)</span>
            </div>
          </div>

          <div className="p-6 bg-[#070a0f] rounded-xl border border-white/10 text-center space-y-4">
            <div className="text-3xl font-mono font-bold text-cyan-400">
              {vacuumPressure.toFixed(1)} inHg
            </div>

            <div className="text-xs font-mono text-slate-400">
              Целевая зона стабилизации: <strong className="text-emerald-400">-28.5 ... -29.8 inHg</strong>
            </div>

            <div className="w-full max-w-md mx-auto bg-neutral-900 h-3 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-cyan-400 transition-all"
                style={{ width: `${vacuumLockDuration}%` }}
              />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Фиксация вакуумного шва: {vacuumLockDuration}%
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setVacuumPressure((prev) => Math.max(-32, prev - 4.0));
                }}
                className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md active:scale-95"
              >
                Откачка воздуха (-4.0 inHg / Клик)
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setVacuumPressure(-29.0);
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs cursor-pointer"
              >
                ★ Целевой вакуум (-29.0 inHg)
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setVacuumPressure((prev) => Math.min(0, prev + 4.0));
                }}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs cursor-pointer border border-white/10"
              >
                Сброс клапана (Bleed)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- STAGE 7: Completed Batch Triumph --- */}
      {stage === 'completed' && (
        <div className="bg-gradient-to-b from-[#130d24] to-[#0b0e14] border-2 border-purple-500/50 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/50 mx-auto flex items-center justify-center text-purple-300 shadow-[0_0_30px_rgba(168,85,247,0.5)] animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-widest font-bold">
              [СИНТЕЗ ЗАВЕРШЕН С УСПЕХОМ]
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Нейро-Блоттеры «Фрактал» (1000 шт.)
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Успешно пройден полный 7-фазный цикл кибернетического синтеза. Товар стабилизирован и готов к распределению.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-xs font-mono">
            <div className="p-3 bg-black/50 rounded-xl border border-purple-500/30">
              <span className="text-slate-400 text-[10px]">Грейд качества:</span>
              <div className="text-lg font-bold text-purple-400 font-mono">Grade {batchGrade}</div>
            </div>
            <div className="p-3 bg-black/50 rounded-xl border border-cyan-500/30">
              <span className="text-slate-400 text-[10px]">Чистота:</span>
              <div className="text-lg font-bold text-cyan-400 font-mono">{purity.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-black/50 rounded-xl border border-emerald-500/30">
              <span className="text-slate-400 text-[10px]">Стабильность:</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">{stability.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-black/50 rounded-xl border border-amber-500/30">
              <span className="text-slate-400 text-[10px]">Рыночная стоимость:</span>
              <div className="text-lg font-bold text-amber-400 font-mono">${calculatedValue.toLocaleString()}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                sounds.playCash();
                onFinishBatch(1, purity, calculatedValue);
                // Reset for next run
                setStage('procurement');
                setMaterials((prev) => prev.map((m) => ({ ...m, purchased: false, slotAssigned: null })));
                setReactorCharge(0);
                setSubPhase(1);
                setWarmupProgress(0);
                setFluidProgress(0);
                setRhythmHits(0);
                setVacuumPressure(-5.0);
                setVacuumLockDuration(0);
              }}
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs shadow-xl cursor-pointer active:scale-95"
            >
              Отправить партию на склад (+1 лист Neuro-Fractal)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
