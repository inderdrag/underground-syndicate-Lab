import React, { useState } from 'react';
import { BotanyPlant, PlantStage, PlantCondition, GameState } from '../types/game';
import { STRAIN_DEFINITIONS } from '../engine/simulationEngine';
import {
  PLANT_STAGES_CONFIG,
  TENT_UPGRADES,
  waterPlant,
  feedPlant,
  inspectPlantDiagnosis,
  resolvePlantEvent,
  calculatePlantHarvest,
} from '../engine/cultivationEngine';
import {
  Droplets,
  Sprout,
  Sparkles,
  Scissors,
  Search,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sun,
  Wind,
  ShieldAlert,
  ChevronDown,
  Layers,
  ShoppingBag,
  Zap,
  Info,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductionStepper } from './ProductionStepper';

interface PlantGrowthInteractiveProps {
  plant: BotanyPlant;
  gameState: GameState;
  onUpdatePlant: (updatedPlant: BotanyPlant) => void;
  onHarvestCompleted: (plantId: string, yieldGrams: number, purity: number) => void;
  onDeductCash: (amount: number) => void;
  onConsumeSupplies: (supplies: {
    waterL?: number;
    vegMl?: number;
    bloomMl?: number;
    organicMl?: number;
    neemMl?: number;
  }) => void;
  onOpenGrowShop: () => void;
  language: Language;
}

