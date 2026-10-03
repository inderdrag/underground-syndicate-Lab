import React, { useState } from 'react';
import { GameState, MushroomBatch } from '../types/game';
import { Plus, Droplets, Moon, Scissors, Sparkles, Syringe, Flame } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { MushroomGrowthInteractive } from './MushroomGrowthInteractive';

interface MycologyPhaseProps {
  gameState: GameState;
  onStartNewBatch: () => void;
  onAdvanceStage: (batchId: string) => void;
  onHarvestBatch: (batchId: string) => void;
  onUpdateParameters: (
    batchId: string,
    updates: Partial<MushroomBatch>
  ) => void;
  onIngestPsilocybin: () => void;
  language: Language;
}

export const MycologyPhase: React.FC<MycologyPhaseProps> = ({
  gameState,
  onStartNewBatch,
  onAdvanceStage,
  onHarvestBatch,
  onUpdateParameters,
  onIngestPsilocybin,
  language,
}) => {
  const t = translations[language];
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(
    gameState.mushroomBatches.length > 0 ? gameState.mushroomBatches[0].id : null
  );

  const activeBatch =
    gameState.mushroomBatches.find((b) => b.id === selectedBatchId) ||
    gameState.mushroomBatches[0];

  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{t.mycologyTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                {gameState.mushroomBatches.length} {language === 'ru' ? 'партий' : 'active batches'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'ru' ? 'Стерилизация, инокуляция, инкубация зерна и сбор Psilocybe Cubensis' : 'Psilocybin cultivation, sterilization & monotub control'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onStartNewBatch();
            }}
            disabled={gameState.inventory.sporeSyringes <= 0}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 ${
              gameState.inventory.sporeSyringes > 0
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-[#141923] text-slate-500 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.prepNewBatch} ({gameState.inventory.sporeSyringes} {t.sporesAvailable})</span>
          </button>

          <button
            onClick={() => {
              sounds.playPsychedelicChime();
              onIngestPsilocybin();
            }}
            disabled={gameState.inventory.mushroomsGrams <= 0}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              gameState.inventory.mushroomsGrams > 0
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                : 'bg-[#141923] text-slate-600 border border-white/5 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.samplePsilocybinFx} ({gameState.inventory.mushroomsGrams}g)</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Grid */}
      {gameState.mushroomBatches.length === 0 ? (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-[#090d14]">
          <Moon className="w-8 h-8 text-cyan-500/60 mx-auto" />
          <h3 className="text-sm font-bold text-white">Монотубы пусты</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Подготовьте стерильный субстрат и начните новую партию мицелия споровым шприцем.
          </p>
          <button
            onClick={() => {
              sounds.playClick();
              onStartNewBatch();
            }}
            disabled={gameState.inventory.sporeSyringes <= 0}
            className="py-1.5 px-4 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Начать автоклавирование субстрата</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Batch Selection List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {gameState.mushroomBatches.map((batch) => {
              const isSelected = batch.id === (activeBatch ? activeBatch.id : null);
              const isReady = batch.stage === 'harvested';

              return (
                <div
                  key={batch.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedBatchId(batch.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121926] border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                      : 'bg-[#0f141d] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{batch.name}</div>
                      <div className="text-[11px] text-cyan-400 capitalize mt-0.5">
                        Фаза: {batch.stage}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-mono font-medium ${
                        isReady
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse font-bold'
                          : 'bg-[#18212e] text-slate-400 border border-white/5'
                      }`}
                    >
                      {Math.round(batch.progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-300"
                      style={{ width: `${Math.min(100, batch.progress)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                    <span>Темп: <strong className="text-white">{batch.temperatureC}°C</strong></span>
                    <span>Влажность: <strong className="text-cyan-400">{batch.humidityPercent}%</strong></span>
                    <span>Потенция: <strong className="text-emerald-400">{batch.potency}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: Interactive Mushroom Stage Engine */}
          {activeBatch && (
            <div className="lg:col-span-2">
              <MushroomGrowthInteractive
                batch={activeBatch}
                gameState={gameState}
                onUpdateBatch={onUpdateParameters}
                onAdvanceStage={onAdvanceStage}
                onHarvestBatch={onHarvestBatch}
                language={language}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
