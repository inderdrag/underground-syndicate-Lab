import React from 'react';
import {
  Sprout,
  Leaf,
  Sparkles,
  Scissors,
  Check,
  Flame,
  Syringe,
  Moon,
  Droplets,
  TestTube,
  FlaskConical,
  Lightbulb,
  Grid,
  CheckCircle2,
  Wind,
  Beaker,
  Zap,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';

export type ProductionDomain = 'botany' | 'mycology' | 'lsd' | 'cocaine';

export interface ProductionStep {
  id: string;
  label: string;
  subLabel?: string;
  icon: typeof Sprout;
}

interface ProductionStepperProps {
  domain: ProductionDomain;
  currentStepId: string;
  progressPercent: number; // 0 to 100 within current stage or overall
  onStepClick?: (stepId: string) => void;
  className?: string;
}

const DOMAIN_STEPS: Record<
  ProductionDomain,
  {
    themeColor: string;
    accentGlow: string;
    borderActive: string;
    bgActive: string;
    steps: ProductionStep[];
  }
> = {
  botany: {
    themeColor: 'text-emerald-400',
    accentGlow: 'rgba(16, 185, 129, 0.4)',
    borderActive: 'border-emerald-400',
    bgActive: 'bg-emerald-500',
    steps: [
      { id: 'seed', label: 'Семя', subLabel: 'Посадка', icon: Sprout },
      { id: 'seedling', label: 'Росток', subLabel: '1-я пара', icon: Leaf },
      { id: 'young_bush', label: 'Куст', subLabel: 'Вегетация', icon: Leaf },
      { id: 'developing', label: 'Рост', subLabel: 'Предцвет', icon: Sprout },
      { id: 'flowering', label: 'Цветение', subLabel: 'Трихомы', icon: Sparkles },
      { id: 'ready_harvest', label: 'Харвест', subLabel: 'Готово', icon: Scissors },
    ],
  },
  mycology: {
    themeColor: 'text-cyan-400',
    accentGlow: 'rgba(6, 182, 212, 0.4)',
    borderActive: 'border-cyan-400',
    bgActive: 'bg-cyan-500',
    steps: [
      { id: 'sterilization', label: 'Автоклав', subLabel: '15 PSI', icon: Flame },
      { id: 'inoculation', label: 'Инокуляция', subLabel: 'Бокс', icon: Syringe },
      { id: 'incubation', label: 'Инкубация', subLabel: '25°C', icon: Moon },
      { id: 'fruiting', label: 'Монотуб', subLabel: 'FAE 92%', icon: Droplets },
      { id: 'harvested', label: 'Сбор', subLabel: 'Готово', icon: Scissors },
    ],
  },
  lsd: {
    themeColor: 'text-purple-400',
    accentGlow: 'rgba(168, 85, 247, 0.4)',
    borderActive: 'border-purple-400',
    bgActive: 'bg-purple-500',
    steps: [
      { id: 'precursor_extraction', label: 'Экстракция', subLabel: 'Пептиды', icon: TestTube },
      { id: 'reaction', label: 'Конденсация', subLabel: '45°C', icon: FlaskConical },
      { id: 'purification', label: 'Хроматография', subLabel: 'Safelight', icon: Lightbulb },
      { id: 'dosing', label: 'Пропитка', subLabel: '1943', icon: Grid },
      { id: 'completed', label: 'Марки', subLabel: '900 шт', icon: CheckCircle2 },
    ],
  },
  cocaine: {
    themeColor: 'text-amber-400',
    accentGlow: 'rgba(245, 158, 11, 0.45)',
    borderActive: 'border-amber-400',
    bgActive: 'bg-amber-500',
    steps: [
      { id: 'maceration', label: 'Мацерация', subLabel: '38°C–44°C', icon: Beaker },
      { id: 'solvent_wash', label: 'Растворитель', subLabel: 'Разделение', icon: TestTube },
      { id: 'acid_conversion', label: 'HCl Конверсия', subLabel: 'pH 3.0', icon: Zap },
      { id: 'vacuum_filtration', label: 'Бюхнер', subLabel: '-25 inHg', icon: Wind },
      { id: 'crystallized', label: 'Кристаллы', subLabel: '96% Fishscale', icon: Sparkles },
    ],
  },
};

export const ProductionStepper: React.FC<ProductionStepperProps> = ({
  domain,
  currentStepId,
  progressPercent,
  onStepClick,
  className = '',
}) => {
  const config = DOMAIN_STEPS[domain];
  const steps = config.steps;

  // Find index of current active step
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);
  const activeIdx = currentIndex !== -1 ? currentIndex : 0;

  return (
    <div className={`w-full bg-[#080c13] border border-white/[0.08] rounded-2xl p-3.5 shadow-md ${className}`}>
      {/* Step Nodes Track */}
      <div className="relative flex items-center justify-between">
        {/* Connecting Progress Line (Background) */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-neutral-800 rounded-full z-0" />

        {/* Connecting Progress Line (Active Filled) */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-500 z-0"
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                (activeIdx / Math.max(1, steps.length - 1)) * 100 +
                  (progressPercent / 100) * (100 / Math.max(1, steps.length - 1))
              )
            )}%`,
            background: `linear-gradient(90deg, ${config.bgActive}, ${config.accentGlow})`,
            boxShadow: `0 0 10px ${config.accentGlow}`,
          }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIdx;
          const isCurrent = idx === activeIdx;
          const isUpcoming = idx > activeIdx;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (onStepClick) {
                  sounds.playClick();
                  onStepClick(step.id);
                }
              }}
              className={`relative z-10 flex flex-col items-center group ${
                onStepClick ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              {/* Node Circle */}
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)] scale-95'
                    : isCurrent
                    ? `${config.bgActive} text-slate-950 font-bold ring-4 ring-white/20 scale-110 shadow-lg animate-pulse`
                    : 'bg-[#121824] border border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20'
                }`}
                style={
                  isCurrent
                    ? {
                        boxShadow: `0 0 16px ${config.accentGlow}`,
                      }
                    : {}
                }
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>

              {/* Step Label */}
              <div className="text-center mt-1.5 flex flex-col items-center">
                <span
                  className={`text-[10px] md:text-[11px] font-mono font-bold transition-colors whitespace-nowrap ${
                    isCurrent
                      ? `${config.themeColor} font-extrabold`
                      : isCompleted
                      ? 'text-slate-200'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>

                {step.subLabel && (
                  <span
                    className={`text-[8px] md:text-[9px] font-mono leading-none ${
                      isCurrent ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {isCurrent ? `${Math.round(progressPercent)}%` : step.subLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
