import { BotanyPlant, PlantStage, PlantCondition, PlantEvent, PlantLogEntry, StrainId, GameState } from '../types/game';
import { STRAIN_DEFINITIONS } from './simulationEngine';

export interface StageConfig {
  id: PlantStage;
  nameRu: string;
  nameEn: string;
  rangeStart: number; // 0-100
  rangeEnd: number; // 0-100
  estimatedDurationHours: number;
  optimalMoisture: [number, number]; // min, max %
  optimalPh: [number, number];
  descriptionRu: string;
  descriptionEn: string;
}

export const PLANT_STAGES_CONFIG: Record<PlantStage, StageConfig> = {
  seed: {
    id: 'seed',
    nameRu: 'Семя в субстрате',
    nameEn: 'Seed in Substrate',
    rangeStart: 0,
    rangeEnd: 15,
    estimatedDurationHours: 12,
    optimalMoisture: [60, 80],
    optimalPh: [6.0, 6.5],
    descriptionRu: 'Прорастание семени в теплой влажной среде. Появление первичного белого корешка (taproot).',
    descriptionEn: 'Germination phase. Shell softens, taproot penetrates the substrate seeking moisture.',
  },
  seedling: {
    id: 'seedling',
    nameRu: 'Маленький росток',
    nameEn: 'Sprout & Seedling',
    rangeStart: 15,
    rangeEnd: 35,
    estimatedDurationHours: 20,
    optimalMoisture: [55, 75],
    optimalPh: [6.0, 6.5],
    descriptionRu: 'Появление округлых семядолей и первой пары настоящих зубчатых листьев. Мягкий свет и бережный полив.',
    descriptionEn: 'Cotyledons open, first pair of true serrated leaves unfolds. High humidity required.',
  },
  young_bush: {
    id: 'young_bush',
    nameRu: 'Молодой куст',
    nameEn: 'Young Bush (Early Veg)',
    rangeStart: 35,
    rangeEnd: 55,
    estimatedDurationHours: 28,
    optimalMoisture: [50, 70],
    optimalPh: [5.8, 6.4],
    descriptionRu: 'Формирование ветвистого кустика, 3-палые листья, активное разрастание корневой системы.',
    descriptionEn: 'Node multiplication, development of secondary stems, robust vegetative expansion.',
  },
  developing: {
    id: 'developing',
    nameRu: 'Развивающееся растение',
    nameEn: 'Developing Plant (Late Veg)',
    rangeStart: 55,
    rangeEnd: 75,
    estimatedDurationHours: 36,
    optimalMoisture: [45, 65],
    optimalPh: [5.8, 6.5],
    descriptionRu: 'Пышная крона классических 7-палых веерных листьев. Высокая потребность в азоте и мощном свете.',
    descriptionEn: 'Canopy fills out with lush 7-finger fan leaves. Pre-flower calyx development begins.',
  },
  flowering: {
    id: 'flowering',
    nameRu: 'Взрослое растение (Цветение)',
    nameEn: 'Mature Plant (Flowering)',
    rangeStart: 75,
    rangeEnd: 95,
    estimatedDurationHours: 48,
    optimalMoisture: [40, 60],
    optimalPh: [6.0, 6.6],
    descriptionRu: 'Формирование плотных чашечек и густых белых волосков-стигм. Начинается активная выработка смолы и ТГК.',
    descriptionEn: 'Explosive budding cola development with dense white stigmas and early glandular trichome frost.',
  },
  ready_harvest: {
    id: 'ready_harvest',
    nameRu: 'Готово к сбору (Харвест)',
    nameEn: 'Ready for Harvest',
    rangeStart: 95,
    rangeEnd: 100,
    estimatedDurationHours: 0,
    optimalMoisture: [35, 50],
    optimalPh: [6.0, 6.5],
    descriptionRu: 'Каменные морозные колы. Янтарные трихомы (30%) и закрученные оранжевые волоски. Пора срезать урожай!',
    descriptionEn: 'Swollen dense resinous colas with amber trichome heads and burnt copper pistils. Ready to chop!',
  },
};

