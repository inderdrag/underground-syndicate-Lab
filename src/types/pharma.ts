/**
 * PHARMA Pack Architecture Types
 * Standalone module configuration for Pharmaceutical Substances
 */

export type PharmaSubgroup = 'opioids' | 'benzodiazepines' | 'gabapentinoids' | 'antidepressants';
export type PharmaForm = 'syrup' | 'pills' | 'powder';
export type PharmaStationId = 'lab_bench' | 'mixer' | 'tablet_press' | 'packaging_table';

export interface PharmaIngredientDef {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
}

export interface PharmaIngredientCost {
  ingredientId: string;
  amount: number;
}

export interface PharmaGoldenZone {
  targetTempC: number;
  tempTolerance: number;
  targetRpm: number;
  targetDoseMg: number;
}

export interface PharmaRecipeDef {
  id: string;
  stationId: PharmaStationId;
  ingredients: PharmaIngredientCost[];
  craftTimeSeconds: number;
  outputAmount: number;
  defectChance: number; // 0.0 - 1.0
  goldenZone: PharmaGoldenZone;
  unlockedAtLevel: number;
  unlockedAtReputation: number;
}

export interface PharmaItemDef {
  id: string;
  name: string;
  subgroup: PharmaSubgroup;
  form: PharmaForm;
  icon: string;
  description: string;
  basePrice: number;
  districtPriceRanges: Record<string, [number, number]>;
  potency: number; // 1 - 100
  durationMinutes: number;
  addictionRisk: number; // 0.0 - 1.0
  overdoseRisk: number; // 0.0 - 1.0
  heatOnCraft: number;
  heatOnSale: number;
  basePurity: number; // 0 - 100%
  recipe: PharmaRecipeDef;
}

export interface PharmaPackConfig {
  enabled: boolean;
  version: string;
  ingredients: PharmaIngredientDef[];
  items: PharmaItemDef[];
}

export type PharmaClientType = 'street' | 'club_goer' | 'reseller' | 'pharmacy_regular';
export type PharmaClientState = 'active' | 'hospitalized' | 'paranoid_police' | 'relapsed';

export interface PharmaClient {
  id: string;
  name: string;
  type: PharmaClientType;
  preferredSubgroup: PharmaSubgroup;
  cravingLevel: number; // 0 to 100
  loyalty: number; // 0 to 100
  walletCash: number;
  purchaseFrequencyDays: number;
  lastPurchaseDay: number;
  state: PharmaClientState;
  stateTimerDays?: number;
  totalPurchasesCount: number;
  avatarIcon: string;
}

export type PharmaLocationType = 'cellar' | 'garage' | 'van';

export interface PharmaStash {
  id: string;
  name: string;
  locationType: PharmaLocationType;
  capacityUnits: number;
  stealthLevel: number; // 0 - 100%
  detectionRisk: number; // 0 - 100%
  items: Record<string, number>;
  cashStashed: number;
  currentDistrict: string;
}

export interface PharmaStationUpgrade {
  id: string;
  stationId: PharmaStationId;
  name: string;
  description: string;
  cost: number;
  speedMultiplier: number;
  purityBonus: number;
  heatMultiplier: number;
  noisePenalty: number;
  isUnlocked: boolean;
}

export interface PharmaFacadeState {
  id: string;
  name: string;
  isUnlocked: boolean;
  signboardQuality: number; // 1 - 5
  storageCapacity: number;
  backroomActive: boolean;
  securityGuard: boolean;
  dailyLaunderLimit: number;
  launderedCashToday: number;
  inspectionRisk: number; // 0 - 100%
  hasActiveDoctor: boolean;
  hasActivePharmacist: boolean;
}

export interface PharmaNewsItem {
  id: string;
  day: number;
  title: string;
  body: string;
  impactText: string;
  type: 'raid' | 'overdose' | 'shortage' | 'police_heat' | 'black_market';
  read: boolean;
}

export interface PharmaCraftBatchResult {
  itemId: string;
  purity: number; // 0 - 100%
  qualityGrade: 'defect' | 'standard' | 'premium';
  dilutedPercent: number; // 0 - 50%
  amountProduced: number;
  heatGenerated: number;
  accidentOccurred: boolean;
  accidentType?: 'smoke_leak' | 'station_damaged' | 'batch_ruined' | 'heat_spike';
}

export interface PharmaGameState {
  inventory: Record<string, number>; // item_id or ingredient_id -> count
  purityStock: Record<string, number>; // item_id -> avg purity %
  clients: PharmaClient[];
  stashes: PharmaStash[];
  stationUpgrades: Record<string, PharmaStationUpgrade>;
  facade: PharmaFacadeState;
  newsFeed: PharmaNewsItem[];
  storyFlags: Record<string, boolean | number | string>;
  bribeStatus: {
    corruptCopBribed: boolean;
    bribeExpiryDay: number;
    copPrice: number;
  };
  blackMarketActive: boolean;
  blackMarketRefreshDay: number;
  achievements: Record<string, boolean>;
}
