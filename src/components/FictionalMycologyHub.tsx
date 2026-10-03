import React, { useState, useEffect } from 'react';
import { GameState, FictionalMushroomColony, FictionalGrowthStage } from '../types/game';
import {
  Moon,
  Droplets,
  Wind,
  Zap,
  Sparkles,
  ShoppingBag,
  Plus,
  Scissors,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  PackageCheck,
  TrendingUp,
  Activity,
  Heart,
  Boxes,
  Flame,
  ChevronRight,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

interface FictionalMycologyHubProps {
  gameState: GameState;
  onDeductCash: (amount: number) => void;
  onAddInventory: (itemKey: string, amount: number) => void;
  onUpdateColony: (colonyId: string, updates: Partial<FictionalMushroomColony>) => void;
  onCreateColony: (colony: FictionalMushroomColony) => void;
  onHarvestColony: (colonyId: string, yieldGrams: number) => void;
  onPackageMushrooms: (format: 'craft' | 'microdose' | 'syndicate', count: number, totalCash: number) => void;
  onIngestAstral: () => void;
  language: Language;
}

export const FictionalMycologyHub: React.FC<FictionalMycologyHubProps> = ({
  gameState,
  onDeductCash,
  onAddInventory,
  onUpdateColony,
  onCreateColony,
  onHarvestColony,
  onPackageMushrooms,
  onIngestAstral,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'cultivation' | 'shop' | 'processing'>('cultivation');
  const [selectedColonyId, setSelectedColonyId] = useState<string | null>(null);

  // Active colonies from gameState or local default
  const colonies = gameState.fictionalColonies || [];
  const activeColony = colonies.find((c) => c.id === selectedColonyId) || colonies[0];

  // Auto-select first colony if none selected
  useEffect(() => {
    if (!selectedColonyId && colonies.length > 0) {
      setSelectedColonyId(colonies[0].id);
    }
  }, [colonies, selectedColonyId]);

  // --- 1. SHOP CATALOG (Fictional Resources) ---
  const mycoShopCatalog = [
    {
      key: 'fictionalMyceliumKits',
      nameRu: 'Мицелиевый набор «Астрал»',
      nameEn: 'Astral Mycelium Kit',
      descRu: 'Стерилизованная споровая взвесь высшей биолюминесцентной чистоты.',
      price: 60,
      rarity: 'Редкий',
      rarityColor: 'text-purple-400 border-purple-500/30',
      icon: Moon,
    },
    {
      key: 'nutrientMixAGrams',
      nameRu: 'Питательная смесь A (100г)',
      nameEn: 'Nutrient Mix-A (100g)',
      descRu: 'Обогащенный полисахаридный субстрат для взрывной колонизации гифов.',
      price: 35,
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Boxes,
    },
    {
      key: 'growthStimulantDoses',
      nameRu: 'Стимулятор роста (1 доза)',
      nameEn: 'Growth Stimulant (1 dose)',
      descRu: 'Био-активатор, ускоряющий созревание плодовых тел на +30%.',
      price: 50,
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Zap,
    },
    {
      key: 'fictionalContainers',
      nameRu: 'Герметичный контейнер',
      nameEn: 'Hermetic Monotub Container',
      descRu: 'Специализированный бокс с фильтрационными мембранами и контролем FAE.',
      price: 80,
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Moon,
    },
    {
      key: 'environmentStabilizers',
      nameRu: 'Стабилизатор среды (1 шт.)',
      nameEn: 'Environment Stabilizer (1 unit)',
      descRu: 'Мгновенно нейтрализует любые проблемы микроклимата и патогены.',
      price: 45,
      rarity: 'Редкий',
      rarityColor: 'text-amber-400 border-amber-500/30',
      icon: Droplets,
    },
  ];

  const handleBuyShopItem = (item: (typeof mycoShopCatalog)[0]) => {
    if (gameState.cash < item.price) {
      sounds.playAlarmBeep();
      return;
    }
    onDeductCash(item.price);
    sounds.playCash();
    const addAmt = item.key === 'nutrientMixAGrams' ? 100 : 1;
    onAddInventory(item.key, addAmt);
  };

  // --- 2. SOWING / PLANTING A NEW COLONY ---
  const handlePlantNewColony = () => {
    const inv = gameState.inventory;
    if (
      (inv.fictionalMyceliumKits || 0) < 1 ||
      (inv.nutrientMixAGrams || 0) < 50 ||
      (inv.fictionalContainers || 0) < 1
    ) {
      sounds.playAlarmBeep();
      return;
    }

    sounds.playClick();
    onAddInventory('fictionalMyceliumKits', -1);
    onAddInventory('nutrientMixAGrams', -50);
    onAddInventory('fictionalContainers', -1);

    const newId = `colony_${Date.now()}`;
    const newColony: FictionalMushroomColony = {
      id: newId,
      name: `Колония «Астрал #${colonies.length + 1}»`,
      stage: 'spore_inception',
      progress: 5,
      health: 100,
      growthRateMultiplier: 1.0,
      stability: 95,
      qualityScore: 94,
      rarityTier: Math.random() < 0.25 ? 'Редкий' : 'Необычный',
      humidityLevel: 92,
      aerationLevel: 78,
      expectedYieldGrams: 85,
      activeIssue: null,
      dayPlanted: gameState.day,
    };

    onCreateColony(newColony);
    setSelectedColonyId(newId);
    setActiveTab('cultivation');
  };

  // --- 3. CARE & MAINTENANCE ACTIONS ---
  const handleCheckVitals = (colony: FictionalMushroomColony) => {
    sounds.playClick();
    onUpdateColony(colony.id, {
      stability: Math.min(100, colony.stability + 4),
      qualityScore: Math.min(99, colony.qualityScore + 2),
    });
  };

  const handleImproveConditions = (colony: FictionalMushroomColony) => {
    sounds.playPsychedelicChime();
    onUpdateColony(colony.id, {
      humidityLevel: 93,
      aerationLevel: 80,
      health: Math.min(100, colony.health + 10),
      stability: Math.min(100, colony.stability + 8),
    });
  };

  const handleFixIssueWithStabilizer = (colony: FictionalMushroomColony) => {
    const stabilizers = gameState.inventory.environmentStabilizers || 0;
    if (stabilizers <= 0) {
      sounds.playAlarmBeep();
      return;
    }
    sounds.playOverrideSuccess();
    onAddInventory('environmentStabilizers', -1);
    onUpdateColony(colony.id, {
      activeIssue: null,
      health: 100,
      stability: 96,
    });
  };

  const handleBoostGrowthWithStimulant = (colony: FictionalMushroomColony) => {
    const stimulants = gameState.inventory.growthStimulantDoses || 0;
    if (stimulants <= 0) {
      sounds.playAlarmBeep();
      return;
    }
    sounds.playResonanceLock();
    onAddInventory('growthStimulantDoses', -1);

    const nextProg = Math.min(100, colony.progress + 30);
    let nextStage: FictionalGrowthStage = colony.stage;
    if (nextProg >= 100) nextStage = 'ready_harvest';
    else if (nextProg >= 80) nextStage = 'mature_flush';
    else if (nextProg >= 60) nextStage = 'pinheads_emerging';
    else if (nextProg >= 40) nextStage = 'colony_formation';
    else if (nextProg >= 20) nextStage = 'young_hyphae';

    onUpdateColony(colony.id, {
      progress: nextProg,
      stage: nextStage,
      growthRateMultiplier: 1.8,
      qualityScore: Math.min(100, colony.qualityScore + 3),
    });
  };

  // --- 4. HARVEST ACTION ---
  const handleHarvestCurrentColony = (colony: FictionalMushroomColony) => {
    sounds.playTriumphFanfare();
    const qualityMult = colony.qualityScore / 90;
    const finalGrams = Math.round(colony.expectedYieldGrams * qualityMult);

    onHarvestColony(colony.id, finalGrams);
    onAddInventory('astralMushroomsRawGrams', finalGrams);
    setActiveTab('processing');
  };

  // --- 5. PROCESSING & PACKAGING LOGIC ---
  const [dryerRunning, setDryerRunning] = useState<boolean>(false);
  const [dryerProgress, setDryerProgress] = useState<number>(0);
  const [grinderProgress, setGrinderProgress] = useState<number>(0);
  const [selectedPackFormat, setSelectedPackFormat] = useState<'craft' | 'microdose' | 'syndicate'>('microdose');

  const rawGramsInStock = gameState.inventory.astralMushroomsRawGrams || 0;

  const handleRunVacuumFreezeDryer = () => {
    if (rawGramsInStock < 25) {
      sounds.playAlarmBeep();
      return;
    }
    sounds.playLabReaction();
    setDryerRunning(true);
    setDryerProgress(0);

    const interval = setInterval(() => {
      setDryerProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDryerRunning(false);
          sounds.playResonanceLock();
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleFinishPackaging = () => {
    sounds.playCash();
    let units = 0;
    let cashVal = 0;
    let rawConsumed = 0;

    if (selectedPackFormat === 'craft') {
      units = Math.max(1, Math.floor(rawGramsInStock / 5));
      cashVal = units * 140;
      rawConsumed = units * 5;
      onPackageMushrooms('craft', units, cashVal);
    } else if (selectedPackFormat === 'microdose') {
      units = Math.max(1, Math.floor(rawGramsInStock / 25));
      cashVal = units * 680;
      rawConsumed = units * 25;
      onPackageMushrooms('microdose', units, cashVal);
    } else {
      units = Math.max(1, Math.floor(rawGramsInStock / 100));
      cashVal = units * 2850;
      rawConsumed = units * 100;
      onPackageMushrooms('syndicate', units, cashVal);
    }

    onAddInventory('astralMushroomsRawGrams', -rawConsumed);
    setDryerProgress(0);
    setGrinderProgress(0);
  };

  // Visual SVG Stage Illustration helper
  const renderColonyStageIllustration = (stage: FictionalGrowthStage) => {
    return (
      <svg viewBox="0 0 320 200" className="w-full h-full filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
        <defs>
          <radialGradient id="astralShroomGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#a855f7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Monotub Substrate Bed */}
        <rect x="30" y="130" width="260" height="50" rx="8" fill="#171226" stroke="#4c1d95" strokeWidth="2" />
        <rect x="35" y="135" width="250" height="20" rx="4" fill="#2e1065" opacity="0.6" />

        {/* 1. Spore Inception */}
        {stage === 'spore_inception' && (
          <g>
            <circle cx="80" cy="142" r="3" fill="#22d3ee" className="animate-pulse" />
            <circle cx="120" cy="146" r="4" fill="#a855f7" />
            <circle cx="160" cy="140" r="3.5" fill="#22d3ee" className="animate-pulse" />
            <circle cx="200" cy="144" r="4" fill="#38bdf8" />
            <circle cx="240" cy="141" r="3" fill="#c084fc" />
          </g>
        )}

        {/* 2. Young Hyphae */}
        {stage === 'young_hyphae' && (
          <g stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none">
            <path d="M 70,140 Q 80,125 90,140" />
            <path d="M 120,140 Q 135,120 145,140" />
            <path d="M 170,140 Q 180,118 195,140" />
            <path d="M 220,140 Q 235,122 250,140" />
          </g>
        )}

        {/* 3. Colony Formation (Dense mycelial blanket) */}
        {stage === 'colony_formation' && (
          <g>
            <rect x="40" y="132" width="240" height="15" rx="6" fill="#06b6d4" opacity="0.7" filter="blur(2px)" />
            <path d="M 45,134 Q 100,126 160,132 Q 220,125 275,134" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.8" />
          </g>
        )}

        {/* 4. Pinheads Emerging */}
        {stage === 'pinheads_emerging' && (
          <g>
            {/* Small pins */}
            <rect x="85" y="115" width="8" height="20" rx="4" fill="#f1f5f9" />
            <ellipse cx="89" cy="113" rx="8" ry="5" fill="#f59e0b" />

            <rect x="145" y="110" width="10" height="25" rx="5" fill="#f1f5f9" />
            <ellipse cx="150" cy="108" rx="10" ry="6" fill="#ec4899" />

            <rect x="215" y="118" width="7" height="17" rx="3.5" fill="#f1f5f9" />
            <ellipse cx="218" cy="116" rx="7" ry="4.5" fill="#06b6d4" />
          </g>
        )}

        {/* 5. Mature Flush & 6. Ready Harvest */}
        {(stage === 'mature_flush' || stage === 'ready_harvest') && (
          <g>
            {/* Ambient Bioluminescent Halo */}
            <circle cx="160" cy="90" r="70" fill="url(#astralShroomGlow)" />

            {/* Left Big Mushroom */}
            <path d="M 90,135 Q 98,80 102,65" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" fill="none" />
            <ellipse cx="103" cy="62" rx="28" ry="16" fill="#06b6d4" stroke="#67e8f9" strokeWidth="2" />
            <ellipse cx="103" cy="56" rx="18" ry="9" fill="#38bdf8" />
            <circle cx="95" cy="58" r="2.5" fill="#ffffff" />
            <circle cx="112" cy="62" r="2.5" fill="#ffffff" />

            {/* Center Giant Astral Shroom */}
            <path d="M 155,135 Q 160,65 162,45" stroke="#f8fafc" strokeWidth="16" strokeLinecap="round" fill="none" />
            <ellipse cx="162" cy="42" rx="38" ry="20" fill="#a855f7" stroke="#e9d5ff" strokeWidth="2.5" />
            <ellipse cx="162" cy="35" rx="24" ry="11" fill="#c084fc" />
            <circle cx="150" cy="38" r="3" fill="#fef08a" />
            <circle cx="174" cy="40" r="3" fill="#fef08a" />
            <circle cx="162" cy="30" r="2.5" fill="#ffffff" />

            {/* Right Medium Shroom */}
            <path d="M 225,135 Q 220,85 218,72" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" fill="none" />
            <ellipse cx="217" cy="70" rx="24" ry="13" fill="#ec4899" stroke="#fbcfe8" strokeWidth="2" />
            <ellipse cx="217" cy="65" rx="14" ry="7" fill="#f472b6" />
            <circle cx="210" cy="66" r="2" fill="#ffffff" />
            <circle cx="224" cy="68" r="2" fill="#ffffff" />

            {/* Glowing Spore Dust (For Ready Harvest) */}
            {stage === 'ready_harvest' && (
              <g fill="#22d3ee" className="animate-pulse">
                <circle cx="130" cy="35" r="2" />
                <circle cx="190" cy="28" r="2.5" />
                <circle cx="145" cy="85" r="1.8" />
                <circle cx="185" cy="75" r="2" />
                <circle cx="110" cy="25" r="2.2" />
                <circle cx="230" cy="50" r="1.8" />
              </g>
            )}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                [МИКОЛОГИЧЕСКИЙ СИМУЛЯТОР «АСТРАЛ»]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {colonies.length} Активных колоний
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Выращивание вымышленных психоактивных грибов
            </h1>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b0e14] p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveTab('cultivation')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-bold ${
              activeTab === 'cultivation'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1. Культивация
          </button>
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-bold ${
              activeTab === 'shop'
                ? 'bg-purple-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Магазин ресурсов
          </button>
          <button
            onClick={() => setActiveTab('processing')}
            className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-bold ${
              activeTab === 'processing'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            3. Обработка и фасовка
          </button>
        </div>
      </div>

      {/* --- TAB 1: CULTIVATION & CARE --- */}
      {activeTab === 'cultivation' && (
        <div className="space-y-4">
          {colonies.length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center space-y-4 bg-[#090d14]">
              <Moon className="w-10 h-10 text-cyan-400/60 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">Монотубы пусты</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Купите ресурсы в магазине или воспользуйтесь стартовым набором, чтобы засеять новую колонию психоактивных грибов «Астрал».
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('shop')}
                  className="py-2.5 px-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Купить сырьё в магазине</span>
                </button>
                <button
                  onClick={handlePlantNewColony}
                  className="py-2.5 px-6 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Засеять первую колонию</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left Column: Colony List & New Colony Button */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Список колоний:</span>
                  <button
                    onClick={handlePlantNewColony}
                    className="py-1 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Новый посев</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {colonies.map((colony) => {
                    const isSelected = colony.id === (activeColony ? activeColony.id : null);
                    const isReady = colony.stage === 'ready_harvest';

                    return (
                      <div
                        key={colony.id}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedColonyId(colony.id);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-[#101724] border-cyan-500 shadow-lg ring-1 ring-cyan-500/30'
                            : 'bg-[#0a0f16] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{colony.name}</span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            colony.rarityTier === 'Мифический' ? 'text-amber-400 border-amber-500/30' : 'text-cyan-400 border-cyan-500/30'
                          }`}>
                            {colony.rarityTier}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span>Стадия: <strong className="text-cyan-300 capitalize">{colony.stage.replace('_', ' ')}</strong></span>
                          <span>{Math.round(colony.progress)}%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-white/10">
                          <div
                            className={`h-full transition-all ${
                              isReady ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-cyan-400'
                            }`}
                            style={{ width: `${colony.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Colony Viewport & Care Actions */}
              {activeColony && (
                <div className="lg:col-span-2 bg-[#0b1017] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl space-y-0">
                  {/* Visual Stage Canvas */}
                  <div className="relative aspect-[21/9] w-full bg-[#03060a] overflow-hidden flex items-center justify-center border-b border-white/[0.06]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.15),transparent_65%)] pointer-events-none" />

                    {/* HUD Badges */}
                    <div className="absolute top-2.5 inset-x-4 flex items-center justify-between pointer-events-none text-[10px] font-mono text-slate-300 z-10">
                      <span className="flex items-center gap-1.5 bg-black/75 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        {activeColony.name}
                      </span>
                      <span className="bg-black/75 px-2.5 py-1 rounded-lg border border-white/10 text-emerald-400 font-bold">
                        Качество: {activeColony.qualityScore}% · ~{activeColony.expectedYieldGrams}г
                      </span>
                    </div>

                    {/* SVG Visual Stage Drawing */}
                    <div className="relative z-10 w-full h-full max-w-sm mx-auto flex items-center justify-center p-2">
                      {renderColonyStageIllustration(activeColony.stage)}
                    </div>

                    {/* Active Issue Warning Banner */}
                    {activeColony.activeIssue && (
                      <div className="absolute bottom-2 inset-x-4 p-2 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs font-mono text-rose-300 flex items-center justify-between backdrop-blur-md">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>{activeColony.activeIssue.title}: {activeColony.activeIssue.description}</span>
                        </div>
                        <button
                          onClick={() => handleFixIssueWithStabilizer(activeColony)}
                          className="px-2.5 py-1 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-lg cursor-pointer text-[10px]"
                        >
                          Устранить стабилизатором
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Vitals Telemetry Indicators */}
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                      <div className="p-2.5 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-rose-400" /> Здоровье:
                        </span>
                        <div className="text-base font-bold text-rose-400">{activeColony.health}%</div>
                      </div>

                      <div className="p-2.5 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-400" /> Скорость роста:
                        </span>
                        <div className="text-base font-bold text-cyan-400">{activeColony.growthRateMultiplier.toFixed(1)}x</div>
                      </div>

                      <div className="p-2.5 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Droplets className="w-3 h-3 text-emerald-400" /> Стабильность:
                        </span>
                        <div className="text-base font-bold text-emerald-400">{activeColony.stability}%</div>
                      </div>

                      <div className="p-2.5 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-400" /> Качество:
                        </span>
                        <div className="text-base font-bold text-purple-400">{activeColony.qualityScore}%</div>
                      </div>
                    </div>

                    {/* Interactive Care Actions Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => handleCheckVitals(activeColony)}
                        className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-slate-200 cursor-pointer active:scale-95 transition-all"
                      >
                        1. Проверить мицелий
                      </button>

                      <button
                        onClick={() => handleImproveConditions(activeColony)}
                        className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 cursor-pointer active:scale-95 transition-all"
                      >
                        2. Туман & Аэрация
                      </button>

                      <button
                        onClick={() => handleFixIssueWithStabilizer(activeColony)}
                        className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-mono font-bold text-amber-300 cursor-pointer active:scale-95 transition-all"
                      >
                        3. Стабилизатор среды
                      </button>

                      <button
                        onClick={() => handleBoostGrowthWithStimulant(activeColony)}
                        className="py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-xs font-mono font-bold text-purple-300 cursor-pointer active:scale-95 transition-all"
                      >
                        4. Стимулятор (+30%)
                      </button>
                    </div>

                    {/* Harvest Button when ready */}
                    {activeColony.progress >= 100 && (
                      <button
                        onClick={() => handleHarvestCurrentColony(activeColony)}
                        className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-bounce"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Собрать спелый урожай грибов (~{activeColony.expectedYieldGrams}г на переработку)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: MYCOLOGY SHOP --- */}
      {activeTab === 'shop' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold font-mono">
              <ShoppingBag className="w-4 h-4" />
              <span>2. Магазин специализированных микологических ресурсов</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mycoShopCatalog.map((item) => {
              const Icon = item.icon;
              const invCount = (gameState.inventory as Record<string, number>)[item.key] || 0;
              const canAfford = gameState.cash >= item.price;

              return (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-[#080c13] border border-white/10 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.rarityColor}`}>
                        {item.rarity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        На складе: <strong className="text-white">{invCount}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs leading-tight">{item.nameRu}</div>
                        <div className="text-[10px] font-sans text-slate-400 mt-0.5">{item.descRu}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="text-sm font-mono font-bold text-purple-300">
                      ${item.price}
                    </div>

                    <button
                      onClick={() => handleBuyShopItem(item)}
                      disabled={!canAfford}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Купить
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: PROCESSING & PACKAGING LAB --- */}
      {activeTab === 'processing' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold font-mono">
              <PackageCheck className="w-4 h-4" />
              <span>3. Обработка и фасовка: Сублимационная сушка и крафт упаковок</span>
            </div>
            <span className="text-xs font-mono text-slate-300">
              Сырых грибов на складе: <strong className="text-cyan-400">{rawGramsInStock}г</strong>
            </span>
          </div>

          {/* Freeze Dryer Section */}
          <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Этап 1: Вакуумная сублимационная сушка (25г минимум):</span>
              <strong className="text-cyan-400">{dryerProgress}%</strong>
            </div>

            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-cyan-400 transition-all duration-200"
                style={{ width: `${dryerProgress}%` }}
              />
            </div>

            <button
              onClick={handleRunVacuumFreezeDryer}
              disabled={dryerRunning || rawGramsInStock < 25}
              className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs cursor-pointer active:scale-98 transition-all ${
                rawGramsInStock >= 25
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                  : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {dryerRunning ? 'Идет сублимационная сушка...' : 'Запустить вакуумную сушку партии'}
            </button>
          </div>

          {/* Packaging Formats Grid */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-slate-300">
              Этап 2: Выберите формат готовой продукции для сбыта:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'craft',
                  nameRu: '5г Крафтовые пакеты «Шепот Астрала»',
                  desc: 'Розничный фасованный продукт для уличных клубов.',
                  price: '$140 / пакет',
                  badge: 'Розница (5г)',
                },
                {
                  id: 'microdose',
                  nameRu: '25г Банки микродозинга',
                  desc: 'Стандарт премиум-капсул в Darknet сети.',
                  price: '$680 / банка',
                  badge: 'Darknet (25г)',
                },
                {
                  id: 'syndicate',
                  nameRu: '100г Вакуум-боксы Синдиката',
                  desc: 'Оптовые партии для картельных контрактов.',
                  price: '$2,850 / бокс',
                  badge: 'Опт (100г)',
                },
              ].map((fmt) => (
                <div
                  key={fmt.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedPackFormat(fmt.id as 'craft' | 'microdose' | 'syndicate');
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                    selectedPackFormat === fmt.id
                      ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-[#080c13] border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                      {fmt.badge}
                    </span>
                    {selectedPackFormat === fmt.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{fmt.nameRu}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fmt.desc}</p>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-2">{fmt.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinishPackaging}
              disabled={rawGramsInStock < 5}
              className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xl transition-all ${
                rawGramsInStock >= 5
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 animate-bounce'
                  : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Расфасовать партию и поместить на склад (в инвентарь)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