export interface GrowShopItem {
  id: 'ro_water' | 'nutrient_veg' | 'nutrient_bloom' | 'nutrient_organic' | 'neem_oil';
  nameRu: string;
  nameEn: string;
  category: 'water' | 'fertilizer' | 'protection';
  quantityDesc: string;
  price: number;
  descriptionRu: string;
  unitsAdd: number;
  inventoryKey: 'purifiedWaterLitres' | 'nutrientVegMl' | 'nutrientBloomMl' | 'nutrientOrganicMl' | 'neemOilMl';
}

export const GROW_SHOP_CATALOG: GrowShopItem[] = [
  {
    id: 'ro_water',
    nameRu: 'Канистра осмотической воды (RO Pure)',
    nameEn: 'Purified RO Water Canister',
    category: 'water',
    quantityDesc: '20 Литров',
    price: 15,
    descriptionRu: 'Деминерализованная вода 0 PPM для идеального контроля EC и чистоты трихом.',
    unitsAdd: 20,
    inventoryKey: 'purifiedWaterLitres',
  },
  {
    id: 'nutrient_veg',
    nameRu: 'N-Max Вегетативный комплекс',
    nameEn: 'N-Max Vega Nutrient Bottle',
    category: 'fertilizer',
    quantityDesc: '500 мл',
    price: 25,
    descriptionRu: 'Хелатный азот и магний для взрывного набора зеленой массы и ветвления кроны.',
    unitsAdd: 500,
    inventoryKey: 'nutrientVegMl',
  },
  {
    id: 'nutrient_bloom',
    nameRu: 'PK 13/14 Бустер цветения',
    nameEn: 'PK 13/14 Bloom Booster',
    category: 'fertilizer',
    quantityDesc: '500 мл',
    price: 35,
    descriptionRu: 'Фосфорно-калийный концентрат для набора каменной плотности шишек и смолы.',
    unitsAdd: 500,
    inventoryKey: 'nutrientBloomMl',
  },
  {
    id: 'nutrient_organic',
    nameRu: 'Органический чай / Биогумус',
    nameEn: 'Organic Bio-Humus Compost Tea',
    category: 'fertilizer',
    quantityDesc: '1000 мл',
    price: 20,
    descriptionRu: 'Полезные почвенные микроорганизмы и микориза для здоровья корневой зоны.',
    unitsAdd: 1000,
    inventoryKey: 'nutrientOrganicMl',
  },
  {
    id: 'neem_oil',
    nameRu: 'Масло нима от паразитов',
    nameEn: 'Cold-Pressed Neem Oil Spray',
    category: 'protection',
    quantityDesc: '100 мл',
    price: 18,
    descriptionRu: 'Органический спрей против клещей, трипсов и мошек без повреждения соцветий.',
    unitsAdd: 100,
    inventoryKey: 'neemOilMl',
  },
];

export interface TentUpgradeOption {
  id: 'light_800' | 'light_1000' | 'clip_fan' | 'scrog_net';
  titleRu: string;
  titleEn: string;
  cost: number;
  descriptionRu: string;
}

export const TENT_UPGRADES: TentUpgradeOption[] = [
  {
    id: 'light_800',
    titleRu: 'LED Full Spectrum 800W',
    titleEn: '800W Full Spectrum LED',
    cost: 140,
    descriptionRu: 'Мощный светильник с дополнительным дальним красным спектром 730нм.',
  },
  {
    id: 'light_1000',
    titleRu: 'Commercial Pro 1000W COB',
    titleEn: '1000W Commercial Pro COB',
    cost: 260,
    descriptionRu: 'Промышленный модуль с линзами глубокого проникновения в нижний ярус.',
  },
  {
    id: 'clip_fan',
    titleRu: 'Осциллирующий вентилятор обдува',
    titleEn: 'Oscillating Canopy Clip Fan',
    cost: 45,
    descriptionRu: 'Создает легкий бриз, укрепляя ветви и устраняя застой влаги в колах.',
  },
  {
    id: 'scrog_net',
    titleRu: 'Шпалерная сетка SCROG',
    titleEn: 'Heavy-Duty SCROG Trellis Net',
    cost: 30,
    descriptionRu: 'Растяжка веток для горизонтального ковра и формирования десятка мощных центральных шишек.',
  },
];

