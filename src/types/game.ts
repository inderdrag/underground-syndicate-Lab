/**
 * Game Economy, Botany, Mycology, Synthesis and Engine Integration Types
 */

export type GamePhase = 'botany' | 'mycology' | 'synthesis' | 'neuro_synthesis' | 'powder_refinery' | 'megastore' | 'side_jobs' | 'economy' | 'handbook' | 'upkeep' | 'ingestion_lab' | 'engine_studio' | 'pharma_lab' | 'pharma_facade';

export type StrainId = 'white_widow' | 'amnesia_haze' | 'gorilla_glue' | 'purple_haze';

export interface StrainDef {
  id: StrainId;
  name: string;
  type: 'Balanced Hybrid' | 'Sativa-dominant' | 'Indica-dominant' | 'Sativa-hybrid';
  thcRange: [number, number];
  floweringDays: number;
  yieldGrams: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  effectDescription: string;
  shaderEffect: {
    name: string;
    type: 'time_dilation' | 'brightness_speed' | 'couch_lock' | 'purple_psychedelic';
    description: string;
  };
  seedPrice: number;
  baseMarketPricePerGram: number;
}

export interface PlantTelemetryPoint {
  hour: number;
  day: number;
  health: number;
  biomass: number; // 0 to 100
  nAbsorption: number; // 0 to 100%
  pAbsorption: number; // 0 to 100%
  kAbsorption: number; // 0 to 100%
  uptakeEfficiency: number; // 0 to 100%
  ph: number;
}

export type PlantStage =
  | 'seed'
  | 'seedling'
  | 'young_bush'
  | 'developing'
  | 'flowering'
  | 'ready_harvest';

export type PlantCondition =
  | 'optimal'
  | 'good'
  | 'thirsty'
  | 'overwatered'
  | 'nutrient_deficiency'
  | 'nutrient_burn'
  | 'stressed'
  | 'pests';

export interface PlantEvent {
  id: string;
  type: 'thirsty' | 'pest_alert' | 'nutrient_lockout' | 'surge_growth' | 'temperature_spike' | 'perfect_vpd';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'positive';
  actionRequired?: string;
  timeRemainingSec?: number;
}

export interface PlantLogEntry {
  id: string;
  timestamp: string;
  action: string;
  result: string;
  type: 'care' | 'event' | 'stage' | 'warning';
}

export interface BotanyPlant {
  id: string;
  strainId: StrainId;
  stage: PlantStage;
  progress: number; // 0 to 100 overall
  stageProgress: number; // 0 to 100 within current stage
  health: number; // 0 to 100
  purity: number; // 50 to 100%
  condition: PlantCondition;
  moisture: number; // 0 to 100%
  soilQuality: number; // 0 to 100%
  nutrients: {
    n: number; // Nitrogen (0-100)
    p: number; // Phosphorus (0-100)
    k: number; // Potassium (0-100)
    ph: number; // 5.5 to 7.0
  };
  medium: 'soil' | 'hydroponics' | 'coco';
  lightWattage: number;
  dayPlanted: number;
  smellUnits: number;
  lastWateredTime?: number;
  activeEvent?: PlantEvent | null;
  historyLog?: PlantLogEntry[];
  careScore?: number;
  potSizeLitres?: number;
  fanSpeed?: number;
  scrogInstalled?: boolean;
  telemetryHistory?: PlantTelemetryPoint[];
}

export type FictionalGrowthStage =
  | 'spore_inception' // 1. Начало (мицелиевые точки)
  | 'young_hyphae' // 2. Маленький росток (первые гифы)
  | 'colony_formation' // 3. Формирование колонии (белоснежная плотная сеть)
  | 'pinheads_emerging' // 4. Появление грибов (миниатюрные шляпки)
  | 'mature_flush' // 5. Зрелая колония (неоновые шляпки)
  | 'ready_harvest' // 6. Готовность к сбору (споровое сияние)
  | 'harvested';

export interface FictionalMushroomColony {
  id: string;
  name: string;
  stage: FictionalGrowthStage;
  progress: number; // 0 to 100
  health: number; // 0 to 100
  growthRateMultiplier: number; // e.g. 1.0x, 1.5x
  stability: number; // 0 to 100
  qualityScore: number; // 0 to 100%
  rarityTier: 'Обычный' | 'Необычный' | 'Редкий' | 'Мифический';
  humidityLevel: number; // 0 to 100% (target 88-96%)
  aerationLevel: number; // 0 to 100% (target 70-85%)
  expectedYieldGrams: number;
  activeIssue: {
    title: string;
    description: string;
    actionLabel: string;
    penalty: string;
  } | null;
  dayPlanted: number;
}

export type MycologyStage = 'sterilization' | 'inoculation' | 'incubation' | 'fruiting' | 'harvested';

