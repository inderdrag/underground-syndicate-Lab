import React, { useState } from 'react';
import { GameState, SpecialOrder, MarketEvent } from '../types/game';
import { calculateDynamicPrice } from '../engine/simulationEngine';
import {
  DollarSign,
  ShieldAlert,
  Globe,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Flame,
  Award,
  Sparkles,
  Star,
  Zap,
  Target,
  BarChart3,
  Radio,
  Footprints,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { MarketHistoryChart } from './MarketHistoryChart';
import { StreetBlackMarket } from './StreetBlackMarket';
import { DeadDropCourierJob } from './DeadDropCourierJob';

interface MarketEconomyProps {
  gameState: GameState;
  onSellStreetDeal: (
    itemKey: string,
    gramsOrUnits: number,
    totalCash: number,
    heatGenerated: number
  ) => void;
  onFulfillDarknetOrder: (orderId: string) => void;
  onConvertCrypto: (currency: 'XMR' | 'BTC', amount: number) => void;
  onAcceptCartelContract: (contractId: string) => void;
  onFulfillCartelContract: (contractId: string) => void;
  onAcceptSpecialOrder?: (orderId: string) => void;
  onFulfillSpecialOrder?: (orderId: string) => void;
  onBuyStreetBlackMarketItem?: (itemKey: string, cost: number, count: number, heatGain: number) => void;
  onHeistSuccess?: (loot: {
    diethylamineMl: number;
    ergotCultures: number;
    sporeSyringes: number;
    nutrientBloomMl: number;
    nutrientVegMl: number;
    bonusCash: number;
  }) => void;
  onHeistCaught?: (heatIncrease: number, penaltyCash: number) => void;
  onCourierSuccess?: (rewardCash: number, heatChange: number) => void;
  onCourierCaught?: (penaltyCash: number, heatAdded: number) => void;
  onDeductCash?: (amount: number) => void;
  language: Language;
}

export const MarketEconomy: React.FC<MarketEconomyProps> = ({
  gameState,
  onSellStreetDeal,
  onFulfillDarknetOrder,
  onConvertCrypto,
  onAcceptCartelContract,
  onFulfillCartelContract,
  onAcceptSpecialOrder,
  onFulfillSpecialOrder,
  onBuyStreetBlackMarketItem,
  onHeistSuccess,
  onHeistCaught,
  onCourierSuccess = () => {},
  onCourierCaught = () => {},
  onDeductCash = () => {},
  language,
}) => {
  const t = translations[language];
  const [selectedChannel, setSelectedChannel] = useState<'street' | 'courier_job' | 'black_market' | 'darknet' | 'cartel' | 'special_orders'>('street');
  const [streetItem, setStreetItem] = useState<string>('white_widow');
  const [streetVolume, setStreetVolume] = useState<number>(20);
  const [selectedChartCommodity, setSelectedChartCommodity] = useState<string>('white_widow');

  // Available inventory calculation helper
  const getInventoryAmount = (key: string): number => {
    switch (key) {
      case 'white_widow':
        return gameState.inventory.whiteWidowGrams;
      case 'amnesia_haze':
        return gameState.inventory.amnesiaHazeGrams;
      case 'gorilla_glue':
        return gameState.inventory.gorillaGlueGrams;
      case 'purple_haze':
        return gameState.inventory.purpleHazeGrams;
      case 'psilocybin':
        return gameState.inventory.mushroomsGrams;
      case 'astral_raw':
        return gameState.inventory.astralMushroomsRawGrams || 0;
      case 'astral_dried':
        return gameState.inventory.astralMushroomsDriedGrams || 0;
      case 'astral_craft':
        return gameState.inventory.astralCraftPacks || 0;
      case 'astral_microdose':
        return gameState.inventory.astralMicrodoseJars || 0;
      case 'astral_syndicate':
        return gameState.inventory.astralSyndicateBoxes || 0;
      case 'lsd_25':
        return gameState.inventory.lsdSheets;
      case 'cocaine':
        return gameState.inventory.cocaineGrams || 0;
      case 'neuro_sheets':
        return gameState.inventory.neuroSheets || 0;
      case 'aurora_powder':
        return gameState.inventory.auroraPowderGrams || 0;
      case 'aurora_briquette':
        return gameState.inventory.packagedAuroraBriquettes || 0;
      case 'aurora_block':
        return gameState.inventory.packagedAuroraBlocks || 0;
      default:
        return 0;
    }
  };

  // Find active event modifier for a product
  const getEventPriceModifier = (itemKey: string): number => {
    const events = gameState.marketEvents || [];
    let mod = 0;
    for (const ev of events) {
      if (ev.targetProduct === 'all' || ev.targetProduct === itemKey) {
        mod += ev.priceModifier;
      }
    }
    return mod;
  };

  const getStreetItemPrice = (key: string): number => {
    const market = gameState.marketPrices[key];
    let base = 16;
    if (key === 'lsd_25') base = 3500;
    else if (key === 'neuro_sheets') base = 5200;
    else if (key === 'cocaine') base = 85;
    else if (key === 'aurora_powder') base = 75;
    else if (key === 'aurora_briquette') base = 700;
    else if (key === 'aurora_block') base = 3400;
    else if (key === 'astral_craft') base = 140;
    else if (key === 'astral_microdose') base = 680;
    else if (key === 'astral_syndicate') base = 2850;
    else if (key === 'astral_raw') base = 18;
    else if (key === 'astral_dried') base = 28;

    const eventMod = getEventPriceModifier(key);
    return calculateDynamicPrice(base, market ? market.saturation : 0.4, gameState.policeHeat, 0.92, eventMod);
  };

  const currentPricePerUnit = getStreetItemPrice(streetItem);
  const maxAvailable = getInventoryAmount(streetItem);

  // Reputation bonuses
  const rep = gameState.buyerReputation || {
    score: 100,
    level: 1,
    title: 'Уличный новичок',
    successfulDeals: 0,
    failedDeals: 0,
    bonusPayoutPercent: 0,
    heatReductionPercent: 0,
  };

  const rawPayout = Math.round(streetVolume * currentPricePerUnit);
  const bonusCash = Math.round(rawPayout * (rep.bonusPayoutPercent / 100));
  const streetPayout = rawPayout + bonusCash;

  const baseHeat = Math.round(3 + streetVolume * 0.15);
  const heatReduction = Math.round(baseHeat * (rep.heatReductionPercent / 100));
  const heatAdded = Math.max(1, baseHeat - heatReduction);

  // Active event for the currently selected street item
  const activeItemEvent = (gameState.marketEvents || []).find(
    (e) => e.targetProduct === 'all' || e.targetProduct === streetItem
  );

  const commodityNames: Record<string, { ru: string; en: string }> = {
    white_widow: { ru: 'Каннабис White Widow', en: 'White Widow' },
    amnesia_haze: { ru: 'Каннабис Amnesia Haze', en: 'Amnesia Haze' },
    gorilla_glue: { ru: 'Каннабис Gorilla Glue #4', en: 'Gorilla Glue #4' },
    purple_haze: { ru: 'Каннабис Purple Haze', en: 'Purple Haze' },
    astral_raw: { ru: 'Псило-грибы «Астрал» (Сырые)', en: 'Astral Mushrooms (Raw)' },
    astral_craft: { ru: '5г Пакеты «Шепот Астрала»', en: '5g Astral Craft Packs' },
    astral_microdose: { ru: '25г Банки микродозинга', en: '25g Microdose Jars' },
    astral_syndicate: { ru: '100г Вакуум-боксы Синдиката', en: '100g Astral Syndicate Boxes' },
    lsd_25: { ru: 'ЛСД-25 (Лист 900 табов)', en: 'LSD-25 Blotter Sheet' },
    cocaine: { ru: 'Кокаин «Fishscale»', en: 'Fishscale Cocaine' },
    neuro_sheets: { ru: 'Нейро-Блоттеры (1000 табов)', en: 'Neuro-Blotter Sheet' },
    aurora_powder: { ru: 'Порошок «Аврора» (1г)', en: 'Aurora Powder (1g)' },
    aurora_briquette: { ru: '10г Брикет «Аврора»', en: '10g Aurora Briquette' },
    aurora_block: { ru: '50г Вакуум-блок «Аврора»', en: '50g Aurora Cartel Block' },
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span>{t.marketBadge1}</span>
            <span aria-hidden="true">·</span>
            <span>{t.marketBadge2}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            {t.marketTitle}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed font-medium">
            {t.marketDesc}
          </p>
        </div>

        {/* Channel Selector Segmented Controls */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121720] border border-white/[0.08] rounded-xl shadow-sm overflow-x-auto">
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedChannel('street');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedChannel === 'street'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.channelStreet}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedChannel('black_market');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedChannel === 'black_market'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏴‍☠️ {language === 'ru' ? 'Барыги & Химсклад' : 'Peddlers & Heist'}</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedChannel('special_orders');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              selectedChannel === 'special_orders'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t.specialOrdersTitle} ({(gameState.specialOrders || []).length})</span>
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedChannel('darknet');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedChannel === 'darknet'
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.channelDarknet}
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setSelectedChannel('cartel');
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              selectedChannel === 'cartel'
                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.channelCartel}
          </button>
        </div>
      </div>

      {/* Buyer Reputation & Trust Tier Banner */}
      <div className="bg-gradient-to-r from-[#0d1622] to-[#111928] border border-white/[0.08] rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-400">
                {t.reputationTitle}
              </span>
              <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                ★ Ранг {rep.level} · {rep.title}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-0.5">
              Успешных сделок: <strong className="text-white font-mono">{rep.successfulDeals}</strong> ·
              Очков репутации: <strong className="text-amber-400 font-mono">{rep.score}/1000</strong>
            </div>
          </div>
        </div>

        {/* Perks Badges */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-[#090e16] border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Бонус к чеку: <strong>+{rep.bonusPayoutPercent}%</strong></span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-[#090e16] border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>Снижение розыска: <strong>-{rep.heatReductionPercent}%</strong></span>
          </div>
        </div>
      </div>

      {/* Dynamic Market Events Ribbon */}
      {(gameState.marketEvents || []).length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                {t.marketEventsTitle}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {gameState.marketEvents.length} активных события
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {gameState.marketEvents.map((ev) => (
              <div
                key={ev.id}
                className="bg-[#0f1520] border border-white/[0.08] hover:border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300">
                      {ev.badge}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {ev.hoursRemaining} {t.hoursRemainingLabel}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-2">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">
                    Эффект:{' '}
                    <strong className={ev.priceModifier >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {ev.priceModifier >= 0 ? `+${Math.round(ev.priceModifier * 100)}%` : `${Math.round(ev.priceModifier * 100)}%`} цены
                    </strong>
                  </span>
                  {ev.heatModifier > 0 && (
                    <span className="text-rose-400 font-semibold">
                      +{ev.heatModifier}% розыска
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Price Ticker & Volatility Overview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
            Биржевые котировки товаров (Выберите для графика)
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            Обновляется каждый час
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(gameState.marketPrices).map(([key, data]) => {
            const label = commodityNames[key]?.[language] || key;
            const unit = key === 'lsd_25' ? (language === 'ru' ? 'лист' : 'sheet') : 'g';
            const isSelected = selectedChartCommodity === key;

            return (
              <button
                key={key}
                onClick={() => setSelectedChartCommodity(key)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#141d2a] border-emerald-500/60 shadow-lg shadow-black/40 ring-1 ring-emerald-500/40'
                    : 'bg-[#0f141d] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="text-[11px] font-mono text-slate-400 truncate font-medium">
                  {label}
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-sm font-bold text-white font-mono">
                    ${data.current.toLocaleString()}/{unit}
                  </span>
                  {data.trend === 'up' ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : data.trend === 'down' ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">FLAT</span>
                  )}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 flex justify-between font-mono">
                  <span>Насыщение:</span>
                  <span className="text-slate-200 font-bold">{Math.round(data.saturation * 100)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive Mini-Chart & Forecasting Section */}
      {selectedChartCommodity && gameState.marketPrices[selectedChartCommodity] && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>{t.marketHistoryTitle}</span>
          </div>
          <MarketHistoryChart
            commodityKey={selectedChartCommodity}
            commodityName={commodityNames[selectedChartCommodity]?.[language] || selectedChartCommodity}
            data={gameState.marketPrices[selectedChartCommodity]}
            language={language}
          />
        </section>
      )}

      {/* CHANNEL: STREET BLACK MARKET & HEIST */}
      {selectedChannel === 'black_market' && (
        <StreetBlackMarket
          gameState={gameState}
          onBuyItem={(itemKey, cost, count, heatGain) => {
            if (onBuyStreetBlackMarketItem) {
              onBuyStreetBlackMarketItem(itemKey, cost, count, heatGain);
            }
          }}
          onHeistSuccess={(loot) => {
            if (onHeistSuccess) {
              onHeistSuccess(loot);
            }
          }}
          onHeistCaught={(heatIncrease, penaltyCash) => {
            if (onHeistCaught) {
              onHeistCaught(heatIncrease, penaltyCash);
            }
          }}
          language={language}
        />
      )}

      {/* CHANNEL 1: STREET DEALERS */}
      {selectedChannel === 'street' && (
        <section className="bg-[#0e141e] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">
                  {t.streetTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t.streetDesc}
              </p>
            </div>

            <div className="text-right text-xs font-mono">
              <span className="text-slate-400">{t.riskLevel}: </span>
              <strong className="text-rose-400">{t.highRisk}{heatAdded}%)</strong>
            </div>
          </div>

          {activeItemEvent && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Активно событие: <strong>{activeItemEvent.title}</strong> — модификатор цены:{' '}
                <strong className={activeItemEvent.priceModifier >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {activeItemEvent.priceModifier >= 0 ? `+${Math.round(activeItemEvent.priceModifier * 100)}%` : `${Math.round(activeItemEvent.priceModifier * 100)}%`}
                </strong>
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-300 font-mono block mb-1.5">
                  {t.selectProduct}
                </label>
                <select
                  value={streetItem}
                  onChange={(e) => {
                    setStreetItem(e.target.value);
                    setStreetVolume(Math.min(25, getInventoryAmount(e.target.value)));
                  }}
                  className="w-full bg-[#121824] border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500 shadow-sm"
                >
                  <option value="white_widow">Каннабис White Widow ({gameState.inventory.whiteWidowGrams}г)</option>
                  <option value="amnesia_haze">Каннабис Amnesia Haze ({gameState.inventory.amnesiaHazeGrams}г)</option>
                  <option value="gorilla_glue">Каннабис Gorilla Glue #4 ({gameState.inventory.gorillaGlueGrams}г)</option>
                  <option value="purple_haze">Каннабис Purple Haze ({gameState.inventory.purpleHazeGrams}г)</option>
                  <option value="psilocybin">Псило-грибы Psilocybe ({gameState.inventory.mushroomsGrams}г)</option>
                  <option value="astral_raw">Грибы «Астрал» (Сырые) ({gameState.inventory.astralMushroomsRawGrams || 0}г)</option>
                  <option value="astral_dried">Грибы «Астрал» (Сублимированные высушенные) ({gameState.inventory.astralMushroomsDriedGrams || 0}г)</option>
                  <option value="astral_craft">5г Пакеты «Шепот Астрала» ({gameState.inventory.astralCraftPacks || 0} шт.)</option>
                  <option value="astral_microdose">25г Банки микродозинга ({gameState.inventory.astralMicrodoseJars || 0} шт.)</option>
                  <option value="astral_syndicate">100г Вакуум-боксы Синдиката ({gameState.inventory.astralSyndicateBoxes || 0} шт.)</option>
                  <option value="lsd_25">ЛСД-25 Листы 900 табов ({gameState.inventory.lsdSheets} шт.)</option>
                  <option value="cocaine">Кокаин Fishscale ({gameState.inventory.cocaineGrams || 0}г)</option>
                  <option value="neuro_sheets">Нейро-Блоттеры ({gameState.inventory.neuroSheets || 0} шт.)</option>
                  <option value="aurora_powder">Порошок «Аврора» (1г зиплоки) ({gameState.inventory.auroraPowderGrams || 0} шт.)</option>
                  <option value="aurora_briquette">10г Брикеты «Аврора» ({gameState.inventory.packagedAuroraBriquettes || 0} шт.)</option>
                  <option value="aurora_block">50г Вакуум-блоки «Аврора» ({gameState.inventory.packagedAuroraBlocks || 0} шт.)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span>{t.batchVolume}:</span>
                  <span className="font-bold text-emerald-400">
                    {streetVolume} {streetItem === 'lsd_25' ? (language === 'ru' ? 'Листов' : 'Sheets') : 'Grams'} ({t.stock}: {maxAvailable})
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={Math.max(1, Math.min(streetItem === 'lsd_25' ? 5 : 50, maxAvailable))}
                  value={streetVolume}
                  onChange={(e) => setStreetVolume(Number(e.target.value))}
                  disabled={maxAvailable <= 0}
                  className="w-full accent-emerald-500 h-1.5 bg-neutral-800 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Deal Summary Box */}
            <div className="bg-[#090d14] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between shadow-inner">
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>{t.marketPriceUnit}:</span>
                  <span className="text-white font-bold">${currentPricePerUnit} / unit</span>
                </div>
                {bonusCash > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Бонус за репутацию (+{rep.bonusPayoutPercent}%):</span>
                    <span>+${bonusCash}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 pt-1 border-t border-white/[0.06]">
                  <span>{t.instantPayout}:</span>
                  <span className="text-emerald-400 font-bold text-base tabular-nums">
                    +${streetPayout.toLocaleString()} CASH
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{t.policeHeatAdded}:</span>
                  <span className="text-rose-400 font-semibold">+{heatAdded}%</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playCash();
                  onSellStreetDeal(streetItem, streetVolume, streetPayout, heatAdded);
                }}
                disabled={maxAvailable < streetVolume || streetVolume <= 0}
                className={`w-full mt-4 py-2.5 px-4 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  maxAvailable >= streetVolume && streetVolume > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-950/40 active:scale-98'
                    : 'bg-[#141a24] text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>{t.executeStreetSale}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CHANNEL: COURIER JOB (DEAD DROP DELIVERY) */}
      {selectedChannel === 'courier_job' && (
        <section className="bg-[#0e141e] border border-white/[0.08] rounded-2xl p-6 shadow-sm">
          <DeadDropCourierJob
            gameState={gameState}
            onCourierSuccess={onCourierSuccess}
            onCourierCaught={onCourierCaught}
            onDeductCash={onDeductCash}
            language={language}
          />
        </section>
      )}

      {/* CHANNEL: SPECIAL VIP ORDERS */}
      {selectedChannel === 'special_orders' && (
        <section className="bg-[#0e141e] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">
                  {t.specialOrdersTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t.specialOrdersDesc}
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl font-bold">
              VIP Премиум
            </span>
          </div>

          {(gameState.specialOrders || []).length === 0 ? (
            <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-slate-400">
              В данный момент нет открытых особых заказов. Новые клиенты свяжутся через закрытые каналы.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {gameState.specialOrders.map((order) => {
                const stockAvailable = getInventoryAmount(order.productKey);
                const hasSufficientVolume = stockAvailable >= order.volume;

                return (
                  <div
                    key={order.id}
                    className="p-5 bg-[#090d14] border border-white/[0.08] hover:border-cyan-500/40 rounded-2xl flex flex-col justify-between transition-colors shadow-sm"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                            VIP Клиент
                          </span>
                          <h4 className="font-bold text-white text-base">
                            {order.clientTitle}
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold text-emerald-400 font-mono block">
                            +${order.rewardCash.toLocaleString()}
                          </span>
                          <span className="text-[11px] font-mono text-amber-400 font-semibold">
                            +{order.reputationGain} репутации
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-[#121824] rounded-xl border border-white/5 space-y-1.5 text-xs font-mono text-slate-300">
                        <div className="flex justify-between">
                          <span>Требуется товар:</span>
                          <strong className="text-white">{order.productName}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Объем заказа:</span>
                          <span className={hasSufficientVolume ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {order.volume} {order.productKey === 'lsd_25' ? 'листов' : 'г'} (В наличии: {stockAvailable})
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Мин. чистота:</span>
                          <span className="text-slate-200">≥ {order.minPurity}%</span>
                        </div>
                        <div className="flex justify-between text-amber-400 pt-1 border-t border-white/5">
                          <span>Дедлайн:</span>
                          <span>{order.hoursRemaining} часов осталось</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5">
                      {order.isAccepted ? (
                        <button
                          onClick={() => {
                            if (hasSufficientVolume && onFulfillSpecialOrder) {
                              sounds.playCash();
                              onFulfillSpecialOrder(order.id);
                            }
                          }}
                          disabled={!hasSufficientVolume}
                          className={`w-full py-2 px-3 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            hasSufficientVolume
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-950/40 active:scale-98'
                              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t.fulfillSpecialOrder}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (onAcceptSpecialOrder) {
                              sounds.playClick();
                              onAcceptSpecialOrder(order.id);
                            }
                          }}
                          className="w-full py-2 px-3 bg-[#16202e] hover:bg-[#1c293b] text-cyan-300 border border-cyan-500/30 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          {t.acceptVipOrder}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* CHANNEL 2: DARKNET MARKET */}
      {selectedChannel === 'darknet' && (
        <section className="bg-[#0e141e] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">
                  {t.torTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t.torDesc}
              </p>
            </div>

            {/* Crypto Swap Desk */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sounds.playCash();
                  onConvertCrypto('XMR', gameState.cryptoXmr);
                }}
                disabled={gameState.cryptoXmr <= 0}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t.liquidateXmr} ({gameState.cryptoXmr.toFixed(2)})
              </button>
              <button
                onClick={() => {
                  sounds.playCash();
                  onConvertCrypto('BTC', gameState.cryptoBtc);
                }}
                disabled={gameState.cryptoBtc <= 0}
                className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {t.liquidateBtc} ({gameState.cryptoBtc.toFixed(4)})
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              {t.pendingOrders} ({gameState.darknetOrders.length})
            </h3>

            {gameState.darknetOrders.length === 0 ? (
              <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-xs text-slate-400">
                {t.noDarknetOrders}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gameState.darknetOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 bg-[#090d14] border border-white/[0.08] rounded-2xl flex flex-col justify-between shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          Buyer: {order.buyerAlias}
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 bg-[#141b26] border border-white/5 px-2.5 py-0.5 rounded-lg">
                          ${order.usdValue} USD
                        </span>
                      </div>
                      <div className="text-xs text-white mt-2 font-medium">
                        Order: {order.amount}x {order.itemName}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                        <span>Escrow: {order.cryptoXmr} XMR</span>
                        <span>·</span>
                        <span>{order.cryptoBtc} BTC</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playCash();
                        onFulfillDarknetOrder(order.id);
                      }}
                      className="w-full mt-4 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t.deliverDeadDrop}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CHANNEL 3: WHOLESALE CARTEL CONTRACTS */}
      {selectedChannel === 'cartel' && (
        <section className="bg-[#0e141e] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">
                  {t.cartelTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {t.cartelDesc}
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
              {t.zeroHeatRisk}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.cartelContracts.map((contract) => (
              <div
                key={contract.id}
                className="p-5 bg-[#090d14] border border-white/[0.08] hover:border-purple-500/40 rounded-2xl flex flex-col justify-between transition-colors shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-white">
                      {contract.cartelName}
                    </h3>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      ${contract.payoutCash.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-300 space-y-1 pt-2">
                    <div>{t.selectProduct}: <span className="text-white font-medium">{contract.requiredProduct}</span></div>
                    <div>{t.quotaVolume}: <span className="text-white font-medium">{contract.requiredVolume}g</span></div>
                    <div>{t.minimumPurity}: <span className="text-white font-medium">{contract.requiredPurity}%</span></div>
                    <div>Дедлайн: <span className="text-amber-400">{contract.daysRemaining} {t.deadlineDays}</span></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  {contract.isAccepted ? (
                    <button
                      onClick={() => {
                        sounds.playCash();
                        onFulfillCartelContract(contract.id);
                      }}
                      className="w-full py-2 px-3 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>{t.fulfillCartelQuota}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onAcceptCartelContract(contract.id);
                      }}
                      className="w-full py-2 px-3 bg-[#151c28] hover:bg-[#1b2535] text-slate-200 border border-white/10 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {t.acceptContract}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