export function getStageFromProgress(progress: number): { stage: PlantStage; stageProgress: number } {
  const clamped = Math.max(0, Math.min(100, progress));
  if (clamped < 15) {
    return { stage: 'seed', stageProgress: Math.round((clamped / 15) * 100) };
  }
  if (clamped < 35) {
    return { stage: 'seedling', stageProgress: Math.round(((clamped - 15) / 20) * 100) };
  }
  if (clamped < 55) {
    return { stage: 'young_bush', stageProgress: Math.round(((clamped - 35) / 20) * 100) };
  }
  if (clamped < 75) {
    return { stage: 'developing', stageProgress: Math.round(((clamped - 55) / 20) * 100) };
  }
  if (clamped < 95) {
    return { stage: 'flowering', stageProgress: Math.round(((clamped - 75) / 20) * 100) };
  }
  return { stage: 'ready_harvest', stageProgress: 100 };
}

/**
 * Creates a pristine new plant instance from planting action
 */
export function createNewPlantedSpecimen(
  strainId: StrainId,
  medium: 'soil' | 'hydroponics' | 'coco',
  day: number,
  potSizeLitres: number = 15
): BotanyPlant {
  const initialLog: PlantLogEntry = {
    id: `log_${Date.now()}`,
    timestamp: `День ${day}, 00:00`,
    action: 'Посадка семени',
    result: `Семя аккуратно помещено в ${medium === 'soil' ? 'органическую почвосмесь' : medium === 'coco' ? 'кокосовый субстрат' : 'гидропонику DWC'}. Проведен стартовый увлажняющий полив.`,
    type: 'stage',
  };

  return {
    id: `plant_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    strainId,
    stage: 'seed',
    progress: 0,
    stageProgress: 0,
    health: 100,
    purity: 94,
    condition: 'optimal',
    moisture: 70, // 70% starter moisture
    soilQuality: 92,
    nutrients: { n: 60, p: 40, k: 50, ph: 6.2 },
    medium,
    lightWattage: 600,
    dayPlanted: day,
    smellUnits: 2,
    lastWateredTime: Date.now(),
    activeEvent: null,
    historyLog: [initialLog],
    careScore: 100,
    potSizeLitres,
    fanSpeed: 1,
    scrogInstalled: false,
  };
}

/**
 * Perform Watering action with realistic resource/utility cost
 */
export function waterPlant(
  plant: BotanyPlant,
  usePurifiedWater: boolean,
  waterStock: number
): {
  updatedPlant: BotanyPlant;
  waterUsedLitres: number;
  cashUtilityCost: number;
  message: string;
  isWarning: boolean;
} {
  const amountPercent = 30;
  const newMoisture = Math.min(100, plant.moisture + amountPercent);
  let condition: PlantCondition = plant.condition;
  let healthDelta = 0;
  let isWarning = false;
  let waterUsedLitres = 0;
  let cashUtilityCost = 0;
  let message = '';

  if (usePurifiedWater && waterStock >= 1.5) {
    waterUsedLitres = 1.5;
    message = `Полив выполнен чистой осмотической водой (израсходовано 1.5 л). Влажность: ${newMoisture}%.`;
  } else {
    cashUtilityCost = 4; // $4 water meter fee
    message = `Полив выполнен по счетчику ЖКХ (списано $4 за воду). Влажность: ${newMoisture}%.`;
  }

  if (newMoisture > 88) {
    condition = 'overwatered';
    healthDelta = -4;
    isWarning = true;
    message += ' Внимание! Перелив субстрата. Корни испытывают кислородное голодание!';
  } else if (newMoisture >= 50 && newMoisture <= 75) {
    if (condition === 'thirsty') condition = 'optimal';
    healthDelta = +2;
    message += ' Влажность вернулась в идеальную зону.';
  }

  const log: PlantLogEntry = {
    id: `log_${Date.now()}`,
    timestamp: 'Только что',
    action: 'Полив',
    result: message,
    type: isWarning ? 'warning' : 'care',
  };

  const updatedPlant: BotanyPlant = {
    ...plant,
    moisture: newMoisture,
    health: Math.min(100, Math.max(10, plant.health + healthDelta)),
    condition,
    historyLog: [log, ...(plant.historyLog || []).slice(0, 9)],
    careScore: (plant.careScore || 100) + (isWarning ? -10 : 5),
  };

  return { updatedPlant, waterUsedLitres, cashUtilityCost, message, isWarning };
}

/**
 * Perform Feeding action with consumable nutrient ml
 */
export function feedPlant(
  plant: BotanyPlant,
  formula: 'veg_nitro' | 'bloom_pk' | 'organic_tea',
  nutrientStockMl: number
): {
  updatedPlant: BotanyPlant;
  mlUsed: number;
  message: string;
  isWarning: boolean;
  canExecute: boolean;
} {
  const reqMl = formula === 'veg_nitro' ? 25 : formula === 'bloom_pk' ? 30 : 40;

  if (nutrientStockMl < reqMl) {
    return {
      updatedPlant: plant,
      mlUsed: 0,
      message: `Недостаточно удобрения в запасах (требуется ${reqMl} мл). Закупите бутыль в Гроушопе!`,
      isWarning: true,
      canExecute: false,
    };
  }

  let deltaN = 0;
  let deltaP = 0;
  let deltaK = 0;
  let message = '';
  let isWarning = false;

  if (formula === 'veg_nitro') {
    deltaN = 25;
    deltaP = 5;
    deltaK = 10;
    message = 'Внесено 25 мл N-Max для вегетативного роста кроны.';
  } else if (formula === 'bloom_pk') {
    deltaN = 5;
    deltaP = 30;
    deltaK = 35;
    message = 'Внесено 30 мл PK 13/14 Бустера для наливания плотных шишек.';
  } else {
    deltaN = 15;
    deltaP = 15;
    deltaK = 15;
    message = 'Внесено 40 мл органического биогумуса с микоризой.';
  }

  const newN = Math.min(100, plant.nutrients.n + deltaN);
  const newP = Math.min(100, plant.nutrients.p + deltaP);
  const newK = Math.min(100, plant.nutrients.k + deltaK);

  let condition = plant.condition;
  let healthChange = 0;
  if (newN > 90 || newP > 90 || newK > 92) {
    condition = 'nutrient_burn';
    healthChange = -6;
    isWarning = true;
    message += ' Внимание: Передозировка солей (Nutrient Burn)! Пожелтение кончиков.';
  } else {
    healthChange = +3;
  }

  const log: PlantLogEntry = {
    id: `log_${Date.now()}`,
    timestamp: 'Только что',
    action: 'Подкормка',
    result: message,
    type: isWarning ? 'warning' : 'care',
  };

  const updatedPlant: BotanyPlant = {
    ...plant,
    nutrients: {
      ...plant.nutrients,
      n: newN,
      p: newP,
      k: newK,
    },
    soilQuality: Math.min(100, plant.soilQuality + (isWarning ? -10 : 8)),
    health: Math.min(100, Math.max(10, plant.health + healthChange)),
    condition,
    historyLog: [log, ...(plant.historyLog || []).slice(0, 9)],
    careScore: (plant.careScore || 100) + (isWarning ? -15 : 8),
  };

  return { updatedPlant, mlUsed: reqMl, message, isWarning, canExecute: true };
}

/**
 * Diagnostic Inspection action
 */
export function inspectPlantDiagnosis(plant: BotanyPlant): {
  overallHealth: string;
  moistureStatus: string;
  nutritionStatus: string;
  recommendations: string[];
} {
  const recommendations: string[] = [];

  let moistureStatus = 'В норме (50-75%)';
  if (plant.moisture < 35) {
    moistureStatus = 'КРИТИЧЕСКАЯ ЖАЖДА (<35%)';
    recommendations.push('Срочно полейте субстрат мягкой отстоянной или осмотической водой.');
  } else if (plant.moisture > 80) {
    moistureStatus = 'ПЕРЕСЫЩЕНИЕ ВЛАГОЙ (>80%)';
    recommendations.push('Приостановите полив на 24 часа для аэрации корней.');
  }

  let nutritionStatus = 'Баланс микроэлементов оптимален';
  if (plant.stage === 'developing' && plant.nutrients.n < 45) {
    nutritionStatus = 'Дефицит азота (N) на вегетативной фазе';
    recommendations.push('Внесите формулу N-Max для набора зеленой массы.');
  } else if (plant.stage === 'flowering' && (plant.nutrients.p < 50 || plant.nutrients.k < 50)) {
    nutritionStatus = 'Дефицит фосфора/калия (PK) на цветении';
    recommendations.push('Добавьте PK 13/14 бустер для плотности шишек.');
  }

  if (plant.activeEvent) {
    recommendations.push(`Активная проблема: ${plant.activeEvent.title}. Используйте кнопку устранения.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('Растение находится в превосходных кондициях. Режим микроклимата соблюден.');
  }

  const overallHealth =
    plant.health >= 85 ? 'Отличное' : plant.health >= 60 ? 'Удовлетворительное' : 'Ослабленное (Требует внимания)';

  return {
    overallHealth,
    moistureStatus,
    nutritionStatus,
    recommendations,
  };
}

