import React, { useState } from 'react';
import { GameState, StrainId } from '../types/game';
import { STRAIN_DEFINITIONS } from '../engine/simulationEngine';
import { Sprout, Droplets, Sparkles, CheckCircle, ChevronRight, X, Shield, Info, Layers } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

interface InteractivePlanterModalProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
  onPlantConfirmed: (strainId: StrainId, medium: 'soil' | 'hydroponics' | 'coco') => void;
  language: Language;
}

export const InteractivePlanterModal: React.FC<InteractivePlanterModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onPlantConfirmed,
  language,
}) => {
  const [selectedStrainId, setSelectedStrainId] = useState<StrainId>('white_widow');
  const [selectedMedium, setSelectedMedium] = useState<'soil' | 'hydroponics' | 'coco'>('soil');
  const [step, setStep] = useState<number>(1);
  const [isHoleDug, setIsHoleDug] = useState<boolean>(false);
  const [isSeedPlaced, setIsSeedPlaced] = useState<boolean>(false);
  const [isWatered, setIsWatered] = useState<boolean>(false);

  if (!isOpen) return null;

  const t = translations[language];

  // Check seed inventory count
  const getSeedCount = (strainId: StrainId): number => {
    switch (strainId) {
      case 'white_widow':
        return gameState.inventory.seedsWhiteWidow;
      case 'amnesia_haze':
        return gameState.inventory.seedsAmnesiaHaze;
      case 'gorilla_glue':
        return gameState.inventory.seedsGorillaGlue;
      case 'purple_haze':
        return gameState.inventory.seedsPurpleHaze;
      default:
        return 0;
    }
  };

  const currentSeedCount = getSeedCount(selectedStrainId);
  const selectedDef = STRAIN_DEFINITIONS.find((s) => s.id === selectedStrainId)!;

  const handleStartCycle = () => {
    sounds.playPsychedelicChime();
    onPlantConfirmed(selectedStrainId, selectedMedium);
    // Reset state
    setStep(1);
    setIsHoleDug(false);
    setIsSeedPlaced(false);
    setIsWatered(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b1017] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {language === 'ru' ? 'Интерактивная посадка семени' : 'Interactive Seed Planting'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ru' ? 'Выберите генетику, субстрат и выполните процедуру посадки' : 'Select genetics, substrate and perform planting ritual'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Steps Navigation Pills */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <button
            onClick={() => setStep(1)}
            className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
              step === 1
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                : 'bg-[#121824] border-white/5 text-slate-400'
            }`}
          >
            1. {language === 'ru' ? 'Семя' : 'Seed'}
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={currentSeedCount <= 0}
            className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
              step === 2
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                : 'bg-[#121824] border-white/5 text-slate-400'
            }`}
          >
            2. {language === 'ru' ? 'Субстрат' : 'Substrate'}
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={currentSeedCount <= 0}
            className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
              step === 3
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                : 'bg-[#121824] border-white/5 text-slate-400'
            }`}
          >
            3. {language === 'ru' ? 'Действие' : 'Action'}
          </button>
        </div>

        {/* STEP 1: SELECT SEED GENETICS */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              {language === 'ru' ? 'Выберите семя из инвентаря' : 'Select seed from vault'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STRAIN_DEFINITIONS.map((def) => {
                const count = getSeedCount(def.id);
                const isSelected = selectedStrainId === def.id;

                return (
                  <div
                    key={def.id}
                    onClick={() => {
                      if (count > 0) {
                        sounds.playClick();
                        setSelectedStrainId(def.id);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      count <= 0
                        ? 'opacity-40 bg-[#0d121a] border-white/5 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#141e2b] border-emerald-500/60 shadow-md ring-1 ring-emerald-500/30'
                        : 'bg-[#0f1520] border-white/[0.08] hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-white text-sm">
                        {def.name}
                      </div>
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded-lg font-bold ${
                          count > 0 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25' : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {count} шт
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      {def.type} · ТГК: {def.thcRange[0]}-{def.thcRange[1]}%
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-slate-400 border-t border-white/5 pt-2">
                      <span>Сложность: {def.difficulty}</span>
                      <span className="text-emerald-400 font-semibold">~65-85g</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(2);
                }}
                disabled={currentSeedCount <= 0}
                className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span>{language === 'ru' ? 'Далее: Выбор субстрата' : 'Next: Choose Substrate'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SELECT MEDIUM / SUBSTRATE */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              {language === 'ru' ? 'Выберите среду культивации' : 'Select cultivation medium'}
            </h3>

            <div className="space-y-3">
              {/* Soil */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedMedium('soil');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedMedium === 'soil'
                    ? 'bg-[#141e2b] border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                    : 'bg-[#0f1520] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    {language === 'ru' ? '1. Органическая почвосмесь с перлитом' : 'Organic Living Soil + Perlite'}
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Стабильность
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Естественный буфер pH, прощает редкий полив и содержит органические микроэлементы на первые 2-3 недели.
                </p>
              </div>

              {/* Coco */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedMedium('coco');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedMedium === 'coco'
                    ? 'bg-[#141e2b] border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                    : 'bg-[#0f1520] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    {language === 'ru' ? '2. Кокосовый субстрат (Coco Coir)' : 'Aerated Coco Coir'}
                  </h4>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    +12% к скорости
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Отличная аэрация корней и быстрый темп роста. Требует регулярного увлажнения и контроля солей.
                </p>
              </div>

              {/* Hydroponics */}
              <div
                onClick={() => {
                  sounds.playClick();
                  setSelectedMedium('hydroponics');
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedMedium === 'hydroponics'
                    ? 'bg-[#141e2b] border-purple-500 shadow-md ring-1 ring-purple-500/40'
                    : 'bg-[#0f1520] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">
                    {language === 'ru' ? '3. Гидропонная система DWC (Deep Water)' : 'Hydroponic DWC System'}
                  </h4>
                  <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    +25% к урожайности
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Взрывной темп развития за счет прямого насыщения корней кислородным раствором. Требует строгой калибровки pH.
                </p>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                ← {language === 'ru' ? 'Назад' : 'Back'}
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setStep(3);
                }}
                className="py-2.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span>{language === 'ru' ? 'Далее: Процедура посадки' : 'Next: Planting Action'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: INTERACTIVE PLANTING ACTION */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              {language === 'ru' ? 'Выполните интерактивную посадку' : 'Execute planting actions'}
            </h3>

            {/* Visual Pot Graphic */}
            <div className="relative aspect-video max-h-48 w-full bg-[#05080c] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-4">
              <svg viewBox="0 0 200 120" className="w-44 h-full filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
                {/* 15L Fabric Smart Pot */}
                <polygon points="35,40 165,40 150,110 50,110" fill="#1e293b" stroke="#475569" strokeWidth="2" />
                {/* Substrate Soil Fill */}
                <ellipse cx="100" cy="42" rx="60" ry="12" fill="#3b2111" />

                {/* Substrate Hole */}
                {isHoleDug && (
                  <ellipse cx="100" cy="43" rx="14" ry="6" fill="#1c0f08" stroke="#451a03" strokeWidth="1" />
                )}

                {/* Seed Placed */}
                {isSeedPlaced && (
                  <ellipse cx="100" cy="43" rx="5" ry="3.5" fill="#a16207" stroke="#ca8a04" strokeWidth="1" />
                )}

                {/* Water droplets */}
                {isWatered && (
                  <g fill="#38bdf8" opacity="0.8">
                    <circle cx="85" cy="40" r="2" />
                    <circle cx="115" cy="42" r="2.5" />
                    <circle cx="100" cy="46" r="1.8" />
                  </g>
                )}
              </svg>

              <div className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-lg">
                15L Smart Pot · {selectedMedium.toUpperCase()}
              </div>
            </div>

            {/* Interactive Step Buttons */}
            <div className="space-y-2 text-xs font-mono">
              {/* Action 1: Dig Hole */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsHoleDug(true);
                }}
                disabled={isHoleDug}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isHoleDug
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-[#121824] border-white/10 hover:border-white/20 text-slate-200'
                }`}
              >
                <span>1. {language === 'ru' ? 'Сделать лунку глубиной 1.5 см' : 'Dig 1.5 cm seed hole'}</span>
                {isHoleDug ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Action 2: Place Seed */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsSeedPlaced(true);
                }}
                disabled={!isHoleDug || isSeedPlaced}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSeedPlaced
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : !isHoleDug
                    ? 'opacity-40 bg-[#0e131d] border-white/5 cursor-not-allowed text-slate-500'
                    : 'bg-[#121824] border-white/10 hover:border-white/20 text-slate-200'
                }`}
              >
                <span>2. {language === 'ru' ? 'Поместить семя и бережно присыпать' : 'Sow seed and cover gently'}</span>
                {isSeedPlaced ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Action 3: Initial Water */}
              <button
                onClick={() => {
                  sounds.playWatering();
                  setIsWatered(true);
                }}
                disabled={!isSeedPlaced || isWatered}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isWatered
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : !isSeedPlaced
                    ? 'opacity-40 bg-[#0e131d] border-white/5 cursor-not-allowed text-slate-500'
                    : 'bg-[#121824] border-white/10 hover:border-white/20 text-slate-200'
                }`}
              >
                <span>3. {language === 'ru' ? 'Стартовый мягкий полив (150 мл)' : 'Initial gentle hydration (150 ml)'}</span>
                {isWatered ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Droplets className="w-4 h-4 text-slate-500" />}
              </button>
            </div>

            {/* Launch Button */}
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
              >
                ← {language === 'ru' ? 'Назад' : 'Back'}
              </button>

              <button
                onClick={handleStartCycle}
                disabled={!isWatered}
                className={`py-2.5 px-6 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-lg ${
                  isWatered
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-950/40 active:scale-98'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'ru' ? 'Запустить цикл роста!' : 'Begin Growth Cycle!'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
