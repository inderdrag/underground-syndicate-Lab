import { PharmaPackConfig } from '../types/pharma';

/**
 * Standalone Pharma Pack Data Configuration
 * Complete catalog covering Opioids, Benzodiazepines, Gabapentinoids, and Antidepressants.
 */
export const pharmaPackConfig: PharmaPackConfig = {
  enabled: true,
  version: '1.0.0',
  ingredients: [
    {
      id: 'pharma_base_extract',
      name: 'Базовый Фарм-Экстракт',
      description: 'Концентрированное химическое сырьё высокой степени очистки',
      basePrice: 65,
      icon: '🧪'
    },
    {
      id: 'pharma_binder',
      name: 'Фармо-Основа (Связующее)',
      description: 'Медицинский наполнитель для прессования таблеток и капсулирования',
      basePrice: 25,
      icon: '⚪'
    },
    {
      id: 'pharma_stabilizer',
      name: 'Органический Стабилизатор',
      description: 'Защищает активные химические соединения от окисления и распада',
      basePrice: 40,
      icon: '🛡️'
    },
    {
      id: 'pharma_solvent',
      name: 'Очищенный Растворитель',
      description: 'Безводный растворитель для приготовления сиропов и экстракций',
      basePrice: 30,
      icon: '💧'
    }
  ],
  items: [
    // --- ОПИОИДНЫЕ ---
    {
      id: 'codeine_syrup',
      name: 'Кодеиновый Сироп (Purple Lean)',
      subgroup: 'opioids',
      form: 'syrup',
      icon: '🍼',
      description: 'Аптечный успокоительный сироп. Высокий спрос у уличной молодёжи и в клубах.',
      basePrice: 120,
      districtPriceRanges: {
        slums: [80, 110],
        downtown: [120, 150],
        nightclubs: [140, 180],
        suburbs: [90, 130]
      },
      potency: 65,
      durationMinutes: 180,
      addictionRisk: 0.65,
      overdoseRisk: 0.35,
      heatOnCraft: 4,
      heatOnSale: 3,
      basePurity: 88,
      recipe: {
        id: 'recipe_codeine_syrup',
        stationId: 'mixer',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 2 },
          { ingredientId: 'pharma_binder', amount: 1 },
          { ingredientId: 'pharma_solvent', amount: 1 }
        ],
        craftTimeSeconds: 45,
        outputAmount: 5,
        defectChance: 0.12,
        goldenZone: { targetTempC: 58, tempTolerance: 4, targetRpm: 450, targetDoseMg: 120 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 10
      }
    },
    {
      id: 'codeine_tabs',
      name: 'Кодеиновые Таблетки',
      subgroup: 'opioids',
      form: 'pills',
      icon: '💊',
      description: 'Опиоидный анальгетик в форме стандартных белых таблеток.',
      basePrice: 90,
      districtPriceRanges: { slums: [65, 85], downtown: [90, 115], nightclubs: [85, 110], suburbs: [75, 95] },
      potency: 60,
      durationMinutes: 150,
      addictionRisk: 0.60,
      overdoseRisk: 0.30,
      heatOnCraft: 3,
      heatOnSale: 2,
      basePurity: 90,
      recipe: {
        id: 'recipe_codeine_tabs',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 1 },
          { ingredientId: 'pharma_binder', amount: 2 }
        ],
        craftTimeSeconds: 35,
        outputAmount: 15,
        defectChance: 0.09,
        goldenZone: { targetTempC: 45, tempTolerance: 5, targetRpm: 700, targetDoseMg: 30 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 15
      }
    },
    {
      id: 'tramadol_caps',
      name: 'Трамадол (Tramal 200mg)',
      subgroup: 'opioids',
      form: 'pills',
      icon: '💊',
      description: 'Синтетический опиоидный обезболивающий препарат среднего действия.',
      basePrice: 110,
      districtPriceRanges: { slums: [80, 105], downtown: [110, 140], nightclubs: [105, 135], suburbs: [90, 115] },
      potency: 70,
      durationMinutes: 210,
      addictionRisk: 0.70,
      overdoseRisk: 0.40,
      heatOnCraft: 4,
      heatOnSale: 3,
      basePurity: 92,
      recipe: {
        id: 'recipe_tramadol_caps',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 2 },
          { ingredientId: 'pharma_stabilizer', amount: 1 }
        ],
        craftTimeSeconds: 50,
        outputAmount: 12,
        defectChance: 0.10,
        goldenZone: { targetTempC: 52, tempTolerance: 4, targetRpm: 500, targetDoseMg: 200 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 25
      }
    },
    {
      id: 'methadone_sol',
      name: 'Метадоновый Раствор',
      subgroup: 'opioids',
      form: 'syrup',
      icon: '🧪',
      description: 'Тяжёлый синтетический опиоид пролонгированного действия.',
      basePrice: 180,
      districtPriceRanges: { slums: [140, 175], downtown: [180, 230], nightclubs: [160, 210], suburbs: [150, 190] },
      potency: 88,
      durationMinutes: 360,
      addictionRisk: 0.85,
      overdoseRisk: 0.60,
      heatOnCraft: 6,
      heatOnSale: 5,
      basePurity: 86,
      recipe: {
        id: 'recipe_methadone_sol',
        stationId: 'mixer',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 3 },
          { ingredientId: 'pharma_solvent', amount: 2 },
          { ingredientId: 'pharma_stabilizer', amount: 1 }
        ],
        craftTimeSeconds: 70,
        outputAmount: 8,
        defectChance: 0.15,
        goldenZone: { targetTempC: 65, tempTolerance: 3, targetRpm: 600, targetDoseMg: 40 },
        unlockedAtLevel: 3,
        unlockedAtReputation: 45
      }
    },
    {
      id: 'heroin_pure',
      name: 'Очищенный Героин (H-99)',
      subgroup: 'opioids',
      form: 'powder',
      icon: '⚖️',
      description: 'Самый тяжёлый и высокорискованный наркотик. Колоссальная прибыль, огромный риск.',
      basePrice: 320,
      districtPriceRanges: { slums: [250, 300], downtown: [320, 420], nightclubs: [280, 380], suburbs: [260, 340] },
      potency: 98,
      durationMinutes: 300,
      addictionRisk: 0.95,
      overdoseRisk: 0.80,
      heatOnCraft: 9,
      heatOnSale: 8,
      basePurity: 95,
      recipe: {
        id: 'recipe_heroin_pure',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 4 },
          { ingredientId: 'pharma_solvent', amount: 2 },
          { ingredientId: 'pharma_stabilizer', amount: 2 }
        ],
        craftTimeSeconds: 90,
        outputAmount: 10,
        defectChance: 0.20,
        goldenZone: { targetTempC: 75, tempTolerance: 2, targetRpm: 900, targetDoseMg: 50 },
        unlockedAtLevel: 4,
        unlockedAtReputation: 70
      }
    },

    // --- БЕНЗОДИАЗЕПИНЫ ---
    {
      id: 'alprazolam_tabs',
      name: 'Алпразолам (Xanax Bars)',
      subgroup: 'benzodiazepines',
      form: 'pills',
      icon: '💊',
      description: 'Мощный бензодиазепиновый транквилизатор в форме прямоугольных таблеток.',
      basePrice: 85,
      districtPriceRanges: { slums: [60, 80], downtown: [85, 110], nightclubs: [100, 130], suburbs: [70, 95] },
      potency: 80,
      durationMinutes: 240,
      addictionRisk: 0.50,
      overdoseRisk: 0.20,
      heatOnCraft: 3,
      heatOnSale: 2,
      basePurity: 94,
      recipe: {
        id: 'recipe_alprazolam_tabs',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 1 },
          { ingredientId: 'pharma_binder', amount: 2 },
          { ingredientId: 'pharma_stabilizer', amount: 1 }
        ],
        craftTimeSeconds: 60,
        outputAmount: 20,
        defectChance: 0.08,
        goldenZone: { targetTempC: 42, tempTolerance: 3, targetRpm: 800, targetDoseMg: 2 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 25
      }
    },
    {
      id: 'diazepam_solution',
      name: 'Диазепам (Valium Drops)',
      subgroup: 'benzodiazepines',
      form: 'syrup',
      icon: '💧',
      description: 'Седативный препарат широкого спектра в жидкой форме.',
      basePrice: 95,
      districtPriceRanges: { slums: [70, 90], downtown: [95, 120], nightclubs: [90, 115], suburbs: [80, 100] },
      potency: 72,
      durationMinutes: 280,
      addictionRisk: 0.45,
      overdoseRisk: 0.18,
      heatOnCraft: 3,
      heatOnSale: 2,
      basePurity: 91,
      recipe: {
        id: 'recipe_diazepam_solution',
        stationId: 'mixer',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 1 },
          { ingredientId: 'pharma_solvent', amount: 2 }
        ],
        craftTimeSeconds: 40,
        outputAmount: 8,
        defectChance: 0.07,
        goldenZone: { targetTempC: 48, tempTolerance: 5, targetRpm: 400, targetDoseMg: 10 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 20
      }
    },

    // --- ГАБАПЕНТИНОИДЫ ---
    {
      id: 'pregabalin_caps',
      name: 'Прегабалин (Lyrica 300mg)',
      subgroup: 'gabapentinoids',
      form: 'pills',
      icon: '💊',
      description: 'Габапентиноидный препарат в капсулах. Популярен среди постоянных аптечных клиентов.',
      basePrice: 95,
      districtPriceRanges: { slums: [70, 90], downtown: [95, 125], nightclubs: [90, 120], suburbs: [80, 105] },
      potency: 75,
      durationMinutes: 300,
      addictionRisk: 0.55,
      overdoseRisk: 0.25,
      heatOnCraft: 3,
      heatOnSale: 3,
      basePurity: 91,
      recipe: {
        id: 'recipe_pregabalin_caps',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 2 },
          { ingredientId: 'pharma_stabilizer', amount: 1 },
          { ingredientId: 'pharma_solvent', amount: 1 }
        ],
        craftTimeSeconds: 50,
        outputAmount: 15,
        defectChance: 0.10,
        goldenZone: { targetTempC: 50, tempTolerance: 5, targetRpm: 600, targetDoseMg: 300 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 30
      }
    },
    {
      id: 'phenibut_powder',
      name: 'Фенибут (Кристаллический Порошок)',
      subgroup: 'gabapentinoids',
      form: 'powder',
      icon: '❄️',
      description: 'Ноотропный ноо-стимулятор с легким анксиолитическим эффектом.',
      basePrice: 70,
      districtPriceRanges: { slums: [50, 65], downtown: [70, 90], nightclubs: [75, 95], suburbs: [60, 80] },
      potency: 50,
      durationMinutes: 200,
      addictionRisk: 0.30,
      overdoseRisk: 0.10,
      heatOnCraft: 2,
      heatOnSale: 1,
      basePurity: 96,
      recipe: {
        id: 'recipe_phenibut_powder',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 1 },
          { ingredientId: 'pharma_binder', amount: 1 }
        ],
        craftTimeSeconds: 30,
        outputAmount: 25,
        defectChance: 0.05,
        goldenZone: { targetTempC: 38, tempTolerance: 6, targetRpm: 350, targetDoseMg: 500 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 5
      }
    },

    // --- АНТИДЕПРЕССАНТЫ ---
    {
      id: 'sertraline_tabs',
      name: 'Сертралин (Zoloft 100mg)',
      subgroup: 'antidepressants',
      form: 'pills',
      icon: '🟡',
      description: 'СИОЗС-антидепрессант. Повышает уровень серотонина, используется для стабилизации клиентов.',
      basePrice: 65,
      districtPriceRanges: { slums: [45, 60], downtown: [65, 85], nightclubs: [50, 70], suburbs: [60, 75] },
      potency: 45,
      durationMinutes: 480,
      addictionRisk: 0.15,
      overdoseRisk: 0.05,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 97,
      recipe: {
        id: 'recipe_sertraline_tabs',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'pharma_base_extract', amount: 1 },
          { ingredientId: 'pharma_binder', amount: 1 },
          { ingredientId: 'pharma_stabilizer', amount: 1 }
        ],
        craftTimeSeconds: 25,
        outputAmount: 20,
        defectChance: 0.04,
        goldenZone: { targetTempC: 40, tempTolerance: 5, targetRpm: 500, targetDoseMg: 100 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 1
      }
    }
  ]
};
