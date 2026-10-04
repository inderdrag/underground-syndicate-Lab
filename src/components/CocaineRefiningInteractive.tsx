import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import { CocaineMiniGames } from './minigames/CocaineMiniGames';
import {
  PROCESS_DURATION_SEC,
  COCAINE_PIPELINE_STAGES,
  PipelineStageDef
} from '../config/synthesisPipelineConfig';
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Zap,
  Sparkles,
  Star,
  Award,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

export type CocaineStage =
  | 'maceration'
  | 'solvent_wash'
  | 'acid_conversion'
  | 'vacuum_filtration'
  | 'crystallized';

export type SynthesisPipelinePhase = 'preparation' | 'minigame' | 'process' | 'summary' | 'completed';

export interface StageResultDef {
  stars: number;
  purityDelta: number;
  yieldDelta: number;
  feedback: string;
}

export interface CocaineBatch {
  id: string;
  stageIndex?: number; // 0 to 4
  pipelinePhase?: SynthesisPipelinePhase;
  startedAt?: number;
  endsAt?: number;
  stageResults?: Record<number, StageResultDef>;
  stage: CocaineStage;
  progress: number;
  purity: number; // e.g. 96%
  yieldGrams: number; // e.g. 50g
  hclAdded: boolean;
  vacuumPsi: number;
  tempC?: number;
  phValue?: number;
}

interface CocaineRefiningInteractiveProps {
  batch: CocaineBatch;
  gameState: GameState;
  onUpdateBatch: (updates: Partial<CocaineBatch>) => void;
  onAdvanceStage: () => void;
  onFinishCocaineBatch: (yieldGrams: number) => void;
  language: Language;
}

