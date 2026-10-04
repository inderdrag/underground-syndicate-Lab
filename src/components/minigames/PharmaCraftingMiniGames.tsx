import React, { useState, useEffect, useRef } from 'react';
import { PharmaDrugRecipe } from '../../data/pharma_recipes_config';
import {
  FlaskConical,
  Flame,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Sparkles,
  Droplets,
  Disc,
  Layers,
  Box,
  Sliders,
  Play,
  X,
  ShieldCheck,
  Zap,
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
  onCancel,
}) => {
  const batchNumRef = useRef<string>(`BATCH-#${Math.floor(100000 + Math.random() * 900000)}`);

  // Active step: 1: Reactor Temp & Stirring, 2: Titration & Metering, 3: Tablet Press & Packaging, 4: Result summary
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const activeStepRef = useRef<1 | 2 | 3 | 4>(1);
  activeStepRef.current = activeStep;

  // --- STEP 1: REACTOR (Temperature & Centrifuge Stirring) ---
  const targetTemp = recipe.rarity === 'legendary' ? 82 : recipe.rarity === 'epic' ? 74 : 68;
  const tempTolerance = recipe.rarity === 'legendary' ? 4 : recipe.rarity === 'epic' ? 6 : 8;
  
  const targetRpm = 850;
  const rpmTolerance = 140; // corridor 710 - 990 RPM

  const [currentTemp, setCurrentTemp] = useState<number>(targetTemp - 18);
  const [stirrerRpm, setStirrerRpm] = useState<number>(320);
  const [step1Progress, setStep1Progress] = useState<number>(0); // 0 - 100%
  
  const [isHeating, setIsHeating] = useState<boolean>(false);
  const [isCooling, setIsCooling] = useState<boolean>(false);
  const [isMixing, setIsMixing] = useState<boolean>(false);

  const isHeatingRef = useRef<boolean>(false);
  const isCoolingRef = useRef<boolean>(false);
  const isMixingRef = useRef<boolean>(false);

  const currentTempRef = useRef<number>(targetTemp - 18);
  const stirrerRpmRef = useRef<number>(320);
  const step1ProgressRef = useRef<number>(0);

  // Synchronize state and refs
  useEffect(() => {
    isHeatingRef.current = isHeating;
  }, [isHeating]);

  useEffect(() => {
    isCoolingRef.current = isCooling;
  }, [isCooling]);

  useEffect(() => {
    isMixingRef.current = isMixing;
  }, [isMixing]);

  // Step 1 physics ticker: runs continuously without restarting on state change
  useEffect(() => {
    if (activeStep !== 1) return;

    const interval = setInterval(() => {
      if (activeStepRef.current !== 1) return;

      // 1. Temperature physics
      let tempChange = -0.25; // ambient cooling loss towards 22°C
      if (isHeatingRef.current) tempChange += 1.6;
      if (isCoolingRef.current) tempChange -= 2.0;

      const nextTemp = Math.max(20, Math.min(130, Math.round((currentTempRef.current + tempChange) * 10) / 10));
      currentTempRef.current = nextTemp;
      setCurrentTemp(nextTemp);

      // 2. Mixer RPM physics (natural decay vs active drive)
      let rpmChange = -18; // viscous friction decay
      if (isMixingRef.current) {
        rpmChange += 65; // active spin acceleration
      }
      const nextRpm = Math.max(80, Math.min(1250, stirrerRpmRef.current + rpmChange));
      stirrerRpmRef.current = nextRpm;
      setStirrerRpm(nextRpm);

      // 3. Check corridor resonance
      const tempDiff = Math.abs(nextTemp - targetTemp);
      const isTempGreen = tempDiff <= tempTolerance;
      const rpmDiff = Math.abs(nextRpm - targetRpm);
      const isRpmGreen = rpmDiff <= rpmTolerance;

      if (isTempGreen && isRpmGreen) {
        const nextProgress = Math.min(100, step1ProgressRef.current + 2.8);
        step1ProgressRef.current = nextProgress;
        setStep1Progress(nextProgress);

        if (nextProgress >= 100) {
          sounds.playOverrideSuccess();
          setActiveStep(2);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [activeStep, targetTemp, tempTolerance, targetRpm, rpmTolerance]);

  // --- STEP 2: TITRATION & DOSING (Stoichiometric Reagent Addition) ---
  const [titrationLevel, setTitrationLevel] = useState<number>(0); // 0 to 100
  const [dropsPoured, setDropsPoured] = useState<number>(0);
  const [isTitrating, setIsTitrating] = useState<boolean>(false);
  const isTitratingRef = useRef<boolean>(false);
  const [titrationQuality, setTitrationQuality] = useState<number>(100);

  useEffect(() => {
    isTitratingRef.current = isTitrating;
  }, [isTitrating]);

  useEffect(() => {
    if (activeStep !== 2) return;

    const interval = setInterval(() => {
      if (activeStepRef.current !== 2 || !isTitratingRef.current) return;

      setTitrationLevel((prev) => {
        const next = prev + 2.8;
        if (next > 104) {
          // over-titration penalty
          setTitrationQuality((q) => Math.max(40, q - 1.5));
        }
        return Math.min(115, Math.round(next * 10) / 10);
      });
      setDropsPoured((d) => d + 1);
    }, 80);

    return () => clearInterval(interval);
  }, [activeStep]);

  const handleFinishTitration = () => {
    sounds.playClick();
    if (titrationLevel < 80) {
      // Under-titrated
      setTitrationQuality(60);
    } else if (titrationLevel >= 90 && titrationLevel <= 104) {
      // Perfect stoichiometric resonance
      setTitrationQuality(100);
      sounds.playOverrideSuccess();
    } else {
      setTitrationQuality(75);
    }
    setActiveStep(3);
  };

  // --- STEP 3: HYDRAULIC TABLET PRESS & BLISTER PACKING ---
  const [pistonPosition, setPistonPosition] = useState<number>(0);
  const [pillsPressed, setPillsPressed] = useState<number>(0);
  const [pressScores, setPressScores] = useState<number[]>([]);
  const requiredPills = 3;

  // Piston oscillation
  useEffect(() => {
    if (activeStep !== 3 || pillsPressed >= requiredPills) return;

    const interval = setInterval(() => {
      setPistonPosition((prev) => (prev + 6) % 100);
    }, 45);

    return () => clearInterval(interval);
  }, [activeStep, pillsPressed]);

  const handlePunchPill = () => {
    sounds.playClick();
    // Sweet spot is 42% - 62%
    const dist = Math.abs(pistonPosition - 52);
    let pillScore = 100 - dist * 3.5;
    if (pillScore < 30) pillScore = 30;

    const nextPills = pillsPressed + 1;
    setPillsPressed(nextPills);
    setPressScores((prev) => [...prev, pillScore]);

    if (nextPills >= requiredPills) {
      sounds.playResonanceLock();
      setActiveStep(4);
    }
  };

  // --- STEP 4: FINAL BATCH CALCULATION ---
  const calculateFinalOutcome = (): PharmaCraftBatchOutcome => {
    const avgPress = pressScores.length > 0 ? pressScores.reduce((a, b) => a + b, 0) / pressScores.length : 85;
    const finalQuality = Math.round(titrationQuality * 0.45 + avgPress * 0.55);
    const isDefective = finalQuality < 45;
    const units = recipe.rarity === 'legendary' ? 2 : recipe.rarity === 'epic' ? 5 : 10;

    return {
      batchNumber: batchNumRef.current,
      qualityScore: Math.min(100, Math.max(30, finalQuality)),
      isDefective,
      defectReason: isDefective ? 'Нарушение температурного и прессовочного профиля' : undefined,
      producedUnits: units,
      finalValueMultiplier: isDefective ? 0.4 : 0.9 + (finalQuality / 100) * 0.4,
    };
  };

  const outcome = calculateFinalOutcome();

  const isTempGreen = Math.abs(currentTemp - targetTemp) <= tempTolerance;
  const isRpmGreen = Math.abs(stirrerRpm - targetRpm) <= rpmTolerance;
  const isCorridorActive = isTempGreen && isRpmGreen;

  return (
    <div className="bg-[#0b1018] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl text-slate-100 font-sans max-w-xl w-full">
      {/* Top Header */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">{recipe.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {recipe.brand}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {batchNumRef.current} • {recipe.shelfNumber}
            </div>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3-Step Stepper Header */}
      <div className="grid grid-cols-3 bg-slate-950/80 border-b border-white/10 text-xs font-mono">
        <div
          className={`py-2.5 px-3 text-center border-r border-white/5 flex items-center justify-center gap-1.5 ${
            activeStep === 1
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border-b-2 border-emerald-400'
              : activeStep > 1
              ? 'text-emerald-400/70'
              : 'text-slate-500'
          }`}
        >
          <span>1. Реактор</span>
          {activeStep > 1 && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
        <div
          className={`py-2.5 px-3 text-center border-r border-white/5 flex items-center justify-center gap-1.5 ${
            activeStep === 2
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border-b-2 border-emerald-400'
              : activeStep > 2
              ? 'text-emerald-400/70'
              : 'text-slate-500'
          }`}
        >
          <span>2. Титрование</span>
          {activeStep > 2 && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
        <div
          className={`py-2.5 px-3 text-center flex items-center justify-center gap-1.5 ${
            activeStep === 3 || activeStep === 4
              ? 'bg-emerald-500/20 text-emerald-300 font-bold border-b-2 border-emerald-400'
              : 'text-slate-500'
          }`}
        >
          <span>3. Пресс-матрица</span>
          {activeStep === 4 && <CheckCircle2 className="w-3.5 h-3.5" />}
        </div>
      </div>

      {/* Main Interactive Stage Body */}
      <div className="p-5 space-y-5">
        {/* ================= STEP 1: REACTOR ================= */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Этап 1: Нагрев и Перемешивание в Реакторе</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Удерживайте температуру <strong className="text-amber-300">{targetTemp}°C (±{tempTolerance}°C)</strong> и обороты миксера <strong className="text-cyan-300">{targetRpm} RPM (±{rpmTolerance})</strong>.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400">Синтез:</span>
                <div className={`text-base font-bold ${isCorridorActive ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`}>
                  {Math.round(step1Progress)}%
                </div>
              </div>
            </div>

            {/* Status indicator bar */}
            <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
              isCorridorActive
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isCorridorActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <span>{isCorridorActive ? '⚡ ИДЕАЛЬНЫЙ РЕЖИМ — ИДЕТ РЕАКЦИЯ СИНТЕЗА' : '⚠️ Балансируйте нагрев и обороты миксера'}</span>
              </div>
              <span className="font-bold">{isCorridorActive ? '+28%/с' : 'Пауза'}</span>
            </div>

            {/* Reaction Progress Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/10 relative">
              <div
                className={`h-full transition-all duration-100 ${
                  isCorridorActive
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-700'
                }`}
                style={{ width: `${step1Progress}%` }}
              />
            </div>

            {/* Thermometer & Stirrer Gauges */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              {/* Temperature Gauge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Flame className={`w-3.5 h-3.5 ${isHeating ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} /> Температура:
                  </span>
                  <span
                    className={`font-bold ${
                      isTempGreen ? 'text-emerald-400' : currentTemp < targetTemp ? 'text-amber-400' : 'text-rose-400'
                    }`}
                  >
                    {currentTemp}°C
                  </span>
                </div>

                {/* Horizontal Thermometer Bar with Target Corridor */}
                <div className="relative h-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  {/* Green target zone */}
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-500/40 border-x-2 border-emerald-400"
                    style={{
                      left: `${Math.max(0, ((targetTemp - tempTolerance - 20) / 110) * 100)}%`,
                      width: `${((tempTolerance * 2) / 110) * 100}%`,
                    }}
                  />
                  {/* Current temp needle */}
                  <div
                    className={`absolute top-0 bottom-0 w-2.5 rounded-sm shadow-md transition-all duration-75 ${
                      isTempGreen ? 'bg-emerald-400' : currentTemp < targetTemp ? 'bg-amber-400' : 'bg-rose-500'
                    }`}
                    style={{ left: `${Math.max(0, Math.min(97, ((currentTemp - 20) / 110) * 100))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>20°C</span>
                  <span className={isTempGreen ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    Цель: {targetTemp}°C
                  </span>
                  <span>130°C</span>
                </div>
                <div className="text-[10px] font-mono text-center">
                  {isTempGreen ? (
                    <span className="text-emerald-400 font-bold">✓ Температура в норме</span>
                  ) : currentTemp < targetTemp ? (
                    <span className="text-amber-300">⚠️ Удерживайте «ПОДОГРЕВ»</span>
                  ) : (
                    <span className="text-rose-400">🔥 Перегрев! Нажмите охлаждение</span>
                  )}
                </div>
              </div>

              {/* Centrifuge Stirrer RPM Gauge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="flex items-center gap-1 text-slate-300">
                    <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isMixing ? 'animate-spin' : ''}`} /> Миксер RPM:
                  </span>
                  <span className={`font-bold ${isRpmGreen ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                    {stirrerRpm} RPM
                  </span>
                </div>

                <div className="relative h-6 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                  {/* Green target RPM corridor */}
                  <div
                    className="absolute top-0 bottom-0 bg-cyan-500/30 border-x-2 border-cyan-400"
                    style={{
                      left: `${Math.max(0, ((targetRpm - rpmTolerance) / 1250) * 100)}%`,
                      width: `${((rpmTolerance * 2) / 1250) * 100}%`,
                    }}
                  />
                  {/* Active RPM level bar */}
                  <div
                    className={`h-full transition-all duration-75 ${
                      isRpmGreen
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-400'
                        : stirrerRpm > targetRpm + rpmTolerance
                        ? 'bg-rose-500'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${Math.min(100, (stirrerRpm / 1250) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>0 RPM</span>
                  <span className={isRpmGreen ? 'text-cyan-400 font-bold' : 'text-slate-400 font-bold'}>
                    Цель: {targetRpm} RPM
                  </span>
                  <span>1250</span>
                </div>
                <div className="text-[10px] font-mono text-center">
                  {isRpmGreen ? (
                    <span className="text-cyan-400 font-bold">✓ Оптимальный вихрь</span>
                  ) : stirrerRpm < targetRpm - rpmTolerance ? (
                    <span className="text-amber-300">⚠️ Удерживайте «МИКСЕР»</span>
                  ) : (
                    <span className="text-rose-400">⚡ Избыточные обороты</span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive Control Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsHeating(true);
                  sounds.playClick();
                }}
                onPointerUp={() => setIsHeating(false)}
                onPointerLeave={() => setIsHeating(false)}
                onPointerCancel={() => setIsHeating(false)}
                onMouseDown={() => setIsHeating(true)}
                onMouseUp={() => setIsHeating(false)}
                onMouseLeave={() => setIsHeating(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsHeating(true);
                  sounds.playClick();
                }}
                onTouchEnd={() => setIsHeating(false)}
                onTouchCancel={() => setIsHeating(false)}
                className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none active:scale-95 ${
                  isHeating
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 scale-95'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-500/30'
                }`}
              >
                <Flame className={`w-4 h-4 ${isHeating ? 'animate-bounce text-slate-950' : 'text-amber-400'}`} />
                <span>ПОДОГРЕВ (Удерживать)</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsCooling(true);
                  sounds.playClick();
                }}
                onPointerUp={() => setIsCooling(false)}
                onPointerLeave={() => setIsCooling(false)}
                onPointerCancel={() => setIsCooling(false)}
                onMouseDown={() => setIsCooling(true)}
                onMouseUp={() => setIsCooling(false)}
                onMouseLeave={() => setIsCooling(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsCooling(true);
                  sounds.playClick();
                }}
                onTouchEnd={() => setIsCooling(false)}
                onTouchCancel={() => setIsCooling(false)}
                className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none active:scale-95 ${
                  isCooling
                    ? 'bg-blue-500 text-slate-950 border-blue-400 shadow-lg shadow-blue-500/40 ring-2 ring-blue-300 scale-95'
                    : 'bg-slate-900 hover:bg-slate-800 text-blue-300 border-blue-500/30'
                }`}
              >
                <Droplets className={`w-4 h-4 ${isCooling ? 'animate-bounce text-slate-950' : 'text-blue-400'}`} />
                <span>ОХЛАЖДЕНИЕ</span>
              </button>

              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsMixing(true);
                  sounds.playClick();
                  // Instant kickstart boost
                  stirrerRpmRef.current = Math.min(1250, stirrerRpmRef.current + 90);
                  setStirrerRpm(stirrerRpmRef.current);
                }}
                onPointerUp={() => setIsMixing(false)}
                onPointerLeave={() => setIsMixing(false)}
                onPointerCancel={() => setIsMixing(false)}
                onMouseDown={() => {
                  setIsMixing(true);
                  sounds.playClick();
                  stirrerRpmRef.current = Math.min(1250, stirrerRpmRef.current + 90);
                  setStirrerRpm(stirrerRpmRef.current);
                }}
                onMouseUp={() => setIsMixing(false)}
                onMouseLeave={() => setIsMixing(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsMixing(true);
                  sounds.playClick();
                  stirrerRpmRef.current = Math.min(1250, stirrerRpmRef.current + 90);
                  setStirrerRpm(stirrerRpmRef.current);
                }}
                onTouchEnd={() => setIsMixing(false)}
                onTouchCancel={() => setIsMixing(false)}
                className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer select-none active:scale-95 ${
                  isMixing
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/40 ring-2 ring-cyan-300 scale-95'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-600/30'
                }`}
              >
                <RotateCw className={`w-4 h-4 ${isMixing ? 'animate-spin text-slate-950' : 'text-white'}`} />
                <span>МИКСЕР (Удерживать)</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TITRATION & DOSING ================= */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Этап 2: Титрование & Дозирование Катализатора</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Удерживайте кнопку «Дозировать Катализатор» до достижения стехиометрической точки{' '}
                  <strong className="text-purple-400">90-104%</strong>.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400">Насыщение:</span>
                <div
                  className={`text-base font-bold ${
                    titrationLevel >= 90 && titrationLevel <= 104 ? 'text-emerald-400' : 'text-purple-400'
                  }`}
                >
                  {titrationLevel}%
                </div>
              </div>
            </div>

            {/* Titration Flask Graphic & Level Bar */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Капель добавлено: {dropsPoured}</span>
                <span
                  className={
                    titrationLevel >= 90 && titrationLevel <= 104
                      ? 'text-emerald-400 font-bold'
                      : titrationLevel > 104
                      ? 'text-rose-400 font-bold'
                      : 'text-amber-400'
                  }
                >
                  {titrationLevel >= 90 && titrationLevel <= 104
                    ? '⭐ Идеальный баланс'
                    : titrationLevel > 104
                    ? '⚠️ Перенасыщение!'
                    : 'Требуется еще катализатор'}
                </span>
              </div>

              <div className="relative h-7 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                {/* Optimal zone 90-104% */}
                <div className="absolute top-0 bottom-0 left-[78%] w-[20%] bg-emerald-500/40 border-x-2 border-emerald-400 z-10" />

                <div
                  className={`h-full transition-all duration-75 ${
                    titrationLevel > 104
                      ? 'bg-rose-500'
                      : titrationLevel >= 90
                      ? 'bg-gradient-to-r from-purple-500 to-emerald-400'
                      : 'bg-purple-600'
                  }`}
                  style={{ width: `${Math.min(100, titrationLevel)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0% (Чистая основа)</span>
                <span className="text-emerald-400 font-bold">Оптимум: 90-104%</span>
                <span>115%</span>
              </div>
            </div>

            {/* Titration Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsTitrating(true);
                  sounds.playClick();
                }}
                onPointerUp={() => setIsTitrating(false)}
                onPointerLeave={() => setIsTitrating(false)}
                onPointerCancel={() => setIsTitrating(false)}
                onMouseDown={() => setIsTitrating(true)}
                onMouseUp={() => setIsTitrating(false)}
                onMouseLeave={() => setIsTitrating(false)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  setIsTitrating(true);
                  sounds.playClick();
                }}
                onTouchEnd={() => setIsTitrating(false)}
                onTouchCancel={() => setIsTitrating(false)}
                className={`py-3.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer select-none active:scale-95 ${
                  isTitrating
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/40 ring-2 ring-purple-300'
                    : 'bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border-purple-500/50'
                }`}
              >
                <Droplets className="w-4 h-4 animate-bounce" />
                <span>УДЕРЖИВАТЬ ДОЗАТОР</span>
              </button>

              <button
                type="button"
                onClick={handleFinishTitration}
                className="py-3.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ЗАФИКСИРОВАТЬ РАСТВОР</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: TABLET PRESS ================= */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white text-sm">Этап 3: Гидравлический Пресс & Клеймение</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Нажимайте «Прессовать», когда пуансон находится в{' '}
                  <strong className="text-cyan-400">зеленой зоне матрицы (42-62%)</strong>.
                </p>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs text-slate-400">Таблеток готово:</span>
                <div className="text-base font-bold text-cyan-400">
                  {pillsPressed} / {requiredPills}
                </div>
              </div>
            </div>

            {/* Punch Matrix Graphic */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 text-center">
              <div className="relative h-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
                {/* Target Sweet Spot */}
                <div className="absolute top-0 bottom-0 left-[42%] w-[20%] bg-emerald-500/40 border-x-2 border-emerald-400 z-10" />

                {/* Oscillating Piston Stamp */}
                <div
                  className="absolute top-0 bottom-0 w-3 bg-cyan-400 rounded-sm shadow-md transition-all duration-75"
                  style={{ left: `${pistonPosition}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                {Array.from({ length: requiredPills }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                      idx < pillsPressed
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                    }`}
                  >
                    {idx < pillsPressed ? '⭐' : `#${idx + 1}`}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePunchPill}
              className="w-full py-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-sm rounded-xl shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Disc className="w-5 h-5 animate-spin" />
              <span>ШТАМПОВАТЬ ТАБЛЕТКУ #{pillsPressed + 1}</span>
            </button>
          </div>
        )}

        {/* ================= STEP 4: BATCH COMPLETION ================= */}
        {activeStep === 4 && (
          <div className="space-y-4 text-center">
            <div className="p-5 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
                  [ ПАРТИЯ УСПЕШНО СИНТЕЗИРОВАНА ]
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{recipe.name}</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Препарат отпрессован в блистеры и готов к передаче на склад аптеки.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Произведено</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                    +{outcome.producedUnits} шт.
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Чистота партии</div>
                  <div className="text-base font-bold text-cyan-300 font-mono mt-0.5">
                    {outcome.qualityScore}%
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-400">Оценка партии</div>
                  <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
                    ${Math.round(recipe.basePrice * outcome.producedUnits * outcome.finalValueMultiplier)}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playCash();
                onCraftCompleted(outcome);
              }}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-base rounded-2xl shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Box className="w-5 h-5" />
              <span>ЗАЧИСЛИТЬ НА СКЛАД АПТЕКИ (+{outcome.producedUnits} ШТ)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
