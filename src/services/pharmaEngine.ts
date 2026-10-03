import { pharmaPackConfig } from '../config/pharmaPackData';
import {
  PharmaItemDef,
  PharmaCraftBatchResult,
  PharmaClient,
  PharmaStash,
  PharmaNewsItem,
  PharmaFacadeState,
  PharmaGameState
} from '../types/pharma';

/**
 * PHARMA Engine Core Service
 * Clean initial state: Starts with $60 cash and ZERO ready-made drugs in inventory.
 */

export const INITIAL_PHARMA_STATE: PharmaGameState = {
  inventory: {
    // 0 ready-made drugs at start as requested
    paracetamol: 0,
    ibuprofen: 0,
    melatonin: 0,
    gabapentin: 0,
    lyrica: 0,
    zoloft: 0,
    tramadol: 0,
    prozac: 0,
    zolpidem: 0,
    xanax: 0,
    modafinil: 0,
    ritalin: 0,
    codeine: 0,
    adderall: 0,
    oxycodone: 0,
    morphine: 0,
    fentanyl: 0
  },
  purityStock: {
    paracetamol: 99,
    ibuprofen: 98,
    melatonin: 99,
    gabapentin: 95,
    lyrica: 94,
    zoloft: 96,
    tramadol: 92,
    prozac: 95,
    zolpidem: 91,
    xanax: 94,
    modafinil: 93,
    ritalin: 92,
    codeine: 90,
    adderall: 88,
    oxycodone: 85,
    morphine: 88,
    fentanyl: 80
  },
  clients: [
    {
      id: 'client_1',
      name: 'Марк (Частный Клиент)',
      type: 'club_goer',
      preferredSubgroup: 'opioids',
      cravingLevel: 30,
      loyalty: 80,
      walletCash: 120,
      purchaseFrequencyDays: 2,
      lastPurchaseDay: 1,
      state: 'active',
      totalPurchasesCount: 0,
      avatarIcon: '🧢'
    },
    {
      id: 'client_2',
      name: 'Елена Сергеевна',
      type: 'pharmacy_regular',
      preferredSubgroup: 'benzodiazepines',
      cravingLevel: 15,
      loyalty: 90,
      walletCash: 85,
      purchaseFrequencyDays: 3,
      lastPurchaseDay: 1,
      state: 'active',
      totalPurchasesCount: 0,
      avatarIcon: '👵'
    },
    {
      id: 'client_3',
      name: 'Артем «Дилер»',
      type: 'reseller',
      preferredSubgroup: 'gabapentinoids',
      cravingLevel: 50,
      loyalty: 60,
      walletCash: 350,
      purchaseFrequencyDays: 1,
      lastPurchaseDay: 1,
      state: 'active',
      totalPurchasesCount: 0,
      avatarIcon: '🕶️'
    }
  ],
  stashes: [
    {
      id: 'stash_pharmacy_shelf',
      name: 'Полка №1 (Основной зал Аптеки)',
      locationType: 'cellar',
      capacityUnits: 100,
      stealthLevel: 90,
      detectionRisk: 10,
      items: {},
      cashStashed: 0,
      currentDistrict: 'downtown'
    },
    {
      id: 'stash_backroom_safe',
      name: 'Задний Сейф (Подсобка Аптеки)',
      locationType: 'garage',
      capacityUnits: 300,
      stealthLevel: 95,
      detectionRisk: 5,
      items: {},
      cashStashed: 0,
      currentDistrict: 'downtown'
    }
  ],
  stationUpgrades: {},
  facade: {
    id: 'facade_main',
    name: 'Аптека «Авиценна-Плюс»',
    isUnlocked: true,
    signboardQuality: 2,
    storageCapacity: 200,
    backroomActive: true,
    securityGuard: false,
    dailyLaunderLimit: 500,
    launderedCashToday: 0,
    inspectionRisk: 5,
    hasActiveDoctor: false,
    hasActivePharmacist: false
  },
  newsFeed: [
    {
      id: 'news_1',
      day: 1,
      title: 'Открытие лицензированной Аптеки «Авиценна»',
      body: 'Вы открыли кассу аптеки с начальным капиталом $60. Посетители заходят непрерывно, будьте внимательны с рецептурными препаратами.',
      impactText: 'Стартовый баланс: $60',
      type: 'black_market',
      read: false
    }
  ],
  storyFlags: {},
  bribeStatus: {
    corruptCopBribed: false,
    bribeExpiryDay: 0,
    copPrice: 500
  },
  blackMarketActive: true,
  blackMarketRefreshDay: 1,
  achievements: {}
};