/**
 * Resolve active event/problem on plant with resource/cash cost
 */
export function resolvePlantEvent(
  plant: BotanyPlant,
  neemStockMl: number,
  waterStockL: number
): {
  updatedPlant: BotanyPlant;
  neemUsedMl: number;
  waterUsedL: number;
  cashCost: number;
  message: string;
  canExecute: boolean;
} {
  if (!plant.activeEvent) {
    return {
      updatedPlant: plant,
      neemUsedMl: 0,
      waterUsedL: 0,
      cashCost: 0,
      message: 'Нет активных проблем, требующих вмешательства.',
      canExecute: false,
    };
  }

  const eventTitle = plant.activeEvent.title;
  let resolutionMsg = `Проблема «${eventTitle}» успешно устранена.`;
  let neemUsedMl = 0;
  let waterUsedL = 0;
  let cashCost = 0;

  if (plant.activeEvent.type === 'pest_alert') {
    if (neemStockMl >= 15) {
      neemUsedMl = 15;
      resolutionMsg = 'Листья обработаны 15 мл органического масла нима. Паразиты нейтрализованы.';
    } else {
      cashCost = 12; // Emergency spray fee
      resolutionMsg = 'Вызвана экстренная санобработка от мошек (списано $12). Паразиты устранены.';
    }
  } else if (plant.activeEvent.type === 'nutrient_lockout') {
    if (waterStockL >= 5) {
      waterUsedL = 5;
      resolutionMsg = 'Корневая зона промыта 5 литрами чистой осмотической воды (Flush). Баланс солей восстановлен.';
    } else {
      cashCost = 10;
      resolutionMsg = 'Проведен аварийный промыв водой по счетчику ЖКХ ($10). Баланс ЕС нормализован.';
    }
  } else {
    cashCost = 5;
    resolutionMsg = 'Параметры микроклимата и вентиляции отрегулированы ($5 за сервис).';
  }

  const log: PlantLogEntry = {
    id: `log_${Date.now()}`,
    timestamp: 'Только что',
    action: 'Устранение проблемы',
    result: resolutionMsg,
    type: 'care',
  };

  const updatedPlant: BotanyPlant = {
    ...plant,
    activeEvent: null,
    condition: 'good',
    health: Math.min(100, plant.health + 10),
    historyLog: [log, ...(plant.historyLog || []).slice(0, 9)],
    careScore: (plant.careScore || 100) + 15,
  };

  return {
    updatedPlant,
    neemUsedMl,
    waterUsedL,
    cashCost,
    message: resolutionMsg,
    canExecute: true,
  };
}

