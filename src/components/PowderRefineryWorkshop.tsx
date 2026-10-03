import React, { useState, useEffect } from 'react';
import { GameState } from '../types/game';
import {
  Boxes,
  Sparkles,
  ShoppingBag,
  Cpu,
  Layers,
  Flame,
  ShieldAlert,
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
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

interface PowderRefineryWorkshopProps {
  gameState: GameState;
  onDeductCash: (amount: number) => void;
  onAddInventory: (itemKey: string, amount: number) => void;
  onFinishPowderBatch: (packagedType: 'ziplocs' | 'briquettes' | 'blocks', count: number, value: number, purity: number) => void;
  language: Language;
}

type WorkshopStage = 'shop' | 'mixing' | 'purification' | 'packaging' | 'completed';

interface RawShopItem {
  key: string;
  nameRu: string;
  nameEn: string;
  pricePer10: number;
  rarity: 'Обычный' | 'Необычный' | 'Редкий' | 'Элитный';
  rarityColor: string;
  qualityBonus: string;
  icon: typeof Boxes;
}

export const PowderRefineryWorkshop: React.FC<PowderRefineryWorkshopProps> = ({
  gameState,
  onDeductCash,
  onAddInventory,
  onFinishPowderBatch,
  language,
}) => {
  const [currentStage, setCurrentStage] = useState<WorkshopStage>('shop');

  // Live Batch Quality & Purification Metrics
  const [quality, setQuality] = useState<number>(94);
  const [purity, setPurity] = useState<number>(95);
  const [stability, setStability] = useState<number>(92);
  const [yieldLoss, setYieldLoss] = useState<number>(4);
  const [rawGramsLoaded, setRawGramsLoaded] = useState<number>(50);

  // Active Random Event
  const [activeEvent, setActiveEvent] = useState<{
    title: string;
    description: string;
    type: 'positive' | 'negative' | 'warning';
  } | null>(null);

  // --- 1. SHOP INVENTORY CATALOG ---
  const shopItems: RawShopItem[] = [
    { key: 'whiteReagentGrams', nameRu: 'Белый порошковый реагент (10г)', nameEn: 'White Powder Reagent (10g)', pricePer10: 45, rarity: 'Обычный', rarityColor: 'text-slate-300 border-white/20', qualityBonus: '+Базовая основа', icon: Boxes },
    { key: 'darkRawGrams', nameRu: 'Тёмное сырьё (10г)', nameEn: 'Dark Raw Material (10g)', pricePer10: 70, rarity: 'Редкий', rarityColor: 'text-purple-400 border-purple-500/30', qualityBonus: '+Высокая плотность алкалоидов', icon: Flame },
    { key: 'filterPowderGrams', nameRu: 'Фильтр-порошок (10г)', nameEn: 'Filter Powder (10g)', pricePer10: 35, rarity: 'Необычный', rarityColor: 'text-cyan-400 border-cyan-500/30', qualityBonus: '-Снижение потерь осадка', icon: Wind },
    { key: 'stabilizerPowderGrams', nameRu: 'Стабилизатор (10г)', nameEn: 'Stabilizer Powder (10g)', pricePer10: 60, rarity: 'Редкий', rarityColor: 'text-amber-400 border-amber-500/30', qualityBonus: '+Фиксация кристаллической решетки', icon: Zap },
    { key: 'packagingPacks', nameRu: 'Упаковочный материал (10 уп.)', nameEn: 'Packaging Materials (10 packs)', pricePer10: 25, rarity: 'Обычный', rarityColor: 'text-emerald-400 border-emerald-500/30', qualityBonus: 'Зиплоки & вакуум-пленка', icon: PackageCheck },
  ];

  const handleBuyShopItem = (item: RawShopItem) => {
    if (gameState.cash < item.pricePer10) {
      sounds.playAlarmBeep();
      return;
    }
    onDeductCash(item.pricePer10);
    sounds.playCash();
    onAddInventory(item.key, 10);
  };

  // --- 2. MIXING & PROCESSING SLOTS ---
  const [placedSlots, setPlacedSlots] = useState<{
    white: boolean;
    dark: boolean;
    filter: boolean;
    stabilizer: boolean;
  }>({ white: false, dark: false, filter: false, stabilizer: false });

  const [millRpm, setMillRpm] = useState<number>(2800);
  const [pressPressureBar, setPressPressureBar] = useState<number>(72);
  const [millProgress, setMillProgress] = useState<number>(0);

  const isRpmOptimal = millRpm >= 2600 && millRpm <= 3100;
  const isPressureOptimal = pressPressureBar >= 68 && pressPressureBar <= 78;
  const allSlotsLoaded = placedSlots.white && placedSlots.dark && placedSlots.filter && placedSlots.stabilizer;

  const handleMillTick = () => {
    sounds.playClick();
    if (!isRpmOptimal || !isPressureOptimal) {
      setQuality((q) => Math.max(70, q - 3));
      setYieldLoss((l) => Math.min(30, l + 2));
    } else {
      setQuality((q) => Math.min(99, q + 1));
      setPurity((p) => Math.min(99, p + 0.8));
    }

    setMillProgress((prev) => {
      const next = prev + 25;
      if (next >= 100) {
        sounds.playResonanceLock();
        triggerRandomEvent();
        setCurrentStage('purification');
        return 100;
      }
      return next;
    });
  };

  // --- 3. PURIFICATION STAGE ---
  const [washStep, setWashStep] = useState<number>(1);
  const [centrifugeSpeed, setCentrifugeSpeed] = useState<number>(50);
  const [purificationTimer, setPurificationTimer] = useState<number>(0);

  const handleWashStep = () => {
    sounds.playLabReaction();
    const next = washStep + 1;
    setWashStep(next);
    setPurity((p) => Math.min(99.5, p + 1.2));
    setStability((s) => Math.min(98, s + 1.5));

    if (next > 3) {
      sounds.playResonanceLock();
      setCurrentStage('packaging');
    }
  };

  // --- 4. RANDOM EVENTS GENERATOR ---
  const triggerRandomEvent = () => {
    const roll = Math.random();
    if (roll < 0.2) {
      setActiveEvent({
        title: 'Редкий бонус кристаллической кристаллизации!',
        description: 'Идеальный баланс солей позволил сформировать кристаллы высшего грейда (+8% к чистоте).',
        type: 'positive',
      });
      setPurity((p) => Math.min(100, p + 8));
      setQuality((q) => Math.min(100, q + 6));
    } else if (roll < 0.4) {
      setActiveEvent({
        title: 'Засор фильтра тонкой очистки',
        description: 'Небольшой засор привел к потерям 6% осадочной массы.',
        type: 'negative',
      });
      setYieldLoss((l) => l + 6);
    } else if (roll < 0.55) {
      setActiveEvent({
        title: 'Патруль в промзоне цеха',
        description: 'Повышенная активность силовиков в квартале (+10% розыска).',
        type: 'warning',
      });
    }
  };

  // --- 5. PACKAGING FORMAT SELECTION ---
  const [selectedFormat, setSelectedFormat] = useState<'ziplocs' | 'briquettes' | 'blocks'>('briquettes');
  const [finalYieldUnits, setFinalYieldUnits] = useState<number>(0);
  const [finalBatchValue, setFinalBatchValue] = useState<number>(0);

  const handlePackageBatch = () => {
    sounds.playCash();
    const totalGrams = Math.round(rawGramsLoaded * ((100 - yieldLoss) / 100));

    let units = 0;
    let unitPrice = 0;

    if (selectedFormat === 'ziplocs') {
      units = totalGrams; // 1g per ziploc
      unitPrice = Math.round(75 * (quality / 90));
    } else if (selectedFormat === 'briquettes') {
      units = Math.max(1, Math.floor(totalGrams / 10)); // 10g each
      unitPrice = Math.round(700 * (quality / 90));
    } else {
      units = Math.max(1, Math.floor(totalGrams / 50)); // 50g vacuum block
      unitPrice = Math.round(3400 * (quality / 90));
    }

    const totalVal = units * unitPrice;
    setFinalYieldUnits(units);
    setFinalBatchValue(totalVal);

    onFinishPowderBatch(selectedFormat, units, totalVal, purity);
    setCurrentStage('completed');
  };

  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                [ТЕНЕВОЙ ЦЕХ РАФИНАЦИИ]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Grade {quality >= 95 ? 'S+' : quality >= 90 ? 'S' : 'A'} · {purity.toFixed(1)}% Чистота
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Производственный цех: Синтетический порошок «Аврора»
            </h1>
          </div>
        </div>

        {/* Phase Stepper Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0b0e14] p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
          {[
            { id: 'shop', label: '1. Закупка' },
            { id: 'mixing', label: '2. Смешивание' },
            { id: 'purification', label: '3. Очистка' },
            { id: 'packaging', label: '4. Фасовка' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setCurrentStage(st.id as WorkshopStage)}
              className={`px-3 py-1 rounded-xl transition-all cursor-pointer font-bold ${
                currentStage === st.id
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Active Event Notification */}
      {activeEvent && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
            activeEvent.type === 'positive'
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : activeEvent.type === 'negative'
              ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              : 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0" />
            <div>
              <strong className="font-bold">{activeEvent.title}: </strong>
              <span>{activeEvent.description}</span>
            </div>
          </div>
          <button
            onClick={() => setActiveEvent(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* --- STAGE 1: RAW MATERIALS SHOP --- */}
      {currentStage === 'shop' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold font-mono">
              <ShoppingBag className="w-4 h-4" />
              <span>1. Магазин вымышленных материалов и реагентов цеха</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shopItems.map((item) => {
              const Icon = item.icon;
              const invCount = (gameState.inventory as Record<string, number>)[item.key] || 0;
              const canAfford = gameState.cash >= item.pricePer10;

              return (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-[#080c13] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
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
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs leading-tight">{item.nameRu}</div>
                        <div className="text-[10px] font-mono text-emerald-400">{item.qualityBonus}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="text-sm font-mono font-bold text-amber-400">
                      ${item.pricePer10}
                    </div>

                    <button
                      onClick={() => handleBuyShopItem(item)}
                      disabled={!canAfford}
                      className={`py-1.5 px-3.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                          : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Купить партию
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                sounds.playClick();
                setCurrentStage('mixing');
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Перейти к Производственному столу</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STAGE 2: PROCESSING & COMPACTION TABLE --- */}
      {currentStage === 'mixing' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-mono">
              <Cpu className="w-4 h-4" />
              <span>2. Производственный стол: Загрузка слотов и роторный помол</span>
            </div>
            <span className={`text-xs font-mono font-bold ${allSlotsLoaded ? 'text-emerald-400' : 'text-amber-400'}`}>
              {allSlotsLoaded ? 'Камера заполнена (4/4 слота)' : 'Загрузите все 4 реагента в камеру'}
            </span>
          </div>

          {/* 4 Chamber Slots Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { id: 'white', label: 'Белый реагент (10г)', loaded: placedSlots.white, inv: gameState.inventory.whiteReagentGrams || 0 },
              { id: 'dark', label: 'Тёмное сырьё (10г)', loaded: placedSlots.dark, inv: gameState.inventory.darkRawGrams || 0 },
              { id: 'filter', label: 'Фильтр-порошок (10г)', loaded: placedSlots.filter, inv: gameState.inventory.filterPowderGrams || 0 },
              { id: 'stabilizer', label: 'Стабилизатор (10г)', loaded: placedSlots.stabilizer, inv: gameState.inventory.stabilizerPowderGrams || 0 },
            ].map((slot) => (
              <div
                key={slot.id}
                onClick={() => {
                  if (slot.inv >= 10 || slot.loaded) {
                    sounds.playClick();
                    setPlacedSlots((prev) => ({ ...prev, [slot.id]: !prev[slot.id as keyof typeof prev] }));
                  }
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  slot.loaded
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                    : 'bg-[#080c13] border-dashed border-white/20 hover:border-white/40'
                }`}
              >
                <div className="space-y-1 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Слот камеры</span>
                  <div className="text-xs font-bold text-white">{slot.label}</div>
                </div>

                <div className="text-center text-[10px] font-mono">
                  {slot.loaded ? (
                    <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Загружено
                    </span>
                  ) : (
                    <span className="text-slate-500">Нажмите для загрузки ({slot.inv} на складе)</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Rotary Milling Controls & Thermal Press */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#070a0f] rounded-xl border border-white/10">
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Скорость роторного помола:</span>
                <strong className={isRpmOptimal ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {millRpm} RPM {isRpmOptimal ? '(Оптимально)' : ''}
                </strong>
              </div>
              <input
                type="range"
                min="1000"
                max="4000"
                value={millRpm}
                onChange={(e) => setMillRpm(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-3"
              />
              <span className="text-[10px] text-slate-500">Зеленая зона: 2600 - 3100 RPM</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Давление пресса:</span>
                <strong className={isPressureOptimal ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {pressPressureBar} Bar {isPressureOptimal ? '(Оптимально)' : ''}
                </strong>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                value={pressPressureBar}
                onChange={(e) => setPressPressureBar(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-3"
              />
              <span className="text-[10px] text-slate-500">Зеленая зона: 68 - 78 Bar</span>
            </div>
          </div>

          {/* Grinding Progress & Trigger Button */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Прогресс измельчения и компактирования:</span>
              <strong className="text-amber-400 font-bold">{millProgress}%</strong>
            </div>
            <div className="w-full bg-neutral-900 h-2.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-200"
                style={{ width: `${millProgress}%` }}
              />
            </div>

            <button
              onClick={handleMillTick}
              disabled={!allSlotsLoaded}
              className={`w-full py-3 rounded-xl font-bold font-mono text-xs cursor-pointer shadow-lg active:scale-95 transition-all ${
                allSlotsLoaded
                  ? 'bg-gradient-to-r from-cyan-500 to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              Импульс роторного измельчения (+25% за клик)
            </button>
          </div>
        </div>
      )}

      {/* --- STAGE 3: PURIFICATION & REFINERY --- */}
      {currentStage === 'purification' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-purple-400 text-sm font-bold font-mono">
              <Sparkles className="w-4 h-4" />
              <span>3. Очистка и кристаллизация: Тройная промывка (Шаг {washStep}/3)</span>
            </div>
          </div>

          {/* Live Dynamic Indicators HUD */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#080c13] rounded-xl border border-purple-500/30 space-y-1">
              <span className="text-slate-400 text-[10px]">Качество:</span>
              <div className="text-lg font-bold text-purple-300">{quality.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-[#080c13] rounded-xl border border-cyan-500/30 space-y-1">
              <span className="text-slate-400 text-[10px]">Чистота кристалла:</span>
              <div className="text-lg font-bold text-cyan-300">{purity.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-[#080c13] rounded-xl border border-emerald-500/30 space-y-1">
              <span className="text-slate-400 text-[10px]">Стабильность:</span>
              <div className="text-lg font-bold text-emerald-300">{stability.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-[#080c13] rounded-xl border border-rose-500/30 space-y-1">
              <span className="text-slate-400 text-[10px]">Потери сырья:</span>
              <div className="text-lg font-bold text-rose-300">{yieldLoss}%</div>
            </div>
          </div>

          <div className="p-6 bg-[#070a0f] rounded-2xl border border-white/10 text-center space-y-4">
            <div className="text-xs font-mono text-slate-300">
              Шаг {washStep}. Фильтрация через нано-мембрану и удаление балластных примесей:
            </div>

            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-base border transition-all ${
                    washStep > step
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : washStep === step
                      ? 'bg-purple-950/40 border-purple-400 text-purple-300 animate-pulse'
                      : 'bg-black/50 border-white/10 text-slate-600'
                  }`}
                >
                  {washStep > step ? '✓' : `Шаг ${step}`}
                </div>
              ))}
            </div>

            <button
              onClick={handleWashStep}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
            >
              Выполнить промывку #{washStep} (Клик)
            </button>
          </div>
        </div>
      )}

      {/* --- STAGE 4: PACKAGING & PORTIONING --- */}
      {currentStage === 'packaging' && (
        <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold font-mono">
              <PackageCheck className="w-4 h-4" />
              <span>4. Фасовка: Выбор формата партии и заполнение инвентаря</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'ziplocs',
                nameRu: '1г Уличные Зиплоки',
                desc: 'Быстрый розничный сбыт на улице. Высокая ликвидность.',
                badge: 'Розница (x1)',
                color: 'border-cyan-500/40',
              },
              {
                id: 'briquettes',
                nameRu: '10г Прессованные Брикеты',
                desc: 'Стандарт Darknet маркетплейсов. Оптимальный баланс прибыли.',
                badge: 'Опт (x10)',
                color: 'border-amber-500/40',
              },
              {
                id: 'blocks',
                nameRu: '50г Вакуумные Блоки Синдиката',
                desc: 'Крупные партии для картеля. Максимальная цена за грамм.',
                badge: 'Картель (x50)',
                color: 'border-purple-500/40',
              },
            ].map((fmt) => (
              <div
                key={fmt.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedFormat(fmt.id as 'ziplocs' | 'briquettes' | 'blocks');
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  selectedFormat === fmt.id
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                    : 'bg-[#080c13] border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {fmt.badge}
                  </span>
                  {selectedFormat === fmt.id && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{fmt.nameRu}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{fmt.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handlePackageBatch}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-bounce"
          >
            <span>Запечатать партию и зачислить на склад</span>
            <PackageCheck className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- STAGE 5: COMPLETED BATCH TRIUMPH & VALUATION --- */}
      {currentStage === 'completed' && (
        <div className="bg-gradient-to-b from-[#181124] to-[#090d15] border-2 border-emerald-500/50 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-bounce">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
              [ПАРТИЯ УСПЕШНО РАСФАСОВАНА]
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Синтетический Порошок «Аврора» ({finalYieldUnits} шт.)
            </h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Партия полностью очищена, стабилизирована и готова к распределению на рынке.
            </p>
          </div>

          {/* Economic Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto text-xs font-mono">
            <div className="p-3 bg-black/60 rounded-xl border border-purple-500/30">
              <span className="text-slate-400 text-[10px]">Грейд:</span>
              <div className="text-lg font-bold text-purple-400">
                Grade {quality >= 95 ? 'S+' : quality >= 90 ? 'S' : 'A'}
              </div>
            </div>
            <div className="p-3 bg-black/60 rounded-xl border border-cyan-500/30">
              <span className="text-slate-400 text-[10px]">Чистота:</span>
              <div className="text-lg font-bold text-cyan-400">{purity.toFixed(1)}%</div>
            </div>
            <div className="p-3 bg-black/60 rounded-xl border border-amber-500/30">
              <span className="text-slate-400 text-[10px]">Оценочная стоимость:</span>
              <div className="text-lg font-bold text-amber-400">${finalBatchValue.toLocaleString()}</div>
            </div>
            <div className="p-3 bg-black/60 rounded-xl border border-emerald-500/30">
              <span className="text-slate-400 text-[10px]">Бонус репутации:</span>
              <div className="text-lg font-bold text-emerald-400">+35 очков</div>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              // Reset for next run
              setCurrentStage('shop');
              setPlacedSlots({ white: false, dark: false, filter: false, stabilizer: false });
              setMillProgress(0);
              setWashStep(1);
            }}
            className="py-3 px-8 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs cursor-pointer shadow-xl active:scale-95"
          >
            Начать новую производственную партию
          </button>
        </div>
      )}
    </div>
  );
};
