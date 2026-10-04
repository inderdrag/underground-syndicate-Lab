import { PharmaPackConfig } from '../types/pharma';

/**
 * Standalone Pharma Pack Data Configuration
 * Synchronized with PHARMA_DRUGS_CATALOG across the entire application.
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
    // --- 🩹 ОБЕЗБОЛИВАЮЩИЕ & НПВС (ANALGESICS) ---
    {
      id: 'aspirin',
      name: 'Аспирин',
      subgroup: 'analgesics',
      form: 'pills',
      icon: '🌿',
      description: 'Аспирин 500 мг (Байер). Жаропонижающее и анальгетическое средство.',
      basePrice: 6,
      districtPriceRanges: { slums: [4, 6], downtown: [6, 9], nightclubs: [5, 8], suburbs: [5, 7] },
      potency: 15,
      durationMinutes: 60,
      addictionRisk: 0.0,
      overdoseRisk: 0.05,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 95,
      recipe: {
        id: 'recipe_aspirin',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_willow_extract', amount: 1 },
          { ingredientId: 'cat_acid_buffer', amount: 1 },
          { ingredientId: 'pack_paper_blister', amount: 1 }
        ],
        craftTimeSeconds: 12,
        outputAmount: 10,
        defectChance: 0.02,
        goldenZone: { targetTempC: 40, tempTolerance: 10, targetRpm: 500, targetDoseMg: 500 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 0
      }
    },
    {
      id: 'no_shpa',
      name: 'Но-шпа',
      subgroup: 'analgesics',
      form: 'pills',
      icon: '💊',
      description: 'Но-шпа 40 мг (Санофи). Спазмолитик и обезболивающее средство.',
      basePrice: 9,
      districtPriceRanges: { slums: [7, 9], downtown: [9, 13], nightclubs: [8, 12], suburbs: [8, 10] },
      potency: 25,
      durationMinutes: 90,
      addictionRisk: 0.0,
      overdoseRisk: 0.05,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 95,
      recipe: {
        id: 'recipe_no_shpa',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_spasmo_lyte', amount: 1 },
          { ingredientId: 'cat_soft_solvent', amount: 1 },
          { ingredientId: 'pack_plastic_blister', amount: 1 }
        ],
        craftTimeSeconds: 15,
        outputAmount: 10,
        defectChance: 0.03,
        goldenZone: { targetTempC: 45, tempTolerance: 8, targetRpm: 550, targetDoseMg: 40 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 0
      }
    },
    {
      id: 'paracetamol',
      name: 'Парацетамол',
      subgroup: 'analgesics',
      form: 'pills',
      icon: '⚪',
      description: 'Парацетамол 500 мг. Восстановление здоровья (+15 HP) и снятие жара.',
      basePrice: 5,
      districtPriceRanges: { slums: [3, 5], downtown: [5, 8], nightclubs: [4, 7], suburbs: [4, 6] },
      potency: 20,
      durationMinutes: 60,
      addictionRisk: 0.0,
      overdoseRisk: 0.05,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 98,
      recipe: {
        id: 'recipe_paracetamol',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_alba', amount: 1 },
          { ingredientId: 'cat_starch_binder', amount: 1 },
          { ingredientId: 'pack_paper_blister', amount: 1 }
        ],
        craftTimeSeconds: 15,
        outputAmount: 10,
        defectChance: 0.02,
        goldenZone: { targetTempC: 42, tempTolerance: 10, targetRpm: 500, targetDoseMg: 500 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 0
      }
    },
    {
      id: 'ibuprofen',
      name: 'Ибупрофен',
      subgroup: 'analgesics',
      form: 'pills',
      icon: '🩹',
      description: 'Ибупрофен 400 мг. Мощный противовоспалительный анальгетик (+25 HP).',
      basePrice: 8,
      districtPriceRanges: { slums: [6, 8], downtown: [8, 12], nightclubs: [7, 11], suburbs: [7, 9] },
      potency: 30,
      durationMinutes: 90,
      addictionRisk: 0.0,
      overdoseRisk: 0.05,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 96,
      recipe: {
        id: 'recipe_ibuprofen',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_alba_pro', amount: 1 },
          { ingredientId: 'cat_citrus_buffer', amount: 1 },
          { ingredientId: 'pack_foil', amount: 1 }
        ],
        craftTimeSeconds: 18,
        outputAmount: 10,
        defectChance: 0.03,
        goldenZone: { targetTempC: 48, tempTolerance: 8, targetRpm: 600, targetDoseMg: 400 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 5
      }
    },

    // --- 🌿 ПРОТИВОАЛЛЕРГИЧЕСКИЕ (ANTIHISTAMINES) ---
    {
      id: 'loratadine',
      name: 'Лоратадин',
      subgroup: 'antihistamines',
      form: 'pills',
      icon: '🛡️',
      description: 'Лоратадин 10 мг (Шеринг). Блокатор гистаминовых H1-рецепторов.',
      basePrice: 8,
      districtPriceRanges: { slums: [6, 8], downtown: [8, 12], nightclubs: [7, 10], suburbs: [7, 9] },
      potency: 25,
      durationMinutes: 120,
      addictionRisk: 0.0,
      overdoseRisk: 0.02,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 97,
      recipe: {
        id: 'recipe_loratadine',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_alba_anti', amount: 1 },
          { ingredientId: 'cat_antihistamine_module', amount: 1 },
          { ingredientId: 'pack_foil', amount: 1 }
        ],
        craftTimeSeconds: 15,
        outputAmount: 10,
        defectChance: 0.02,
        goldenZone: { targetTempC: 45, tempTolerance: 9, targetRpm: 550, targetDoseMg: 10 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 0
      }
    },

    // --- 🫀 ДЛЯ ПИЩЕВАРЕНИЯ & СОРБЕНТЫ (SORBENTS) ---
    {
      id: 'activated_charcoal',
      name: 'Активированный уголь',
      subgroup: 'sorbents',
      form: 'pills',
      icon: '🪵',
      description: 'Уголь Активированный 250 мг. Адсорбент токсинов и химических соединений.',
      basePrice: 5,
      districtPriceRanges: { slums: [3, 5], downtown: [5, 8], nightclubs: [4, 7], suburbs: [4, 6] },
      potency: 20,
      durationMinutes: 60,
      addictionRisk: 0.0,
      overdoseRisk: 0.0,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 99,
      recipe: {
        id: 'recipe_activated_charcoal',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_charred_wood', amount: 1 },
          { ingredientId: 'cat_porous_activator', amount: 1 },
          { ingredientId: 'pack_cardboard_strip', amount: 1 }
        ],
        craftTimeSeconds: 10,
        outputAmount: 10,
        defectChance: 0.01,
        goldenZone: { targetTempC: 35, tempTolerance: 12, targetRpm: 450, targetDoseMg: 250 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 0
      }
    },

    // --- 💊 ВИТАМИНЫ & БАДЫ (VITAMINS) ---
    {
      id: 'vitamin_c',
      name: 'Витамин C',
      subgroup: 'vitamins',
      form: 'pills',
      icon: '🍋',
      description: 'Витамин C 1000 мг Шипучий. Иммуностимулятор и нейтрализатор утомления.',
      basePrice: 7,
      districtPriceRanges: { slums: [5, 7], downtown: [7, 11], nightclubs: [6, 10], suburbs: [6, 8] },
      potency: 20,
      durationMinutes: 90,
      addictionRisk: 0.0,
      overdoseRisk: 0.01,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 98,
      recipe: {
        id: 'recipe_vitamin_c',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_citrus_concentrate', amount: 1 },
          { ingredientId: 'cat_effervescent_activator', amount: 1 },
          { ingredientId: 'pack_tubus', amount: 1 }
        ],
        craftTimeSeconds: 12,
        outputAmount: 10,
        defectChance: 0.02,
        goldenZone: { targetTempC: 40, tempTolerance: 10, targetRpm: 500, targetDoseMg: 1000 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 0
      }
    },
    {
      id: 'melatonin',
      name: 'Мелатонин',
      subgroup: 'vitamins',
      form: 'pills',
      icon: '🌙',
      description: 'Мелатонин 3 мг. Регулятор сна и суточных биоритмов (+40% энергии во сне).',
      basePrice: 10,
      districtPriceRanges: { slums: [8, 10], downtown: [10, 15], nightclubs: [9, 14], suburbs: [8, 12] },
      potency: 35,
      durationMinutes: 180,
      addictionRisk: 0.0,
      overdoseRisk: 0.02,
      heatOnCraft: 1,
      heatOnSale: 1,
      basePurity: 95,
      recipe: {
        id: 'recipe_melatonin',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'base_moonflower_extract', amount: 1 },
          { ingredientId: 'cat_plant_sorbent', amount: 1 },
          { ingredientId: 'pack_dark_jar', amount: 1 }
        ],
        craftTimeSeconds: 20,
        outputAmount: 10,
        defectChance: 0.04,
        goldenZone: { targetTempC: 50, tempTolerance: 6, targetRpm: 600, targetDoseMg: 3 },
        unlockedAtLevel: 1,
        unlockedAtReputation: 10
      }
    },

    // --- ❄️ ГАБАПЕНТИНОИДЫ (GABAPENTINOIDS) ---
    {
      id: 'gabapentin',
      name: 'Габапентин',
      subgroup: 'gabapentinoids',
      form: 'pills',
      icon: '🧪',
      description: 'Габапентин 300 мг (Teva). Нейротропное противосудорожное средство.',
      basePrice: 25,
      districtPriceRanges: { slums: [18, 24], downtown: [25, 35], nightclubs: [22, 32], suburbs: [20, 28] },
      potency: 50,
      durationMinutes: 180,
      addictionRisk: 0.15,
      overdoseRisk: 0.10,
      heatOnCraft: 2,
      heatOnSale: 2,
      basePurity: 92,
      recipe: {
        id: 'recipe_gabapentin',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_neuro_seda', amount: 1 },
          { ingredientId: 'cat_alkaline_buffer', amount: 1 },
          { ingredientId: 'pack_grey_foil', amount: 1 }
        ],
        craftTimeSeconds: 30,
        outputAmount: 10,
        defectChance: 0.06,
        goldenZone: { targetTempC: 52, tempTolerance: 5, targetRpm: 650, targetDoseMg: 300 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 20
      }
    },
    {
      id: 'lyrica',
      name: 'Лирика',
      subgroup: 'gabapentinoids',
      form: 'pills',
      icon: '💊',
      description: 'LYRICA 75 мг (Pfizer). Прегабалин высокой степени очистки.',
      basePrice: 35,
      districtPriceRanges: { slums: [28, 34], downtown: [35, 48], nightclubs: [32, 45], suburbs: [30, 40] },
      potency: 65,
      durationMinutes: 240,
      addictionRisk: 0.30,
      overdoseRisk: 0.15,
      heatOnCraft: 3,
      heatOnSale: 3,
      basePurity: 94,
      recipe: {
        id: 'recipe_lyrica',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_neuro_seda_pro', amount: 1 },
          { ingredientId: 'cat_silent_leaf', amount: 1 },
          { ingredientId: 'pack_capsule_pkg', amount: 1 }
        ],
        craftTimeSeconds: 35,
        outputAmount: 10,
        defectChance: 0.07,
        goldenZone: { targetTempC: 55, tempTolerance: 4, targetRpm: 700, targetDoseMg: 75 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 30
      }
    },

    // --- 🟡 АНТИДЕПРЕССАНТЫ (ANTIDEPRESSANTS) ---
    {
      id: 'zoloft',
      name: 'Золофт',
      subgroup: 'antidepressants',
      form: 'pills',
      icon: '🟡',
      description: 'Zoloft 50 мг (Pfizer). Сертралин — селективный ингибитор обратного захвата серотонина.',
      basePrice: 40,
      districtPriceRanges: { slums: [32, 38], downtown: [40, 55], nightclubs: [38, 52], suburbs: [35, 45] },
      potency: 60,
      durationMinutes: 300,
      addictionRisk: 0.10,
      overdoseRisk: 0.08,
      heatOnCraft: 3,
      heatOnSale: 2,
      basePurity: 93,
      recipe: {
        id: 'recipe_zoloft',
        stationId: 'mixer',
        ingredients: [
          { ingredientId: 'base_sero', amount: 1 },
          { ingredientId: 'cat_sunny_citrus', amount: 1 },
          { ingredientId: 'pack_shell_blister', amount: 1 }
        ],
        craftTimeSeconds: 40,
        outputAmount: 10,
        defectChance: 0.08,
        goldenZone: { targetTempC: 58, tempTolerance: 4, targetRpm: 600, targetDoseMg: 50 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 35
      }
    },
    {
      id: 'prozac',
      name: 'Прозак',
      subgroup: 'antidepressants',
      form: 'pills',
      icon: '🟡',
      description: 'PROZAC 20 мг (Lilly). Флуоксетин — классический антидепрессант.',
      basePrice: 45,
      districtPriceRanges: { slums: [35, 42], downtown: [45, 60], nightclubs: [42, 58], suburbs: [40, 50] },
      potency: 65,
      durationMinutes: 320,
      addictionRisk: 0.12,
      overdoseRisk: 0.08,
      heatOnCraft: 3,
      heatOnSale: 2,
      basePurity: 92,
      recipe: {
        id: 'recipe_prozac',
        stationId: 'mixer',
        ingredients: [
          { ingredientId: 'base_sero_lite', amount: 1 },
          { ingredientId: 'cat_focus_module', amount: 1 },
          { ingredientId: 'pack_capsule', amount: 1 }
        ],
        craftTimeSeconds: 45,
        outputAmount: 10,
        defectChance: 0.09,
        goldenZone: { targetTempC: 60, tempTolerance: 4, targetRpm: 620, targetDoseMg: 20 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 40
      }
    },

    // --- 🧘 БЕНЗОДИАЗЕПИНЫ (BENZODIAZEPINES) ---
    {
      id: 'zolpidem',
      name: 'Золпидем',
      subgroup: 'benzodiazepines',
      form: 'pills',
      icon: '💤',
      description: 'Zolpidem 10 мг. Седативно-снотворное средство строгого учёта.',
      basePrice: 70,
      districtPriceRanges: { slums: [55, 68], downtown: [70, 95], nightclubs: [65, 90], suburbs: [60, 80] },
      potency: 75,
      durationMinutes: 240,
      addictionRisk: 0.35,
      overdoseRisk: 0.25,
      heatOnCraft: 4,
      heatOnSale: 4,
      basePurity: 94,
      recipe: {
        id: 'recipe_zolpidem',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_somna', amount: 1 },
          { ingredientId: 'cat_fast_dissolver', amount: 1 },
          { ingredientId: 'pack_sealed_blister', amount: 1 }
        ],
        craftTimeSeconds: 55,
        outputAmount: 10,
        defectChance: 0.10,
        goldenZone: { targetTempC: 50, tempTolerance: 3, targetRpm: 750, targetDoseMg: 10 },
        unlockedAtLevel: 3,
        unlockedAtReputation: 50
      }
    },
    {
      id: 'xanax',
      name: 'Ксанакс',
      subgroup: 'benzodiazepines',
      form: 'pills',
      icon: '💊',
      description: 'XANAX 1 мг (Pfizer). Алпразолам — анксиолитик и транквилизатор высокого спроса.',
      basePrice: 90,
      districtPriceRanges: { slums: [70, 88], downtown: [90, 125], nightclubs: [95, 130], suburbs: [80, 105] },
      potency: 85,
      durationMinutes: 280,
      addictionRisk: 0.55,
      overdoseRisk: 0.30,
      heatOnCraft: 5,
      heatOnSale: 5,
      basePurity: 95,
      recipe: {
        id: 'recipe_xanax',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_tranqui', amount: 1 },
          { ingredientId: 'cat_silence_stab', amount: 1 },
          { ingredientId: 'pack_protected_blister', amount: 1 }
        ],
        craftTimeSeconds: 60,
        outputAmount: 10,
        defectChance: 0.11,
        goldenZone: { targetTempC: 52, tempTolerance: 3, targetRpm: 800, targetDoseMg: 1 },
        unlockedAtLevel: 3,
        unlockedAtReputation: 60
      }
    },

    // --- 🧠 НООТРОПЫ & СТИМУЛЯТОРЫ (NOOTROPICS) ---
    {
      id: 'modafinil',
      name: 'Модафинил',
      subgroup: 'nootropics',
      form: 'pills',
      icon: '👁️',
      description: 'MODAFINIL 200 мг. Аналептик бодрствования и сверхфокусировки.',
      basePrice: 100,
      districtPriceRanges: { slums: [80, 98], downtown: [100, 140], nightclubs: [105, 145], suburbs: [90, 120] },
      potency: 80,
      durationMinutes: 360,
      addictionRisk: 0.40,
      overdoseRisk: 0.20,
      heatOnCraft: 5,
      heatOnSale: 4,
      basePurity: 93,
      recipe: {
        id: 'recipe_modafinil',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_vigil', amount: 1 },
          { ingredientId: 'cat_clarity_tonic', amount: 1 },
          { ingredientId: 'pack_blister', amount: 1 }
        ],
        craftTimeSeconds: 65,
        outputAmount: 10,
        defectChance: 0.12,
        goldenZone: { targetTempC: 55, tempTolerance: 3, targetRpm: 780, targetDoseMg: 200 },
        unlockedAtLevel: 3,
        unlockedAtReputation: 65
      }
    },
    {
      id: 'ritalin',
      name: 'Риталин',
      subgroup: 'nootropics',
      form: 'pills',
      icon: '⚡',
      description: 'Ritalin 10 мг (Novartis). Метилфенидат — психостимулятор концентрации.',
      basePrice: 120,
      districtPriceRanges: { slums: [95, 115], downtown: [120, 165], nightclubs: [125, 170], suburbs: [105, 140] },
      potency: 88,
      durationMinutes: 300,
      addictionRisk: 0.50,
      overdoseRisk: 0.35,
      heatOnCraft: 6,
      heatOnSale: 5,
      basePurity: 94,
      recipe: {
        id: 'recipe_ritalin',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_focus_stim', amount: 1 },
          { ingredientId: 'cat_neuro_activator', amount: 1 },
          { ingredientId: 'pack_blister', amount: 1 }
        ],
        craftTimeSeconds: 70,
        outputAmount: 10,
        defectChance: 0.13,
        goldenZone: { targetTempC: 58, tempTolerance: 3, targetRpm: 820, targetDoseMg: 10 },
        unlockedAtLevel: 4,
        unlockedAtReputation: 70
      }
    },
    {
      id: 'adderall',
      name: 'Аддерол',
      subgroup: 'nootropics',
      form: 'pills',
      icon: '⚡',
      description: 'ADDERALL XR 20 мг (Shire). Мощная смесь солей амфетаминового ряда.',
      basePrice: 200,
      districtPriceRanges: { slums: [160, 195], downtown: [200, 270], nightclubs: [210, 280], suburbs: [180, 230] },
      potency: 95,
      durationMinutes: 420,
      addictionRisk: 0.70,
      overdoseRisk: 0.50,
      heatOnCraft: 8,
      heatOnSale: 7,
      basePurity: 96,
      recipe: {
        id: 'recipe_adderall',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_stim_mix', amount: 1 },
          { ingredientId: 'cat_prolongator_xr', amount: 1 },
          { ingredientId: 'pack_granule_capsule', amount: 1 }
        ],
        craftTimeSeconds: 90,
        outputAmount: 5,
        defectChance: 0.16,
        goldenZone: { targetTempC: 62, tempTolerance: 2, targetRpm: 880, targetDoseMg: 20 },
        unlockedAtLevel: 4,
        unlockedAtReputation: 80
      }
    },

    // --- 🍼 ОПИОИДНЫЕ (OPIOIDS) ---
    {
      id: 'tramadol',
      name: 'Трамадол',
      subgroup: 'opioids',
      form: 'pills',
      icon: '💉',
      description: 'Tramadol 50 мг (Grünenthal). Опиоидный анальгетик с атипичным действием.',
      basePrice: 45,
      districtPriceRanges: { slums: [35, 43], downtown: [45, 62], nightclubs: [42, 58], suburbs: [38, 50] },
      potency: 60,
      durationMinutes: 240,
      addictionRisk: 0.30,
      overdoseRisk: 0.20,
      heatOnCraft: 3,
      heatOnSale: 3,
      basePurity: 91,
      recipe: {
        id: 'recipe_tramadol',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'base_analga', amount: 1 },
          { ingredientId: 'cat_slow_releaser', amount: 1 },
          { ingredientId: 'pack_thermo', amount: 1 }
        ],
        craftTimeSeconds: 45,
        outputAmount: 10,
        defectChance: 0.08,
        goldenZone: { targetTempC: 54, tempTolerance: 4, targetRpm: 680, targetDoseMg: 50 },
        unlockedAtLevel: 2,
        unlockedAtReputation: 35
      }
    },
    {
      id: 'codeine',
      name: 'Кодеин',
      subgroup: 'opioids',
      form: 'pills',
      icon: '🟤',
      description: 'Кодеин 30 мг. Полусинтетический опиоидный алкалоид.',
      basePrice: 130,
      districtPriceRanges: { slums: [100, 125], downtown: [130, 175], nightclubs: [135, 180], suburbs: [115, 150] },
      potency: 82,
      durationMinutes: 300,
      addictionRisk: 0.60,
      overdoseRisk: 0.40,
      heatOnCraft: 6,
      heatOnSale: 5,
      basePurity: 92,
      recipe: {
        id: 'recipe_codeine',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_dark_resin_lite', amount: 1 },
          { ingredientId: 'cat_softener', amount: 1 },
          { ingredientId: 'pack_blister', amount: 1 }
        ],
        craftTimeSeconds: 75,
        outputAmount: 10,
        defectChance: 0.14,
        goldenZone: { targetTempC: 60, tempTolerance: 3, targetRpm: 750, targetDoseMg: 30 },
        unlockedAtLevel: 3,
        unlockedAtReputation: 55
      }
    },
    {
      id: 'oxycodone',
      name: 'Оксикодон',
      subgroup: 'opioids',
      form: 'pills',
      icon: '🟤',
      description: 'OxyContin 10 мг (Purdue). Мощнейший опиоидный анальгетик элитной категории.',
      basePrice: 300,
      districtPriceRanges: { slums: [240, 290], downtown: [300, 400], nightclubs: [320, 420], suburbs: [270, 350] },
      potency: 96,
      durationMinutes: 480,
      addictionRisk: 0.85,
      overdoseRisk: 0.65,
      heatOnCraft: 9,
      heatOnSale: 8,
      basePurity: 96,
      recipe: {
        id: 'recipe_oxycodone',
        stationId: 'tablet_press',
        ingredients: [
          { ingredientId: 'base_dark_resin_pro', amount: 1 },
          { ingredientId: 'cat_release_ctrl', amount: 1 },
          { ingredientId: 'pack_tamper_proof', amount: 1 }
        ],
        craftTimeSeconds: 100,
        outputAmount: 5,
        defectChance: 0.18,
        goldenZone: { targetTempC: 68, tempTolerance: 2, targetRpm: 850, targetDoseMg: 10 },
        unlockedAtLevel: 4,
        unlockedAtReputation: 85
      }
    },
    {
      id: 'morphine',
      name: 'Морфин',
      subgroup: 'opioids',
      form: 'pills',
      icon: '💎',
      description: 'Morphine 10 мг (Ампулы). Чистейший опиоидный алкалоид высшего фармацевтического стандарта.',
      basePrice: 450,
      districtPriceRanges: { slums: [360, 430], downtown: [450, 600], nightclubs: [420, 580], suburbs: [400, 520] },
      potency: 99,
      durationMinutes: 540,
      addictionRisk: 0.90,
      overdoseRisk: 0.75,
      heatOnCraft: 10,
      heatOnSale: 9,
      basePurity: 98,
      recipe: {
        id: 'recipe_morphine',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'base_dark_resin_elite', amount: 1 },
          { ingredientId: 'cat_sterile_sol', amount: 1 },
          { ingredientId: 'pack_glass_ampoules', amount: 1 }
        ],
        craftTimeSeconds: 110,
        outputAmount: 5,
        defectChance: 0.15,
        goldenZone: { targetTempC: 72, tempTolerance: 2, targetRpm: 900, targetDoseMg: 10 },
        unlockedAtLevel: 5,
        unlockedAtReputation: 90
      }
    },
    {
      id: 'fentanyl',
      name: 'Фентанил',
      subgroup: 'opioids',
      form: 'pills',
      icon: '☣️',
      description: 'FENTANYL 100 mcg/h (Пластыри). Синтетический анальгетик максимальной критической мощности.',
      basePrice: 1000,
      districtPriceRanges: { slums: [800, 950], downtown: [1000, 1400], nightclubs: [1100, 1500], suburbs: [900, 1200] },
      potency: 100,
      durationMinutes: 600,
      addictionRisk: 0.98,
      overdoseRisk: 0.95,
      heatOnCraft: 12,
      heatOnSale: 12,
      basePurity: 99,
      recipe: {
        id: 'recipe_fentanyl',
        stationId: 'lab_bench',
        ingredients: [
          { ingredientId: 'base_synth_neuro', amount: 1 },
          { ingredientId: 'cat_transdermal_matrix', amount: 1 },
          { ingredientId: 'pack_laminated_patch', amount: 1 }
        ],
        craftTimeSeconds: 120,
        outputAmount: 1,
        defectChance: 0.22,
        goldenZone: { targetTempC: 80, tempTolerance: 1, targetRpm: 950, targetDoseMg: 0.1 },
        unlockedAtLevel: 5,
        unlockedAtReputation: 95
      }
    }
  ]
};