export function processCraftingMiniGame(
  item: PharmaItemDef,
  userTempC: number,
  userRpm: number,
  userDoseMg: number,
  dilutionPercent: number = 0
): PharmaCraftBatchResult {
  const gz = item.recipe.goldenZone;
  const tempDiff = Math.abs(userTempC - gz.targetTempC);
  const rpmDiff = Math.abs(userRpm - gz.targetRpm);
  const doseDiff = Math.abs(userDoseMg - gz.targetDoseMg);

  let precision = 100 - (tempDiff * 4 + (rpmDiff / 10) + (doseDiff / 5));
  precision = Math.max(0, Math.min(100, precision));

  let qualityGrade: 'defect' | 'standard' | 'premium' = 'standard';
  if (precision >= 90) qualityGrade = 'premium';
  else if (precision < 50 || Math.random() < item.recipe.defectChance) qualityGrade = 'defect';

  let rawPurity = item.basePurity + (precision >= 90 ? 8 : precision < 50 ? -25 : 0);
  rawPurity = Math.max(20, Math.min(100, rawPurity));
  const finalPurity = Math.max(10, Math.round(rawPurity * (1 - dilutionPercent / 100)));

  const finalAmount = Math.round(item.recipe.outputAmount * (qualityGrade === 'defect' ? 0.5 : 1 + (dilutionPercent / 100) * 0.8));

  let accidentOccurred = false;
  let accidentType: PharmaCraftBatchResult['accidentType'] = undefined;

  if (tempDiff > gz.tempTolerance * 3) {
    accidentOccurred = true;
    accidentType = 'smoke_leak';
  } else if (precision < 30) {
    accidentOccurred = true;
    accidentType = Math.random() > 0.5 ? 'station_damaged' : 'batch_ruined';
  }

  const heatGenerated = item.heatOnCraft + (accidentOccurred ? 5 : 0);

  return {
    itemId: item.id,
    purity: finalPurity,
    qualityGrade,
    dilutedPercent: dilutionPercent,
    amountProduced: finalAmount,
    heatGenerated,
    accidentOccurred,
    accidentType
  };
}

export function processClientDeal(
  client: PharmaClient,
  item: PharmaItemDef,
  purity: number,
  quantity: number,
  currentDay: number
): {
  success: boolean;
  totalCashEarned: number;
  reputationChange: number;
  overdoseTriggered: boolean;
  newsItem?: PharmaNewsItem;
  clientMessage: string;
} {
  const pricePerUnit = Math.round(item.basePrice * (purity / 100) * (1 + (client.loyalty / 200)));
  const totalCashEarned = pricePerUnit * quantity;

  const impurityPenalty = (100 - purity) * 0.008;
  const totalOverdoseChance = item.overdoseRisk * 0.2 + impurityPenalty;
  const overdoseTriggered = Math.random() < totalOverdoseChance;

  let reputationChange = 5;
  let clientMessage = `Сделка прошла успешно! ${client.name} заплатл $${totalCashEarned}.`;
  let newsItem: PharmaNewsItem | undefined = undefined;

  if (overdoseTriggered) {
    client.state = 'hospitalized';
    client.stateTimerDays = 4;
    reputationChange = -25;
    clientMessage = `⚠️ ВНИМАНИЕ: Покупатель попал в больницу! Внимание полиции повышенно!`;

    newsItem = {
      id: `news_od_${Date.now()}`,
      day: currentDay,
      title: `Госпитализация от грязной партии`,
      body: `В городе зафиксировано тяжелое отравление фальсифицированным препаратом. Проверки полицией усилены.`,
      impactText: 'Внимание полиции +15%',
      type: 'overdose',
      read: false
    };
  } else {
    client.cravingLevel = Math.min(100, client.cravingLevel + Math.round(item.addictionRisk * 20));
    client.loyalty = Math.min(100, client.loyalty + 3);
    client.lastPurchaseDay = currentDay;
    client.totalPurchasesCount += 1;
  }

  return {
    success: true,
    totalCashEarned,
    reputationChange,
    overdoseTriggered,
    newsItem,
    clientMessage
  };
}
