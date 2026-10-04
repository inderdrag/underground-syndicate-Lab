import React, { useState, useEffect, useCallback } from 'react';
import { HeartPulse } from 'lucide-react';
import { GamePhase, GameState, BotanyPlant, StrainId, MushroomBatch, LSDSynthesisBatch, ActiveDrugEffect, DrugEffectType, DosageTier, SpecialOrder, MarketEvent, BuyerReputation, MarketCommodityData, DaySummaryReport, FictionalMushroomColony, FictionalGrowthStage, SyndicateLicenseId } from './types/game';
import { INITIAL_GAME_STATE, STRAIN_DEFINITIONS, calculateDailyUpkeep, calculateDynamicPrice } from './engine/simulationEngine';
import { simulatePlantHourTick, createNewPlantedSpecimen, GrowShopItem } from './engine/cultivationEngine';
import { sounds } from './engine/soundEffects';
import { Navigation } from './components/Navigation';
import { BotanyPhase } from './components/BotanyPhase';
import { FictionalMycologyHub } from './components/FictionalMycologyHub';
import { SynthesisPhase } from './components/SynthesisPhase';
import { PowderRefineryWorkshop } from './components/PowderRefineryWorkshop';
import { MegastoreHub } from './components/MegastoreHub';
import { DeadDropCourierJob } from './components/DeadDropCourierJob';
import { SyndicateHandbook } from './components/SyndicateHandbook';
import { MarketEconomy } from './components/MarketEconomy';
import { UpkeepOperations } from './components/UpkeepOperations';
import { NativeEngineStudio } from './components/NativeEngineStudio';
import { PharmaLabView } from './components/pharma/PharmaLabView';
import { PharmaFacadeView } from './components/pharma/PharmaFacadeView';
import { PharmaPharmacyTab } from './components/pharma/PharmaPharmacyTab';
import { INITIAL_PHARMA_STATE } from './services/pharmaEngine';
import { PharmaGameState } from './types/pharma';
import { IngestionOverlay } from './components/IngestionOverlay';
import { SampleModal } from './components/SampleModal';
import { DayEndSummaryModal } from './components/DayEndSummaryModal';
import { MiniGameManager, MiniGameType, MiniGameResult } from './components/MiniGameManager';
import { Language } from './i18n/translations';
import { FontTheme } from './components/Navigation';

const LOCAL_STORAGE_KEY = 'syndicate_lab_game_save_v1';

