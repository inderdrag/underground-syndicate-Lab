import React, { useState } from 'react';
import { GameState, BotanyPlant, StrainId } from '../types/game';
import { STRAIN_DEFINITIONS } from '../engine/simulationEngine';
import { GrowShopItem } from '../engine/cultivationEngine';
import { Sprout, Sun, Wind, Droplets, Scissors, ShieldAlert, Sparkles, Plus, AlertCircle, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { BotanyTelemetryChart } from './BotanyTelemetryChart';
import { PlantGrowthInteractive } from './PlantGrowthInteractive';
import { InteractivePlanterModal } from './InteractivePlanterModal';
import { GrowShopModal } from './GrowShopModal';

interface BotanyPhaseProps {
  gameState: GameState;
  onPlantSeed: (strainId: StrainId) => void;
  onPlantSpecimen?: (strainId: StrainId, medium: 'soil' | 'hydroponics' | 'coco') => void;
  onUpdatePlant?: (updatedPlant: BotanyPlant) => void;
  onHarvestPlant: (plantId: string) => void;
  onHarvestCompleted?: (plantId: string, yieldGrams: number, purity: number) => void;
  onDeductCash?: (amount: number) => void;
  onConsumeSupplies?: (supplies: {
    waterL?: number;
    vegMl?: number;
    bloomMl?: number;
    organicMl?: number;
    neemMl?: number;
  }) => void;
  onBuySupply?: (item: GrowShopItem) => void;
  onAdjustNutrients: (plantId: string, n: number, p: number, k: number, ph: number) => void;
  onSwitchMedium: (plantId: string, medium: 'soil' | 'hydroponics') => void;
  onToggleLight: (plantId: string, wattage: number) => void;
  onBuySeeds: (strainId: StrainId, cost: number) => void;
  onIngestSample: (effectType: 'white_widow' | 'amnesia_haze' | 'gorilla_glue' | 'purple_haze') => void;
  language: Language;
}

export const BotanyPhase: React.FC<BotanyPhaseProps> = ({
  gameState,
  onPlantSeed,
  onPlantSpecimen,
  onUpdatePlant,
  onHarvestPlant,
  onHarvestCompleted,
  onDeductCash = () => {},
  onConsumeSupplies = () => {},
  onBuySupply = () => {},
  onAdjustNutrients,
  onSwitchMedium,
  onToggleLight,
  onBuySeeds,
  onIngestSample,
  language,
}) => {
  const t = translations[language];
  const [isPlanterModalOpen, setIsPlanterModalOpen] = useState<boolean>(false);
  const [isGrowShopOpen, setIsGrowShopOpen] = useState<boolean>(false);
  const [activePlantId, setActivePlantId] = useState<string | null>(
    gameState.plants.length > 0 ? gameState.plants[0].id : null
  );

  const activePlant = gameState.plants.find((p) => p.id === activePlantId) || gameState.plants[0];

  return (
    <div className="space-y-4">
      {/* Compact Editorial Header with Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{t.botanyTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {gameState.plants.length} {language === 'ru' ? 'растений' : 'active plants'}
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {language === 'ru' ? 'Интерактивная фазовая культивация, контроль микроклимата и сбор шишек' : 'Interactive staged cultivation & climate control'}
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setIsGrowShopOpen(true);
            }}
            className="px-3.5 py-1.5 bg-[#141c28] hover:bg-[#1a2536] border border-white/10 hover:border-emerald-500/40 text-slate-200 font-mono font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ru' ? 'Гроушоп (Припасы)' : 'Grow Shop'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setIsPlanterModalOpen(true);
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Посадить семя' : 'Plant Seed'}</span>
          </button>
        </div>
      </div>

      {/* Genetics Quick Seed Bar */}
      <div className="p-2.5 rounded-xl bg-[#090d14] border border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-[11px]">Семена на складе:</span>
          {STRAIN_DEFINITIONS.map((s) => {
            let count = 0;
            if (s.id === 'white_widow') count = gameState.inventory.seedsWhiteWidow;
            else if (s.id === 'amnesia_haze') count = gameState.inventory.seedsAmnesiaHaze;
            else if (s.id === 'gorilla_glue') count = gameState.inventory.seedsGorillaGlue;
            else if (s.id === 'purple_haze') count = gameState.inventory.seedsPurpleHaze;

            return (
              <span
                key={s.id}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1.5"
              >
                <span className="font-semibold text-white">{s.name.split(' ')[0]}:</span>
                <strong className={count > 0 ? 'text-emerald-400' : 'text-slate-500'}>{count}</strong>
                <button
                  onClick={() => onBuySeeds(s.id, s.seedPrice)}
                  disabled={gameState.cash < s.seedPrice}
                  className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/40 cursor-pointer ml-1"
                >
                  +${s.seedPrice}
                </button>
              </span>
            );
          })}
        </div>

        <div className="text-slate-400 text-[11px]">
          Баланс: <strong className="text-emerald-400 font-bold">${gameState.cash.toLocaleString()}</strong>
        </div>
      </div>

      {/* Main Viewport Grid */}
      {gameState.plants.length === 0 ? (
        <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-3 bg-[#090d14]">
          <Sprout className="w-8 h-8 text-emerald-500/60 mx-auto" />
          <h3 className="text-sm font-bold text-white">{t.emptyTents}</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">{t.emptyTentsDesc}</p>
          <button
            onClick={() => {
              sounds.playClick();
              setIsPlanterModalOpen(true);
            }}
            className="py-1.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Начать посадку семени' : 'Start Seed Planting'}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Column: Plant Selection List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {gameState.plants.map((plant) => {
              const def = STRAIN_DEFINITIONS.find((s) => s.id === plant.strainId)!;
              const isSelected = plant.id === activePlantId;
              const isReady = plant.progress >= 95 || plant.stage === 'ready_harvest';

              return (
                <div
                  key={plant.id}
                  onClick={() => {
                    sounds.playClick();
                    setActivePlantId(plant.id);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#121926] border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                      : 'bg-[#0f141d] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {def.name}
                      </div>
                      <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                        {plant.stage} · {plant.medium.toUpperCase()}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-mono font-medium ${
                        isReady
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse font-bold'
                          : 'bg-[#18212e] text-slate-400 border border-white/5'
                      }`}
                    >
                      {Math.round(plant.progress)}%
                    </span>
                  </div>

                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isReady ? 'bg-emerald-400' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, plant.progress)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
                    <span>Влажность: <strong className="text-cyan-400">{Math.round(plant.moisture)}%</strong></span>
                    <span>Здоровье: <strong className="text-slate-200">{plant.health}%</strong></span>
                    <span>Смола: <strong className="text-purple-400">{plant.purity}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Columns: Full Interactive Cultivation Engine & Dashboard */}
          {activePlant && (
            <div className="lg:col-span-2 space-y-4">
              <PlantGrowthInteractive
                plant={activePlant}
                gameState={gameState}
                onUpdatePlant={(updated) => onUpdatePlant && onUpdatePlant(updated)}
                onHarvestCompleted={(plantId, yieldGrams, purity) => {
                  if (onHarvestCompleted) {
                    onHarvestCompleted(plantId, yieldGrams, purity);
                  } else {
                    onHarvestPlant(plantId);
                  }
                }}
                onDeductCash={onDeductCash}
                onConsumeSupplies={onConsumeSupplies}
                onOpenGrowShop={() => setIsGrowShopOpen(true)}
                language={language}
              />

              {/* Compact Telemetry Chart */}
              <div className="bg-[#0e131b] border border-white/[0.08] rounded-2xl p-4 shadow-sm">
                <BotanyTelemetryChart plant={activePlant} language={language} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Planter Modal */}
      <InteractivePlanterModal
        gameState={gameState}
        isOpen={isPlanterModalOpen}
        onClose={() => setIsPlanterModalOpen(false)}
        onPlantConfirmed={(strainId, medium) => {
          if (onPlantSpecimen) {
            onPlantSpecimen(strainId, medium);
          } else {
            onPlantSeed(strainId);
          }
        }}
        language={language}
      />

      {/* Grow Shop Modal */}
      <GrowShopModal
        gameState={gameState}
        isOpen={isGrowShopOpen}
        onClose={() => setIsGrowShopOpen(false)}
        onBuySupply={onBuySupply}
        language={language}
      />
    </div>
  );
};
