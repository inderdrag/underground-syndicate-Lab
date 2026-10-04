import { GameState, StrainDef, BotanyPlant, MushroomBatch, LSDSynthesisBatch, DarknetOrder, CartelContract } from '../types/game';

export const STRAIN_DEFINITIONS: StrainDef[] = [
  {
    id: 'white_widow',
    name: 'White Widow',
    type: 'Balanced Hybrid',
    thcRange: [18, 22],
    floweringDays: 58,
    yieldGrams: 65,
    difficulty: 'Beginner',
    effectDescription: 'Legendary 1990s Dutch strain coated with thick crystalline white trichomes.',
    shaderEffect: {
      name: 'Temporal Stasis & Frost Vignette',
      type: 'time_dilation',
      description: 'Slows game simulation speed by 30% with an ethereal white mist vignette around viewport boundaries.'
    },
    seedPrice: 40,
    baseMarketPricePerGram: 14,
  },
  {
    id: 'amnesia_haze',
    name: 'Amnesia Haze',
    type: 'Sativa-dominant',
    thcRange: [21, 25],
    floweringDays: 68,
    yieldGrams: 85,
    difficulty: 'Intermediate',
    effectDescription: 'High-energy cerebral sativa with sharp citrus terpenes and intense headspace.',
    shaderEffect: {
      name: 'High Brightness & Hyper Velocity',
      type: 'brightness_speed',
      description: 'Vivid exposure flare, rotation motion blur, and accelerates operational processing speed by 1.4x.'
    },
    seedPrice: 55,
    baseMarketPricePerGram: 17,
  },
  {
    id: 'gorilla_glue',
    name: 'Gorilla Glue #4',
    type: 'Indica-dominant',
    thcRange: [25, 29],
    floweringDays: 62,
    yieldGrams: 75,
    difficulty: 'Intermediate',
    effectDescription: 'Heavy resin producer with pungent diesel punch delivering intense physical sedation.',
    shaderEffect: {
      name: 'Couch-Lock & Edge Blur',
      type: 'couch_lock',
      description: 'Dampens all camera tremors, applies heavy peripheral gaussian blur, and creates gentle UI panel sway.'
    },
    seedPrice: 65,
    baseMarketPricePerGram: 19,
  },
  {
    id: 'purple_haze',
    name: 'Purple Haze',
    type: 'Sativa-hybrid',
    thcRange: [19, 23],
    floweringDays: 64,
    yieldGrams: 70,
    difficulty: 'Beginner',
    effectDescription: 'Vibrant anthocyanin purple calyxes with spicy-sweet berry aroma and psychedelic euphoric kick.',
    shaderEffect: {
      name: 'Ultraviolet Psychedelic Shift',
      type: 'purple_psychedelic',
      description: 'Deep magenta/violet chromatic spectrum grade with continuous psychedelic color cycling across all text.'
    },
    seedPrice: 50,
    baseMarketPricePerGram: 16,
  }
];

