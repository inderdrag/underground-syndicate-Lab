import React, { useState, useEffect } from 'react';
import { GameState, FictionalMushroomColony, FictionalGrowthStage, DrugEffectType, DosageTier, SyndicateLicenseId } from '../types/game';
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
  Building2,
  DollarSign,
  Package,
  X,
  ShieldAlert,
  Lock,
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
  onSellMushroomDeal?: (itemKey: string, units: number, totalCash: number, heat: number) => void;
  onBuyLicense?: (licenseId: SyndicateLicenseId, cost: number) => void;
  onIngestAstral: () => void;
  onIngestSample?: (effectType: DrugEffectType, dosage?: DosageTier) => void;
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
  onSellMushroomDeal,
  onBuyLicense,
  onIngestAstral,
  onIngestSample,
  language,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'cultivation' | 'shop' | 'processing' | 'warehouse'>('cultivation');
  const [selectedColonyId, setSelectedColonyId] = useState<string | null>(null);
  const hasMycologyLicense = Boolean(gameState.syndicateLicenses?.mycology_license);

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
    if (!hasMycologyLicense) {
      sounds.playAlarmBeep();
      return;
    }
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

  // --- 5. PROCESSING & PACKAGING LOGIC (BULK DRYING & REPEATABLE PACKAGING) ---
  const [dryerRunning, setDryerRunning] = useState<boolean>(false);
  const [dryerProgress, setDryerProgress] = useState<number>(0);
  const [dryBatchGrams, setDryBatchGrams] = useState<number>(25);
  const [dryerNotice, setDryerNotice] = useState<string | null>(null);

  const [selectedPackFormat, setSelectedPackFormat] = useState<'craft' | 'microdose' | 'syndicate'>('craft');
  const [packUnitsCount, setPackUnitsCount] = useState<number>(1);
  const [warehouseNotice, setWarehouseNotice] = useState<string | null>(null);
  const [packagingFeedback, setPackagingFeedback] = useState<string | null>(null);

  // Dedicated tasting lab modal
  const [isTastingModalOpen, setIsTastingModalOpen] = useState<boolean>(false);
  const [selectedTastingDose, setSelectedTastingDose] = useState<DosageTier>('standard');

  const rawGramsInStock = gameState.inventory.astralMushroomsRawGrams || 0;
  const driedGramsInStock = gameState.inventory.astralMushroomsDriedGrams || 0;

  // Drying batch calculation
  const maxDryableGrams = rawGramsInStock;
  const currentDryBatch = Math.max(1, Math.min(dryBatchGrams, Math.max(1, maxDryableGrams)));

  const handleRunVacuumFreezeDryer = () => {
    if (rawGramsInStock <= 0) {
      sounds.playAlarmBeep();
      return;
    }
    const amountToDry = Math.min(currentDryBatch, rawGramsInStock);
    if (amountToDry <= 0) {
      sounds.playAlarmBeep();
      return;
    }

    sounds.playLabReaction();
    setDryerRunning(true);
    setDryerProgress(0);
    setDryerNotice(null);

    const interval = setInterval(() => {
      setDryerProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDryerRunning(false);
          sounds.playResonanceLock();

          // Transfer raw mushrooms to dried mushrooms in inventory!
          onAddInventory('astralMushroomsRawGrams', -amountToDry);
          onAddInventory('astralMushroomsDriedGrams', amountToDry);

          setDryerNotice(
            `✓ Сушка успешно завершена! ${amountToDry}г сырых грибов стали высушенными грибами «Астрал» (+${amountToDry}г на складе). Теперь их можно фасовать в банки и пакеты или дегустировать!`
          );
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Packaging calculations (prefers dried mushrooms; falls back to raw if dried is 0)
  const packSize = selectedPackFormat === 'craft' ? 5 : selectedPackFormat === 'microdose' ? 25 : 100;
  const isPackingFromDried = driedGramsInStock >= packSize;
  const packStock = isPackingFromDried ? driedGramsInStock : (driedGramsInStock > 0 ? driedGramsInStock : rawGramsInStock);
  const maxPossiblePacks = Math.max(0, Math.floor(packStock / packSize));
  const desiredPacks = Math.max(1, Math.min(packUnitsCount, Math.max(1, maxPossiblePacks)));

  const handleFinishPackaging = () => {
    if (packStock < packSize || maxPossiblePacks <= 0) {
      sounds.playAlarmBeep();
      return;
    }

    sounds.playVacuumSeal();
    sounds.playResonanceLock();

    const actualUnits = Math.min(desiredPacks, Math.floor(packStock / packSize));
    const consumed = actualUnits * packSize;
    const invKey = isPackingFromDried ? 'astralMushroomsDriedGrams' : 'astralMushroomsRawGrams';

    // Strictly deposit in inventory, NO CASH ADDED!
    onPackageMushrooms(selectedPackFormat, actualUnits, 0);
    onAddInventory(invKey, -consumed);

    const packTitle =
      selectedPackFormat === 'craft'
        ? '5г Крафтовые пакеты «Шепот Астрала»'
        : selectedPackFormat === 'microdose'
        ? '25г Банки микродозинга'
        : '100г Вакуум-боксы Синдиката';

    const remaining = packStock - consumed;
    setPackagingFeedback(
      `✓ Партия успешно запечатана: +${actualUnits} шт. (${packTitle})! Использовано: ${consumed}г ${isPackingFromDried ? 'сушеных' : 'сырых'} грибов. На складе осталось: ${remaining}г. Вы можете сразу запечатать следующую партию!`
    );
  };

  // --- 6. WAREHOUSE & MANUAL DISTRIBUTION DESK ---
  const [sellItemKey, setSellItemKey] = useState<'astral_raw' | 'astral_dried' | 'astral_craft' | 'astral_microdose' | 'astral_syndicate'>('astral_craft');
  const [sellVolume, setSellVolume] = useState<number>(1);
  const [sellChannel, setSellChannel] = useState<'clubs' | 'darknet' | 'syndicate' | 'herbalists'>('clubs');
  const [salesFeedback, setSalesFeedback] = useState<string | null>(null);

  const getMushroomStock = (key: string) => {
    if (key === 'astral_raw') return gameState.inventory.astralMushroomsRawGrams || 0;
    if (key === 'astral_dried') return gameState.inventory.astralMushroomsDriedGrams || 0;
    if (key === 'astral_craft') return gameState.inventory.astralCraftPacks || 0;
    if (key === 'astral_microdose') return gameState.inventory.astralMicrodoseJars || 0;
    return gameState.inventory.astralSyndicateBoxes || 0;
  };

  const getMushroomUnitPrice = (key: string) => {
    if (key === 'astral_raw') return 18;
    if (key === 'astral_dried') return 28;
    if (key === 'astral_craft') return 140;
    if (key === 'astral_microdose') return 680;
    return 2850;
  };

  const mushroomStock = getMushroomStock(sellItemKey);
  const mushroomUnitPrice = getMushroomUnitPrice(sellItemKey);

  const channelMult = sellChannel === 'syndicate' ? 1.15 : sellChannel === 'darknet' ? 1.10 : sellChannel === 'clubs' ? 1.05 : 1.0;
  const channelHeat = sellChannel === 'syndicate' ? 2.2 : sellChannel === 'darknet' ? 1.4 : sellChannel === 'clubs' ? 1.2 : 0.8;

  const actualSellVolume = Math.min(sellVolume, mushroomStock);
  const totalMushroomPayout = Math.round(actualSellVolume * mushroomUnitPrice * channelMult);
  const mushroomHeat = Math.max(1, Math.round(actualSellVolume * (sellItemKey === 'astral_syndicate' ? 7 : sellItemKey === 'astral_microdose' ? 3 : 0.9) * channelHeat));

  const handleExecuteMushroomSale = () => {
    if (mushroomStock <= 0 || actualSellVolume <= 0) {
      sounds.playAlarmBeep();
      setSalesFeedback('На складе нет достаточного количества выбранного товара!');
      return;
    }

    if (onSellMushroomDeal) {
      onSellMushroomDeal(sellItemKey, actualSellVolume, totalMushroomPayout, mushroomHeat);
    } else {
      const invKey =
        sellItemKey === 'astral_raw'
          ? 'astralMushroomsRawGrams'
          : sellItemKey === 'astral_dried'
          ? 'astralMushroomsDriedGrams'
          : sellItemKey === 'astral_craft'
          ? 'astralCraftPacks'
          : sellItemKey === 'astral_microdose'
          ? 'astralMicrodoseJars'
          : 'astralSyndicateBoxes';
      onAddInventory(invKey, -actualSellVolume);
    }

    sounds.playCash();
    const itemTitle =
      sellItemKey === 'astral_raw'
        ? `${actualSellVolume}г сырых грибов`
        : sellItemKey === 'astral_dried'
        ? `${actualSellVolume}г сушеных грибов`
        : sellItemKey === 'astral_craft'
        ? `${actualSellVolume} шт. 5г пакетов`
        : sellItemKey === 'astral_microdose'
        ? `${actualSellVolume} шт. банок микродозинга`
        : `${actualSellVolume} шт. 100г вакуум-боксов`;

    setSalesFeedback(`✓ Сделка закрыта: Сбыто ${itemTitle}. Получено +$${totalMushroomPayout.toLocaleString()}. Товар списан со склада.`);
    setSellVolume(1);
  };

  // Total valuation of all mushroom inventory
  const totalMushroomValuation =
    (gameState.inventory.astralMushroomsRawGrams || 0) * 18 +
    (gameState.inventory.astralMushroomsDriedGrams || 0) * 28 +
    (gameState.inventory.astralCraftPacks || 0) * 140 +
    (gameState.inventory.astralMicrodoseJars || 0) * 680 +
    (gameState.inventory.astralSyndicateBoxes || 0) * 2850;

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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                [МИКОЛОГИЧЕСКИЙ СИМУЛЯТОР «АСТРАЛ»]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {colonies.length} Активных колоний
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Авто-продажа отключена (Склад)
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Выращивание вымышленных психоактивных грибов
            </h1>
          </div>
        </div>

        {/* Real-time Astral Mushroom Stock Mini-Bar */}
        <div className="bg-[#070b13] p-2 rounded-2xl border border-white/10 flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span className="text-[11px] text-slate-400">Склад грибов:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-cyan-300">
              Сырые: <strong>{gameState.inventory.astralMushroomsRawGrams || 0}г</strong>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-bold">
              Сушеные: <strong>{gameState.inventory.astralMushroomsDriedGrams || 0}г</strong>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-emerald-300">
              5г: <strong>{gameState.inventory.astralCraftPacks || 0}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-purple-300">
              25г: <strong>{gameState.inventory.astralMicrodoseJars || 0}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-amber-300">
              100г: <strong>{gameState.inventory.astralSyndicateBoxes || 0}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
              ${totalMushroomValuation.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setIsTastingModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 hover:from-purple-500/50 hover:to-pink-500/50 text-purple-200 border border-purple-500/40 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.25)] active:scale-95 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span>Дегустировать в лаборатории</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#0b0e14] p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
        <button
          onClick={() => setActiveTab('cultivation')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
            activeTab === 'cultivation'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Культивация
        </button>
        <button
          onClick={() => setActiveTab('shop')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
            activeTab === 'shop'
              ? 'bg-purple-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Магазин ресурсов
        </button>
        <button
          onClick={() => setActiveTab('processing')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
            activeTab === 'processing'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Обработка и фасовка
        </button>
        <button
          onClick={() => setActiveTab('warehouse')}
          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5 ${
            activeTab === 'warehouse'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>4. Склад & Ручной Сбыт</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'warehouse' ? 'bg-slate-900 text-amber-300' : 'bg-white/10 text-slate-300'}`}>
            {(gameState.inventory.astralCraftPacks || 0) + (gameState.inventory.astralMicrodoseJars || 0) + (gameState.inventory.astralSyndicateBoxes || 0)}
          </span>
        </button>
      </div>

      {/* Persistent Warehouse Confirmation Notice */}
      {warehouseNotice && (
        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Грибы зачислены в инвентарь склада!</div>
              <div className="text-emerald-300/90 mt-0.5 leading-relaxed">{warehouseNotice}</div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('warehouse');
              setTimeout(() => {
                const el = document.getElementById('mushroom-warehouse-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }, 50);
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shrink-0 cursor-pointer shadow-md active:scale-95 transition-all"
          >
            Перейти к Складу
          </button>
        </div>
      )}

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Colony Selection Strip (Horizontal on mobile, vertical on desktop) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Колонии ({colonies.length}):</span>
                  <button
                    onClick={handlePlantNewColony}
                    className="py-1 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Новый посев</span>
                  </button>
                </div>

                <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto gap-2 pb-1.5 lg:pb-0 scrollbar-none lg:max-h-[520px] shrink-0">
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
                        className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 shrink-0 min-w-[210px] sm:min-w-[240px] lg:min-w-0 ${
                          isSelected
                            ? 'bg-[#101724] border-cyan-500 shadow-lg ring-1 ring-cyan-500/30'
                            : 'bg-[#0a0f16] border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-white text-xs truncate max-w-[130px]">{colony.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border shrink-0 ${
                            colony.rarityTier === 'Мифический' ? 'text-amber-400 border-amber-500/30' : 'text-cyan-400 border-cyan-500/30'
                          }`}>
                            {colony.rarityTier}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold font-mono">
              <ShoppingBag className="w-4 h-4" />
              <span>2. Магазин специализированных микологических ресурсов</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${
                hasMycologyLicense
                  ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              }`}>
                {hasMycologyLicense ? '✓ Споровый сертификат активен' : '🔒 Требуется споровый сертификат'}
              </span>
            </div>
          </div>

          {/* License Lock Banner (Synced with Megastore) */}
          {!hasMycologyLicense && (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-amber-300 text-sm flex items-center gap-2 font-mono">
                    <span>{language === 'ru' ? 'Требуется Споровый Сертификат (Микология)' : 'Spore Certificate Required'}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Синдикат</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {language === 'ru'
                      ? 'Закупка мицелиевых наборов «Астрал», субстратов Mix-A и монотубов заблокирована без официального сертификата Синдиката.'
                      : 'Purchasing Astral mycelium kits, Mix-A and monotubs is locked without a Spore Certificate.'}
                  </p>
                </div>
              </div>

              {onBuyLicense && (
                <button
                  onClick={() => {
                    if (gameState.cash >= 350) {
                      sounds.playCash();
                      onBuyLicense('mycology_license', 350);
                    } else {
                      sounds.playAlarmBeep();
                    }
                  }}
                  disabled={gameState.cash < 350}
                  className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-md ${
                    gameState.cash >= 350
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 cursor-pointer active:scale-95'
                      : 'bg-neutral-800 text-slate-500 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{language === 'ru' ? 'Купить сертификат ($350)' : 'Buy Certificate ($350)'}</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {mycoShopCatalog.map((item) => {
              const Icon = item.icon;
              const invCount = (gameState.inventory as Record<string, number>)[item.key] || 0;
              const canAfford = gameState.cash >= item.price;
              const canPurchase = hasMycologyLicense && canAfford;

              return (
                <div
                  key={item.key}
                  className={`p-4 rounded-2xl bg-[#080c13] border transition-all flex flex-col justify-between space-y-3 ${
                    hasMycologyLicense ? 'border-white/10 hover:border-purple-500/40' : 'border-white/5 opacity-70'
                  }`}
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
                      disabled={!canPurchase}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-all shadow-md ${
                        canPurchase
                          ? 'bg-purple-500 hover:bg-purple-400 text-slate-950 cursor-pointer active:scale-95'
                          : !hasMycologyLicense
                          ? 'bg-amber-950/40 text-amber-500 border border-amber-500/30 cursor-not-allowed'
                          : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {!hasMycologyLicense ? (
                        <span className="flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Нужен сертификат</span>
                        </span>
                      ) : (
                        'Купить'
                      )}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold font-mono">
              <PackageCheck className="w-4 h-4" />
              <span>3. Обработка и фасовка: Сублимационная сушка и крафт упаковок</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <span className="text-slate-300">
                Сырые: <strong className="text-cyan-400">{rawGramsInStock}г</strong>
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-300">
                Высушенные: <strong className="text-emerald-400">{driedGramsInStock}г</strong>
              </span>
            </div>
          </div>

          {dryerNotice && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{dryerNotice}</span>
              </div>
              <button onClick={() => setDryerNotice(null)} className="text-slate-400 hover:text-white cursor-pointer ml-2">✕</button>
            </div>
          )}

          {/* Freeze Dryer Section (Bulk Drying) */}
          <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-cyan-400" />
                <span>Этап 1: Вакуумная сублимационная сушка (Сырые → Высушенные)</span>
              </span>
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span>Конденсатор: -55°C</span>
                <span>•</span>
                <span>Вакуум: 0.04 мбар</span>
                <span>•</span>
                <strong className="text-cyan-400">{dryerProgress}%</strong>
              </div>
            </div>

            <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-200"
                style={{ width: `${dryerProgress}%` }}
              />
            </div>

            {/* Batch Amount Selection for Drying */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-slate-300 font-bold">Объем партии для сушки:</span>
                <span className="text-cyan-400 font-bold">
                  {currentDryBatch}г сырых → {currentDryBatch}г сублимированных высушенных
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="5"
                  max={Math.max(5, rawGramsInStock)}
                  value={currentDryBatch}
                  onChange={(e) => setDryBatchGrams(Number(e.target.value))}
                  disabled={dryerRunning || rawGramsInStock <= 0}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded"
                />
                <button
                  onClick={() => setDryBatchGrams(25)}
                  disabled={dryerRunning || rawGramsInStock < 25}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold"
                >
                  25г
                </button>
                <button
                  onClick={() => setDryBatchGrams(50)}
                  disabled={dryerRunning || rawGramsInStock < 50}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold"
                >
                  50г
                </button>
                <button
                  onClick={() => setDryBatchGrams(100)}
                  disabled={dryerRunning || rawGramsInStock < 100}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold"
                >
                  100г
                </button>
                <button
                  onClick={() => setDryBatchGrams(rawGramsInStock)}
                  disabled={dryerRunning || rawGramsInStock <= 0}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded text-[10px] font-bold"
                >
                  MAX ({rawGramsInStock}г)
                </button>
              </div>
            </div>

            <button
              onClick={handleRunVacuumFreezeDryer}
              disabled={dryerRunning || rawGramsInStock <= 0}
              className={`w-full py-3 rounded-xl font-bold font-mono text-xs cursor-pointer active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg ${
                rawGramsInStock > 0 && !dryerRunning
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-cyan-500/20'
                  : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${dryerRunning ? 'animate-spin' : ''}`} />
              <span>
                {dryerRunning
                  ? `Идет вакуумная сублимационная сушка (${dryerProgress}%)...`
                  : rawGramsInStock > 0
                  ? `Запустить сушку партии (${currentDryBatch}г сырых грибов)`
                  : 'Нет сырых грибов для сушки (соберите урожай в Культивации)'}
              </span>
            </button>
          </div>

          {/* Packaging Formats Grid */}
          <div className="space-y-3 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <span className="text-emerald-400 font-bold">
                Этап 2: Расфасовка в банки и пакеты (можно повторять несколько раз):
              </span>
              <span className="text-slate-300 text-[11px]">
                Доступно для фасовки:{' '}
                <strong className={isPackingFromDried ? 'text-emerald-400' : 'text-cyan-400'}>
                  {packStock}г {isPackingFromDried ? '(Высушенные грибы)' : '(Сырые грибы)'}
                </strong>
              </span>
            </div>

            {packagingFeedback && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>{packagingFeedback}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('warehouse')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 cursor-pointer"
                  >
                    Смотреть на складе ➔
                  </button>
                  <button onClick={() => setPackagingFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'craft',
                  nameRu: '5г Крафтовые пакеты «Шепот Астрала»',
                  desc: 'Розничный фасованный продукт для уличных клубов.',
                  badge: 'Розница (5г)',
                  ratioText: '5г высушенных → 1 пакет',
                  estValue: 'Оценка: ~$140 / шт.',
                },
                {
                  id: 'microdose',
                  nameRu: '25г Банки микродозинга',
                  desc: 'Стандарт премиум-капсул в Darknet сети.',
                  badge: 'Darknet (25г)',
                  ratioText: '25г высушенных → 1 банка',
                  estValue: 'Оценка: ~$680 / шт.',
                },
                {
                  id: 'syndicate',
                  nameRu: '100г Вакуум-боксы Синдиката',
                  desc: 'Оптовые партии для картельных контрактов.',
                  badge: 'Опт (100г)',
                  ratioText: '100г высушенных → 1 бокс',
                  estValue: 'Оценка: ~$2,850 / шт.',
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
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold">
                      {fmt.badge}
                    </span>
                    {selectedPackFormat === fmt.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-sm">{fmt.nameRu}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fmt.desc}</p>
                    <div className="text-[11px] font-mono text-cyan-300 mt-2 font-bold">{fmt.ratioText}</div>
                    <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">{fmt.estValue}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Packaging Quantity & Consumption Slider */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/5 space-y-3 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-slate-300 font-bold">Объем фасуемой партии:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {desiredPacks} шт. (из {maxPossiblePacks} макс. доступных)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, maxPossiblePacks)}
                  value={desiredPacks}
                  onChange={(e) => setPackUnitsCount(Number(e.target.value))}
                  disabled={maxPossiblePacks <= 0}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded"
                />
                <button
                  onClick={() => setPackUnitsCount(1)}
                  disabled={maxPossiblePacks <= 0}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold"
                >
                  1 шт.
                </button>
                <button
                  onClick={() => setPackUnitsCount(Math.min(5, maxPossiblePacks))}
                  disabled={maxPossiblePacks < 5}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold"
                >
                  5 шт.
                </button>
                <button
                  onClick={() => setPackUnitsCount(Math.min(10, maxPossiblePacks))}
                  disabled={maxPossiblePacks < 10}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-bold"
                >
                  10 шт.
                </button>
                <button
                  onClick={() => setPackUnitsCount(maxPossiblePacks)}
                  disabled={maxPossiblePacks <= 0}
                  className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold"
                >
                  MAX ({maxPossiblePacks})
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                <span>Будет израсходовано грибов:</span>
                <strong className="text-cyan-300">
                  {desiredPacks * packSize}г из {packStock}г доступных
                </strong>
              </div>
            </div>

            {/* Warehouse Rule Notice */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs flex items-center justify-between gap-2 font-mono">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Повторная фасовка:</strong> Вы можете запечатывать продукцию несколько раз подряд. Готовый товар отправляется в инвентарь склада.
                </span>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsTastingModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Дегустировать</span>
              </button>
            </div>

            <button
              onClick={handleFinishPackaging}
              disabled={packStock < packSize || maxPossiblePacks <= 0}
              className={`w-full py-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xl transition-all ${
                packStock >= packSize && maxPossiblePacks > 0
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/25'
                  : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Запечатать {desiredPacks} шт. в инвентарь склада (можно несколько раз)</span>
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 4: WAREHOUSE & DIRECT SALES TERMINAL --- */}
      {activeTab === 'warehouse' && (
        <div id="mushroom-warehouse-section" className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold font-mono">
              <Building2 className="w-4 h-4" />
              <span>4. Склад урожая «Астрал» & Терминал ручного сбыта</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Общая оценка склада грибов: ${totalMushroomValuation.toLocaleString()}
            </span>
          </div>

          {/* Current Stock Inventory Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3.5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Сырой сбор «Астрал»</div>
              <div className="text-xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.astralMushroomsRawGrams || 0}г</span>
                <span className="text-xs font-normal text-cyan-400">~$18/г</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка:</span>
                <strong className="text-emerald-400">${((gameState.inventory.astralMushroomsRawGrams || 0) * 18).toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-3.5 bg-[#070a0f] rounded-2xl border border-cyan-500/30 space-y-1.5 font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <div className="text-[10px] text-cyan-300 uppercase tracking-wider font-bold">Высушенные «Астрал»</div>
              <div className="text-xl font-bold text-cyan-200 flex items-center justify-between">
                <span>{gameState.inventory.astralMushroomsDriedGrams || 0}г</span>
                <span className="text-xs font-normal text-cyan-400">~$28/г</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка:</span>
                <strong className="text-emerald-400">${((gameState.inventory.astralMushroomsDriedGrams || 0) * 28).toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-3.5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">5г Пакеты «Шепот Астрала»</div>
              <div className="text-xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.astralCraftPacks || 0} шт.</span>
                <span className="text-xs font-normal text-emerald-400">~$140/шт.</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка:</span>
                <strong className="text-emerald-400">${((gameState.inventory.astralCraftPacks || 0) * 140).toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-3.5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">25г Банки микродозинга</div>
              <div className="text-xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.astralMicrodoseJars || 0} шт.</span>
                <span className="text-xs font-normal text-purple-400">~$680/шт.</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка:</span>
                <strong className="text-emerald-400">${((gameState.inventory.astralMicrodoseJars || 0) * 680).toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-3.5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-1.5 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">100г Вакуум-боксы</div>
              <div className="text-xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.astralSyndicateBoxes || 0} шт.</span>
                <span className="text-xs font-normal text-amber-400">~$2,850/шт.</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка:</span>
                <strong className="text-emerald-400">${((gameState.inventory.astralSyndicateBoxes || 0) * 2850).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Manual Sales Desk */}
          <div className="p-5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Терминал ручного сбыта грибного урожая</span>
              </h3>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsTastingModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(168,85,247,0.2)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                <span>Дегустировать в лаборатории</span>
              </button>
            </div>

            {salesFeedback && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between">
                <span>{salesFeedback}</span>
                <button onClick={() => setSalesFeedback(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">1. Выберите продукцию:</label>
                <select
                  value={sellItemKey}
                  onChange={(e) => {
                    setSellItemKey(e.target.value as any);
                    setSellVolume(1);
                  }}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="astral_raw">
                    Сырые неоновые грибы ({gameState.inventory.astralMushroomsRawGrams || 0}г)
                  </option>
                  <option value="astral_dried">
                    Сублимированные высушенные грибы ({gameState.inventory.astralMushroomsDriedGrams || 0}г)
                  </option>
                  <option value="astral_craft">
                    5г Крафтовые пакеты «Шепот Астрала» ({gameState.inventory.astralCraftPacks || 0} шт.)
                  </option>
                  <option value="astral_microdose">
                    25г Банки микродозинга ({gameState.inventory.astralMicrodoseJars || 0} шт.)
                  </option>
                  <option value="astral_syndicate">
                    100г Вакуум-боксы Синдиката ({gameState.inventory.astralSyndicateBoxes || 0} шт.)
                  </option>
                </select>
              </div>

              {/* Buyer Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">2. Канал сбыта / Клиентура:</label>
                <select
                  value={sellChannel}
                  onChange={(e) => setSellChannel(e.target.value as any)}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="clubs">Неоновые рейвы & клубы (+5% бонус, средний риск)</option>
                  <option value="darknet">Darknet микродозинг комьюнити (+10% бонус)</option>
                  <option value="syndicate">Психоделический синдикат (+15% бонус, опт)</option>
                  <option value="herbalists">Местные травники (базовая цена, минимальный риск)</option>
                </select>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>3. Объем партии:</span>
                  <span className="text-emerald-400 font-bold">{actualSellVolume} {sellItemKey === 'astral_raw' ? 'г' : 'шт.'} (из {mushroomStock})</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={Math.max(1, mushroomStock)}
                    value={sellVolume}
                    onChange={(e) => setSellVolume(Number(e.target.value))}
                    disabled={mushroomStock <= 0}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded"
                  />
                  <button
                    onClick={() => setSellVolume(mushroomStock)}
                    disabled={mushroomStock <= 0}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing & Execution Bar */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-400 text-[11px]">Цена за единицу:</span>
                <div className="font-bold text-white text-sm">
                  ${Math.round(mushroomUnitPrice * channelMult).toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Выручка от сделки:</span>
                <div className="font-bold text-emerald-400 text-base">
                  +${totalMushroomPayout.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Внимание полиции:</span>
                <div className="font-bold text-amber-400 text-sm">
                  +{mushroomHeat} жара
                </div>
              </div>

              <button
                onClick={handleExecuteMushroomSale}
                disabled={mushroomStock <= 0}
                className={`py-3 px-6 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md ${
                  mushroomStock > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300'
                    : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Сбыть выбранную партию (${totalMushroomPayout.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ASTRAL MUSHROOM TASTING LAB MODAL --- */}
      {isTastingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0b0e14] border border-purple-500/30 rounded-2xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[92vh] overflow-y-auto font-mono text-xs">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                    <span>Дегустация в лаборатории: Неоновые грибы «Астрал»</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                      Психоделический трип
                    </span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Эффект вызывает мощную эйфорию, фрактальные галлюцинации и накопление зависимости. Выберите дозировку:
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsTastingModalOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Inventory Stock Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 bg-slate-900/60 rounded-xl border border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 block">Высушенные:</span>
                <strong className="text-emerald-400 text-sm">{driedGramsInStock}г</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Сырой сбор:</span>
                <strong className="text-cyan-400 text-sm">{rawGramsInStock}г</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Крафтовые пакеты:</span>
                <strong className="text-purple-300 text-sm">{gameState.inventory.astralCraftPacks || 0} шт.</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Уровень зависимости:</span>
                <strong className="text-amber-400 text-sm">{gameState.addictionLevel || 0}%</strong>
              </div>
            </div>

            {/* Dose Selection Cards */}
            <div className="space-y-2.5">
              <div className="text-slate-300 font-bold text-xs">
                Выберите дозировку дегустации:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    tier: 'micro' as DosageTier,
                    title: '1. Микродоза «Нейро-Ясность»',
                    costDried: 0.25,
                    costRaw: 2.5,
                    durationText: '55 сек',
                    euphoria: 35,
                    hallucinations: 20,
                    addiction: 2,
                    desc: 'Мягкий серотониновый подъем, кристальная ясность мысли и повышение креативности.',
                    visuals: 'Нежное неоновое свечение контуров и сочность цветового спектра.',
                    color: 'border-cyan-500/40 hover:border-cyan-400',
                    activeColor: 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]',
                  },
                  {
                    tier: 'standard' as DosageTier,
                    title: '2. Терапевтический «Астральный Поток»',
                    costDried: 1.5,
                    costRaw: 15.0,
                    durationText: '80 сек',
                    euphoria: 70,
                    hallucinations: 60,
                    addiction: 8,
                    desc: 'Глубокие волны тепла по телу, эмоциональный подъем, снятие тревоги и внутренний покой.',
                    visuals: 'Волнообразное дыхание стен, плавающие биолюминесцентные споры, мягкий RGB-сплит.',
                    color: 'border-teal-500/40 hover:border-teal-400',
                    activeColor: 'bg-teal-950/40 border-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.25)]',
                  },
                  {
                    tier: 'high' as DosageTier,
                    title: '3. Шаманский Трип «Разрыв Реальности»',
                    costDried: 3.5,
                    costRaw: 35.0,
                    durationText: '120 сек',
                    euphoria: 95,
                    hallucinations: 90,
                    addiction: 18,
                    desc: 'Мощнейший экстатический раш, безграничное счастье, единство с мицелием и миром.',
                    visuals: 'Жидкое плавление интерфейса, спиральные фрактальные волны, синестезия звуков.',
                    color: 'border-purple-500/40 hover:border-purple-400',
                    activeColor: 'bg-purple-950/40 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
                  },
                  {
                    tier: 'heroic' as DosageTier,
                    title: '4. Сингулярность «Heroic Ego Death»',
                    costDried: 6.0,
                    costRaw: 60.0,
                    durationText: '180 сек',
                    euphoria: 100,
                    hallucinations: 100,
                    addiction: 32,
                    desc: 'Запредельный космический катарсис, полное растворение границ «я» и времени.',
                    visuals: 'Психоделический гиперпространственный туннель, сакральная геометрия, смена спектров.',
                    color: 'border-pink-500/40 hover:border-pink-400',
                    activeColor: 'bg-pink-950/40 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.35)]',
                  },
                ].map((item) => {
                  const isSelected = selectedTastingDose === item.tier;
                  const hasDried = driedGramsInStock >= item.costDried;
                  const hasRaw = rawGramsInStock >= item.costRaw;
                  const hasAny = driedGramsInStock > 0 || rawGramsInStock > 0;

                  return (
                    <div
                      key={item.tier}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedTastingDose(item.tier);
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                        isSelected ? item.activeColor : `bg-[#070b12] ${item.color}`
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-xs">{item.title}</div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </div>

                      <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        {item.desc}
                      </div>

                      {/* Visual & Euphoria telemetry */}
                      <div className="space-y-1.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-emerald-400 font-bold">Эйфория:</span>
                          <span className="text-emerald-300 font-bold">{item.euphoria}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400"
                            style={{ width: `${item.euphoria}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px]">
                          <span className="text-purple-400 font-bold">Галлюцинации:</span>
                          <span className="text-purple-300 font-bold">{item.hallucinations}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/10">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            style={{ width: `${item.hallucinations}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[10px]">
                          <span className="text-amber-400 font-bold">Зависимость:</span>
                          <span className="text-amber-300 font-bold">+{item.addiction}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                        <span>Расход: {item.costDried}г сушеных (или {item.costRaw}г сырых)</span>
                        <span className="text-cyan-300 font-bold">{item.durationText}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Execute Button */}
            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400">
                {driedGramsInStock > 0 ? (
                  <span>
                    Будет списано из запаса <strong className="text-emerald-400">высушенных грибов</strong>.
                  </span>
                ) : rawGramsInStock > 0 ? (
                  <span>
                    Будет списано из запаса <strong className="text-cyan-400">сырого урожая</strong>.
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold">
                    Внимание: На складе нет грибов для дегустации. Соберите или высушите урожай!
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  sounds.playLabReaction();
                  sounds.playSubstanceIngest('psilocybin');
                  if (onIngestSample) {
                    onIngestSample('astral_mushrooms', selectedTastingDose);
                  } else {
                    onIngestAstral();
                  }
                  setIsTastingModalOpen(false);
                }}
                disabled={driedGramsInStock <= 0 && rawGramsInStock <= 0 && (gameState.inventory.astralCraftPacks || 0) <= 0}
                className={`py-3 px-6 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-xl transition-all ${
                  driedGramsInStock > 0 || rawGramsInStock > 0 || (gameState.inventory.astralCraftPacks || 0) > 0
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-400 hover:to-pink-400 text-white shadow-purple-500/25'
                    : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>Принять дозу и начать трип-дегустацию</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