const loadSavedGameState = (): GameState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_GAME_STATE, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load saved state from localStorage:', e);
  }
  return INITIAL_GAME_STATE;
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>(loadSavedGameState);
  const [pharmaState, setPharmaState] = useState<PharmaGameState>(INITIAL_PHARMA_STATE);
  const [currentPhase, setCurrentPhase] = useState<GamePhase>('botany');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSampleModalOpen, setIsSampleModalOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('ru');
  const [activeFont, setActiveFont] = useState<FontTheme>('inter');
  const [dayBanner, setDayBanner] = useState<string | null>(null);
  const [dayEndReport, setDayEndReport] = useState<DaySummaryReport | null>(null);
  const [dailyIncomeEarned, setDailyIncomeEarned] = useState<number>(0);
  const [overdoseAlert, setOverdoseAlert] = useState<{ substanceName: string; fee: number } | null>(null);
  const [dismissedBedtimeDay, setDismissedBedtimeDay] = useState<number | null>(null);

  // MiniGame Manager State
  const [isMiniGameOpen, setIsMiniGameOpen] = useState<boolean>(false);
  const [activeMiniGameType, setActiveMiniGameType] = useState<MiniGameType>('lsd_dosing');

  const handleOpenMiniGame = (type: MiniGameType = 'lsd_dosing') => {
    sounds.playClick();
    setActiveMiniGameType(type);
    setIsMiniGameOpen(true);
  };

  const handleMiniGameCompleted = (result: MiniGameResult) => {
    setIsMiniGameOpen(false);
    if (result.success) {
      sounds.playOverrideSuccess();
      // Reward player with bonus cash or purity boost
      setGameState((prev) => ({
        ...prev,
        cash: prev.cash + (result.score > 80 ? 250 : 100),
        buyerReputation: {
          ...prev.buyerReputation,
          score: prev.buyerReputation.score + 15,
        },
      }));
    } else {
      sounds.playAlarmBeep();
    }
  };

  // Auto-save game state to localStorage on every update
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Failed to auto-save game state to localStorage:', e);
    }
  }, [gameState]);

  useEffect(() => {
    document.documentElement.setAttribute('data-font', activeFont);
  }, [activeFont]);

  const toggleLanguage = () => {
    sounds.playClick();
    setLanguage((prev) => (prev === 'ru' ? 'en' : 'ru'));
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sounds.setMuted(next);
  };

  const handleChangeSpeed = (speed: number) => {
    setGameState((prev) => ({ ...prev, timeSpeedMultiplier: speed }));
  };

  // Trigger consumption effect with dosage tiers, inventory deduction, and overdose risk
  const handleIngestSample = useCallback((effectType: DrugEffectType, dosage: DosageTier = 'standard') => {
    setGameState((prev) => {
      let invKey: keyof typeof prev.inventory = 'mushroomsGrams';
      let requiredAmount = 0.5;

      if (effectType === 'astral_mushrooms') {
        const driedReq = dosage === 'micro' ? 0.25 : dosage === 'standard' ? 1.5 : dosage === 'high' ? 3.5 : 6.0;
        const rawReq = dosage === 'micro' ? 2.5 : dosage === 'standard' ? 15.0 : dosage === 'high' ? 35.0 : 60.0;
        const driedStock = prev.inventory.astralMushroomsDriedGrams || 0;
        const rawStock = prev.inventory.astralMushroomsRawGrams || 0;
        const psiloStock = prev.inventory.mushroomsGrams || 0;

        if (driedStock >= driedReq) {
          invKey = 'astralMushroomsDriedGrams';
          requiredAmount = driedReq;
        } else if (rawStock >= rawReq) {
          invKey = 'astralMushroomsRawGrams';
          requiredAmount = rawReq;
        } else if (driedStock > 0) {
          invKey = 'astralMushroomsDriedGrams';
          requiredAmount = driedStock;
        } else if (rawStock > 0) {
          invKey = 'astralMushroomsRawGrams';
          requiredAmount = rawStock;
        } else if (psiloStock >= driedReq) {
          invKey = 'mushroomsGrams';
          requiredAmount = driedReq;
        } else {
          invKey = 'astralMushroomsDriedGrams';
          requiredAmount = driedReq;
        }
      } else if (effectType === 'cocaine') {
        invKey = 'cocaineGrams';
        requiredAmount = dosage === 'micro' ? 0.1 : dosage === 'standard' ? 0.3 : dosage === 'high' ? 0.6 : 1.0;
      } else if (effectType === 'aurora_powder') {
        invKey = 'powderGrams' in prev.inventory ? ('powderGrams' as any) : 'cocaineGrams';
        requiredAmount = dosage === 'micro' ? 0.1 : dosage === 'standard' ? 0.25 : dosage === 'high' ? 0.5 : 1.0;
      } else if (effectType === 'white_widow') {
        invKey = 'whiteWidowGrams';
        requiredAmount = dosage === 'micro' ? 0.2 : dosage === 'standard' ? 0.5 : dosage === 'high' ? 1.0 : 2.0;
      } else if (effectType === 'amnesia_haze') {
        invKey = 'amnesiaHazeGrams';
        requiredAmount = dosage === 'micro' ? 0.2 : dosage === 'standard' ? 0.5 : dosage === 'high' ? 1.0 : 2.0;
      } else if (effectType === 'gorilla_glue') {
        invKey = 'gorillaGlueGrams';
        requiredAmount = dosage === 'micro' ? 0.2 : dosage === 'standard' ? 0.5 : dosage === 'high' ? 1.0 : 2.0;
      } else if (effectType === 'purple_haze') {
        invKey = 'purpleHazeGrams';
        requiredAmount = dosage === 'micro' ? 0.2 : dosage === 'standard' ? 0.5 : dosage === 'high' ? 1.0 : 2.0;
      } else if (effectType === 'psilocybin') {
        invKey = 'mushroomsGrams';
        requiredAmount = dosage === 'micro' ? 0.5 : dosage === 'standard' ? 1.5 : dosage === 'high' ? 3.5 : 5.0;
      } else if (effectType === 'lsd_25' || effectType === 'neuro_fractal') {
        invKey = 'lsdSheets';
        requiredAmount = dosage === 'micro' ? 0.05 : dosage === 'standard' ? 0.1 : dosage === 'high' ? 0.2 : 0.5;
      } else {
        // Pharma product
        invKey = (effectType as any) as keyof typeof prev.inventory;
        requiredAmount = 1;
        // Deduct from pharmaState if available
        setPharmaState(pPrev => ({
          ...pPrev,
          inventory: {
            ...pPrev.inventory,
            [effectType]: Math.max(0, (pPrev.inventory[effectType] || 0) - 1)
          }
        }));
      }

      const available = (prev.inventory as Record<string, number>)[invKey] || 0;
      const pharmaStock = (pharmaState?.inventory as Record<string, number>)?.[effectType] || 0;

      if (available <= 0 && pharmaStock <= 0) {
        // Substance is not in inventory
        return prev;
      }

      const actualConsumed = Math.min(available, requiredAmount);

      // Deduct consumed amount from inventory
      const newInventory = {
        ...prev.inventory,
        [invKey]: Math.max(0, Math.round((available - actualConsumed) * 100) / 100),
      };

      // Overdose Risk calculation
      let baseOverdoseChance = 0;
      if (dosage === 'high') baseOverdoseChance = effectType === 'cocaine' || effectType === 'aurora_powder' ? 0.30 : 0.10;
      if (dosage === 'heroic') baseOverdoseChance = effectType === 'cocaine' || effectType === 'aurora_powder' ? 0.65 : 0.35;

      if (prev.activeEffect) baseOverdoseChance += 0.20; // Stacking active effect risk

      const isOverdose = Math.random() < baseOverdoseChance;

      if (isOverdose) {
        sounds.playAlarmBeep();
        const fee = 250;
        setOverdoseAlert({
          substanceName: effectType,
          fee,
        });

        return {
          ...prev,
          cash: Math.max(0, prev.cash - fee),
          policeHeat: Math.min(100, prev.policeHeat + 5),
          activeEffect: null,
          inventory: newInventory,
        };
      }

      // Normal consumption effect
      let name = 'Sample Effect';
      let baseDuration = 30;
      const durationMult = dosage === 'micro' ? 0.7 : dosage === 'standard' ? 1.0 : dosage === 'high' ? 1.4 : 2.0;

      let euphoriaScore = 50;
      let hallucinationScore = 30;
      let addictionDelta = 5;

      switch (effectType) {
        case 'astral_mushrooms':
          name =
            language === 'ru'
              ? 'Грибы «Астрал» (Серотониновый экстаз, неоновые споры и фракталы)'
              : 'Astral Mushrooms (Serotonergic Ecstasy & Fractal Spores)';
          baseDuration = 55;
          euphoriaScore = dosage === 'micro' ? 35 : dosage === 'standard' ? 70 : dosage === 'high' ? 95 : 100;
          hallucinationScore = dosage === 'micro' ? 20 : dosage === 'standard' ? 60 : dosage === 'high' ? 90 : 100;
          addictionDelta = dosage === 'micro' ? 2 : dosage === 'standard' ? 8 : dosage === 'high' ? 18 : 32;
          break;
        case 'cocaine':
          name = language === 'ru' ? 'Кокаин Fishscale 96% (Дофаминовый раш и молнии)' : 'Cocaine (Dopamine Rush, Tachycardia & Gold Arcs)';
          baseDuration = 25;
          euphoriaScore = dosage === 'micro' ? 40 : dosage === 'standard' ? 85 : dosage === 'high' ? 98 : 100;
          hallucinationScore = dosage === 'micro' ? 10 : dosage === 'standard' ? 25 : dosage === 'high' ? 50 : 70;
          addictionDelta = dosage === 'micro' ? 6 : dosage === 'standard' ? 16 : dosage === 'high' ? 30 : 50;
          break;
        case 'aurora_powder':
          name = language === 'ru' ? 'Порошок «Аврора» (Электрические молнии и сверхскорость)' : 'Aurora Powder (Electric Cyan Strobe & Overclock)';
          baseDuration = 28;
          euphoriaScore = dosage === 'micro' ? 45 : dosage === 'standard' ? 88 : dosage === 'high' ? 98 : 100;
          hallucinationScore = dosage === 'micro' ? 15 : dosage === 'standard' ? 30 : dosage === 'high' ? 60 : 80;
          addictionDelta = dosage === 'micro' ? 7 : dosage === 'standard' ? 18 : dosage === 'high' ? 35 : 55;
          break;
        case 'tramadol':
          name = language === 'ru' ? '🤢 Трамадол (Тошнотворный эффект, вертиго и качка)' : '🤢 Tramadol (Visceral Nausea, Motion Sickness & Vertigo)';
          baseDuration = 35;
          euphoriaScore = dosage === 'micro' ? 15 : dosage === 'standard' ? 30 : dosage === 'high' ? 45 : 50;
          hallucinationScore = dosage === 'micro' ? 25 : dosage === 'standard' ? 65 : dosage === 'high' ? 90 : 100;
          addictionDelta = dosage === 'micro' ? 4 : dosage === 'standard' ? 12 : dosage === 'high' ? 25 : 40;
          break;
        case 'lyrica':
          name = language === 'ru' ? '🤢 Лирика / Прегабалин (Двоение в глазах, пьяная атаксия)' : '🤢 Lyrica / Pregabalin (Diplopia Double-Vision & Ataxia)';
          baseDuration = 35;
          euphoriaScore = dosage === 'micro' ? 25 : dosage === 'standard' ? 50 : dosage === 'high' ? 70 : 80;
          hallucinationScore = dosage === 'micro' ? 30 : dosage === 'standard' ? 70 : dosage === 'high' ? 95 : 100;
          addictionDelta = dosage === 'micro' ? 4 : dosage === 'standard' ? 10 : dosage === 'high' ? 20 : 35;
          break;
        case 'xanax':
          name = language === 'ru' ? 'Ксанакс / Алпразолам (Глубокое затемнение и релакс)' : 'Xanax / Alprazolam (Heavy Downer & Calm)';
          baseDuration = 35;
          euphoriaScore = dosage === 'micro' ? 30 : dosage === 'standard' ? 60 : dosage === 'high' ? 80 : 90;
          hallucinationScore = dosage === 'micro' ? 5 : dosage === 'standard' ? 15 : dosage === 'high' ? 25 : 35;
          addictionDelta = dosage === 'micro' ? 5 : dosage === 'standard' ? 14 : dosage === 'high' ? 28 : 45;
          break;
        case 'morphine':
          name = language === 'ru' ? 'Морфин / Оксикодон (Золотисто-малиновый транс)' : 'Morphine / Oxycodone (Warm Euphoric Dreamscape)';
          baseDuration = 40;
          euphoriaScore = dosage === 'micro' ? 45 : dosage === 'standard' ? 85 : dosage === 'high' ? 98 : 100;
          hallucinationScore = dosage === 'micro' ? 10 : dosage === 'standard' ? 25 : dosage === 'high' ? 45 : 60;
          addictionDelta = dosage === 'micro' ? 8 : dosage === 'standard' ? 20 : dosage === 'high' ? 38 : 60;
          break;
        case 'codeine':
          name = language === 'ru' ? 'Кодеин (Фиолетовый сироп Lean и слоу-мо)' : 'Codeine Lean (Purple Syrup Dripping & Slow-Mo)';
          baseDuration = 35;
          euphoriaScore = dosage === 'micro' ? 35 : dosage === 'standard' ? 70 : dosage === 'high' ? 88 : 95;
          hallucinationScore = dosage === 'micro' ? 15 : dosage === 'standard' ? 35 : dosage === 'high' ? 55 : 70;
          addictionDelta = dosage === 'micro' ? 5 : dosage === 'standard' ? 12 : dosage === 'high' ? 24 : 40;
          break;
        case 'ritalin':
          name = language === 'ru' ? 'Риталин / Аддералл (Лазерный СДВГ-гиперфокус)' : 'Ritalin / Adderall (Laser ADHD Hyper-Focus)';
          baseDuration = 30;
          euphoriaScore = dosage === 'micro' ? 35 : dosage === 'standard' ? 70 : dosage === 'high' ? 88 : 95;
          hallucinationScore = dosage === 'micro' ? 5 : dosage === 'standard' ? 15 : dosage === 'high' ? 25 : 40;
          addictionDelta = dosage === 'micro' ? 4 : dosage === 'standard' ? 10 : dosage === 'high' ? 22 : 38;
          break;
        case 'zolpidem':
          name = language === 'ru' ? 'Золпидем (Лавандовые сумерки и сонные тени)' : 'Zolpidem (Lavender Dream Veil & Slumber)';
          baseDuration = 30;
          euphoriaScore = dosage === 'micro' ? 25 : dosage === 'standard' ? 55 : dosage === 'high' ? 75 : 85;
          hallucinationScore = dosage === 'micro' ? 20 : dosage === 'standard' ? 50 : dosage === 'high' ? 75 : 90;
          addictionDelta = dosage === 'micro' ? 3 : dosage === 'standard' ? 8 : dosage === 'high' ? 16 : 28;
          break;
        case 'prozac':
          name = language === 'ru' ? 'Прозак / Флуоксетин (Серотониновый штиль)' : 'Prozac / Fluoxetine (Serotonin Waves)';
          baseDuration = 35;
          euphoriaScore = dosage === 'micro' ? 25 : dosage === 'standard' ? 50 : dosage === 'high' ? 70 : 80;
          hallucinationScore = dosage === 'micro' ? 5 : dosage === 'standard' ? 10 : dosage === 'high' ? 20 : 30;
          addictionDelta = 1;
          break;
        case 'neuro_fractal':
          name = language === 'ru' ? 'Neuro-Fractal (Матричный код и кибер-глитч)' : 'Neuro-Fractal (Matrix Binary Code & Cyber-Glitch)';
          baseDuration = 45;
          euphoriaScore = dosage === 'micro' ? 30 : dosage === 'standard' ? 65 : dosage === 'high' ? 88 : 98;
          hallucinationScore = dosage === 'micro' ? 40 : dosage === 'standard' ? 80 : dosage === 'high' ? 98 : 100;
          addictionDelta = dosage === 'micro' ? 3 : dosage === 'standard' ? 7 : dosage === 'high' ? 15 : 25;
          break;
        case 'white_widow':
          name = language === 'ru' ? 'Белая Вдова (Замедление времени и туман)' : 'White Widow (Temporal Dilation & Fog)';
          baseDuration = 30;
          euphoriaScore = dosage === 'micro' ? 30 : dosage === 'standard' ? 55 : dosage === 'high' ? 75 : 85;
          hallucinationScore = dosage === 'micro' ? 10 : dosage === 'standard' ? 20 : dosage === 'high' ? 35 : 50;
          addictionDelta = dosage === 'micro' ? 1 : dosage === 'standard' ? 3 : dosage === 'high' ? 7 : 12;
          break;
        case 'amnesia_haze':
          name = language === 'ru' ? 'Амнезия Хейз (Световая вспышка и скорость)' : 'Amnesia Haze (Exposure Flare & Velocity)';
          baseDuration = 30;
          euphoriaScore = dosage === 'micro' ? 35 : dosage === 'standard' ? 65 : dosage === 'high' ? 85 : 95;
          hallucinationScore = dosage === 'micro' ? 15 : dosage === 'standard' ? 30 : dosage === 'high' ? 45 : 60;
          addictionDelta = dosage === 'micro' ? 1 : dosage === 'standard' ? 4 : dosage === 'high' ? 8 : 14;
          break;
        case 'gorilla_glue':
          name = language === 'ru' ? 'Gorilla Glue #4 (Стоун-эффект и блюр краев)' : 'Gorilla Glue #4 (Couch-Lock & Edge Blur)';
          baseDuration = 30;
          euphoriaScore = dosage === 'micro' ? 30 : dosage === 'standard' ? 60 : dosage === 'high' ? 80 : 90;
          hallucinationScore = dosage === 'micro' ? 10 : dosage === 'standard' ? 25 : dosage === 'high' ? 40 : 55;
          addictionDelta = dosage === 'micro' ? 1 : dosage === 'standard' ? 3 : dosage === 'high' ? 7 : 12;
          break;
        case 'purple_haze':
          name = language === 'ru' ? 'Purple Haze (УФ хроматический сдвиг)' : 'Purple Haze (Ultraviolet Chromatic Shift)';
          baseDuration = 35;
          euphoriaScore = dosage === 'micro' ? 35 : dosage === 'standard' ? 65 : dosage === 'high' ? 85 : 95;
          hallucinationScore = dosage === 'micro' ? 20 : dosage === 'standard' ? 45 : dosage === 'high' ? 70 : 85;
          addictionDelta = dosage === 'micro' ? 2 : dosage === 'standard' ? 5 : dosage === 'high' ? 10 : 16;
          break;
        case 'psilocybin':
          name = language === 'ru' ? 'Псилоцибин (Волновое плавление и RGB-сплит)' : 'Psilocybin (Melting Sine-Wave & RGB Split)';
          baseDuration = 40;
          euphoriaScore = dosage === 'micro' ? 30 : dosage === 'standard' ? 65 : dosage === 'high' ? 90 : 98;
          hallucinationScore = dosage === 'micro' ? 25 : dosage === 'standard' ? 60 : dosage === 'high' ? 85 : 98;
          addictionDelta = dosage === 'micro' ? 2 : dosage === 'standard' ? 6 : dosage === 'high' ? 14 : 24;
          break;
        case 'lsd_25':
          name = language === 'ru' ? 'ЛСД-25 (Калейдоскоп и цикл инверсии)' : 'LSD-25 (Kaleidoscope & Inversion Cycle)';
          baseDuration = 45;
          euphoriaScore = dosage === 'micro' ? 25 : dosage === 'standard' ? 60 : dosage === 'high' ? 85 : 96;
          hallucinationScore = dosage === 'micro' ? 35 : dosage === 'standard' ? 75 : dosage === 'high' ? 95 : 100;
          addictionDelta = dosage === 'micro' ? 2 : dosage === 'standard' ? 5 : dosage === 'high' ? 12 : 22;
          break;
      }

      const finalDuration = Math.round(baseDuration * durationMult);
      sounds.playSubstanceIngest(effectType);

      const newAddictionLevel = Math.min(100, (prev.addictionLevel || 0) + addictionDelta);

      return {
        ...prev,
        addictionLevel: newAddictionLevel,
        activeEffect: {
          substanceId: effectType,
          name,
          effectType,
          durationSeconds: finalDuration,
          maxDurationSeconds: finalDuration,
          intensity: dosage === 'micro' ? 0.6 : dosage === 'standard' ? 1.1 : dosage === 'high' ? 2.0 : 3.0,
          dosageTier: dosage,
          startedAt: Date.now(),
          euphoriaScore,
          hallucinationScore,
          addictionDelta,
        },
        inventory: newInventory,
      };
    });
  }, [language]);

  const handleClearEffect = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      activeEffect: null,
    }));
  }, []);

  // Main Simulation Loop (1 in-game day = 15 minutes at x1 speed, scalable with x2 and x3)
  useEffect(() => {
    const speedMultiplier = gameState.activeEffect?.effectType === 'white_widow'
      ? 0.7 // time-dilation slows down
      : gameState.activeEffect?.effectType === 'amnesia_haze' || gameState.activeEffect?.effectType === 'cocaine'
      ? 1.5 // acceleration
      : 1.0;

    const currentMultiplier = gameState.timeSpeedMultiplier || 1.0;
    // Base 56.25 seconds per in-game hour: 16 active daytime hours (8:00 to 24:00) = exactly 15 minutes at x1
    const BASE_HOUR_MS = 56250;
    const intervalTime = Math.max(1000, Math.round(BASE_HOUR_MS / (currentMultiplier * speedMultiplier)));

    const timer = setInterval(() => {
      setGameState((prev) => {
        // Clock stops at 24:00 (end of day). Does NOT auto-switch day without player pressing End Day!
        let nextHour = prev.hour < 24 ? prev.hour + 1 : 24;

        // Progress plants with real-time vitals and event simulation
        const updatedPlants = prev.plants.map((plant) =>
          simulatePlantHourTick(plant, prev.lawyerRetainerActive)
        );

        // Progress mushroom batches & fictional colonies
        const updatedMushrooms = prev.mushroomBatches.map((mush) => {
          if (mush.progress >= 100) return mush;
          const nextProg = Math.min(100, mush.progress + 1.5);
          return { ...mush, progress: nextProg };
        });

        const updatedColonies = (prev.fictionalColonies || []).map((col) => {
          if (col.progress >= 100) return col;
          const nextProg = Math.min(100, col.progress + (col.growthRateMultiplier || 1.0) * 2.0);
          let nextStage: FictionalGrowthStage = col.stage;
          if (nextProg >= 100) nextStage = 'ready_harvest';
          else if (nextProg >= 80) nextStage = 'mature_flush';
          else if (nextProg >= 60) nextStage = 'pinheads_emerging';
          else if (nextProg >= 40) nextStage = 'colony_formation';
          else if (nextProg >= 20) nextStage = 'young_hyphae';

          // Random issue check (3% chance per hour)
          let nextIssue = col.activeIssue;
          if (!nextIssue && Math.random() < 0.03) {
            nextIssue = {
              title: 'Избыток конденсата',
              description: 'Повышенная влажность замедляет развитие гифов.',
              actionLabel: 'Применить стабилизатор',
              penalty: '-15% здоровья',
            };
          }

          return {
            ...col,
            progress: nextProg,
            stage: nextStage,
            activeIssue: nextIssue,
          };
        });

        // Progress LSD batches
        const updatedLSD = prev.lsdBatches.map((lsd) => {
          if (lsd.progress >= 100) return lsd;
          const nextProg = Math.min(100, lsd.progress + 1.8);
          // If safelight is OFF during purification, degrade purity!
          let nextPurity = lsd.purity;
          let nextUv = lsd.uvDegradation;
          if (lsd.stage === 'purification' && !lsd.safelightActive) {
            nextUv = Math.min(100, nextUv + 1);
            nextPurity = Math.max(40, nextPurity - 1);
          }
          return { ...lsd, progress: nextProg, purity: nextPurity, uvDegradation: nextUv };
        });

        // Progress Market Events
        const updatedEvents = (prev.marketEvents || [])
          .map((ev) => ({ ...ev, hoursRemaining: ev.hoursRemaining - 1 }))
          .filter((ev) => ev.hoursRemaining > 0);

        // Progress Special VIP Orders
        const updatedSpecialOrders = (prev.specialOrders || [])
          .map((ord) => ({ ...ord, hoursRemaining: ord.hoursRemaining - 1 }))
          .filter((ord) => ord.hoursRemaining > 0);

        // Periodically record market prices history points
        const updatedMarketPrices: Record<string, MarketCommodityData> = { ...prev.marketPrices };
        if (nextHour % 3 === 0) {
          for (const [key, commodity] of Object.entries(updatedMarketPrices)) {
            const hist = commodity.history ? [...commodity.history] : [];
            hist.push({
              day: prev.day,
              hour: nextHour,
              price: commodity.current,
              saturation: commodity.saturation,
            });
            if (hist.length > 12) hist.shift(); // retain last 12 points

            // Slight dynamic fluctuation
            const randomShift = (Math.random() - 0.48) * 0.04;
            const newSat = Math.max(0.1, Math.min(0.85, commodity.saturation + randomShift));
            const newCurrent = Math.round(commodity.current * (1 + (Math.random() - 0.49) * 0.03) * 10) / 10;

            updatedMarketPrices[key] = {
              ...commodity,
              current: newCurrent,
              saturation: Math.round(newSat * 100) / 100,
              history: hist,
              trend: newCurrent >= commodity.current ? 'up' : 'down',
            };
          }
        }

        return {
          ...prev,
          hour: nextHour,
          plants: updatedPlants,
          mushroomBatches: updatedMushrooms,
          fictionalColonies: updatedColonies,
          lsdBatches: updatedLSD,
          marketEvents: updatedEvents,
          specialOrders: updatedSpecialOrders,
          marketPrices: updatedMarketPrices,
        };
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [gameState.timeSpeedMultiplier, gameState.activeEffect]);

  // Botany Handlers
  const handlePlantSeed = (strainId: StrainId) => {
    handlePlantSpecimen(strainId, 'soil');
  };

  const handlePlantSpecimen = (strainId: StrainId, medium: 'soil' | 'hydroponics' | 'coco') => {
    setGameState((prev) => {
      let seedKey: keyof typeof prev.inventory;
      if (strainId === 'white_widow') seedKey = 'seedsWhiteWidow';
      else if (strainId === 'amnesia_haze') seedKey = 'seedsAmnesiaHaze';
      else if (strainId === 'gorilla_glue') seedKey = 'seedsGorillaGlue';
      else seedKey = 'seedsPurpleHaze';

      if (prev.inventory[seedKey] <= 0) return prev;

      const newPlant = createNewPlantedSpecimen(strainId, medium, prev.day);

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [seedKey]: prev.inventory[seedKey] - 1,
        },
        plants: [...prev.plants, newPlant],
      };
    });
  };

  const handleUpdatePlant = (updatedPlant: BotanyPlant) => {
    setGameState((prev) => ({
      ...prev,
      plants: prev.plants.map((p) => (p.id === updatedPlant.id ? updatedPlant : p)),
    }));
  };

  const handleHarvestCompleted = (plantId: string, yieldGrams: number, purity: number) => {
    setGameState((prev) => {
      const plant = prev.plants.find((p) => p.id === plantId);
      if (!plant) return prev;

      let invKey: keyof typeof prev.inventory;
      if (plant.strainId === 'white_widow') invKey = 'whiteWidowGrams';
      else if (plant.strainId === 'amnesia_haze') invKey = 'amnesiaHazeGrams';
      else if (plant.strainId === 'gorilla_glue') invKey = 'gorillaGlueGrams';
      else invKey = 'purpleHazeGrams';

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [invKey]: prev.inventory[invKey] + yieldGrams,
        },
        plants: prev.plants.filter((p) => p.id !== plantId),
      };
    });
  };

  const handleHarvestPlant = (plantId: string) => {
    handleHarvestCompleted(plantId, 65, 92);
  };

  const handleDeductCash = (amount: number) => {
    setGameState((prev) => ({
      ...prev,
      cash: Math.max(0, prev.cash - amount),
    }));
  };

  const handleConsumeSupplies = (supplies: {
    waterL?: number;
    vegMl?: number;
    bloomMl?: number;
    organicMl?: number;
    neemMl?: number;
  }) => {
    setGameState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        purifiedWaterLitres: Math.max(0, Math.round((prev.inventory.purifiedWaterLitres - (supplies.waterL || 0)) * 10) / 10),
        nutrientVegMl: Math.max(0, prev.inventory.nutrientVegMl - (supplies.vegMl || 0)),
        nutrientBloomMl: Math.max(0, prev.inventory.nutrientBloomMl - (supplies.bloomMl || 0)),
        nutrientOrganicMl: Math.max(0, prev.inventory.nutrientOrganicMl - (supplies.organicMl || 0)),
        neemOilMl: Math.max(0, prev.inventory.neemOilMl - (supplies.neemMl || 0)),
      },
    }));
  };

  const handleBuySupply = (item: GrowShopItem) => {
    setGameState((prev) => {
      if (prev.cash < item.price) return prev;
      return {
        ...prev,
        cash: prev.cash - item.price,
        inventory: {
          ...prev.inventory,
          [item.inventoryKey]: prev.inventory[item.inventoryKey] + item.unitsAdd,
        },
      };
    });
  };

  const handleAdjustNutrients = (plantId: string, n: number, p: number, k: number, ph: number) => {
    setGameState((prev) => ({
      ...prev,
      plants: prev.plants.map((plant) =>
        plant.id === plantId
          ? {
              ...plant,
              nutrients: { n, p, k, ph },
              purity: Math.min(99, Math.max(80, Math.round(85 + (ph >= 5.8 && ph <= 6.5 ? 8 : -5)))),
            }
          : plant
      ),
    }));
  };

  const handleSwitchMedium = (plantId: string, medium: 'soil' | 'hydroponics') => {
    setGameState((prev) => ({
      ...prev,
      plants: prev.plants.map((p) => (p.id === plantId ? { ...p, medium } : p)),
    }));
  };

  const handleToggleLight = (plantId: string, lightWattage: number) => {
    setGameState((prev) => ({
      ...prev,
      plants: prev.plants.map((p) => (p.id === plantId ? { ...p, lightWattage } : p)),
    }));
  };

  const handleBuySeeds = (strainId: StrainId, cost: number) => {
    setGameState((prev) => {
      if (prev.cash < cost) return prev;
      let seedKey: keyof typeof prev.inventory;
      if (strainId === 'white_widow') seedKey = 'seedsWhiteWidow';
      else if (strainId === 'amnesia_haze') seedKey = 'seedsAmnesiaHaze';
      else if (strainId === 'gorilla_glue') seedKey = 'seedsGorillaGlue';
      else seedKey = 'seedsPurpleHaze';

      return {
        ...prev,
        cash: prev.cash - cost,
        inventory: {
          ...prev.inventory,
          [seedKey]: prev.inventory[seedKey] + 1,
        },
      };
    });
  };

  // Mycology Handlers
  const handleStartMushroomBatch = () => {
    setGameState((prev) => {
      if (prev.inventory.sporeSyringes <= 0) return prev;
      const newBatch: MushroomBatch = {
        id: `mush_${Date.now()}`,
        name: `Golden Teacher Tub #${prev.mushroomBatches.length + 1}`,
        stage: 'sterilization',
        progress: 0,
        sterilizationPressurePsi: 15.0,
        sterilizationTimeMin: 90,
        stillAirBoxUsed: true,
        contaminationRisk: 4,
        isContaminated: false,
        temperatureC: 25.0,
        inDarkness: true,
        faeRate: 80,
        humidityPercent: 92,
        potency: 95,
        yieldGrams: 280,
      };

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          sporeSyringes: prev.inventory.sporeSyringes - 1,
        },
        mushroomBatches: [...prev.mushroomBatches, newBatch],
      };
    });
  };

  const handleAdvanceMushroomStage = (batchId: string) => {
    setGameState((prev) => ({
      ...prev,
      mushroomBatches: prev.mushroomBatches.map((b) => {
        if (b.id !== batchId) return b;
        let nextStage = b.stage;
        if (b.stage === 'sterilization') nextStage = 'inoculation';
        else if (b.stage === 'inoculation') nextStage = 'incubation';
        else if (b.stage === 'incubation') nextStage = 'fruiting';
        return { ...b, stage: nextStage, progress: 0 };
      }),
    }));
  };

  const handleHarvestMushroomBatch = (batchId: string) => {
    setGameState((prev) => {
      const batch = prev.mushroomBatches.find((b) => b.id === batchId);
      if (!batch) return prev;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          mushroomsGrams: prev.inventory.mushroomsGrams + batch.yieldGrams,
        },
        mushroomBatches: prev.mushroomBatches.filter((b) => b.id !== batchId),
      };
    });
  };

  const handleUpdateMushroomParams = (batchId: string, updates: Partial<MushroomBatch>) => {
    setGameState((prev) => ({
      ...prev,
      mushroomBatches: prev.mushroomBatches.map((b) =>
        b.id === batchId ? { ...b, ...updates } : b
      ),
    }));
  };

  // Synthesis Handlers
  const handleStartSynthesis = () => {
    setGameState((prev) => {
      if (prev.inventory.ergotCultures <= 0 || prev.inventory.diethylamineMl < 50) return prev;
      const newLsd: LSDSynthesisBatch = {
        id: `lsd_${Date.now()}`,
        stageIndex: 0,
        pipelinePhase: 'preparation',
        stage: 'precursor_extraction',
        progress: 0,
        ergotamineGrams: 5.0,
        refluxTempC: 45.0,
        magneticStirrerRpm: 450,
        solventAnhydrous: true,
        safelightActive: true,
        uvDegradation: 0,
        purity: 98,
        sheetsDosed: 0,
        blotterDoseUg: 150,
      };

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          ergotCultures: prev.inventory.ergotCultures - 1,
          diethylamineMl: prev.inventory.diethylamineMl - 50,
        },
        lsdBatches: [...prev.lsdBatches, newLsd],
      };
    });
  };

  const handleAdvanceSynthesisStage = (batchId: string) => {
    setGameState((prev) => ({
      ...prev,
      lsdBatches: prev.lsdBatches.map((b) => {
        if (b.id !== batchId) return b;
        let nextStage = b.stage;
        if (b.stage === 'precursor_extraction') nextStage = 'reaction';
        else if (b.stage === 'reaction') nextStage = 'purification';
        else if (b.stage === 'purification') nextStage = 'dosing';
        return { ...b, stage: nextStage, progress: 0 };
      }),
    }));
  };

  const handleCompleteDosing = (batchId: string) => {
    setGameState((prev) => {
      const batch = prev.lsdBatches.find((b) => b.id === batchId);
      if (!batch) return prev;
      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          lsdSheets: prev.inventory.lsdSheets + 1,
          perforatedPaperSheets: Math.max(0, prev.inventory.perforatedPaperSheets - 1),
        },
        lsdBatches: prev.lsdBatches.filter((b) => b.id !== batchId),
      };
    });
  };

  const handleUpdateLSDParams = (batchId: string, updates: Partial<LSDSynthesisBatch>) => {
    setGameState((prev) => ({
      ...prev,
      lsdBatches: prev.lsdBatches.map((b) => (b.id === batchId ? { ...b, ...updates } : b)),
    }));
  };

  const handleFinishCocaine = (yieldGrams: number) => {
    setGameState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        cocaineGrams: prev.inventory.cocaineGrams + yieldGrams,
      },
    }));
  };

  const handleFinishNeuroBatch = (sheetsCount: number, purity: number, marketValue: number) => {
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + Math.round(marketValue * 0.5),
      inventory: {
        ...prev.inventory,
        neuroSheets: prev.inventory.neuroSheets + sheetsCount,
      },
    }));
  };

  // Street Black Market & Chemical Heist Handlers
  const handleBuyStreetBlackMarketItem = (itemKey: string, cost: number, count: number, heatGain: number) => {
    setGameState((prev) => {
      if (prev.cash < cost) return prev;
      const inv = { ...prev.inventory };
      const currentVal = (inv as Record<string, number>)[itemKey] || 0;
      (inv as Record<string, number>)[itemKey] = currentVal + count;

      return {
        ...prev,
        cash: prev.cash - cost,
        policeHeat: Math.min(100, prev.policeHeat + heatGain),
        inventory: inv,
      };
    });
  };

  const handleHeistSuccess = (loot: {
    diethylamineMl: number;
    ergotCultures: number;
    sporeSyringes: number;
    nutrientBloomMl: number;
    nutrientVegMl: number;
    bonusCash: number;
  }) => {
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + loot.bonusCash,
      inventory: {
        ...prev.inventory,
        diethylamineMl: prev.inventory.diethylamineMl + loot.diethylamineMl,
        ergotCultures: prev.inventory.ergotCultures + loot.ergotCultures,
        sporeSyringes: prev.inventory.sporeSyringes + loot.sporeSyringes,
        nutrientBloomMl: prev.inventory.nutrientBloomMl + loot.nutrientBloomMl,
        nutrientVegMl: prev.inventory.nutrientVegMl + loot.nutrientVegMl,
      },
    }));
  };

  const handleHeistCaught = (heatIncrease: number, penaltyCash: number) => {
    setGameState((prev) => ({
      ...prev,
      cash: Math.max(0, prev.cash - penaltyCash),
      policeHeat: Math.min(100, prev.policeHeat + heatIncrease),
    }));
  };

  // License & Dead Drop Courier Handlers
  const handleBuyLicense = (licenseId: SyndicateLicenseId, cost: number) => {
    setGameState((prev) => {
      if (prev.cash < cost) return prev;
      return {
        ...prev,
        cash: prev.cash - cost,
        syndicateLicenses: {
          ...(prev.syndicateLicenses || {
            botany_license: false,
            mycology_license: false,
            synthesis_license: false,
            powder_license: false,
            neuro_license: false,
            facility_license: false,
            pharma_license: false,
          }),
          [licenseId]: true,
        },
      };
    });
  };

  const handleCourierSuccess = (rewardCash: number, heatChange: number) => {
    setGameState((prev) => ({
      ...prev,
      cash: prev.cash + rewardCash,
      policeHeat: Math.min(100, Math.max(0, prev.policeHeat + heatChange)),
      courierStats: {
        successfulDrops: (prev.courierStats?.successfulDrops || 0) + 1,
        bustedDrops: prev.courierStats?.bustedDrops || 0,
        totalCashEarned: (prev.courierStats?.totalCashEarned || 0) + rewardCash,
        dangerLevel: prev.courierStats?.dangerLevel || 1,
      },
    }));
  };

  const handleCourierCaught = (penaltyCash: number, heatAdded: number) => {
    setGameState((prev) => ({
      ...prev,
      cash: Math.max(0, prev.cash - penaltyCash),
      policeHeat: Math.min(100, prev.policeHeat + heatAdded),
      courierStats: {
        successfulDrops: prev.courierStats?.successfulDrops || 0,
        bustedDrops: (prev.courierStats?.bustedDrops || 0) + 1,
        totalCashEarned: prev.courierStats?.totalCashEarned || 0,
        dangerLevel: prev.courierStats?.dangerLevel || 1,
      },
    }));
  };

  // Fictional Mycology Handlers
  const handleUpdateColony = (colonyId: string, updates: Partial<FictionalMushroomColony>) => {
    setGameState((prev) => ({
      ...prev,
      fictionalColonies: (prev.fictionalColonies || []).map((col) =>
        col.id === colonyId ? { ...col, ...updates } : col
      ),
    }));
  };

  const handleCreateColony = (colony: FictionalMushroomColony) => {
    setGameState((prev) => ({
      ...prev,
      fictionalColonies: [...(prev.fictionalColonies || []), colony],
    }));
  };

  const handleHarvestColony = (colonyId: string, yieldGrams: number) => {
    setGameState((prev) => ({
      ...prev,
      fictionalColonies: (prev.fictionalColonies || []).filter((c) => c.id !== colonyId),
    }));
  };

  const handlePackageMushrooms = (
    format: 'craft' | 'microdose' | 'syndicate',
    count: number,
    totalCash: number
  ) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      if (format === 'craft') {
        inv.astralCraftPacks = (inv.astralCraftPacks || 0) + count;
      } else if (format === 'microdose') {
        inv.astralMicrodoseJars = (inv.astralMicrodoseJars || 0) + count;
      } else {
        inv.astralSyndicateBoxes = (inv.astralSyndicateBoxes || 0) + count;
      }

      return {
        ...prev,
        inventory: inv,
      };
    });
  };

  // Powder Refinery Handlers
  const handleAddInventory = (itemKey: string, amount: number) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      const cur = (inv as Record<string, number>)[itemKey] || 0;
      (inv as Record<string, number>)[itemKey] = cur + amount;
      return { ...prev, inventory: inv };
    });
  };

  const handleFinishPowderBatch = (
    packagedType: 'ziplocs' | 'briquettes' | 'blocks',
    count: number,
    value: number,
    purity: number
  ) => {
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      if (packagedType === 'ziplocs') {
        inv.auroraPowderGrams = (inv.auroraPowderGrams || 0) + count;
      } else if (packagedType === 'briquettes') {
        inv.packagedAuroraBriquettes = (inv.packagedAuroraBriquettes || 0) + count;
      } else {
        inv.packagedAuroraBlocks = (inv.packagedAuroraBlocks || 0) + count;
      }

      // NO AUTOMATIC SALE: Manufactured powder is stored directly in inventory!
      // Reputation gain for high-purity batch crafting excellence
      const curRep = prev.buyerReputation || {
        score: 100,
        level: 1,
        title: 'Уличный новичок',
        successfulDeals: 0,
        failedDeals: 0,
        bonusPayoutPercent: 0,
        heatReductionPercent: 0,
      };

      return {
        ...prev,
        inventory: inv,
        buyerReputation: {
          ...curRep,
          score: Math.min(1000, curRep.score + 15),
        },
      };
    });
  };

  // Market Handlers
  const handleSellStreetDeal = (
    itemKey: string,
    gramsOrUnits: number,
    totalCash: number,
    heatGenerated: number
  ) => {
    setDailyIncomeEarned((prev) => prev + totalCash);
    setGameState((prev) => {
      const inv = { ...prev.inventory };
      if (itemKey === 'white_widow') inv.whiteWidowGrams = Math.max(0, inv.whiteWidowGrams - gramsOrUnits);
      else if (itemKey === 'amnesia_haze') inv.amnesiaHazeGrams = Math.max(0, inv.amnesiaHazeGrams - gramsOrUnits);
      else if (itemKey === 'gorilla_glue') inv.gorillaGlueGrams = Math.max(0, inv.gorillaGlueGrams - gramsOrUnits);
      else if (itemKey === 'purple_haze') inv.purpleHazeGrams = Math.max(0, inv.purpleHazeGrams - gramsOrUnits);
      else if (itemKey === 'psilocybin') inv.mushroomsGrams = Math.max(0, inv.mushroomsGrams - gramsOrUnits);
      else if (itemKey === 'astral_raw') inv.astralMushroomsRawGrams = Math.max(0, (inv.astralMushroomsRawGrams || 0) - gramsOrUnits);
      else if (itemKey === 'astral_dried') inv.astralMushroomsDriedGrams = Math.max(0, (inv.astralMushroomsDriedGrams || 0) - gramsOrUnits);
      else if (itemKey === 'astral_craft') inv.astralCraftPacks = Math.max(0, (inv.astralCraftPacks || 0) - gramsOrUnits);
      else if (itemKey === 'astral_microdose') inv.astralMicrodoseJars = Math.max(0, (inv.astralMicrodoseJars || 0) - gramsOrUnits);
      else if (itemKey === 'astral_syndicate') inv.astralSyndicateBoxes = Math.max(0, (inv.astralSyndicateBoxes || 0) - gramsOrUnits);
      else if (itemKey === 'lsd_25') inv.lsdSheets = Math.max(0, inv.lsdSheets - gramsOrUnits);
      else if (itemKey === 'cocaine') inv.cocaineGrams = Math.max(0, (inv.cocaineGrams || 0) - gramsOrUnits);
      else if (itemKey === 'neuro_sheets') inv.neuroSheets = Math.max(0, (inv.neuroSheets || 0) - gramsOrUnits);
      else if (itemKey === 'aurora_powder') inv.auroraPowderGrams = Math.max(0, (inv.auroraPowderGrams || 0) - gramsOrUnits);
      else if (itemKey === 'aurora_briquette') inv.packagedAuroraBriquettes = Math.max(0, (inv.packagedAuroraBriquettes || 0) - gramsOrUnits);
      else if (itemKey === 'aurora_block') inv.packagedAuroraBlocks = Math.max(0, (inv.packagedAuroraBlocks || 0) - gramsOrUnits);

      const effectiveHeat = prev.lawyerRetainerActive ? heatGenerated * 0.5 : heatGenerated;

      // Buyer Reputation update
      const curRep = prev.buyerReputation || {
        score: 100,
        level: 1,
        title: 'Уличный новичок',
        successfulDeals: 0,
        failedDeals: 0,
        bonusPayoutPercent: 0,
        heatReductionPercent: 0,
      };

      const scoreGain = Math.max(5, Math.round(gramsOrUnits * 0.5));
      const newScore = Math.min(1000, curRep.score + scoreGain);
      let newLevel = 1;
      let newTitle = 'Уличный новичок';
      let bonusPercent = 0;
      let heatRed = 0;

      if (newScore >= 750) {
        newLevel = 4;
        newTitle = 'Синдикатный магнат';
        bonusPercent = 18;
        heatRed = 25;
      } else if (newScore >= 450) {
        newLevel = 3;
        newTitle = 'Теневой авторитет';
        bonusPercent = 10;
        heatRed = 15;
      } else if (newScore >= 200) {
        newLevel = 2;
        newTitle = 'Проверенный поставщик';
        bonusPercent = 5;
        heatRed = 10;
      }

      const updatedRep: BuyerReputation = {
        score: newScore,
        level: newLevel,
        title: newTitle,
        successfulDeals: curRep.successfulDeals + 1,
        failedDeals: curRep.failedDeals,
        bonusPayoutPercent: bonusPercent,
        heatReductionPercent: heatRed,
      };

      return {
        ...prev,
        cash: prev.cash + totalCash,
        policeHeat: Math.min(100, prev.policeHeat + effectiveHeat),
        inventory: inv,
        buyerReputation: updatedRep,
      };
    });
  };

  const handleFulfillDarknetOrder = (orderId: string) => {
    setGameState((prev) => {
      const order = prev.darknetOrders.find((o) => o.id === orderId);
      if (!order) return prev;

      const curRep = prev.buyerReputation || {
        score: 100,
        level: 1,
        title: 'Уличный новичок',
        successfulDeals: 0,
        failedDeals: 0,
        bonusPayoutPercent: 0,
        heatReductionPercent: 0,
      };

      const newScore = Math.min(1000, curRep.score + 15);
      return {
        ...prev,
        cryptoXmr: prev.cryptoXmr + order.cryptoXmr,
        cryptoBtc: prev.cryptoBtc + order.cryptoBtc,
        policeHeat: Math.min(100, prev.policeHeat + 1.5),
        darknetOrders: prev.darknetOrders.filter((o) => o.id !== orderId),
        buyerReputation: {
          ...curRep,
          score: newScore,
          successfulDeals: curRep.successfulDeals + 1,
        },
      };
    });
  };

  const handleAcceptSpecialOrder = (orderId: string) => {
    setGameState((prev) => ({
      ...prev,
      specialOrders: (prev.specialOrders || []).map((o) =>
        o.id === orderId ? { ...o, isAccepted: true } : o
      ),
    }));
  };

  const handleFulfillSpecialOrder = (orderId: string) => {
    setGameState((prev) => {
      const order = (prev.specialOrders || []).find((o) => o.id === orderId);
      if (!order) return prev;

      const inv = { ...prev.inventory };
      if (order.productKey === 'white_widow') inv.whiteWidowGrams = Math.max(0, inv.whiteWidowGrams - order.volume);
      else if (order.productKey === 'amnesia_haze') inv.amnesiaHazeGrams = Math.max(0, inv.amnesiaHazeGrams - order.volume);
      else if (order.productKey === 'gorilla_glue') inv.gorillaGlueGrams = Math.max(0, inv.gorillaGlueGrams - order.volume);
      else if (order.productKey === 'purple_haze') inv.purpleHazeGrams = Math.max(0, inv.purpleHazeGrams - order.volume);
      else if (order.productKey === 'psilocybin') inv.mushroomsGrams = Math.max(0, inv.mushroomsGrams - order.volume);
      else if (order.productKey === 'lsd_25') inv.lsdSheets = Math.max(0, inv.lsdSheets - order.volume);

      const curRep = prev.buyerReputation || {
        score: 100,
        level: 1,
        title: 'Уличный новичок',
        successfulDeals: 0,
        failedDeals: 0,
        bonusPayoutPercent: 0,
        heatReductionPercent: 0,
      };

      const newScore = Math.min(1000, curRep.score + order.reputationGain);
      let newLevel = 1;
      let newTitle = 'Уличный новичок';
      let bonusPercent = 0;
      let heatRed = 0;

      if (newScore >= 750) {
        newLevel = 4;
        newTitle = 'Синдикатный магнат';
        bonusPercent = 18;
        heatRed = 25;
      } else if (newScore >= 450) {
        newLevel = 3;
        newTitle = 'Теневой авторитет';
        bonusPercent = 10;
        heatRed = 15;
      } else if (newScore >= 200) {
        newLevel = 2;
        newTitle = 'Проверенный поставщик';
        bonusPercent = 5;
        heatRed = 10;
      }

      return {
        ...prev,
        cash: prev.cash + order.rewardCash,
        inventory: inv,
        buyerReputation: {
          ...curRep,
          score: newScore,
          level: newLevel,
          title: newTitle,
          successfulDeals: curRep.successfulDeals + 1,
          bonusPayoutPercent: bonusPercent,
          heatReductionPercent: heatRed,
        },
        specialOrders: prev.specialOrders.filter((o) => o.id !== orderId),
      };
    });
  };

  const handleConvertCrypto = (currency: 'XMR' | 'BTC', amount: number) => {
    setGameState((prev) => {
      const xmrRate = 180; // $180 / XMR
      const btcRate = 65000; // $65,000 / BTC
      const fee = 0.92; // 8% laundering fee

      let payout = 0;
      let newXmr = prev.cryptoXmr;
      let newBtc = prev.cryptoBtc;

      if (currency === 'XMR') {
        payout = amount * xmrRate * fee;
        newXmr = 0;
      } else {
        payout = amount * btcRate * fee;
        newBtc = 0;
      }

      return {
        ...prev,
        cash: Math.round(prev.cash + payout),
        cryptoXmr: newXmr,
        cryptoBtc: newBtc,
      };
    });
  };

  const handleAcceptCartelContract = (contractId: string) => {
    setGameState((prev) => ({
      ...prev,
      cartelContracts: prev.cartelContracts.map((c) =>
        c.id === contractId ? { ...c, isAccepted: true } : c
      ),
    }));
  };

  const handleFulfillCartelContract = (contractId: string) => {
    setGameState((prev) => {
      const contract = prev.cartelContracts.find((c) => c.id === contractId);
      if (!contract) return prev;

      return {
        ...prev,
        cash: prev.cash + contract.payoutCash,
        cartelContracts: prev.cartelContracts.filter((c) => c.id !== contractId),
      };
    });
  };

  // Upkeep Handlers
  const handleBuySolarPanel = () => {
    setGameState((prev) => {
      if (prev.cash < 950) return prev;
      return {
        ...prev,
        cash: prev.cash - 950,
        solarPanels: prev.solarPanels + 1,
      };
    });
  };

  const handleToggleGenerator = () => {
    setGameState((prev) => ({
      ...prev,
      generatorsActive: !prev.generatorsActive,
    }));
  };

  const handleInstallCarbonFilter = () => {
    setGameState((prev) => {
      if (prev.cash < 420) return prev;
      return {
        ...prev,
        cash: prev.cash - 420,
        carbonFiltersInstalled: prev.carbonFiltersInstalled + 1,
      };
    });
  };

  const handleHireEmployee = (role: 'trimmers' | 'labChemists' | 'couriers') => {
    setGameState((prev) => ({
      ...prev,
      employees: {
        ...prev.employees,
        [role]: prev.employees[role] + 1,
      },
    }));
  };

  const handleFireEmployee = (role: 'trimmers' | 'labChemists' | 'couriers') => {
    setGameState((prev) => ({
      ...prev,
      employees: {
        ...prev.employees,
        [role]: Math.max(0, prev.employees[role] - 1),
      },
    }));
  };

  const handleToggleLawyerRetainer = () => {
    setGameState((prev) => ({
      ...prev,
      lawyerRetainerActive: !prev.lawyerRetainerActive,
    }));
  };

  const handlePayPoliceBribe = () => {
    setGameState((prev) => {
      if (prev.cash < 1800) return prev;
      return {
        ...prev,
        cash: prev.cash - 1800,
        policeHeat: Math.max(0, prev.policeHeat - 35),
      };
    });
  };

  // Day End Trigger & Modal Report
  const handleTriggerDayEnd = () => {
    sounds.playPsychedelicChime();
    const upkeep = calculateDailyUpkeep(gameState);
    const net = dailyIncomeEarned - upkeep.totalDaily;

    setDayEndReport({
      completedDay: gameState.day,
      incomeCash: dailyIncomeEarned,
      expensesUpkeep: upkeep.totalDaily,
      netProfit: net,
      policeHeatChange: upkeep.gridAnomalyHeat + upkeep.smellHeat - (gameState.lawyerRetainerActive ? 3 : 0),
      currentPoliceHeat: gameState.policeHeat,
      breakdown: {
        electricity: upkeep.electricityCost,
        baseRent: upkeep.baseRent,
        salaries: upkeep.salaries,
        generatorFuel: upkeep.generatorFuel,
        lawyerRetainer: upkeep.lawyerRetainer,
        salesTotal: dailyIncomeEarned,
      },
    });
  };

  const handleResetGame = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.clear();
    } catch (e) {
      console.warn('Failed to clear saved game state from localStorage:', e);
    }
    // Deep clone initial state so absolutely nothing carries over from the previous game
    setGameState(JSON.parse(JSON.stringify(INITIAL_GAME_STATE)));
    setPharmaState(JSON.parse(JSON.stringify(INITIAL_PHARMA_STATE)));
    setDailyIncomeEarned(0);
    setDayEndReport(null);
    setDismissedBedtimeDay(null);
    setCurrentPhase('botany');
  };

  const handleConfirmNextDay = () => {
    setGameState((prev) => {
      const upkeep = calculateDailyUpkeep(prev);
      return {
        ...prev,
        day: prev.day + 1,
        hour: 8,
        cash: prev.cash - upkeep.totalDaily,
        policeHeat: Math.min(100, Math.max(0, prev.policeHeat + upkeep.gridAnomalyHeat + upkeep.smellHeat - (prev.lawyerRetainerActive ? 3 : 0))),
        addictionLevel: Math.max(0, (prev.addictionLevel || 0) - 15),
      };
    });
    setDailyIncomeEarned(0);
    setDayEndReport(null);
    setDismissedBedtimeDay(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col font-sans bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(16,185,129,0.08),rgba(0,0,0,0))]">
      {/* Real-Time Post-Processing Ingestion Shader Canvas & HUD */}
      <IngestionOverlay
        activeEffect={gameState.activeEffect}
        onClearEffect={handleClearEffect}
        onSelectSample={handleIngestSample}
        language={language}
      />

      {/* Top Bar Contract & Strategy Strip */}
      <Navigation
        currentPhase={currentPhase}
        onSelectPhase={(phase) => setCurrentPhase(phase)}
        gameState={gameState}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onTriggerSampleModal={() => setIsSampleModalOpen(true)}
        onOpenMiniGameManager={handleOpenMiniGame}
        onResetGame={handleResetGame}
        onChangeSpeed={handleChangeSpeed}
        onTriggerDayEnd={handleTriggerDayEnd}
        language={language}
        onToggleLanguage={toggleLanguage}
        activeFont={activeFont}
        onChangeFont={setActiveFont}
      />

      {/* Day Transition Toast Alert */}
      {dayBanner && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 bg-[#0e1622]/95 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center gap-2.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>{dayBanner}</span>
        </div>
      )}

      {/* 23:00 Bedtime Notification (Days do NOT auto-switch without user action!) */}
      {gameState.hour >= 23 && dismissedBedtimeDay !== gameState.day && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[94%] sm:w-auto px-5 py-4 bg-[#0d121c]/95 backdrop-blur-2xl border-2 border-indigo-500/70 text-white rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.45)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-indigo-300 text-xl shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              🌙
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  [23:00 · ГЛУБОКАЯ НОЧЬ]
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">
                  Клиенты разошлись
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Пора ложиться спать и переходить в новый день!
              </h4>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                После 23:00 клиентов нет. Дни не переключаются автоматически — вы сами решаете, когда лечь спать.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                handleTriggerDayEnd();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-400 text-white font-mono font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>🛏️ Завершить день</span>
            </button>
            <button
              onClick={() => setDismissedBedtimeDay(gameState.day)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs cursor-pointer border border-white/5"
              title="Закрыть уведомление"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Container - Responsive Grid & Flex Layout with Bottom Tab Clearance */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-2.5 sm:py-4 pb-28 md:pb-6 overflow-x-hidden">
        {currentPhase === 'botany' && (
          <BotanyPhase
            gameState={gameState}
            onPlantSeed={handlePlantSeed}
            onPlantSpecimen={handlePlantSpecimen}
            onUpdatePlant={handleUpdatePlant}
            onHarvestPlant={handleHarvestPlant}
            onHarvestCompleted={handleHarvestCompleted}
            onDeductCash={handleDeductCash}
            onConsumeSupplies={handleConsumeSupplies}
            onBuySupply={handleBuySupply}
            onBuyLicense={handleBuyLicense}
            onAdjustNutrients={handleAdjustNutrients}
            onSwitchMedium={handleSwitchMedium}
            onToggleLight={handleToggleLight}
            onBuySeeds={handleBuySeeds}
            onIngestSample={handleIngestSample}
            language={language}
          />
        )}

        {currentPhase === 'mycology' && (
          <FictionalMycologyHub
            gameState={gameState}
            onDeductCash={handleDeductCash}
            onAddInventory={handleAddInventory}
            onUpdateColony={handleUpdateColony}
            onCreateColony={handleCreateColony}
            onHarvestColony={handleHarvestColony}
            onPackageMushrooms={handlePackageMushrooms}
            onSellMushroomDeal={handleSellStreetDeal}
            onBuyLicense={handleBuyLicense}
            onIngestAstral={() => handleIngestSample('astral_mushrooms', 'standard')}
            onIngestSample={handleIngestSample}
            language={language}
          />
        )}

        {currentPhase === 'synthesis' && (
          <SynthesisPhase
            gameState={gameState}
            onStartSynthesis={handleStartSynthesis}
            onAdvanceSynthesisStage={handleAdvanceSynthesisStage}
            onCompleteDosing={handleCompleteDosing}
            onUpdateBatch={handleUpdateLSDParams}
            onFinishCocaine={handleFinishCocaine}
            onIngestLSD={() => handleIngestSample('lsd_25')}
            onTriggerOverdose={(name, fee) => {
              setGameState((prev) => ({
                ...prev,
                cash: Math.max(0, prev.cash - fee),
                policeHeat: Math.min(100, prev.policeHeat + 5),
                activeEffect: null,
              }));
              setOverdoseAlert({ substanceName: name, fee });
            }}
            language={language}
          />
        )}

        {currentPhase === 'powder_refinery' && (
          <PowderRefineryWorkshop
            gameState={gameState}
            onDeductCash={handleDeductCash}
            onAddInventory={handleAddInventory}
            onFinishPowderBatch={handleFinishPowderBatch}
            onSellPowderDeal={handleSellStreetDeal}
            language={language}
          />
        )}

        {currentPhase === 'pharma_lab' && (
          <PharmaLabView
            gameState={gameState}
            pharmaState={pharmaState}
            onUpdatePharmaState={setPharmaState}
            onAddCash={(amount) => setGameState(prev => ({ ...prev, cash: prev.cash + amount }))}
            onAddHeat={(heat) => setGameState(prev => ({ ...prev, policeHeat: Math.min(100, Math.max(0, prev.policeHeat + heat)) }))}
            onDeductInventory={(itemKey, amount) => {
              setGameState(prev => ({
                ...prev,
                inventory: {
                  ...prev.inventory,
                  [itemKey]: Math.max(0, ((prev.inventory as any)[itemKey] || 0) - amount)
                }
              }));
            }}
          />
        )}

        {(currentPhase === 'pharma_facade' || (currentPhase as string) === 'pharmacy_group') && (
          <PharmaPharmacyTab
            gameState={gameState}
            pharmaState={pharmaState}
            onUpdatePharmaState={setPharmaState}
            onAddCash={(amount) => setGameState(prev => ({ ...prev, cash: prev.cash + amount }))}
            onAddHeat={(heat) => setGameState(prev => ({ ...prev, policeHeat: Math.min(100, Math.max(0, prev.policeHeat + heat)) }))}
            onTriggerDayEnd={handleTriggerDayEnd}
          />
        )}

        {currentPhase === 'megastore' && (
          <MegastoreHub
            gameState={gameState}
            onDeductCash={handleDeductCash}
            onAddInventory={handleAddInventory}
            onBuySolarPanel={handleBuySolarPanel}
            onInstallCarbonFilter={handleInstallCarbonFilter}
            onBuyLicense={handleBuyLicense}
            language={language}
          />
        )}

        {currentPhase === 'side_jobs' && (
          <div className="bg-[#0e141e] border border-white/[0.08] rounded-2xl p-6 shadow-sm">
            <DeadDropCourierJob
              gameState={gameState}
              onCourierSuccess={handleCourierSuccess}
              onCourierCaught={handleCourierCaught}
              onDeductCash={handleDeductCash}
              language={language}
            />
          </div>
        )}

        {currentPhase === 'economy' && (
          <MarketEconomy
            gameState={gameState}
            onSellStreetDeal={handleSellStreetDeal}
            onFulfillDarknetOrder={handleFulfillDarknetOrder}
            onConvertCrypto={handleConvertCrypto}
            onAcceptCartelContract={handleAcceptCartelContract}
            onFulfillCartelContract={handleFulfillCartelContract}
            onAcceptSpecialOrder={handleAcceptSpecialOrder}
            onFulfillSpecialOrder={handleFulfillSpecialOrder}
            onBuyStreetBlackMarketItem={handleBuyStreetBlackMarketItem}
            onHeistSuccess={handleHeistSuccess}
            onHeistCaught={handleHeistCaught}
            onCourierSuccess={handleCourierSuccess}
            onCourierCaught={handleCourierCaught}
            onDeductCash={handleDeductCash}
            language={language}
          />
        )}

        {currentPhase === 'handbook' && <SyndicateHandbook language={language} />}

        {currentPhase === 'upkeep' && (
          <UpkeepOperations
            gameState={gameState}
            onBuySolarPanel={handleBuySolarPanel}
            onToggleGenerator={handleToggleGenerator}
            onInstallCarbonFilter={handleInstallCarbonFilter}
            onHireEmployee={handleHireEmployee}
            onFireEmployee={handleFireEmployee}
            onToggleLawyerRetainer={handleToggleLawyerRetainer}
            onPayPoliceBribe={handlePayPoliceBribe}
            onAdvanceDay={handleTriggerDayEnd}
            onResetGame={handleResetGame}
            language={language}
          />
        )}

        {currentPhase === 'engine_studio' && <NativeEngineStudio language={language} />}
      </main>

      {/* Day End Summary Report Modal */}
      {dayEndReport && (
        <DayEndSummaryModal
          report={dayEndReport}
          onConfirmNextDay={handleConfirmNextDay}
          language={language}
        />
      )}

      {/* Global Crafting MiniGame Manager Modal */}
      <MiniGameManager
        isOpen={isMiniGameOpen}
        gameType={activeMiniGameType}
        onClose={() => setIsMiniGameOpen(false)}
        onComplete={handleMiniGameCompleted}
        language={language}
      />

      {/* Global Ingestion Sample Bench Modal */}
      <SampleModal
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        onSelectEffect={handleIngestSample}
        gameState={gameState}
        pharmaState={pharmaState}
        language={language}
      />

      {/* Emergency Overdose Modal */}
      {overdoseAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#120a10] border-2 border-rose-500/80 rounded-3xl p-6 max-w-md w-full shadow-[0_0_50px_rgba(244,63,94,0.4)] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center mx-auto text-rose-400 animate-bounce">
              <HeartPulse className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-widest">[ ЭКСТРЕННАЯ ГОСПИТАЛИЗАЦИЯ ]</span>
              <h2 className="text-xl font-bold text-white mt-1">КРИТИЧЕСКАЯ ПЕРЕДОЗИРОВКА!</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Вы превысили опасный предел дозировки при дегустации. Ваше сердце остановилось! Реанимационная бригада скорой помощи откачала вас в токсикологическом отделении.
            </p>
            <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-300">Оплата скорой помощи и реанимации:</span>
              <span className="text-rose-400 font-bold">-$250</span>
            </div>
            <button
              onClick={() => setOverdoseAlert(null)}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
            >
              ПОНЯТНО (ОПЛАТИТЬ И ВЫПИСАТЬСЯ)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