export const INITIAL_GAME_STATE: GameState = {
  cash: 60,
  cryptoXmr: 0,
  cryptoBtc: 0,
  day: 1,
  hour: 8,
  timeSpeedMultiplier: 1.0,
  policeHeat: 0,
  lawyerRetainerActive: false,
  totalPowerWatts: 0,
  solarPanels: 0,
  generatorsActive: false,
  carbonFiltersInstalled: 0,
  employees: {
    trimmers: 0,
    labChemists: 0,
    couriers: 0,
  },
  inventory: {
    whiteWidowGrams: 0,
    amnesiaHazeGrams: 0,
    gorillaGlueGrams: 0,
    purpleHazeGrams: 0,
    mushroomsGrams: 0,
    lsdSheets: 0,
    cocaineGrams: 0,
    neuroSheets: 0,
    whiteReagentGrams: 0,
    darkRawGrams: 0,
    filterPowderGrams: 0,
    stabilizerPowderGrams: 0,
    packagingPacks: 0,
    auroraPowderGrams: 0,
    packagedAuroraBriquettes: 0,
    seedsWhiteWidow: 1,
    seedsAmnesiaHaze: 0,
    seedsGorillaGlue: 0,
    seedsPurpleHaze: 0,
    sporeSyringes: 0,
    ergotCultures: 0,
    diethylamineMl: 0,
    perforatedPaperSheets: 0,
    purifiedWaterLitres: 0,
    nutrientVegMl: 0,
    nutrientBloomMl: 0,
    nutrientOrganicMl: 0,
    neemOilMl: 0,
  },
  plants: [],
  mushroomBatches: [],
  fictionalColonies: [],
  lsdBatches: [],
  darknetOrders: [],
  cartelContracts: [],
  specialOrders: [],
  marketEvents: [],
  buyerReputation: {
    score: 0,
    level: 1,
    title: 'Уличный новичок',
    successfulDeals: 0,
    failedDeals: 0,
    bonusPayoutPercent: 0,
    heatReductionPercent: 0,
  },
  activeEffect: null,
  syndicateLicenses: {
    botany_license: false,
    mycology_license: false,
    synthesis_license: false,
    powder_license: false,
    neuro_license: false,
    facility_license: false,
    pharma_license: false,
  },
  courierStats: {
    successfulDrops: 0,
    bustedDrops: 0,
    totalCashEarned: 0,
    dangerLevel: 1,
  },
  marketPrices: {
    white_widow: {
      current: 14.8,
      trend: 'up',
      saturation: 0.45,
      forecastTrend: 'up',
      forecastConfidence: 82,
      forecastExpectedChange: 8,
      history: [
        { day: 1, hour: 0, price: 13.5, saturation: 0.52 },
        { day: 1, hour: 4, price: 13.9, saturation: 0.50 },
        { day: 1, hour: 8, price: 14.2, saturation: 0.48 },
        { day: 1, hour: 12, price: 14.0, saturation: 0.49 },
        { day: 1, hour: 16, price: 14.4, saturation: 0.46 },
        { day: 1, hour: 20, price: 14.8, saturation: 0.45 },
      ]
    },
    amnesia_haze: {
      current: 24.5,
      trend: 'up',
      saturation: 0.22,
      forecastTrend: 'up',
      forecastConfidence: 94,
      forecastExpectedChange: 22,
      history: [
        { day: 1, hour: 0, price: 17.0, saturation: 0.40 },
        { day: 1, hour: 4, price: 18.2, saturation: 0.35 },
        { day: 1, hour: 8, price: 20.1, saturation: 0.30 },
        { day: 1, hour: 12, price: 21.8, saturation: 0.26 },
        { day: 1, hour: 16, price: 23.4, saturation: 0.24 },
        { day: 1, hour: 20, price: 24.5, saturation: 0.22 },
      ]
    },
    gorilla_glue: {
      current: 20.5,
      trend: 'stable',
      saturation: 0.25,
      forecastTrend: 'stable',
      forecastConfidence: 75,
      forecastExpectedChange: 2,
      history: [
        { day: 1, hour: 0, price: 20.1, saturation: 0.27 },
        { day: 1, hour: 4, price: 20.4, saturation: 0.26 },
        { day: 1, hour: 8, price: 20.5, saturation: 0.25 },
        { day: 1, hour: 12, price: 20.3, saturation: 0.26 },
        { day: 1, hour: 16, price: 20.6, saturation: 0.25 },
        { day: 1, hour: 20, price: 20.5, saturation: 0.25 },
      ]
    },
    purple_haze: {
      current: 16.9,
      trend: 'down',
      saturation: 0.60,
      forecastTrend: 'down',
      forecastConfidence: 80,
      forecastExpectedChange: -12,
      history: [
        { day: 1, hour: 0, price: 18.8, saturation: 0.48 },
        { day: 1, hour: 4, price: 18.2, saturation: 0.52 },
        { day: 1, hour: 8, price: 17.6, saturation: 0.55 },
        { day: 1, hour: 12, price: 17.2, saturation: 0.58 },
        { day: 1, hour: 16, price: 17.0, saturation: 0.59 },
        { day: 1, hour: 20, price: 16.9, saturation: 0.60 },
      ]
    },
    psilocybin: {
      current: 16.5,
      trend: 'up',
      saturation: 0.30,
      forecastTrend: 'up',
      forecastConfidence: 86,
      forecastExpectedChange: 15,
      history: [
        { day: 1, hour: 0, price: 14.8, saturation: 0.38 },
        { day: 1, hour: 4, price: 15.2, saturation: 0.36 },
        { day: 1, hour: 8, price: 15.8, saturation: 0.33 },
        { day: 1, hour: 12, price: 16.1, saturation: 0.31 },
        { day: 1, hour: 16, price: 16.3, saturation: 0.30 },
        { day: 1, hour: 20, price: 16.5, saturation: 0.30 },
      ]
    },
    lsd_25: {
      current: 3850.0,
      trend: 'up',
      saturation: 0.18,
      forecastTrend: 'up',
      forecastConfidence: 90,
      forecastExpectedChange: 18,
      history: [
        { day: 1, hour: 0, price: 3400.0, saturation: 0.24 },
        { day: 1, hour: 4, price: 3500.0, saturation: 0.22 },
        { day: 1, hour: 8, price: 3600.0, saturation: 0.21 },
        { day: 1, hour: 12, price: 3720.0, saturation: 0.19 },
        { day: 1, hour: 16, price: 3800.0, saturation: 0.18 },
        { day: 1, hour: 20, price: 3850.0, saturation: 0.18 },
      ]
    },
    cocaine: {
      current: 85.0,
      trend: 'up',
      saturation: 0.20,
      forecastTrend: 'up',
      forecastConfidence: 92,
      forecastExpectedChange: 15,
      history: [
        { day: 1, hour: 0, price: 78.0, saturation: 0.25 },
        { day: 1, hour: 4, price: 80.5, saturation: 0.23 },
        { day: 1, hour: 8, price: 82.0, saturation: 0.22 },
        { day: 1, hour: 12, price: 83.5, saturation: 0.21 },
        { day: 1, hour: 16, price: 84.0, saturation: 0.20 },
        { day: 1, hour: 20, price: 85.0, saturation: 0.20 },
      ]
    },
  }
};