export interface MushroomBatch {
  id: string;
  name: string;
  stage: MycologyStage;
  progress: number; // 0 to 100
  sterilizationPressurePsi: number; // target ~15 PSI
  sterilizationTimeMin: number; // target ~90 min
  stillAirBoxUsed: boolean;
  contaminationRisk: number; // 0 to 100
  isContaminated: boolean;
  temperatureC: number; // target 24-27°C
  inDarkness: boolean;
  faeRate: number; // Fresh air exchange (0-100)
  humidityPercent: number; // target 90-95%
  potency: number; // 60-100%
  yieldGrams: number;
}

export type SynthesisStage = 'precursor_extraction' | 'reaction' | 'purification' | 'dosing' | 'completed';
export type SynthesisPipelinePhase = 'preparation' | 'minigame' | 'process' | 'summary' | 'completed';

export interface StageResultDef {
  stars: number;
  purityDelta: number;
  yieldDelta: number;
  feedback: string;
}

export interface LSDSynthesisBatch {
  id: string;
  stageIndex?: number; // 0 to 4
  pipelinePhase?: SynthesisPipelinePhase;
  startedAt?: number;
  endsAt?: number;
  stageResults?: Record<number, StageResultDef>;
  stage: SynthesisStage;
  progress: number; // 0 to 100
  ergotamineGrams: number;
  refluxTempC: number; // target 45°C
  magneticStirrerRpm: number; // target 400-600 RPM
  solventAnhydrous: boolean;
  safelightActive: boolean; // Column chromatography under red safelight only
  uvDegradation: number; // 0 to 100%
  purity: number; // 0 to 100%
  sheetsDosed: number;
  blotterDoseUg: number; // 100-250 ug per tab
}

export type DistributionChannelType = 'street_dealers' | 'darknet' | 'cartel';

export interface MarketItem {
  id: string;
  name: string;
  category: 'cannabis' | 'psilocybin' | 'lsd';
  basePrice: number;
  currentPrice: number;
  inventoryUnits: number; // grams or tabs
  unitName: string;
  purity: number; // avg purity of stock
}

export interface DarknetOrder {
  id: string;
  buyerAlias: string;
  itemName: string;
  amount: number;
  cryptoBtc: number;
  cryptoXmr: number;
  usdValue: number;
  deadDropReady: boolean;
  timeRemainingSec: number;
}

export interface CartelContract {
  id: string;
  cartelName: string;
  requiredProduct: string;
  requiredVolume: number;
  requiredPurity: number;
  payoutCash: number;
  deadlineDays: number;
  daysRemaining: number;
  penaltyCash: number;
  isAccepted: boolean;
}

export interface UpkeepExpenses {
  baseRent: number;
  electricityRatePerKwh: number;
  totalWattageUsed: number;
  solarCapacityWatt: number;
  generatorFuelCost: number;
  employeeSalaries: number;
  totalDailyUpkeep: number;
}

export type DrugEffectType =
  | 'white_widow'
  | 'amnesia_haze'
  | 'gorilla_glue'
  | 'purple_haze'
  | 'psilocybin'
  | 'lsd_25'
  | 'cocaine'
  | 'neuro_fractal';

export type DosageTier = 'micro' | 'standard' | 'high' | 'heroic';

export interface ActiveDrugEffect {
  substanceId: string;
  name: string;
  effectType: DrugEffectType;
  durationSeconds: number;
  maxDurationSeconds: number;
  intensity: number; // 0 to 1
  dosageTier?: DosageTier;
  dosageLabel?: string;
  startedAt: number;
}

export interface MarketHistoryPoint {
  day: number;
  hour: number;
  price: number;
  saturation: number;
}

export interface MarketCommodityData {
  current: number;
  trend: 'up' | 'down' | 'stable';
  saturation: number;
  forecastTrend?: 'up' | 'down' | 'stable';
  forecastConfidence?: number; // 0 to 100%
  forecastExpectedChange?: number; // percentage, e.g. +14%
  history?: MarketHistoryPoint[];
}

export interface MarketEvent {
  id: string;
  title: string;
  description: string;
  targetProduct?: string; // specific product key or 'all'
  channelAffected?: 'street' | 'darknet' | 'cartel' | 'all';
  priceModifier: number; // e.g. +0.35 (35% surge) or -0.20
  saturationModifier: number; // e.g. -0.2 (deficit) or +0.3 (glut)
  heatModifier: number; // e.g. +10 or 0
  hoursRemaining: number;
  badge: string; // e.g. 'Всплеск спроса' / 'Дефицит' / 'Полицейский рейд'
  type: 'demand_surge' | 'supply_glut' | 'police_crackdown' | 'festival_boom' | 'competitor_disruption';
}

export interface SpecialOrder {
  id: string;
  clientTitle: string; // e.g. "VIP Клиент из пентхауса", "Техно-клуб 'Monolith'"
  productKey: string;
  productName: string;
  volume: number; // e.g. 50g or 2 sheets
  minPurity: number; // e.g. 92%
  rewardCash: number; // e.g. $2,800
  reputationGain: number; // e.g. +25
  penaltyRep: number; // e.g. -20
  penaltyCash: number;
  hoursRemaining: number;
  totalHours: number;
  isAccepted: boolean;
}