/**
 * Simulate 1 game hour tick for a plant
 */
export function simulatePlantHourTick(plant: BotanyPlant, lawyerRetainerActive: boolean): BotanyPlant {
  const evaporationRate = plant.lightWattage >= 1000 ? 3.0 : 2.0;
  const newMoisture = Math.max(0, Math.round((plant.moisture - evaporationRate) * 10) / 10);

  let healthDelta = 0;
  let condition: PlantCondition = plant.condition;

  if (newMoisture < 25) {
    condition = 'thirsty';
    healthDelta -= 2.0;
  } else if (newMoisture > 85) {
    condition = 'overwatered';
    healthDelta -= 1.5;
  } else if (condition === 'thirsty' || condition === 'overwatered') {
    condition = 'good';
  }

  let growthSpeedMultiplier = 1.0;
  if (plant.medium === 'hydroponics') growthSpeedMultiplier *= 1.25;
  if (plant.medium === 'coco') growthSpeedMultiplier *= 1.12;
  if (plant.lightWattage === 800) growthSpeedMultiplier *= 1.1;
  if (plant.lightWattage === 1000) growthSpeedMultiplier *= 1.2;
  if (plant.scrogInstalled) growthSpeedMultiplier *= 1.08;

  if (plant.health < 40 || newMoisture < 15) {
    growthSpeedMultiplier = 0.2;
  } else if (plant.health >= 85 && newMoisture >= 50 && newMoisture <= 75) {
    growthSpeedMultiplier *= 1.2;
  }

  const nextProgress = Math.min(100, plant.progress + 1.2 * growthSpeedMultiplier);
  const { stage: nextStage, stageProgress } = getStageFromProgress(nextProgress);

  let updatedLog = plant.historyLog || [];
  if (nextStage !== plant.stage) {
    const stageConf = PLANT_STAGES_CONFIG[nextStage];
    const stageLog: PlantLogEntry = {
      id: `log_${Date.now()}`,
      timestamp: 'Новая стадия',
      action: `Переход в фазу: ${stageConf.nameRu}`,
      result: stageConf.descriptionRu,
      type: 'stage',
    };
    updatedLog = [stageLog, ...updatedLog.slice(0, 9)];
  }

  let nextEvent = plant.activeEvent;
  if (!nextEvent && Math.random() < 0.04 && plant.stage !== 'ready_harvest') {
    const eventRoll = Math.random();
    if (eventRoll < 0.35) {
      nextEvent = {
        id: `ev_${Date.now()}`,
        type: 'pest_alert',
        title: 'Завелись листовые мошки',
        description: 'Личинки мошек повреждают нежные корешки. Требуется спрей масла нима.',
        severity: 'medium',
        actionRequired: 'Обработать маслом нима',
      };
    } else if (eventRoll < 0.7) {
      nextEvent = {
        id: `ev_${Date.now()}`,
        type: 'temperature_spike',
        title: 'Скачок температуры гроутента',
        description: 'Жар от ламп нагрел воздух до 31°C. Требуется оптимизация обдува.',
        severity: 'low',
        actionRequired: 'Отрегулировать вентиляцию',
      };
    } else {
      nextEvent = {
        id: `ev_${Date.now()}`,
        type: 'surge_growth',
        title: 'Взрывной фотосинтез (VPD Peak)',
        description: 'Идеальное соотношение температуры и влажности! Ускорение метаболизма.',
        severity: 'positive',
      };
    }
  }

  const baseSmell =
    nextStage === 'seed'
      ? 0
      : nextStage === 'seedling'
      ? 2
      : nextStage === 'young_bush'
      ? 6
      : nextStage === 'developing'
      ? 12
      : 24;

  return {
    ...plant,
    progress: nextProgress,
    stage: nextStage,
    stageProgress,
    moisture: newMoisture,
    health: Math.min(100, Math.max(5, plant.health + healthDelta)),
    condition,
    smellUnits: baseSmell,
    activeEvent: nextEvent,
    historyLog: updatedLog,
  };
}