/**
 * Dynamic Market Pricing Formula with Event Modifiers
 * Price = Base * (1 + (1 - saturation) * 0.45) * (1 + (policeHeat / 100) * 0.35) * (1 + eventModifier)
 */
export function calculateDynamicPrice(
  basePrice: number,
  saturation: number,
  policeHeat: number,
  purity: number = 0.9,
  eventPriceModifier: number = 0
): number {
  const saturationModifier = (1.0 - saturation) * 0.45; // scarcity bonus
  const riskPremium = (policeHeat / 100.0) * 0.35; // high police activity drives street cost up
  const qualityMultiplier = 0.7 + (purity * 0.4); // 90% purity = 1.06x, 99% purity = 1.1x
  const eventMultiplier = 1.0 + eventPriceModifier;

  const finalPrice = basePrice * (1.0 + saturationModifier + riskPremium) * qualityMultiplier * eventMultiplier;
  return Math.round(finalPrice * 10) / 10;
}

/**
 * Upkeep & Operational Deductions calculation
 */
export function calculateDailyUpkeep(state: GameState) {
  const baseRent = 350;
  // Power calculation
  const lightsWattage = state.plants.reduce((sum, p) => sum + p.lightWattage, 0);
  const labWattage = (state.mushroomBatches.length * 150) + (state.lsdBatches.length * 400) + 200;
  const totalWatts = lightsWattage + labWattage;
  const solarWattOffset = state.solarPanels * 400; // 400W per solar unit
  const gridWatts = Math.max(0, totalWatts - solarWattOffset);

  // kWh daily = (watts * 24h) / 1000
  const dailyKwh = (gridWatts * 24) / 1000;
  const electricityRate = 0.18; // $0.18 / kWh
  const electricityCost = Math.round(dailyKwh * electricityRate);

  // Payroll
  const salaries = (state.employees.trimmers * 85) +
                   (state.employees.labChemists * 190) +
                   (state.employees.couriers * 115);

  const generatorFuel = state.generatorsActive ? 60 : 0;
  const lawyerRetainer = state.lawyerRetainerActive ? 200 : 0;

  const totalDaily = baseRent + electricityCost + salaries + generatorFuel + lawyerRetainer;

  // Police smell & grid anomaly detection calculation
  const rawSmell = state.plants.reduce((sum, p) => sum + p.smellUnits, 0);
  const scrubbedSmell = Math.max(0, rawSmell - (state.carbonFiltersInstalled * 25));

  // High grid draw alert threshold (>1800W)
  const gridAnomalyHeat = gridWatts > 1800 ? Math.min(6, (gridWatts - 1800) / 300) : 0;
  const smellHeat = scrubbedSmell > 10 ? Math.min(8, (scrubbedSmell - 10) * 0.4) : 0;

  return {
    baseRent,
    electricityCost,
    salaries,
    generatorFuel,
    lawyerRetainer,
    totalDaily,
    totalWatts,
    gridWatts,
    gridAnomalyHeat,
    smellHeat,
    dailyKwh: Math.round(dailyKwh * 10) / 10,
  };
}