export const CocaineRefiningInteractive: React.FC<CocaineRefiningInteractiveProps> = ({
  batch,
  onUpdateBatch,
  onFinishCocaineBatch
}) => {
  const stageIndex = batch.stageIndex !== undefined ? batch.stageIndex : 0;
  const pipelinePhase = batch.pipelinePhase || 'preparation';
  const stageResults = batch.stageResults || {};

  // Local tick for real-time timer calculations
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, []);

  // Time-resilience check: if process endsAt is passed, auto-complete process!
  useEffect(() => {
    if (pipelinePhase === 'process' && batch.endsAt && now >= batch.endsAt) {
      sounds.playTriumphFanfare();
      onUpdateBatch({
        pipelinePhase: 'summary'
      });
    }
  }, [pipelinePhase, batch.endsAt, now, onUpdateBatch]);

  const currentStageDef: PipelineStageDef = COCAINE_PIPELINE_STAGES[stageIndex] || COCAINE_PIPELINE_STAGES[0];

  // Process progress calculations
  const startedAt = batch.startedAt || now;
  const endsAt = batch.endsAt || (startedAt + PROCESS_DURATION_SEC * 1000);
  const elapsedSec = Math.max(0, (now - startedAt) / 1000);
  const totalSec = Math.max(1, (endsAt - startedAt) / 1000);
  const processProgressRatio = Math.min(1, Math.max(0, elapsedSec / totalSec));
  const processProgressPercent = Math.round(processProgressRatio * 100);
  const remainingSec = Math.max(0, Math.ceil((endsAt - now) / 1000));

  // Overall batch progress percent
  const overallBatchPercent = Math.round(
    ((stageIndex + (pipelinePhase === 'process' ? processProgressRatio : pipelinePhase === 'summary' || pipelinePhase === 'completed' ? 1 : 0)) / 5) * 100
  );

  // --- HANDLERS ---
  const handleStartStagePrep = () => {
    sounds.playClick();
    onUpdateBatch({
      pipelinePhase: 'minigame'
    });
  };

  const handleMinigameComplete = (result: { stars: number; purityDelta: number; yieldDelta: number; feedback: string }) => {
    sounds.playLabReaction();
    const startTime = Date.now();
    const endTime = startTime + PROCESS_DURATION_SEC * 1000;

    const newResults = {
      ...stageResults,
      [stageIndex]: result
    };

    const updatedPurity = Math.min(100, Math.max(30, batch.purity + result.purityDelta));
    const updatedYield = Math.max(500, batch.yieldGrams + result.yieldDelta);

    onUpdateBatch({
      pipelinePhase: 'process',
      startedAt: startTime,
      endsAt: endTime,
      stageResults: newResults,
      purity: updatedPurity,
      yieldGrams: updatedYield
    });
  };

  const handleAdvanceToNextStage = () => {
    sounds.playClick();
    if (stageIndex >= 4) {
      onUpdateBatch({
        pipelinePhase: 'completed',
        progress: 100
      });
    } else {
      const nextIndex = stageIndex + 1;
      const cocaineStagesMap: CocaineStage[] = ['maceration', 'solvent_wash', 'acid_conversion', 'vacuum_filtration', 'crystallized'];
      onUpdateBatch({
        stageIndex: nextIndex,
        stage: cocaineStagesMap[nextIndex],
        pipelinePhase: 'preparation',
        progress: Math.round((nextIndex / 5) * 100)
      });
    }
  };

  const handleCollectBatchToInventory = () => {
    sounds.playCash();
    onFinishCocaineBatch(batch.yieldGrams);
  };

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl space-y-0 text-white font-sans">
      {/* HEADER & TOP STEPPER BAR */}
      <div className="p-4 bg-[#070b10] border-b border-white/[0.08] space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-base sm:text-lg font-black text-amber-100 font-mono uppercase tracking-wider">
              Очистка и Рафинирование Кокаина Fishscale
            </h2>
          </div>

          <div className="flex items-center gap-3 bg-black/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Прогресс очистки:</span>
            <span className="text-amber-400 font-bold">{overallBatchPercent}%</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Чистота:</span>
            <span className="text-emerald-400 font-bold">
              {stageIndex > 0 || pipelinePhase === 'summary' || pipelinePhase === 'completed' ? `${batch.purity}%` : '—'}
            </span>
          </div>
        </div>

        {/* 5-STAGE STEPPER INDICATOR */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {COCAINE_PIPELINE_STAGES.map((st, idx) => {
            const isFinished = idx < stageIndex || (idx === 4 && pipelinePhase === 'completed');
            const isCurrent = idx === stageIndex && pipelinePhase !== 'completed';
            const isLocked = idx > stageIndex;

            return (
              <div
                key={st.id}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  isFinished
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : isCurrent
                    ? 'bg-amber-950/80 border-amber-400 text-amber-200 ring-2 ring-amber-500/30 shadow-lg'
                    : 'bg-slate-950/40 border-slate-800 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold">
                  {isFinished && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  {isCurrent && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />}
                  {isLocked && <Lock className="w-3 h-3 text-slate-600 shrink-0" />}
                  <span className="truncate">Этап {idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PIPELINE PHASE 1: PREPARATION (ПОДГОТОВКА) */}
      {pipelinePhase === 'preparation' && (
        <div className="p-6 space-y-6 max-w-2xl mx-auto text-center animate-fadeIn">
          <div className="bg-slate-950/90 border border-amber-500/30 p-6 rounded-2xl space-y-4 shadow-xl">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold uppercase">
              {currentStageDef.titleRu}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-100">
              {currentStageDef.subtitleRu}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed max-w-lg mx-auto">
              {currentStageDef.prepDescRu}
            </p>

            <div className="pt-2">
              <button
                onClick={handleStartStagePrep}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto min-h-[48px] active:scale-95"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>НАЧАТЬ ЭТАП И МИНИ-ИГРУ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIPELINE PHASE 2: MINIGAME (МИНИ-ИГРА) */}
      {pipelinePhase === 'minigame' && (
        <div className="p-4 sm:p-6 bg-[#080d14]">
          <CocaineMiniGames
            cocaineGrams={batch.yieldGrams}
            purity={batch.purity}
            stageIndex={stageIndex}
            onCompleteMinigame={handleMinigameComplete}
          />
        </div>
      )}

      {/* PIPELINE PHASE 3: PROCESS (АВТОМАТИЧЕСКИЙ ПРОЦЕСС 30 СЕКУНД) */}
      {pipelinePhase === 'process' && (
        <div className="p-6 space-y-6 max-w-2xl mx-auto text-center animate-fadeIn">
          <div className="bg-slate-950/90 border border-amber-500/40 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 animate-pulse" />

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                [ АВТОМАТИЧЕСКИЙ РЕАКЦИОННЫЙ ПРОЦЕСС ]
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-100">
                {currentStageDef.processTitleRu}
              </h3>
            </div>

            {/* CIRCULAR / LINEAR TIMER PROGRESS DISPLAY */}
            <div className="relative py-4 flex flex-col items-center justify-center space-y-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="#1e293b" strokeWidth="10" fill="none" />
                  <circle
                    cx="72"
                    cy="72"
                    r="62"
                    stroke="#f59e0b"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="390"
                    strokeDashoffset={390 - (390 * processProgressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center font-mono">
                  <span className="text-3xl font-black text-amber-400">{processProgressPercent}%</span>
                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                    00:{remainingSec < 10 ? `0${remainingSec}` : remainingSec}
                  </span>
                </div>
              </div>

              <div className="text-xs font-mono text-slate-300 italic max-w-md">
                «{currentStageDef.processDescRu}»
              </div>
            </div>

            {/* DISABLED BUTTON DURING PROCESS */}
            <button
              disabled
              className="w-full py-4 bg-slate-900 border border-slate-800 text-slate-500 font-mono text-xs font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4 animate-spin text-amber-400" />
              <span>ИДЁТ ИНТЕНСИВНЫЙ ПРОЦЕСС... УСКОРЕНИЕ НЕДОСТУПНО</span>
            </button>
          </div>
        </div>
      )}

      {/* PIPELINE PHASE 4: STAGE SUMMARY (ИТОГ ЭТАПА) */}
      {pipelinePhase === 'summary' && (
        <div className="p-6 space-y-6 max-w-2xl mx-auto text-center animate-fadeIn">
          <div className="bg-slate-950/90 border border-emerald-500/40 p-6 sm:p-8 rounded-2xl space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                [ ЭТАП УСПЕШНО ЗАВЕРШЁН ]
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-100">
                Итог: {currentStageDef.titleRu}
              </h3>
            </div>

            {/* STAR RATING & DELTAS */}
            {stageResults[stageIndex] && (
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2 max-w-md mx-auto">
                <div className="flex justify-center items-center gap-1 text-yellow-400">
                  {Array.from({ length: stageResults[stageIndex].stars || 3 }).map((_, i) => (
                    <Star key={i} className="w-6 h-6 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  {stageResults[stageIndex].feedback}
                </p>
                <div className="flex justify-center gap-4 text-xs font-mono font-bold pt-1">
                  <span className="text-amber-400">Чистота: +{stageResults[stageIndex].purityDelta}%</span>
                </div>
              </div>
            )}

            <button
              onClick={handleAdvanceToNextStage}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto min-h-[48px] active:scale-95"
            >
              <Zap className="w-5 h-5 fill-slate-950" />
              <span>
                {stageIndex >= 4 ? 'ПЕРЕЙТИ К ФИНАЛЬНОМУ ИТОГУ ПАРТИИ' : 'ПЕРЕЙТИ К СЛЕДУЮЩЕМУ ЭТАПУ'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* PIPELINE PHASE 5: FINAL BATCH COMPLETED */}
      {pipelinePhase === 'completed' && (
        <div className="p-6 space-y-6 max-w-2xl mx-auto text-center animate-fadeIn">
          <div className="bg-slate-950/90 border border-amber-500/50 p-6 sm:p-8 rounded-2xl space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center mx-auto text-slate-950 shadow-2xl animate-bounce">
              <Sparkles className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block">
                [ ПОЛНАЯ ОЧИСТКА КОКАИНА УСПЕШНА ]
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-100">
                Кристаллы Fishscale готовы!
              </h3>
            </div>

            <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4 max-w-md mx-auto text-center">
              <div>
                <div className="text-xs text-slate-400">Итоговая Чистота:</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-1">{batch.purity}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Выход Брикета:</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{batch.yieldGrams}г</div>
              </div>
            </div>

            <button
              onClick={handleCollectBatchToInventory}
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-base rounded-2xl shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto min-h-[48px] active:scale-95"
            >
              <ShieldCheck className="w-5 h-5 fill-slate-950" />
              <span>ЗАБРАТЬ КРИСТАЛЛЫ НА СКЛАД</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
