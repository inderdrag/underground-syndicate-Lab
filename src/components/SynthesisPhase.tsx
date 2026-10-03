import React, { useState } from 'react';
import { GameState, LSDSynthesisBatch } from '../types/game';
import { FlaskConical, Beaker, ShieldAlert, Sparkles, Plus, TestTube, Lightbulb, Grid, CheckCircle2 } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { LSDSynthesisInteractive } from './LSDSynthesisInteractive';
import { CocaineRefiningInteractive, CocaineBatch } from './CocaineRefiningInteractive';

interface SynthesisPhaseProps {
  gameState: GameState;
  onStartSynthesis: () => void;
  onAdvanceSynthesisStage: (batchId: string) => void;
  onCompleteDosing: (batchId: string) => void;
  onUpdateBatch: (batchId: string, updates: Partial<LSDSynthesisBatch>) => void;
  onFinishCocaine?: (yieldGrams: number) => void;
  onIngestLSD: () => void;
  onTriggerOverdose?: (substanceName: string, fee: number) => void;
  language: Language;
}

export const SynthesisPhase: React.FC<SynthesisPhaseProps> = ({
  gameState,
  onStartSynthesis,
  onAdvanceSynthesisStage,
  onCompleteDosing,
  onUpdateBatch,
  onFinishCocaine,
  onIngestLSD,
  onTriggerOverdose,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'lsd' | 'cocaine'>('lsd');
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    gameState.lsdBatches.length > 0 ? gameState.lsdBatches[0].id : null
  );

  // Local Cocaine refining state
  const [cocaineBatch, setCocaineBatch] = useState<CocaineBatch>({
    id: 'cocaine_batch_1',
    stage: 'maceration',
    progress: 25,
    purity: 96,
    yieldGrams: 50,
    hclAdded: true,
    vacuumPsi: -25,
  });

  const activeBatch =
    gameState.lsdBatches.find((b) => b.id === selectedBatchId) ||
    gameState.lsdBatches[0];

  const handleAdvanceCocaineStage = () => {
    setCocaineBatch((prev) => {
      let nextStage = prev.stage;
      let nextProg = prev.progress + 20;
      if (prev.stage === 'maceration') nextStage = 'solvent_wash';
      else if (prev.stage === 'solvent_wash') nextStage = 'acid_conversion';
      else if (prev.stage === 'acid_conversion') nextStage = 'vacuum_filtration';
      else if (prev.stage === 'vacuum_filtration') nextStage = 'crystallized';
      return { ...prev, stage: nextStage, progress: Math.min(100, nextProg) };
    });
  };

  const handleFinishCocaine = (grams: number) => {
    if (onFinishCocaine) {
      onFinishCocaine(grams);
    }
    setCocaineBatch({
      id: `cocaine_batch_${Date.now()}`,
      stage: 'maceration',
      progress: 0,
      purity: 96,
      yieldGrams: 50,
      hclAdded: false,
      vacuumPsi: 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Editorial Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{t.synthesisTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                {activeTab === 'lsd' ? `${gameState.lsdBatches.length} реакций` : 'Лаборатория HCl'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'ru' ? 'Органический синтез ЛСД-25 и гидрохлоридная очистка кокаина' : 'Chemical organic synthesis & purification lab'}
            </p>
          </div>
        </div>

        {/* Tab Switcher & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Sub-tab pills */}
          <div className="flex bg-[#0f141d] p-1 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab('lsd')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                activeTab === 'lsd'
                  ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ЛСД-25
            </button>
            <button
              onClick={() => setActiveTab('cocaine')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
                activeTab === 'cocaine'
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Кокаин (HCl)
            </button>
          </div>

          {activeTab === 'lsd' ? (
            <button
              onClick={() => {
                sounds.playLabReaction();
                onStartSynthesis();
              }}
              disabled={
                gameState.inventory.ergotCultures <= 0 ||
                gameState.inventory.diethylamineMl < 50
              }
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 ${
                gameState.inventory.ergotCultures > 0 &&
                gameState.inventory.diethylamineMl >= 50
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-[#141923] text-slate-500 border border-white/5 cursor-not-allowed'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.startReaction}</span>
            </button>
          ) : (
            <span className="text-xs font-mono text-slate-400 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
              Склад: <strong className="text-amber-400">{gameState.inventory.cocaineGrams}g</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Viewport Content based on active tab */}
      {activeTab === 'lsd' ? (
        gameState.lsdBatches.length === 0 ? (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-[#090d14]">
            <FlaskConical className="w-8 h-8 text-purple-500/60 mx-auto" />
            <h3 className="text-sm font-bold text-white">Реакционные колбы свободны</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Начните новую пептидную конденсацию с эрготамином и диэтиламином.
            </p>
            <button
              onClick={() => {
                sounds.playLabReaction();
                onStartSynthesis();
              }}
              disabled={
                gameState.inventory.ergotCultures <= 0 ||
                gameState.inventory.diethylamineMl < 50
              }
              className="py-1.5 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Начать синтез партии ЛСД-25</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column: Batch Selection List */}
            <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {gameState.lsdBatches.map((batch) => {
                const isSelected = batch.id === (activeBatch ? activeBatch.id : null);
                const isReady = batch.stage === 'completed';

                return (
                  <div
                    key={batch.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedBatchId(batch.id);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#121926] border-purple-500 shadow-md ring-1 ring-purple-500/30'
                        : 'bg-[#0f141d] border-white/[0.08] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-white text-sm">
                          Синтез #{batch.id.slice(-4)}
                        </div>
                        <div className="text-[11px] text-purple-400 capitalize mt-0.5">
                          Фаза: {batch.stage}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-lg font-mono font-medium ${
                          isReady
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse font-bold'
                            : 'bg-[#18212e] text-slate-400 border border-white/5'
                        }`}
                      >
                        {Math.round(batch.progress)}%
                      </span>
                    </div>

                    <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                      <div
                        className="h-full bg-purple-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, batch.progress)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                      <span>Темп: <strong className="text-white">{batch.refluxTempC}°C</strong></span>
                      <span>Чистота: <strong className="text-pink-400">{batch.purity}%</strong></span>
                      <span>Доза: <strong className="text-amber-400">{batch.blotterDoseUg}ug</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right 2 Columns: Interactive LSD Synthesis Stage Engine */}
            {activeBatch && (
              <div className="lg:col-span-2">
                <LSDSynthesisInteractive
                  batch={activeBatch}
                  gameState={gameState}
                  onUpdateBatch={onUpdateBatch}
                  onAdvanceStage={onAdvanceSynthesisStage}
                  onCompleteDosing={onCompleteDosing}
                  onTriggerOverdose={onTriggerOverdose}
                  language={language}
                />
              </div>
            )}
          </div>
        )
      ) : (
        /* Cocaine Refining Interactive Tab */
        <div className="space-y-4">
          <CocaineRefiningInteractive
            batch={cocaineBatch}
            gameState={gameState}
            onUpdateBatch={(updates) => setCocaineBatch((prev) => ({ ...prev, ...updates }))}
            onAdvanceStage={handleAdvanceCocaineStage}
            onFinishCocaineBatch={handleFinishCocaine}
            language={language}
          />
        </div>
      )}
    </div>
  );
};