export const PlantGrowthInteractive: React.FC<PlantGrowthInteractiveProps> = ({
  plant,
  gameState,
  onUpdatePlant,
  onHarvestCompleted,
  onDeductCash,
  onConsumeSupplies,
  onOpenGrowShop,
  language,
}) => {
  const [isFeedMenuOpen, setIsFeedMenuOpen] = useState<boolean>(false);
  const [isInspectOpen, setIsInspectOpen] = useState<boolean>(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isWarning: boolean } | null>(null);

  const strainDef = STRAIN_DEFINITIONS.find((s) => s.id === plant.strainId)!;
  const stageConfig = PLANT_STAGES_CONFIG[plant.stage];

  const showToast = (text: string, isWarning: boolean = false) => {
    setToastMessage({ text, isWarning });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Water Action with Water / Utility Accounting
  const handleWater = () => {
    const hasROWater = gameState.inventory.purifiedWaterLitres >= 1.5;
    const canAffordTap = gameState.cash >= 4;

    if (!hasROWater && !canAffordTap) {
      showToast('Недостаточно средств ($4) и нет запасов осмотической воды для полива!', true);
      return;
    }

    sounds.playWatering();
    const { updatedPlant, waterUsedLitres, cashUtilityCost, message, isWarning } = waterPlant(
      plant,
      hasROWater,
      gameState.inventory.purifiedWaterLitres
    );

    if (waterUsedLitres > 0) {
      onConsumeSupplies({ waterL: waterUsedLitres });
    }
    if (cashUtilityCost > 0) {
      onDeductCash(cashUtilityCost);
    }

    onUpdatePlant(updatedPlant);
    showToast(message, isWarning);
  };

  // 2. Feed Action with ml deduction
  const handleFeed = (formula: 'veg_nitro' | 'bloom_pk' | 'organic_tea') => {
    let stock = 0;
    if (formula === 'veg_nitro') stock = gameState.inventory.nutrientVegMl;
    else if (formula === 'bloom_pk') stock = gameState.inventory.nutrientBloomMl;
    else stock = gameState.inventory.nutrientOrganicMl;

    const { updatedPlant, mlUsed, message, isWarning, canExecute } = feedPlant(plant, formula, stock);

    if (!canExecute) {
      showToast(message, true);
      return;
    }

    sounds.playPsychedelicChime();
    if (formula === 'veg_nitro') onConsumeSupplies({ vegMl: mlUsed });
    else if (formula === 'bloom_pk') onConsumeSupplies({ bloomMl: mlUsed });
    else onConsumeSupplies({ organicMl: mlUsed });

    onUpdatePlant(updatedPlant);
    setIsFeedMenuOpen(false);
    showToast(message, isWarning);
  };

  // 3. Resolve Problem with Neem oil or utility fee
  const handleResolveProblem = () => {
    sounds.playClick();
    const { updatedPlant, neemUsedMl, waterUsedL, cashCost, message, canExecute } = resolvePlantEvent(
      plant,
      gameState.inventory.neemOilMl,
      gameState.inventory.purifiedWaterLitres
    );

    if (!canExecute) {
      showToast(message, true);
      return;
    }

    if (neemUsedMl > 0) onConsumeSupplies({ neemMl: neemUsedMl });
    if (waterUsedL > 0) onConsumeSupplies({ waterL: waterUsedL });
    if (cashCost > 0) onDeductCash(cashCost);

    onUpdatePlant(updatedPlant);
    showToast(message, false);
  };

  // 4. Upgrade Environment with Cash Cost
  const handleUpgrade = (upgradeId: 'light_800' | 'light_1000' | 'clip_fan' | 'scrog_net') => {
    const upgradeConf = TENT_UPGRADES.find((u) => u.id === upgradeId)!;

    if (gameState.cash < upgradeConf.cost) {
      showToast(`Недостаточно средств для модернизации ($${upgradeConf.cost})!`, true);
      return;
    }

    sounds.playCash();
    onDeductCash(upgradeConf.cost);

    let updated = { ...plant };
    let msg = '';
    if (upgradeId === 'light_800') {
      updated.lightWattage = 800;
      msg = `Освещение модернизировано до 800W Full Spectrum (списано $${upgradeConf.cost}).`;
    } else if (upgradeId === 'light_1000') {
      updated.lightWattage = 1000;
      msg = `Установлен коммерческий модуль 1000W COB (списано $${upgradeConf.cost}).`;
    } else if (upgradeId === 'clip_fan') {
      updated.fanSpeed = (plant.fanSpeed || 1) + 1;
      msg = `Установлен осциллирующий вентилятор обдува кроны (списано $${upgradeConf.cost}).`;
    } else {
      updated.scrogInstalled = true;
      msg = `Сетка SCROG смонтирована над кроной (списано $${upgradeConf.cost}).`;
    }

    onUpdatePlant(updated);
    setIsUpgradeOpen(false);
    showToast(msg, false);
  };

  // 5. Harvest Action
  const handleHarvest = () => {
    sounds.playHarvest();
    const result = calculatePlantHarvest(plant);
    onHarvestCompleted(plant.id, result.yieldGrams, result.purity);
  };

  const isReady = plant.progress >= 95 || plant.stage === 'ready_harvest';

  const conditionLabels: Record<PlantCondition, { label: string; color: string }> = {
    optimal: { label: 'Идеальное состояние', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
    good: { label: 'Хорошее развитие', color: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20' },
    thirsty: { label: 'Жажда (Низкая влажность)', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    overwatered: { label: 'Перелив (Заболачивание)', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
    nutrient_deficiency: { label: 'Дефицит питания', color: 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30' },
    nutrient_burn: { label: 'Ожог солями (Burn)', color: 'text-rose-400 bg-rose-500/15 border-rose-500/30' },
    stressed: { label: 'Температурный стресс', color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
    pests: { label: 'Завелись паразиты', color: 'text-rose-400 bg-rose-500/20 border-rose-500/40' },
  };

  const conditionInfo = conditionLabels[plant.condition] || conditionLabels.good;
  const inspectData = inspectPlantDiagnosis(plant);

  return (
    <div className="bg-[#0b1017] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl space-y-0">
      {/* Toast Notification Bar */}
      {toastMessage && (
        <div
          className={`py-2.5 px-4 text-xs font-mono flex items-center justify-between border-b transition-all ${
            toastMessage.isWarning
              ? 'bg-rose-950/85 text-rose-300 border-rose-500/40'
              : 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            ✕
          </button>
        </div>
      )}

      {/* 1. Unified Stylized Production Stepper Progress Bar */}
      <div className="p-3.5 border-b border-white/[0.06] bg-[#070b10]">
        <ProductionStepper
          domain="botany"
          currentStepId={plant.stage}
          progressPercent={plant.progress}
        />
      </div>

      {/* Main Interactive Stage Canvas (Photorealistic Renderings of 6 Stages) */}
      <div className="relative aspect-video sm:aspect-[21/9] w-full bg-[#03060a] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
        {/* Ambient Grow Light Backlight Glow */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            plant.stage === 'seed'
              ? 'bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_65%)]'
              : plant.stage === 'seedling'
              ? 'bg-[radial-gradient(circle_at_50%_45%,rgba(34,197,94,0.18),transparent_70%)]'
              : plant.stage === 'young_bush'
              ? 'bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.22),transparent_65%)]'
              : plant.stage === 'developing'
              ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(5,150,105,0.25),transparent_70%)]'
              : plant.stage === 'flowering'
              ? 'bg-[radial-gradient(circle_at_50%_35%,rgba(245,158,11,0.24),transparent_65%)]'
              : 'bg-[radial-gradient(circle_at_50%_35%,rgba(249,115,22,0.3),rgba(16,185,129,0.2),transparent_75%)]'
          }`}
        />

        {/* Top Environment HUD Strip */}
        <div className="absolute top-3 inset-x-5 flex items-center justify-between pointer-events-none text-[11px] font-mono text-slate-300 z-10">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              {plant.lightWattage}W LED
            </span>
            <span className="flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              {plant.medium.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {plant.scrogInstalled && (
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-xl text-[10px] font-bold">
                SCROG NET ACTIVE
              </span>
            )}
            <span className="bg-black/70 px-2.5 py-1 rounded-xl border border-white/10 text-slate-300 backdrop-blur-md">
              pH: <strong className="text-emerald-400">{plant.nutrients.ph.toFixed(1)}</strong>
            </span>
          </div>
        </div>

        {/* 6 Ultra-Detailed Botanical Vector Visual Models */}
        <div className="relative z-10 w-full h-full max-w-lg mx-auto flex items-center justify-center p-3">
          {/* STAGE 1: SEED (0-15%) - DETAILED SUBSTRATE CROSS-SECTION & SPROUTING TAPROOT */}
          {plant.stage === 'seed' && (
            <svg viewBox="0 0 320 200" className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
              <defs>
                <radialGradient id="soilCut" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#3b2111" />
                  <stop offset="60%" stopColor="#24140a" />
                  <stop offset="100%" stopColor="#0f0804" />
                </radialGradient>
                <linearGradient id="rootGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#86efac" />
                </linearGradient>
              </defs>

              {/* Smart Fabric Pot Rim */}
              <polygon points="40,90 280,90 255,185 65,185" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              {/* Organic Soil Surface with Perlite Granules */}
              <ellipse cx="160" cy="92" rx="115" ry="26" fill="url(#soilCut)" stroke="#451a03" strokeWidth="1" />
              {/* White Perlite nodules */}
              <circle cx="95" cy="88" r="3" fill="#f8fafc" />
              <circle cx="130" cy="98" r="2.5" fill="#e2e8f0" />
              <circle cx="210" cy="86" r="3.2" fill="#f8fafc" />
              <circle cx="235" cy="96" r="2.8" fill="#e2e8f0" />

              {/* Seed Hole in Humus */}
              <ellipse cx="160" cy="92" rx="28" ry="12" fill="#140a05" />

              {/* Cracked Cannabis Seed Achene Shell */}
              <g transform="translate(160, 88)">
                <ellipse cx="-4" cy="0" rx="8" ry="6" fill="#854d0e" stroke="#a16207" strokeWidth="1" transform="rotate(-15)" />
                <ellipse cx="4" cy="0" rx="7" ry="5.5" fill="#713f12" stroke="#522b07" strokeWidth="1" transform="rotate(20)" />
                {/* Golden Embryo inside */}
                <circle cx="0" cy="0" r="3.5" fill="#fef08a" />
              </g>

              {/* Emerging White Taproot piercing down with micro-hair curves */}
              <path d="M 160 92 Q 163 115 158 135 Q 155 150 162 165" stroke="url(#rootGrad)" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              {/* Fine root hairs */}
              <path d="M 160 115 Q 150 118 145 125" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.8" />
              <path d="M 158 135 Q 170 140 176 148" stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.8" />
              <circle cx="162" cy="165" r="2.2" fill="#34d399" />
            </svg>
          )}

          {/* STAGE 2: SEEDLING (15-35%) - LIME STEM, COTYLEDONS & SERRATED TRUE LEAVES WITH DEW */}
          {plant.stage === 'seedling' && (
            <svg viewBox="0 0 320 200" className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
              <defs>
                <linearGradient id="limeStem" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#a7f3d0" />
                  <stop offset="60%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Soil Base */}
              <ellipse cx="160" cy="165" rx="100" ry="22" fill="#29160c" stroke="#451a03" strokeWidth="1" />
              <circle cx="130" cy="162" r="2.5" fill="#f8fafc" />
              <circle cx="190" cy="166" r="3" fill="#f8fafc" />

              {/* Slender Curved Lime Stem */}
              <path d="M 160 160 Q 157 125 160 90" stroke="url(#limeStem)" strokeWidth="6" strokeLinecap="round" fill="none" />

              {/* Plump Rounded Cotyledon Baby Leaves */}
              <ellipse cx="148" cy="90" rx="16" ry="9" fill="#10b981" stroke="#059669" strokeWidth="1" transform="rotate(-22 148 90)" />
              <ellipse cx="172" cy="90" rx="16" ry="9" fill="#059669" stroke="#047857" strokeWidth="1" transform="rotate(22 172 90)" />

              {/* First Pair of Jagged Serrated True Leaves */}
              <path d="M 160 86 Q 120 65 110 55 Q 135 75 160 84" fill="#34d399" stroke="#059669" strokeWidth="1.2" />
              <path d="M 160 86 Q 200 65 210 55 Q 185 75 160 84" fill="#10b981" stroke="#047857" strokeWidth="1.2" />
              {/* Emerging Micro Sprout */}
              <path d="M 160 82 Q 160 55 158 48 Q 163 65 160 82" fill="#6ee7b7" />

              {/* Dew Drops with Specular Reflection */}
              <circle cx="114" cy="58" r="2.5" fill="#e0f2fe" opacity="0.95" />
              <circle cx="204" cy="62" r="2.2" fill="#e0f2fe" opacity="0.9" />
            </svg>
          )}

          {/* STAGE 3: YOUNG BUSH (35-55%) - STRUCTURED BRANCHES & SERRATED FAN LEAVES */}
          {plant.stage === 'young_bush' && (
            <svg viewBox="0 0 340 210" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
              {/* Woody Stalk with Inter-nodes */}
              <path d="M 170 200 Q 168 135 170 70" stroke="#15803d" strokeWidth="8" strokeLinecap="round" fill="none" />
              {/* Node rings */}
              <line x1="166" y1="150" x2="174" y2="150" stroke="#14532d" strokeWidth="3" />
              <line x1="166" y1="110" x2="174" y2="110" stroke="#14532d" strokeWidth="3" />

              {/* Lateral Branches */}
              <path d="M 170 150 Q 130 135 105 115" stroke="#166534" strokeWidth="5" strokeLinecap="round" fill="none" />
              <path d="M 170 140 Q 210 125 235 105" stroke="#166534" strokeWidth="5" strokeLinecap="round" fill="none" />

              {/* Left Fan Leaf Cluster */}
              <g transform="translate(105, 115) rotate(-35)">
                <path d="M 0 0 Q -35 -15 -60 0 Q -30 15 0 0" fill="#22c55e" />
                <path d="M 0 0 Q -40 -30 -65 -15 Q -30 -5 0 0" fill="#16a34a" />
                <path d="M 0 0 Q -20 -40 -45 -35 Q -18 -15 0 0" fill="#15803d" />
                <path d="M 0 0 Q -5 -45 -25 -55 Q -5 -25 0 0" fill="#22c55e" />
              </g>

              {/* Right Fan Leaf Cluster */}
              <g transform="translate(235, 105) rotate(35)">
                <path d="M 0 0 Q 35 -15 60 0 Q 30 15 0 0" fill="#22c55e" />
                <path d="M 0 0 Q 40 -30 65 -15 Q 30 -5 0 0" fill="#16a34a" />
                <path d="M 0 0 Q 20 -40 45 -35 Q 18 -15 0 0" fill="#15803d" />
                <path d="M 0 0 Q 5 -45 25 -55 Q 5 -25 0 0" fill="#22c55e" />
              </g>

              {/* Center Canopy Sprout */}
              <g transform="translate(170, 70)">
                <path d="M 0 0 Q -30 -35 -40 -55 Q -15 -30 0 0" fill="#4ade80" />
                <path d="M 0 0 Q 30 -35 40 -55 Q 15 -30 0 0" fill="#4ade80" />
                <path d="M 0 0 Q 0 -50 0 -70 Q 8 -40 0 0" fill="#86efac" />
              </g>
            </svg>
          )}

          {/* STAGE 4: DEVELOPING PLANT (55-75%) - DENSE MULTI-LAYERED 7-FINGER CANOPY */}
          {plant.stage === 'developing' && (
            <svg viewBox="0 0 350 220" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.92)]">
              {/* Heavy Trunk */}
              <path d="M 175 205 L 175 55" stroke="#166534" strokeWidth="10" strokeLinecap="round" />

              {/* Overlapping Deep Foliage Layers */}
              <g fill="#14532d">
                <ellipse cx="115" cy="145" rx="42" ry="24" transform="rotate(-25 115 145)" />
                <ellipse cx="235" cy="145" rx="42" ry="24" transform="rotate(25 235 145)" />
                <ellipse cx="105" cy="100" rx="46" ry="25" transform="rotate(-35 105 100)" />
                <ellipse cx="245" cy="100" rx="46" ry="25" transform="rotate(35 245 100)" />
              </g>

              {/* Mid Layer Vibrant Foliage */}
              <g fill="#15803d">
                <ellipse cx="135" cy="120" rx="38" ry="20" transform="rotate(-15 135 120)" />
                <ellipse cx="215" cy="120" rx="38" ry="20" transform="rotate(15 215 120)" />
                <ellipse cx="145" cy="75" rx="36" ry="18" transform="rotate(-20 145 75)" />
                <ellipse cx="205" cy="75" rx="36" ry="18" transform="rotate(20 205 75)" />
              </g>

              {/* Top Fresh Canopy */}
              <g fill="#22c55e">
                <ellipse cx="175" cy="45" rx="30" ry="18" fill="#4ade80" />
                <ellipse cx="150" cy="55" rx="25" ry="14" transform="rotate(-20 150 55)" />
                <ellipse cx="200" cy="55" rx="25" ry="14" transform="rotate(20 200 55)" />
              </g>

              {/* Leaf Veins detailing */}
              <line x1="175" y1="75" x2="140" y2="60" stroke="#16a34a" strokeWidth="1.5" />
              <line x1="175" y1="75" x2="210" y2="60" stroke="#16a34a" strokeWidth="1.5" />
            </svg>
          )}

          {/* STAGE 5: MATURE FLOWERING (75-95%) - SWELLING CALYXES, WHITE STIGMAS & EARLY RESIN */}
          {plant.stage === 'flowering' && (
            <svg viewBox="0 0 350 220" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]">
              <path d="M 175 205 L 175 45" stroke="#166534" strokeWidth="10" strokeLinecap="round" />

              {/* Swelling Colas Clusters */}
              <ellipse cx="175" cy="150" rx="38" ry="28" fill="#15803d" />
              <ellipse cx="175" cy="105" rx="42" ry="32" fill="#14532d" />
              <ellipse cx="175" cy="65" rx="35" ry="35" fill="#15803d" />

              {/* Sugar Leaves radiating from buds */}
              <path d="M 135 105 Q 90 95 95 75 Q 120 90 135 105" fill="#166534" stroke="#052e16" strokeWidth="1" />
              <path d="M 215 105 Q 260 95 255 75 Q 230 90 215 105" fill="#166534" stroke="#052e16" strokeWidth="1" />

              {/* Cream and White Stigmas (Pistil Hairs) */}
              <path d="M 160 100 Q 135 90 125 105" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 190 100 Q 215 90 225 105" stroke="#fef08a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 170 65 Q 145 50 135 60" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 180 65 Q 205 50 215 60" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M 175 45 Q 165 25 178 20" stroke="#ffffff" strokeWidth="2.5" fill="none" strokeLinecap="round" />

              {/* Diamond crystalline resin spots */}
              <circle cx="160" cy="85" r="2.2" fill="#ffffff" />
              <circle cx="190" cy="85" r="2.2" fill="#ffffff" />
              <circle cx="175" cy="98" r="2.5" fill="#f8fafc" />
              <circle cx="165" cy="140" r="2.0" fill="#ffffff" />
              <circle cx="185" cy="140" r="2.0" fill="#ffffff" />
            </svg>
          )}

          {/* STAGE 6: READY HARVEST (95-100%) - LEGENDARY CURED BUD COLA WITH AMBER RESIN & ORANGE PISTILS */}
          {plant.stage === 'ready_harvest' && (
            <svg viewBox="0 0 360 230" className="w-full h-full filter drop-shadow-[0_15px_40px_rgba(0,0,0,0.98)]">
              <defs>
                <radialGradient id="harvestCoreBud" cx="45%" cy="38%" r="60%">
                  <stop offset="0%" stopColor="#15803d" />
                  <stop offset="45%" stopColor="#14532d" />
                  <stop offset="85%" stopColor="#052e16" />
                  <stop offset="100%" stopColor="#021c0b" />
                </radialGradient>
                <filter id="trichomeShine">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <g transform="translate(180, 115)">
                {/* Heavy Bottom Calyx Clumps */}
                <ellipse cx="-40" cy="45" rx="35" ry="28" fill="url(#harvestCoreBud)" />
                <ellipse cx="40" cy="45" rx="35" ry="28" fill="url(#harvestCoreBud)" />
                <ellipse cx="0" cy="50" rx="44" ry="30" fill="url(#harvestCoreBud)" />

                {/* Mid Tier Dense Buds */}
                <ellipse cx="-30" cy="10" rx="40" ry="32" fill="url(#harvestCoreBud)" />
                <ellipse cx="30" cy="10" rx="40" ry="32" fill="url(#harvestCoreBud)" />
                <ellipse cx="0" cy="-5" rx="48" ry="36" fill="url(#harvestCoreBud)" />

                {/* Top Crown Apex */}
                <ellipse cx="-15" cy="-55" rx="30" ry="26" fill="url(#harvestCoreBud)" />
                <ellipse cx="15" cy="-55" rx="30" ry="26" fill="url(#harvestCoreBud)" />
                <ellipse cx="0" cy="-70" rx="28" ry="25" fill="url(#harvestCoreBud)" />

                {/* Sugar Leaves protruding */}
                <path d="M -45 -15 Q -85 -30 -75 -10 Q -50 0 -45 -15" fill="#14532d" stroke="#052e16" strokeWidth="1" />
                <path d="M 45 -15 Q 85 -30 75 -10 Q 50 0 45 -15" fill="#14532d" stroke="#052e16" strokeWidth="1" />

                {/* Fiery Burnt Orange & Copper Pistil Spirals */}
                <path d="M -28 -70 Q -48 -95 -32 -100 Q -22 -90 -25 -70" stroke="#ea580c" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M 28 -70 Q 48 -95 32 -100 Q 22 -90 25 -70" stroke="#f97316" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M -38 -20 Q -70 -35 -60 -15 Q -45 -5 -38 -20" stroke="#c2410c" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 38 -20 Q 70 -35 60 -15 Q 45 -5 38 -20" stroke="#ea580c" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M 0 -30 Q -30 -15 -18 15" stroke="#f97316" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M 12 25 Q 40 40 18 55" stroke="#c2410c" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                <path d="M -15 25 Q -40 40 -18 55" stroke="#ea580c" strokeWidth="2.8" fill="none" strokeLinecap="round" />

                {/* Intense Frosting of Milky and Warm Amber Trichomes */}
                <circle cx="-18" cy="-68" r="2.8" fill="#ffffff" filter="url(#trichomeShine)" />
                <circle cx="18" cy="-68" r="2.8" fill="#fef3c7" filter="url(#trichomeShine)" />
                <circle cx="0" cy="-50" r="3.4" fill="#ffffff" filter="url(#trichomeShine)" />
                <circle cx="-28" cy="-35" r="3.0" fill="#fde68a" filter="url(#trichomeShine)" />
                <circle cx="28" cy="-35" r="3.0" fill="#ffffff" filter="url(#trichomeShine)" />
                <circle cx="-12" cy="-8" r="3.6" fill="#ffffff" filter="url(#trichomeShine)" />
                <circle cx="18" cy="-12" r="3.2" fill="#fde68a" filter="url(#trichomeShine)" />
                <circle cx="-38" cy="18" r="3.0" fill="#f8fafc" filter="url(#trichomeShine)" />
                <circle cx="38" cy="18" r="3.0" fill="#fef3c7" filter="url(#trichomeShine)" />
                <circle cx="0" cy="28" r="3.6" fill="#ffffff" filter="url(#trichomeShine)" />
                <circle cx="-20" cy="50" r="2.8" fill="#fde68a" filter="url(#trichomeShine)" />
                <circle cx="20" cy="50" r="2.8" fill="#ffffff" filter="url(#trichomeShine)" />
              </g>
            </svg>
          )}
        </div>

        {/* Floating Stage Badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2 z-10">
          <span className="px-3.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-xs font-mono font-bold text-emerald-400 flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            {stageConfig.nameRu}
          </span>
          <span className="px-2.5 py-1.5 rounded-xl bg-black/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
            {Math.round(plant.progress)}%
          </span>
        </div>

        {/* Status Pill */}
        <div className="absolute bottom-3 right-4 z-10">
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold shadow-lg ${conditionInfo.color}`}>
            {conditionInfo.label}
          </span>
        </div>
      </div>

      {/* Random Event Alert Banner */}
      {plant.activeEvent && (
        <div className="p-4 bg-amber-500/10 border-b border-amber-500/30 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-amber-300">{plant.activeEvent.title}: </span>
              <span className="text-slate-300">{plant.activeEvent.description}</span>
            </div>
          </div>
          <button
            onClick={handleResolveProblem}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-colors cursor-pointer shadow"
          >
            {plant.activeEvent.actionRequired || 'Устранить проблему'}
          </button>
        </div>
      )}

      {/* Main Interactive Controls & Dashboard */}
      <div className="p-6 space-y-6">
        {/* Plant Vital Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {/* Health Gauge */}
          <div className="p-3.5 rounded-2xl bg-[#090d14] border border-white/[0.08] space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Здоровье:</span>
              <strong className="text-emerald-400">{plant.health}%</strong>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  plant.health >= 80 ? 'bg-emerald-400' : plant.health >= 50 ? 'bg-amber-400' : 'bg-rose-500'
                }`}
                style={{ width: `${plant.health}%` }}
              />
            </div>
          </div>

          {/* Moisture Gauge */}
          <div className="p-3.5 rounded-2xl bg-[#090d14] border border-white/[0.08] space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Влажность:</span>
              <strong className={plant.moisture >= 50 && plant.moisture <= 75 ? 'text-cyan-400' : 'text-amber-400'}>
                {Math.round(plant.moisture)}%
              </strong>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(100, plant.moisture)}%` }}
              />
            </div>
          </div>

          {/* Soil/Substrate Quality */}
          <div className="p-3.5 rounded-2xl bg-[#090d14] border border-white/[0.08] space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Питание почвы:</span>
              <strong className="text-slate-200">{plant.soilQuality}%</strong>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${plant.soilQuality}%` }}
              />
            </div>
          </div>

          {/* Purity & Cannabinoids */}
          <div className="p-3.5 rounded-2xl bg-[#090d14] border border-white/[0.08] space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Смола / Purity:</span>
              <strong className="text-purple-400">{plant.purity}%</strong>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-300"
                style={{ width: `${plant.purity}%` }}
              />
            </div>
          </div>
        </div>

        {/* Supplies Quick Bar */}
        <div className="p-3 rounded-2xl bg-[#070b12] border border-white/5 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400">Склад:</span>
            <span className="flex items-center gap-1 text-cyan-300">
              <Droplets className="w-3 h-3" />
              {gameState.inventory.purifiedWaterLitres}L RO
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <Sparkles className="w-3 h-3" />
              {gameState.inventory.nutrientVegMl}ml N
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Sparkles className="w-3 h-3" />
              {gameState.inventory.nutrientBloomMl}ml PK
            </span>
            <span className="flex items-center gap-1 text-purple-300">
              <Sparkles className="w-3 h-3" />
              {gameState.inventory.nutrientOrganicMl}ml Bio
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <ShieldAlert className="w-3 h-3" />
              {gameState.inventory.neemOilMl}ml Ним
            </span>
          </div>

          <button
            onClick={onOpenGrowShop}
            className="px-3 py-1 bg-white/5 hover:bg-white/10 text-emerald-400 font-bold rounded-lg border border-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Гроушоп</span>
          </button>
        </div>

        {/* Action Buttons Bar with Resource Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {/* Water Button */}
          <button
            onClick={handleWater}
            disabled={plant.moisture >= 92}
            className={`py-3 px-3 rounded-2xl border text-xs font-mono font-bold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              plant.moisture >= 92
                ? 'opacity-40 bg-[#0d121a] border-white/5 cursor-not-allowed text-slate-500'
                : plant.moisture < 45
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 animate-pulse'
                : 'bg-[#121824] hover:bg-[#182130] text-slate-200 border-white/10'
            }`}
          >
            <div className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              <span>Полить</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">
              {gameState.inventory.purifiedWaterLitres >= 1.5 ? '1.5L RO Воды' : '$4 по счетчику ЖКХ'}
            </span>
          </button>

          {/* Inspect Button */}
          <button
            onClick={() => setIsInspectOpen(!isInspectOpen)}
            className="py-3 px-3 rounded-2xl bg-[#121824] hover:bg-[#182130] border border-white/10 text-xs font-mono font-bold text-slate-200 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <Search className="w-3.5 h-3.5 text-amber-400" />
              <span>Диагностика</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Осмотр N-P-K</span>
          </button>

          {/* Feed Nutrients Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsFeedMenuOpen(!isFeedMenuOpen)}
              className="w-full h-full py-3 px-3 rounded-2xl bg-[#121824] hover:bg-[#182130] border border-white/10 text-xs font-mono font-bold text-slate-200 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Подкормить</span>
                <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Выбор формулы</span>
            </button>

            {isFeedMenuOpen && (
              <div className="absolute bottom-full mb-2 left-0 w-64 bg-[#0d131f] border border-white/15 rounded-2xl p-2 shadow-2xl space-y-1 z-20">
                <button
                  onClick={() => handleFeed('veg_nitro')}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/10 text-xs font-mono text-slate-200 cursor-pointer"
                >
                  <div className="font-bold text-emerald-400">1. Азот N-Max (Вега)</div>
                  <div className="text-[10px] text-slate-400">
                    Расход: 25 мл (Остаток: {gameState.inventory.nutrientVegMl} мл)
                  </div>
                </button>
                <button
                  onClick={() => handleFeed('bloom_pk')}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/10 text-xs font-mono text-slate-200 cursor-pointer"
                >
                  <div className="font-bold text-amber-400">2. PK 13/14 Бустер (Цвет)</div>
                  <div className="text-[10px] text-slate-400">
                    Расход: 30 мл (Остаток: {gameState.inventory.nutrientBloomMl} мл)
                  </div>
                </button>
                <button
                  onClick={() => handleFeed('organic_tea')}
                  className="w-full text-left p-2 rounded-xl hover:bg-white/10 text-xs font-mono text-slate-200 cursor-pointer"
                >
                  <div className="font-bold text-cyan-400">3. Органический чай</div>
                  <div className="text-[10px] text-slate-400">
                    Расход: 40 мл (Остаток: {gameState.inventory.nutrientOrganicMl} мл)
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Upgrade Tent Button */}
          <button
            onClick={() => setIsUpgradeOpen(!isUpgradeOpen)}
            className="py-3 px-3 rounded-2xl bg-[#121824] hover:bg-[#182130] border border-white/10 text-xs font-mono font-bold text-slate-200 flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Улучшить</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">Свет, обдув, сетка</span>
          </button>

          {/* Harvest Button (Only when ready) */}
          <button
            onClick={handleHarvest}
            disabled={!isReady}
            className={`col-span-2 sm:col-span-1 py-3 px-3 rounded-2xl font-mono font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-lg ${
              isReady
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-950/50 animate-bounce'
                : 'opacity-40 bg-[#0d121a] border border-white/5 cursor-not-allowed text-slate-500'
            }`}
          >
            <div className="flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5" />
              <span>{isReady ? 'Собрать!' : 'Не готово'}</span>
            </div>
            <span className="text-[10px] font-normal">
              {isReady ? '~65-85g шишек' : `${Math.round(plant.progress)}% созрело`}
            </span>
          </button>
        </div>

        {/* Diagnosis Inspector Panel (If Opened) */}
        {isInspectOpen && (
          <div className="p-4 bg-[#090d14] border border-white/10 rounded-2xl space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 font-bold text-white">
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                Диагностический отчет гровера
              </span>
              <button onClick={() => setIsInspectOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400 block">Общий тонус:</span>
                <span className="text-white font-bold">{inspectData.overallHealth}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Влагообеспечение:</span>
                <span className="text-cyan-400 font-bold">{inspectData.moistureStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Питательный баланс:</span>
                <span className="text-emerald-400 font-bold">{inspectData.nutritionStatus}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Рекомендации по уходу:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-300 text-[11px]">
                {inspectData.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upgrade Modal with Cash Costs (If Opened) */}
        {isUpgradeOpen && (
          <div className="p-4 bg-[#090d14] border border-white/10 rounded-2xl space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center border-b border-white/5 pb-2 font-bold text-white">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" />
                Модернизация гроубокса (Оборудование за $ наличные)
              </span>
              <button onClick={() => setIsUpgradeOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                onClick={() => handleUpgrade(plant.lightWattage === 600 ? 'light_800' : 'light_1000')}
                disabled={plant.lightWattage >= 1000}
                className="p-3 rounded-xl bg-[#121824] hover:bg-[#182130] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-amber-400">
                    {plant.lightWattage === 600 ? '+LED 800W' : '+1000W Pro COB'}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    ${plant.lightWattage === 600 ? 140 : 260}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Текущая: {plant.lightWattage}W. Ускоряет фотосинтез.</div>
              </button>

              <button
                onClick={() => handleUpgrade('clip_fan')}
                className="p-3 rounded-xl bg-[#121824] hover:bg-[#182130] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-cyan-400">+Обдув кроны</span>
                  <span className="text-emerald-400 font-bold">$45</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Укрепляет ствол и предотвращает застой влаги.</div>
              </button>

              <button
                onClick={() => handleUpgrade('scrog_net')}
                disabled={plant.scrogInstalled}
                className="p-3 rounded-xl bg-[#121824] hover:bg-[#182130] border border-white/10 text-left transition-colors cursor-pointer"
              >
                <div className="flex justify-between">
                  <span className="font-bold text-purple-400">Сетка SCROG</span>
                  <span className="text-emerald-400 font-bold">{plant.scrogInstalled ? 'Куплено' : '$30'}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {plant.scrogInstalled ? 'Уже установлена' : '+15% к урожайности за счет распределения кол.'}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* History Action & Event Log */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              История ухода и событий
            </span>
            <span className="text-[10px] text-slate-500">Последние 5 записей</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {(plant.historyLog || []).slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-[#080c12] border border-white/5 text-[11px] font-mono flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    {log.type === 'stage' && <Sprout className="w-3 h-3 text-emerald-400" />}
                    {log.type === 'care' && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                    {log.type === 'warning' && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                    <span>{log.action}</span>
                  </div>
                  <p className="text-slate-400 text-[10px] mt-0.5">{log.result}</p>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