/**
 * Calculate realistic harvest yields (50g to 95g)
 */
export function calculatePlantHarvest(plant: BotanyPlant): {
  yieldGrams: number;
  purity: number;
  qualityRating: 'AAA+ Премиум' | 'Grade-A Стандарт' | 'B-Grade Урожай' | 'Брак/Технический';
} {
  const strainDef = STRAIN_DEFINITIONS.find((s) => s.id === plant.strainId);
  const baseYield = strainDef ? strainDef.yieldGrams : 65;

  const healthFactor = plant.health / 100;
  const moisturePenalty = plant.moisture > 80 ? 0.85 : 1.0;
  const mediumFactor = plant.medium === 'hydroponics' ? 1.2 : plant.medium === 'coco' ? 1.1 : 1.0;
  const scrogBonus = plant.scrogInstalled ? 1.15 : 1.0;

  const finalYield = Math.max(15, Math.round(baseYield * healthFactor * moisturePenalty * mediumFactor * scrogBonus));
  const purity = Math.min(99, Math.max(55, Math.round(plant.purity * (0.85 + (plant.health / 100) * 0.15))));

  let qualityRating: 'AAA+ Премиум' | 'Grade-A Стандарт' | 'B-Grade Урожай' | 'Брак/Технический' = 'Grade-A Стандарт';
  if (purity >= 94 && plant.health >= 90) {
    qualityRating = 'AAA+ Премиум';
  } else if (purity < 75 || plant.health < 60) {
    qualityRating = 'B-Grade Урожай';
  }

  return {
    yieldGrams: finalYield,
    purity,
    qualityRating,
  };
}
