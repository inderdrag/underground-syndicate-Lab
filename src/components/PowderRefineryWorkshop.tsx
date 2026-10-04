import React, { useState } from 'react';
import { GameState } from '../types/game';
import {
  Boxes,
  Sparkles,
  Cpu,
  Flame,
  Zap,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  PackageCheck,
  ChevronRight,
  Sliders,
  Wind,
  Gauge,
  Scale,
  DollarSign,
  Award,
  Thermometer,
  FlaskConical,
  Droplets,
  Package,
  Building2,
  Clock,
  ArrowRight,
  Check,
  Plus,
  Minus,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

interface PowderRefineryWorkshopProps {
  gameState: GameState;
  onDeductCash: (amount: number) => void;
  onAddInventory: (itemKey: string, amount: number) => void;
  onFinishPowderBatch: (packagedType: 'ziplocs' | 'briquettes' | 'blocks', count: number, value: number, purity: number) => void;
  onSellPowderDeal?: (itemKey: string, units: number, totalCash: number, heat: number) => void;
  language: Language;
}

export type WorkshopTab = 'formulation' | 'reactor' | 'processing' | 'warehouse';

export interface PowderRecipe {
  id: string;
  name: string;
  subtitle: string;
  desc: string;
  baseYield: number; // base grams per 1x
  basePurity: number; // baseline %
  recommendedFormat: 'ziplocs' | 'briquettes' | 'blocks';
  badge: string;
  badgeColor: string;
  reqs: {
    whiteReagentGrams: number;
    darkRawGrams: number;
    filterPowderGrams: number;
    stabilizerPowderGrams: number;
  };
}

export const POWDER_RECIPES: PowderRecipe[] = [
  {
    id: 'street_aurora',
    name: '«Уличная Аврора» (Street Grade)',
    subtitle: 'Экономичная быстрая формула',
    desc: 'Оптимизированный скоростной синтез гидрохлорида. Минимальный расход редких прекурсоров, высокая скорость кристаллизации. Идеально для фасовки в розничные 1г зиплоки.',
    baseYield: 15,
    basePurity: 89.5,
    recommendedFormat: 'ziplocs',
    badge: 'Розница (1г)',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/30',
    reqs: {
      whiteReagentGrams: 10,
      darkRawGrams: 0,
      filterPowderGrams: 5,
      stabilizerPowderGrams: 0,
    },
  },
  {
    id: 'fishscale_hydro',
    name: '«Fishscale Hydro» (Премиум Перламутр)',
    subtitle: 'Чешуйчатые кристаллы 96%+',
    desc: 'Тонкая рафинация с добавлением кристаллического стабилизатора. Формирует характерный слоистый перламутровый блеск высшего клубного стандарта со штампом синдиката.',
    baseYield: 28,
    basePurity: 96.2,
    recommendedFormat: 'briquettes',
    badge: 'Мелкий опт (10г)',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/30',
    reqs: {
      whiteReagentGrams: 15,
      darkRawGrams: 10,
      filterPowderGrams: 5,
      stabilizerPowderGrams: 5,
    },
  },
  {
    id: 'cartel_monolith',
    name: '«Картельный Монолит» (Cartel Monolith)',
    subtitle: 'Тяжелый концентрат 99%+',
    desc: 'Максимальная плотность активных алкалоидов и глубокая многоступенчатая кристаллизация. Рассчитан на формовку в 50г вакуумные монолитные блоки для картельных поставок.',
    baseYield: 65,
    basePurity: 98.8,
    recommendedFormat: 'blocks',
    badge: 'Картельный опт (50г)',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-950/30',
    reqs: {
      whiteReagentGrams: 25,
      darkRawGrams: 20,
      filterPowderGrams: 10,
      stabilizerPowderGrams: 10,
    },
  },
];

export const PowderRefineryWorkshop: React.FC<PowderRefineryWorkshopProps> = ({
  gameState,
  onDeductCash,
  onAddInventory,
  onFinishPowderBatch,
  onSellPowderDeal,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<WorkshopTab>('formulation');

  // Recipe & Batch Scale State
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('fishscale_hydro');
  const [batchMultiplier, setBatchMultiplier] = useState<number>(1); // 1x, 2x, 5x, 10x

  // Active Batch in Progress
  const [batchActive, setBatchActive] = useState<boolean>(false);
  const [batchRawLoaded, setBatchRawLoaded] = useState<number>(0);
  const [batchRecipe, setBatchRecipe] = useState<PowderRecipe>(POWDER_RECIPES[1]);
  const [batchPurity, setBatchPurity] = useState<number>(96.2);
  const [batchQuality, setBatchQuality] = useState<number>(94);
  const [batchYieldLoss, setBatchYieldLoss] = useState<number>(3);

  // Notifications
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [warehouseNotice, setWarehouseNotice] = useState<string | null>(null);

  // Selected recipe object
  const currentRecipe = POWDER_RECIPES.find((r) => r.id === selectedRecipeId) || POWDER_RECIPES[1];

  // Calculated required precursors for chosen recipe and multiplier
  const requiredMaterials = {
    whiteReagentGrams: currentRecipe.reqs.whiteReagentGrams * batchMultiplier,
    darkRawGrams: currentRecipe.reqs.darkRawGrams * batchMultiplier,
    filterPowderGrams: currentRecipe.reqs.filterPowderGrams * batchMultiplier,
    stabilizerPowderGrams: currentRecipe.reqs.stabilizerPowderGrams * batchMultiplier,
  };

  const inv = gameState.inventory;
  const hasEnoughMaterials =
    (inv.whiteReagentGrams || 0) >= requiredMaterials.whiteReagentGrams &&
    (inv.darkRawGrams || 0) >= requiredMaterials.darkRawGrams &&
    (inv.filterPowderGrams || 0) >= requiredMaterials.filterPowderGrams &&
    (inv.stabilizerPowderGrams || 0) >= requiredMaterials.stabilizerPowderGrams;

  // --- PRECURSOR SHOP DESK ---
  const precursorCatalog = [
    { key: 'whiteReagentGrams', name: 'Белый порошковый реагент', price10: 45, icon: Boxes, color: 'text-slate-300' },
    { key: 'darkRawGrams', name: 'Тёмное сырьё высокой плотности', price10: 70, icon: Flame, color: 'text-purple-400' },
    { key: 'filterPowderGrams', name: 'Фильтр-порошок тонкой очистки', price10: 35, icon: Wind, color: 'text-cyan-400' },
    { key: 'stabilizerPowderGrams', name: 'Кристаллический стабилизатор', price10: 60, icon: Zap, color: 'text-amber-400' },
    { key: 'packagingPacks', name: 'Комплект вакуум-упаковки', price10: 25, icon: PackageCheck, color: 'text-emerald-400' },
  ];

  const handleBuyPrecursor = (key: string, count10: number, pricePer10: number) => {
    const totalCost = pricePer10 * count10;
    if (gameState.cash < totalCost) {
      sounds.playAlarmBeep();
      setStatusMessage(`Недостаточно средств ($${totalCost} требуется, в наличии $${gameState.cash})`);
      return;
    }
    onDeductCash(totalCost);
    sounds.playCash();
    onAddInventory(key, 10 * count10);
    setStatusMessage(`Закуплено: +${10 * count10} ед. (списано $${totalCost})`);
  };

  // --- STAGE 1 ACTION: LOAD FEEDSTOCK INTO REACTOR ---
  const handleLoadFeedstock = () => {
    if (!hasEnoughMaterials) {
      sounds.playAlarmBeep();
      setStatusMessage('На складе не хватает сырья для выбранного масштаба варки! Закупите недостающие прекурсоры.');
      return;
    }

    sounds.playLabReaction();
    // Deduct exact required materials
    if (requiredMaterials.whiteReagentGrams > 0) onAddInventory('whiteReagentGrams', -requiredMaterials.whiteReagentGrams);
    if (requiredMaterials.darkRawGrams > 0) onAddInventory('darkRawGrams', -requiredMaterials.darkRawGrams);
    if (requiredMaterials.filterPowderGrams > 0) onAddInventory('filterPowderGrams', -requiredMaterials.filterPowderGrams);
    if (requiredMaterials.stabilizerPowderGrams > 0) onAddInventory('stabilizerPowderGrams', -requiredMaterials.stabilizerPowderGrams);

    const totalRawGrams =
      requiredMaterials.whiteReagentGrams +
      requiredMaterials.darkRawGrams +
      requiredMaterials.filterPowderGrams +
      requiredMaterials.stabilizerPowderGrams;

    setBatchActive(true);
    setBatchRecipe(currentRecipe);
    setBatchRawLoaded(currentRecipe.baseYield * batchMultiplier);
    setBatchPurity(currentRecipe.basePurity);
    setBatchQuality(92);
    setBatchYieldLoss(3);

    // Reset reactor stage parameters
    setReactorProgress(0);
    setReactorExtracted(false);
    setWashCyclesCompleted(0);
    setMillStep(0);
    setWarehouseNotice(null);

    setStatusMessage(`Сырье успешно загружено в реактор: масштаб ${batchMultiplier}x (${totalRawGrams}г прекурсоров). Переход в аппаратную!`);
    setActiveTab('reactor');
  };

  // --- STAGE 2: CHEMICAL REACTOR PARAMETERS & CONTROLS ---
  const [phLevel, setPhLevel] = useState<number>(4.1);
  const [reactorTempC, setReactorTempC] = useState<number>(52);
  const [stirrerRpm, setStirrerRpm] = useState<number>(920);
  const [catalystActive, setCatalystActive] = useState<boolean>(true);
  const [reactorRunning, setReactorRunning] = useState<boolean>(false);
  const [reactorProgress, setReactorProgress] = useState<number>(0);
  const [reactorExtracted, setReactorExtracted] = useState<boolean>(false);

  const isPhOptimal = phLevel >= 3.8 && phLevel <= 4.4;
  const isTempOptimal = reactorTempC >= 48 && reactorTempC <= 56;
  const isRpmOptimal = stirrerRpm >= 750 && stirrerRpm <= 1150;

  const handleRunReactorExtraction = () => {
    if (reactorRunning) return;
    sounds.playLabReaction();
    setReactorRunning(true);
    setReactorProgress(0);

    const interval = setInterval(() => {
      setReactorProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setReactorRunning(false);
          setReactorExtracted(true);
          sounds.playResonanceLock();

          // Calculate quality & purity impact from live controls
          let pDelta = 0;
          let qDelta = 0;
          let lossDelta = 0;

          if (isPhOptimal && isTempOptimal && isRpmOptimal) {
            pDelta += 2.2;
            qDelta += 5;
            setStatusMessage('✓ Кислотная экстракция проведена идеально! Сформирован кристаллический осадок гидрохлорида высшей пробы.');
          } else {
            pDelta -= 1.8;
            qDelta -= 4;
            lossDelta += 4;
            setStatusMessage('⚠️ Неоптимальный pH или перегрев реактора привели к частичному разрушению алкалоидов.');
          }

          if (catalystActive) {
            pDelta += 1.2;
          }

          setBatchPurity((p) => Math.min(99.9, Math.max(75, p + pDelta)));
          setBatchQuality((q) => Math.min(100, Math.max(60, q + qDelta)));
          setBatchYieldLoss((l) => Math.min(30, l + lossDelta));
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // --- STAGE 3: PURIFICATION, MILLING & COMPACTION ---
  const [solventType, setSolventType] = useState<'acetone_ice' | 'ether_cryo'>('acetone_ice');
  const [vacuumPumpActive, setVacuumPumpActive] = useState<boolean>(true);
  const [washCyclesCompleted, setWashCyclesCompleted] = useState<number>(0); // 0 to 3
  const [millStep, setMillStep] = useState<number>(0); // 0 to 3
  const [millRunning, setMillRunning] = useState<boolean>(false);

  const handleWashCycle = () => {
    sounds.playLabReaction();
    const nextCycle = washCyclesCompleted + 1;
    setWashCyclesCompleted(nextCycle);

    const boost = solventType === 'acetone_ice' ? 1.0 : 1.4;
    setBatchPurity((p) => Math.min(99.9, p + boost));
    setBatchQuality((q) => Math.min(100, q + 2));

    if (nextCycle >= 3) {
      sounds.playResonanceLock();
      setStatusMessage('✓ Трехступенчатая промывка завершена! Органические смолы и балластные соли полностью удалены.');
    } else {
      setStatusMessage(`Промывка растворителем такт #${nextCycle} завершена.`);
    }
  };

  const handleMillPass = () => {
    sounds.playClick();
    setMillRunning(true);

    setTimeout(() => {
      setMillRunning(false);
      const next = millStep + 1;
      setMillStep(next);
      setBatchPurity((p) => Math.min(99.9, p + 0.4));
      sounds.playResonanceLock();

      if (next >= 3) {
        setStatusMessage('✓ Микронизация завершена! Получена шелковистая пудра с перламутровым отливом Fishscale.');
      } else {
        setStatusMessage(`Роторная микронизация такт #${next}: Дисперсность повышена.`);
      }
    }, 350);
  };

  // Packaging Format Selection & Custom Quantity
  const [packFormat, setPackFormat] = useState<'ziplocs' | 'briquettes' | 'blocks'>('briquettes');
  const [packQuantityRatio, setPackQuantityRatio] = useState<number>(1); // 1 = 100%, 0.5 = 50%, etc.

  // Net Grams after yield losses
  const netBatchGrams = Math.max(1, Math.round(batchRawLoaded * ((100 - batchYieldLoss) / 100)));

  // Calculate units available for chosen format
  const getFormatUnitWeight = (fmt: 'ziplocs' | 'briquettes' | 'blocks') => {
    if (fmt === 'ziplocs') return 1;
    if (fmt === 'briquettes') return 10;
    return 50;
  };

  const unitWeight = getFormatUnitWeight(packFormat);
  const maxPossibleUnits = Math.max(1, Math.floor(netBatchGrams / unitWeight));
  const selectedUnitsToPack = Math.max(1, Math.round(maxPossibleUnits * packQuantityRatio));
  const packsConsumed = Math.max(1, Math.ceil(selectedUnitsToPack / (packFormat === 'ziplocs' ? 10 : 2)));

  // Estimated economic valuation for UI display (NO CASH ADDED!)
  const getFormatEstVal = (fmt: 'ziplocs' | 'briquettes' | 'blocks') => {
    const purityMult = batchPurity / 92;
    if (fmt === 'ziplocs') return Math.round(75 * purityMult);
    if (fmt === 'briquettes') return Math.round(720 * purityMult);
    return Math.round(3500 * purityMult);
  };

  const estValPerUnit = getFormatEstVal(packFormat);
  const totalEstBatchVal = selectedUnitsToPack * estValPerUnit;

  // --- THE CRITICAL PACKAGING ACTION: STRICTLY STORES IN INVENTORY, NO AUTO-SALE ---
  const handleSealAndDepositToInventory = () => {
    const availablePacks = gameState.inventory.packagingPacks || 0;
    if (availablePacks < packsConsumed) {
      sounds.playAlarmBeep();
      setStatusMessage(`Недостаточно комплектов фасовки! Требуется: ${packsConsumed} шт., на складе: ${availablePacks} шт. Закупите упаковку.`);
      return;
    }

    sounds.playVacuumSeal();
    sounds.playResonanceLock();

    // Consume packaging kits
    onAddInventory('packagingPacks', -packsConsumed);

    // Call onFinishPowderBatch: STRICTLY deposits items into inventory, NO CASH ADDED!
    onFinishPowderBatch(packFormat, selectedUnitsToPack, totalEstBatchVal, batchPurity);

    const formatName =
      packFormat === 'ziplocs'
        ? '1г Зиплоки «Уличная Аврора»'
        : packFormat === 'briquettes'
        ? '10г Прессованные Брикеты «Fishscale Bar»'
        : '50г Вакуум-блоки «Cartel Block»';

    const msg = `✓ Партия успешно запечатана и отправлена на Склад цеха: +${selectedUnitsToPack} шт. (${formatName}). Авто-продажа отключена: готовый товар надежно лежит в вашем инвентаре. Сбывайте его вручную через Терминал сбыта или по контрактам Синдиката.`;
    setWarehouseNotice(msg);
    setStatusMessage(msg);

    // Complete the batch run
    setBatchActive(false);
    setReactorExtracted(false);
    setReactorProgress(0);
    setWashCyclesCompleted(0);
    setMillStep(0);

    // Promptly switch to warehouse view
    setActiveTab('warehouse');
  };

  // --- STAGE 4: WAREHOUSE & MANUAL DISTRIBUTION DESK ---
  const [sellProduct, setSellProduct] = useState<'aurora_powder' | 'aurora_briquette' | 'aurora_block'>('aurora_powder');
  const [sellQuantity, setSellQuantity] = useState<number>(1);
  const [sellChannel, setSellChannel] = useState<'runners' | 'clubs' | 'cartel'>('runners');
  const [salesResult, setSalesResult] = useState<string | null>(null);

  const getStockCount = (key: string) => {
    if (key === 'aurora_powder') return gameState.inventory.auroraPowderGrams || 0;
    if (key === 'aurora_briquette') return gameState.inventory.packagedAuroraBriquettes || 0;
    return gameState.inventory.packagedAuroraBlocks || 0;
  };

  const getBaseUnitPrice = (key: string) => {
    if (key === 'aurora_powder') return 75;
    if (key === 'aurora_briquette') return 700;
    return 3400;
  };

  const currentStock = getStockCount(sellProduct);
  const unitPrice = getBaseUnitPrice(sellProduct);

  // Channel bonus
  const channelMultiplier = sellChannel === 'cartel' ? 1.15 : sellChannel === 'clubs' ? 1.08 : 1.0;
  const channelHeatMult = sellChannel === 'cartel' ? 2.5 : sellChannel === 'clubs' ? 1.5 : 0.9;

  const actualSellUnits = Math.min(sellQuantity, currentStock);
  const totalPayout = Math.round(actualSellUnits * unitPrice * channelMultiplier);
  const estimatedHeat = Math.max(1, Math.round(actualSellUnits * (sellProduct === 'aurora_block' ? 8 : sellProduct === 'aurora_briquette' ? 3 : 0.8) * channelHeatMult));

  const handleExecuteManualSale = () => {
    if (currentStock <= 0 || actualSellUnits <= 0) {
      sounds.playAlarmBeep();
      setSalesResult('На складе нет достаточного количества выбранного товара!');
      return;
    }

    if (onSellPowderDeal) {
      onSellPowderDeal(sellProduct, actualSellUnits, totalPayout, estimatedHeat);
    } else {
      onAddInventory(
        sellProduct === 'aurora_powder'
          ? 'auroraPowderGrams'
          : sellProduct === 'aurora_briquette'
          ? 'packagedAuroraBriquettes'
          : 'packagedAuroraBlocks',
        -actualSellUnits
      );
    }

    sounds.playCash();
    const prodTitle =
      sellProduct === 'aurora_powder' ? '1г Зиплоков' : sellProduct === 'aurora_briquette' ? '10г Брикетов' : '50г Блоков';
    setSalesResult(`✓ Сделка закрыта: Сбыто ${actualSellUnits} шт. (${prodTitle}). Получено +$${totalPayout.toLocaleString()}. Товар списан со склада.`);
    setSellQuantity(1);
  };

  // Total warehouse stock valuation
  const totalWarehouseValuation =
    (gameState.inventory.auroraPowderGrams || 0) * 75 +
    (gameState.inventory.packagedAuroraBriquettes || 0) * 700 +
    (gameState.inventory.packagedAuroraBlocks || 0) * 3400;

  return (
    <div className="space-y-4">
      {/* Top Banner: Industrial Refinery Workshop Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Boxes className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                [ХИМИКО-РАФИНИРОВОЧНЫЙ ЦЕХ]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Авто-продажа отключена (Склад)
              </span>
              {batchActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 animate-pulse font-bold">
                  Варка активна ({batchRawLoaded}г) · {batchPurity.toFixed(1)}%
                </span>
              )}
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Производство Порошка «Аврора» (Синтез, Фасовка & Склад)
            </h1>
          </div>
        </div>

        {/* Real-time Warehouse Inventory Mini-Bar */}
        <div className="bg-[#070b13] p-2.5 rounded-2xl border border-white/10 flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] text-slate-400">Склад цеха:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-amber-300 flex items-center gap-1">
              <span>1г:</span>
              <strong className="text-white font-bold">{gameState.inventory.auroraPowderGrams || 0}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-cyan-300 flex items-center gap-1">
              <span>10г:</span>
              <strong className="text-white font-bold">{gameState.inventory.packagedAuroraBriquettes || 0}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-purple-300 flex items-center gap-1">
              <span>50г:</span>
              <strong className="text-white font-bold">{gameState.inventory.packagedAuroraBlocks || 0}</strong>
            </span>
            <span className="px-2 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
              ${totalWarehouseValuation.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#070b13] p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
        {[
          { id: 'formulation', label: '1. Сырье & Рецепты', icon: Boxes },
          { id: 'reactor', label: '2. Химический Реактор', icon: FlaskConical },
          { id: 'processing', label: '3. Очистка & Пресс-цех', icon: PackageCheck },
          { id: 'warehouse', label: '4. Склад & Ручной Сбыт', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id as WorkshopTab);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.id === 'warehouse' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-slate-900 text-amber-300' : 'bg-white/10 text-slate-300'}`}>
                  {(gameState.inventory.auroraPowderGrams || 0) + (gameState.inventory.packagedAuroraBriquettes || 0) + (gameState.inventory.packagedAuroraBlocks || 0)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs font-mono flex items-center justify-between shadow-sm animate-fadeIn">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white text-xs ml-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Persistent Warehouse Confirmation Notice */}
      {warehouseNotice && (
        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl text-emerald-200 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Партия сохранена в инвентаре склада!</div>
              <div className="text-emerald-300/90 mt-0.5 leading-relaxed">{warehouseNotice}</div>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('warehouse');
              setTimeout(() => {
                const el = document.getElementById('powder-warehouse-section');
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

      {/* ========================================================================= */}
      {/* TAB 1: FORMULATION & PRECURSOR LOGISTICS                                   */}
      {/* ========================================================================= */}
      {activeTab === 'formulation' && (
        <div className="space-y-4">
          {/* Recipe Selection Grid */}
          <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-sm font-bold font-mono">
                  <Boxes className="w-4 h-4" />
                  <span>1. Выбор рецептуры и масштаба химического синтеза</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Выберите формулу порошка и объем загрузки реактора перед началом цикла
                </p>
              </div>

              {/* Batch Scale Multipliers */}
              <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-xl border border-white/10 font-mono text-xs">
                <span className="text-slate-400 text-[10px] px-2 font-bold">Масштаб:</span>
                {[1, 2, 5, 10].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => {
                      sounds.playClick();
                      setBatchMultiplier(mult);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                      batchMultiplier === mult
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>

            {/* Recipes Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {POWDER_RECIPES.map((recipe) => {
                const isSelected = selectedRecipeId === recipe.id;
                const scaledYield = recipe.baseYield * batchMultiplier;

                return (
                  <div
                    key={recipe.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedRecipeId(recipe.id);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
                        : 'bg-[#080c13] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${recipe.badgeColor}`}>
                          {recipe.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>

                      <div>
                        <h3 className="font-bold text-white text-sm">{recipe.name}</h3>
                        <div className="text-[11px] text-amber-300/80 font-mono">{recipe.subtitle}</div>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{recipe.desc}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 space-y-2 font-mono text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Базовый выход:</span>
                        <strong className="text-emerald-400">{scaledYield}г порошка</strong>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Базовая чистота:</span>
                        <strong className="text-cyan-400">{recipe.basePurity}%</strong>
                      </div>

                      {/* Required Precursors Mini-Badges */}
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-white/5 space-y-1">
                        <div className="font-bold text-slate-300">Требуется сырья ({batchMultiplier}x):</div>
                        <div className="flex flex-wrap gap-1">
                          {recipe.reqs.whiteReagentGrams > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-200">
                              Белый: {recipe.reqs.whiteReagentGrams * batchMultiplier}г
                            </span>
                          )}
                          {recipe.reqs.darkRawGrams > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-purple-300">
                              Тёмный: {recipe.reqs.darkRawGrams * batchMultiplier}г
                            </span>
                          )}
                          {recipe.reqs.filterPowderGrams > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300">
                              Фильтр: {recipe.reqs.filterPowderGrams * batchMultiplier}г
                            </span>
                          )}
                          {recipe.reqs.stabilizerPowderGrams > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">
                              Стабилизатор: {recipe.reqs.stabilizerPowderGrams * batchMultiplier}г
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Launch Reactor Action Box */}
            <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <div className="text-slate-300 font-bold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Статус готовности реактора к загрузке:</span>
                </div>
                <div className="text-[11px]">
                  {hasEnoughMaterials ? (
                    <span className="text-emerald-400 font-bold">✓ Все прекурсоры в наличии на складе ({batchMultiplier}x замес)</span>
                  ) : (
                    <span className="text-rose-400 font-bold">⚠️ Недостаточно сырья на складе. Докупите прекурсоры ниже!</span>
                  )}
                </div>
              </div>

              <button
                onClick={handleLoadFeedstock}
                disabled={!hasEnoughMaterials}
                className={`py-3.5 px-6 rounded-xl font-bold font-mono text-xs cursor-pointer flex items-center justify-center gap-2 shadow-lg transition-all ${
                  hasEnoughMaterials
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 active:scale-98 animate-pulse'
                    : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <FlaskConical className="w-4 h-4" />
                <span>Загрузить сырье в химический реактор ({batchMultiplier}x)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Precursor Stock & Quick Procurement Desk */}
          <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
                <ShoppingBag className="w-4 h-4" />
                <span>Складские запасы прекурсоров & Дозаказ реактивов</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                Баланс: ${gameState.cash.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {precursorCatalog.map((item) => {
                const Icon = item.icon;
                const inStock = (inv as Record<string, number>)[item.key] || 0;
                const canAfford10 = gameState.cash >= item.price10;
                const canAfford50 = gameState.cash >= item.price10 * 5;

                return (
                  <div key={item.key} className="p-3.5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-2.5 flex flex-col justify-between font-mono text-xs">
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                        <span>На складе:</span>
                        <strong className="text-white text-xs font-bold">{inStock} {item.key === 'packagingPacks' ? 'уп.' : 'г'}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        </div>
                        <div className="text-white font-bold text-xs leading-tight line-clamp-2">{item.name}</div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-white/5">
                      <div className="text-[10px] text-slate-400 flex justify-between">
                        <span>Цена:</span>
                        <span className="text-amber-300 font-bold">${item.price10} / 10 шт.</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleBuyPrecursor(item.key, 1, item.price10)}
                          disabled={!canAfford10}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                            canAfford10
                              ? 'bg-white/10 hover:bg-white/20 text-white'
                              : 'bg-neutral-900 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          +10 ({item.price10}$)
                        </button>
                        <button
                          onClick={() => handleBuyPrecursor(item.key, 5, item.price10)}
                          disabled={!canAfford50}
                          className={`py-1.5 px-2 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                            canAfford50
                              ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
                              : 'bg-neutral-900 text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          +50 ({item.price10 * 5}$)
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CHEMICAL REACTOR EXTRACTION & PARAMETERS                           */}
      {/* ========================================================================= */}
      {activeTab === 'reactor' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
              <FlaskConical className="w-4 h-4" />
              <span>2. Аппаратная Реактора: Кислотная экстракция и осаждение алкалоидов</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Партия:</span>
              <span className="text-amber-300 font-bold">{batchRecipe.name} ({batchRawLoaded}г)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: Chemical Vessel SVG Illustration & Live Telemetry */}
            <div className="lg:col-span-5 bg-[#070a0f] p-4 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              <div className="text-slate-300 font-bold flex items-center justify-between">
                <span>Визуализация реакционного сосуда:</span>
                <span className={reactorRunning ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}>
                  {reactorRunning ? '● ЭКСТРАКЦИЯ В ПРОЦЕССЕ' : '○ ОЖИДАНИЕ ЗАПУСКА'}
                </span>
              </div>

              {/* Reactor Graphic */}
              <div className="relative w-full h-44 bg-[#040609] rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 200 160" className="w-full h-full max-h-40">
                  <defs>
                    <linearGradient id="reagentFluid" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={isPhOptimal && isTempOptimal ? '#06b6d4' : '#f59e0b'} stopOpacity="0.8" />
                      <stop offset="100%" stopColor={isPhOptimal && isTempOptimal ? '#10b981' : '#dc2626'} stopOpacity="0.9" />
                    </linearGradient>
                    <radialGradient id="fluidGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Reactor Shell */}
                  <rect x="50" y="30" width="100" height="110" rx="20" fill="none" stroke="#334155" strokeWidth="3" />
                  <path d="M 75 15 L 125 15 L 125 30 L 75 30 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                  {/* Heating Jacket Outline */}
                  <path d="M 42 50 L 42 130 C 42 145 60 148 70 148 L 130 148 C 140 148 158 145 158 130 L 158 50" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity={reactorTempC >= 48 ? "0.8" : "0.2"} />

                  {/* Boiling Fluid Level */}
                  <rect x="54" y="65" width="92" height="70" rx="14" fill="url(#reagentFluid)" />
                  <circle cx="100" cy="100" r="45" fill="url(#fluidGlow)" />

                  {/* Bubbles */}
                  {reactorRunning && (
                    <>
                      <circle cx="75" cy="100" r="3" fill="#ffffff" opacity="0.7" className="animate-ping" />
                      <circle cx="120" cy="90" r="4" fill="#ffffff" opacity="0.6" className="animate-pulse" />
                      <circle cx="95" cy="115" r="2.5" fill="#ffffff" opacity="0.8" />
                      <circle cx="130" cy="110" r="3" fill="#ffffff" opacity="0.5" />
                    </>
                  )}

                  {/* Magnetic Stirrer Bar */}
                  <rect
                    x="85"
                    y="125"
                    width="30"
                    height="6"
                    rx="3"
                    fill="#ffffff"
                    transform={reactorRunning ? `rotate(${Date.now() % 360} 100 128)` : ''}
                  />
                </svg>

                {/* Status Overlay */}
                <div className="absolute top-2 right-2 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded border border-white/10 text-cyan-300">
                  {stirrerRpm} RPM
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px]">Текущая чистота:</span>
                  <div className="text-cyan-400 font-bold text-sm">{batchPurity.toFixed(1)}%</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-slate-400 text-[10px]">Стабильность кристаллов:</span>
                  <div className="text-emerald-400 font-bold text-sm">{batchQuality}%</div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Reactor Controls */}
            <div className="lg:col-span-7 bg-[#070a0f] p-4 rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
              {/* 1. pH Adjustment */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Кислотность реакционной среды (pH):</span>
                  </span>
                  <strong className={isPhOptimal ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                    pH {phLevel.toFixed(1)} {isPhOptimal ? '(Идеально 3.8 - 4.4)' : '(Опасность гидролиза)'}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPhLevel((p) => Math.max(2.0, Math.round((p - 0.1) * 10) / 10))}
                    disabled={reactorRunning}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer text-xs"
                    title="-0.1 pH (Соляная кислота)"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="2.5"
                    max="6.5"
                    step="0.1"
                    value={phLevel}
                    onChange={(e) => setPhLevel(Number(e.target.value))}
                    disabled={reactorRunning}
                    className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-900 rounded"
                  />
                  <button
                    onClick={() => setPhLevel((p) => Math.min(6.5, Math.round((p + 0.1) * 10) / 10))}
                    disabled={reactorRunning}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer text-xs"
                    title="+0.1 pH (Аммиак)"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>pH 2.5 (Кислотный распад)</span>
                  <span className="text-emerald-400 font-bold">Оптимум pH 3.8 - 4.4</span>
                  <span>pH 6.5 (Щелочной ожог)</span>
                </div>
              </div>

              {/* 2. Temperature Jacket */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-200 font-bold flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                    <span>Температура рубашки реактора:</span>
                  </span>
                  <strong className={isTempOptimal ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {reactorTempC}°C {isTempOptimal ? '(Зеленая зона 48°C - 56°C)' : '(Риск потерь выхода)'}
                  </strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReactorTempC((t) => Math.max(25, t - 2))}
                    disabled={reactorRunning}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer text-xs"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="range"
                    min="25"
                    max="80"
                    value={reactorTempC}
                    onChange={(e) => setReactorTempC(Number(e.target.value))}
                    disabled={reactorRunning}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded"
                  />
                  <button
                    onClick={() => setReactorTempC((t) => Math.min(80, t + 2))}
                    disabled={reactorRunning}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer text-xs"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>25°C (Затухание реакции)</span>
                  <span className="text-emerald-400 font-bold">Оптимум 48°C - 56°C</span>
                  <span className="text-rose-400">70°C+ (Термолиз)</span>
                </div>
              </div>

              {/* 3. Magnetic Stirrer & Catalyst */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Скорость мешалки:</span>
                    <strong className={isRpmOptimal ? 'text-emerald-400' : 'text-amber-400'}>{stirrerRpm} RPM</strong>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="1500"
                    step="50"
                    value={stirrerRpm}
                    onChange={(e) => setStirrerRpm(Number(e.target.value))}
                    disabled={reactorRunning}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-900 rounded"
                  />
                  <span className="text-[10px] text-slate-500">Оптимум: 750 - 1150 RPM</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catalystActive}
                      onChange={(e) => setCatalystActive(e.target.checked)}
                      disabled={reactorRunning}
                      className="rounded accent-emerald-500"
                    />
                    <span className="text-[11px]">Катализатор осаждения</span>
                  </label>
                  <span className="text-emerald-400 font-bold text-[10px]">+1.2% чистоты</span>
                </div>
              </div>

              {/* Extraction Progress & Action Bar */}
              <div className="pt-2 space-y-2.5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Прогресс осаждения гидрохлорида:</span>
                  <span className="font-bold text-white">{reactorProgress}%</span>
                </div>
                <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 transition-all duration-300"
                    style={{ width: `${reactorProgress}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    onClick={handleRunReactorExtraction}
                    disabled={reactorRunning || !batchActive}
                    className={`flex-1 py-3.5 rounded-xl font-bold font-mono text-xs cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      batchActive && !reactorRunning
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 shadow-md active:scale-98'
                        : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4" />
                    <span>
                      {reactorRunning
                        ? 'Идет кислотная экстракция...'
                        : reactorExtracted
                        ? 'Повторить такт экстракции'
                        : 'Запустить химическую экстракцию'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab('processing');
                    }}
                    className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>К Промывке & Прессу</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PURIFICATION, MILLING & COMPACTION (STRICT INVENTORY DEPOSIT)       */}
      {/* ========================================================================= */}
      {activeTab === 'processing' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold font-mono">
              <PackageCheck className="w-4 h-4" />
              <span>3. Очистка, Микронизация & Пресс-цех (Зачисление в инвентарь)</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Чистота партии: {batchPurity.toFixed(1)}% · Выход: {netBatchGrams}г
            </span>
          </div>

          {/* Sub-Stage 1: Buchner Vacuum Filtration & Solvent Washing */}
          <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <span className="text-slate-200 font-bold flex items-center gap-2">
                <Wind className="w-4 h-4 text-cyan-400" />
                <span>Этап 1: Вакуумная фильтрация через воронку Бюхнера</span>
              </span>
              <span className="text-emerald-400 font-bold">
                Тактов промывки: {washCyclesCompleted} / 3
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-slate-400 text-[10px]">Выбор промывочного растворителя:</span>
                <select
                  value={solventType}
                  onChange={(e) => setSolventType(e.target.value as any)}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-2 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="acetone_ice">Безводный ацетон (-15°C) — кристаллизация</option>
                  <option value="ether_cryo">Криогенный диэтиловый эфир — удаление смол (+1.4%)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vacuumPumpActive}
                    onChange={(e) => setVacuumPumpActive(e.target.checked)}
                    className="rounded accent-cyan-400"
                  />
                  <span>Вакуумный насос глубокого разрежения (-0.8 Bar)</span>
                </label>
                <span className="text-cyan-400 font-bold text-[10px]">АКТИВЕН</span>
              </div>
            </div>

            <button
              onClick={handleWashCycle}
              disabled={washCyclesCompleted >= 3}
              className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs cursor-pointer transition-all flex items-center justify-center gap-2 ${
                washCyclesCompleted < 3
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-md active:scale-98'
                  : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-default'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {washCyclesCompleted < 3
                  ? `Выполнить такт вакуумной промывки #${washCyclesCompleted + 1}`
                  : '✓ Трехступенчатая промывка полностью завершена'}
              </span>
            </button>
          </div>

          {/* Sub-Stage 2: Rotary Micronizer & Milling */}
          <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-3 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
              <span className="text-slate-200 font-bold flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Этап 2: Роторная микронизация в пудру Fishscale</span>
              </span>
              <span className="text-purple-400 font-bold">
                Такт помола: {millStep} / 3
              </span>
            </div>

            <button
              onClick={handleMillPass}
              disabled={millRunning || millStep >= 3}
              className={`w-full py-2.5 rounded-xl font-bold font-mono text-xs cursor-pointer transition-all flex items-center justify-center gap-2 ${
                millStep < 3
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-98'
                  : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 cursor-default'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>
                {millRunning
                  ? 'Идет роторный помол...'
                  : millStep < 3
                  ? `Выполнить такт помола #${millStep + 1} (В пудру Fishscale)`
                  : '✓ Микронизация полностью завершена'}
              </span>
            </button>
          </div>

          {/* Sub-Stage 3: Compaction Formats & Deposit to Warehouse (STRICT NO AUTO-SALE) */}
          <div className="p-5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <span className="text-white font-bold text-sm flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-emerald-400" />
                <span>Этап 3: Выбор формата фасовки и прессования партии</span>
              </span>
              <span className="text-slate-400 text-xs">
                Упаковочных комплектов в наличии: <strong className="text-emerald-400">{gameState.inventory.packagingPacks || 0} шт.</strong>
              </span>
            </div>

            {/* Packaging Formats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'ziplocs',
                  title: '1г Зиплоки «Уличная Аврора»',
                  unitWeight: '1г',
                  desc: 'Розничный фасованный порошок для быстрого сбыта через бегунков.',
                  estPrice: '~$75 / шт.',
                  badge: 'Розница (1г)',
                  invKey: 'auroraPowderGrams',
                },
                {
                  id: 'briquettes',
                  title: '10г Брикеты «Fishscale Bar»',
                  unitWeight: '10г',
                  desc: 'Стандартный оптовый брусок со штампом синдиката для клубных сетей.',
                  estPrice: '~$700 / шт.',
                  badge: 'Опт (10г)',
                  invKey: 'packagedAuroraBriquettes',
                },
                {
                  id: 'blocks',
                  title: '50г Вакуум-блоки «Cartel Block»',
                  unitWeight: '50г',
                  desc: 'Прессованный монолит в тройной вакуумной защите для картеля.',
                  estPrice: '~$3,400 / шт.',
                  badge: 'Картель (50г)',
                  invKey: 'packagedAuroraBlocks',
                },
              ].map((fmt) => {
                const isSelected = packFormat === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    onClick={() => {
                      sounds.playClick();
                      setPackFormat(fmt.id as any);
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2.5 ${
                      isSelected
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                        : 'bg-[#080c13] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-bold">
                        {fmt.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>

                    <div>
                      <h4 className="font-bold text-white text-xs">{fmt.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{fmt.desc}</p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex justify-between text-[11px]">
                      <span className="text-slate-400">Оценка:</span>
                      <strong className="text-emerald-400">{fmt.estPrice}</strong>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Packaging Yield & Quantity Slider */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-white/5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-slate-300 font-bold">Объем запечатываемой партии:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {selectedUnitsToPack} шт. (из {maxPossibleUnits} макс.)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.1"
                  value={packQuantityRatio}
                  onChange={(e) => setPackQuantityRatio(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded"
                />
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setPackQuantityRatio(0.25)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-slate-300"
                  >
                    25%
                  </button>
                  <button
                    onClick={() => setPackQuantityRatio(0.5)}
                    className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] text-slate-300"
                  >
                    50%
                  </button>
                  <button
                    onClick={() => setPackQuantityRatio(1.0)}
                    className="px-2 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold"
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Economic Summary Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5 text-center text-[10px]">
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-slate-400">Готовая масса:</span>
                  <div className="text-xs font-bold text-white">{selectedUnitsToPack * unitWeight}г</div>
                </div>
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-slate-400">Чистота партии:</span>
                  <div className="text-xs font-bold text-cyan-400">{batchPurity.toFixed(1)}%</div>
                </div>
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-slate-400">Расход упаковки:</span>
                  <div className="text-xs font-bold text-amber-300">{packsConsumed} уп.</div>
                </div>
                <div className="p-2 bg-black/40 rounded-lg">
                  <span className="text-slate-400">Оценочная стоимость:</span>
                  <div className="text-xs font-bold text-emerald-400">${totalEstBatchVal.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* THE CRITICAL SEAL & DEPOSIT BUTTON: NO AUTO-SALE! */}
            <div className="space-y-2">
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl text-cyan-200 text-xs flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  <strong>Правило склада:</strong> Продукция не продается автоматически. Она зачисляется в инвентарь и хранится на складе, пока вы сами не решите её сбыть через Терминал сбыта.
                </span>
              </div>

              <button
                onClick={handleSealAndDepositToInventory}
                disabled={(gameState.inventory.packagingPacks || 0) < packsConsumed}
                className={`w-full py-4 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2.5 cursor-pointer active:scale-98 shadow-xl transition-all ${
                  (gameState.inventory.packagingPacks || 0) >= packsConsumed
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20'
                    : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <PackageCheck className="w-4 h-4" />
                <span>Запечатать партию и зачислить на Склад цеха (в инвентарь)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: WAREHOUSE & MANUAL DISTRIBUTION DESK                                */}
      {/* ========================================================================= */}
      {activeTab === 'warehouse' && (
        <div id="powder-warehouse-section" className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl scroll-mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold font-mono">
              <Building2 className="w-4 h-4" />
              <span>4. Склад готовой продукции цеха & Терминал ручного сбыта</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              Общая оценка склада: ${totalWarehouseValuation.toLocaleString()}
            </span>
          </div>

          {/* Current Stock Inventory Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-2 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">1г Зиплоки «Уличная Аврора»</div>
              <div className="text-2xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.auroraPowderGrams || 0} шт.</span>
                <span className="text-xs font-normal text-cyan-400">~$75/шт.</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка запаса:</span>
                <strong className="text-emerald-400">${((gameState.inventory.auroraPowderGrams || 0) * 75).toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-2 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">10г Брикеты «Fishscale Bar»</div>
              <div className="text-2xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.packagedAuroraBriquettes || 0} шт.</span>
                <span className="text-xs font-normal text-amber-400">~$700/шт.</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка запаса:</span>
                <strong className="text-emerald-400">${((gameState.inventory.packagedAuroraBriquettes || 0) * 700).toLocaleString()}</strong>
              </div>
            </div>

            <div className="p-4 bg-[#070a0f] rounded-2xl border border-white/10 space-y-2 font-mono">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">50г Вакуум-блоки «Cartel Block»</div>
              <div className="text-2xl font-bold text-white flex items-center justify-between">
                <span>{gameState.inventory.packagedAuroraBlocks || 0} шт.</span>
                <span className="text-xs font-normal text-purple-400">~$3,400/шт.</span>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-white/5">
                <span>Оценка запаса:</span>
                <strong className="text-emerald-400">${((gameState.inventory.packagedAuroraBlocks || 0) * 3400).toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Manual Sales Terminal */}
          <div className="p-5 bg-[#070a0f] rounded-2xl border border-white/10 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Терминал ручного сбыта со склада</span>
              </h3>
              <span className="text-[11px] text-slate-400">Вы управляете поставками вручную</span>
            </div>

            {salesResult && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between">
                <span>{salesResult}</span>
                <button onClick={() => setSalesResult(null)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">1. Выберите товар со склада:</label>
                <select
                  value={sellProduct}
                  onChange={(e) => {
                    setSellProduct(e.target.value as any);
                    setSellQuantity(1);
                  }}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="aurora_powder">
                    1г Зиплоки «Уличная Аврора» ({gameState.inventory.auroraPowderGrams || 0} шт.)
                  </option>
                  <option value="aurora_briquette">
                    10г Брикеты «Fishscale Bar» ({gameState.inventory.packagedAuroraBriquettes || 0} шт.)
                  </option>
                  <option value="aurora_block">
                    50г Вакуум-блоки «Cartel Block» ({gameState.inventory.packagedAuroraBlocks || 0} шт.)
                  </option>
                </select>
              </div>

              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-bold block">2. Канал сбыта / Покупатель:</label>
                <select
                  value={sellChannel}
                  onChange={(e) => setSellChannel(e.target.value as any)}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="runners">Уличные бегунки (базовая цена, низкий риск)</option>
                  <option value="clubs">Клубные промоутеры (+8% бонус, средний риск)</option>
                  <option value="cartel">Картельный синдикат (+15% бонус, высокий интерес копов)</option>
                </select>
              </div>

              {/* Quantity Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300 font-bold">
                  <span>3. Объем партии:</span>
                  <span className="text-emerald-400 font-bold">{actualSellUnits} шт. (из {currentStock})</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max={Math.max(1, currentStock)}
                    value={sellQuantity}
                    onChange={(e) => setSellQuantity(Number(e.target.value))}
                    disabled={currentStock <= 0}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-900 rounded"
                  />
                  <button
                    onClick={() => setSellQuantity(currentStock)}
                    disabled={currentStock <= 0}
                    className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Deal Calculation & Execution Bar */}
            <div className="p-4 bg-slate-900/60 rounded-xl border border-white/5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-slate-400 text-[11px]">Цена за единицу:</span>
                <div className="font-bold text-white text-sm">
                  ${Math.round(unitPrice * channelMultiplier).toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Итоговая выручка:</span>
                <div className="font-bold text-emerald-400 text-base">
                  +${totalPayout.toLocaleString()}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[11px]">Внимание полиции:</span>
                <div className="font-bold text-amber-400 text-sm">
                  +{estimatedHeat} жара
                </div>
              </div>

              <button
                onClick={handleExecuteManualSale}
                disabled={currentStock <= 0}
                className={`py-3 px-6 rounded-xl font-bold text-xs cursor-pointer transition-all active:scale-95 shadow-md ${
                  currentStock > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:from-emerald-400 hover:to-teal-300'
                    : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Сбыть выбранную партию (${totalPayout.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