export interface DaySummaryReport {
  completedDay: number;
  incomeCash: number;
  expensesUpkeep: number;
  netProfit: number;
  policeHeatChange: number;
  currentPoliceHeat: number;
  breakdown: {
    electricity: number;
    baseRent: number;
    salaries: number;
    generatorFuel: number;
    lawyerRetainer: number;
    salesTotal: number;
  };
}

export interface BuyerReputation {
  score: number; // 0 to 1000
  level: number; // 1 to 5
  title: string;
  successfulDeals: number;
  failedDeals: number;
  bonusPayoutPercent: number; // e.g. 5 = +5%
  heatReductionPercent: number; // e.g. 10 = -10%
}

export type SyndicateLicenseId =
  | 'botany_license' // Разрешает закупку семян и гроу-припасов
  | 'mycology_license' // Разрешает закупку мицелия и монотубов
  | 'pharma_license' // Разрешает закупку фарм-компонентов и блистеров
  | 'synthesis_license' // Разрешает закупку прекурсоров ЛСД и Кокаина
  | 'powder_license' // Разрешает закупку реагентов порошкового цеха
  | 'neuro_license' // Разрешает закупку компонентов нейро-синтеза
  | 'facility_license'; // Разрешает закупку солнечных панелей и фильтров

export interface SyndicateLicenseInfo {
  id: SyndicateLicenseId;
  nameRu: string;
  nameEn: string;
  category: 'botany' | 'mycology' | 'synthesis' | 'powder' | 'neuro' | 'facility';
  cost: number;
  descriptionRu: string;
}

export interface GameState {
  cash: number;
  cryptoXmr: number;
  cryptoBtc: number;
  day: number;
  hour: number;
  timeSpeedMultiplier: number;
  policeHeat: number; // 0 to 100
  lawyerRetainerActive: boolean;
  totalPowerWatts: number;
  solarPanels: number;
  generatorsActive: boolean;
  carbonFiltersInstalled: number;
  employees: {
    trimmers: number;
    labChemists: number;
    couriers: number;
  };
  inventory: {
    whiteWidowGrams: number;
    amnesiaHazeGrams: number;
    gorillaGlueGrams: number;
    purpleHazeGrams: number;
    mushroomsGrams: number;
    lsdSheets: number; // 900 tabs per sheet
    cocaineGrams: number; // Pure fishscale cocaine crystals & powder
    neuroSheets: number; // Cybernetic Neuro-Blotter sheets (1000 tabs)
    whiteReagentGrams?: number; // Белый порошковый реагент
    darkRawGrams?: number; // Тёмное сырьё
    filterPowderGrams?: number; // Фильтр-порошок
    stabilizerPowderGrams?: number; // Стабилизатор
    packagingPacks?: number; // Упаковочный материал
    auroraPowderGrams?: number; // Готовый Синтетический Порошок «Аврора»
    packagedAuroraBriquettes?: number; // Расфасованные брикеты
    fictionalMyceliumKits?: number; // «Мицелиевый набор»
    nutrientMixAGrams?: number; // «Питательная смесь A»
    growthStimulantDoses?: number; // «Стимулятор роста»
    fictionalContainers?: number; // «Контейнер»
    environmentStabilizers?: number; // «Стабилизатор среды»
    astralMushroomsRawGrams?: number; // Неоновые грибы «Астрал» (сырой урожай)
    astralCraftPacks?: number; // 5г Крафтовые пакеты «Шепот Астрала»
    astralMicrodoseJars?: number; // 25г Банки микродозинга
    astralSyndicateBoxes?: number; // 100г Вакуум-боксы Синдиката
    seedsWhiteWidow: number;
    seedsAmnesiaHaze: number;
    seedsGorillaGlue: number;
    seedsPurpleHaze: number;
    sporeSyringes: number;
    ergotCultures: number;
    diethylamineMl: number;
    perforatedPaperSheets: number;
    purifiedWaterLitres: number; // Osmotic clean water
    nutrientVegMl: number; // N-Max formula
    nutrientBloomMl: number; // PK 13/14 bloom booster
    nutrientOrganicMl: number; // Organic compost tea
    neemOilMl: number; // Pest treatment spray
  };
  plants: BotanyPlant[];
  mushroomBatches: MushroomBatch[];
  fictionalColonies?: FictionalMushroomColony[];
  lsdBatches: LSDSynthesisBatch[];
  darknetOrders: DarknetOrder[];
  cartelContracts: CartelContract[];
  specialOrders: SpecialOrder[];
  marketEvents: MarketEvent[];
  buyerReputation: BuyerReputation;
  activeEffect: ActiveDrugEffect | null;
  marketPrices: Record<string, MarketCommodityData>;
  syndicateLicenses?: Record<SyndicateLicenseId, boolean>;
  courierStats?: {
    successfulDrops: number;
    bustedDrops: number;
    totalCashEarned: number;
    dangerLevel: number;
  };
}
