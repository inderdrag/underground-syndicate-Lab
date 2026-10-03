import React, { useState } from 'react';
import { GameState } from '../types/game';
import {
  ShoppingBag,
  Flame,
  ShieldAlert,
  Zap,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Droplets,
  Sprout,
  Syringe,
  FlaskConical,
  Layers,
  ChevronRight,
  Skull,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ChemicalHeistMiniGame } from './ChemicalHeistMiniGame';

interface StreetBlackMarketProps {
  gameState: GameState;
  onBuyItem: (itemKey: string, cost: number, count: number, heatGain: number) => void;
  onHeistSuccess: (loot: {
    diethylamineMl: number;
    ergotCultures: number;
    sporeSyringes: number;
    nutrientBloomMl: number;
    nutrientVegMl: number;
    bonusCash: number;
  }) => void;
  onHeistCaught: (heatIncrease: number, penaltyCash: number) => void;
  language: Language;
}

interface BlackMarketItem {
  key: string;
  nameRu: string;
  nameEn: string;
  category: 'seeds' | 'mycology' | 'chemistry' | 'nutrients';
  streetPrice: number;
  marketPrice: number;
  unitAmount: number;
  unitLabel: string;
  icon: typeof Sprout;
  badge: string;
}

export const StreetBlackMarket: React.FC<StreetBlackMarketProps> = ({
  gameState,
  onBuyItem,
  onHeistSuccess,
  onHeistCaught,
  language,
}) => {
  const [showHeistModal, setShowHeistModal] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const blackMarketItems: BlackMarketItem[] = [
    // Seeds (marked up ~2.7x)
    { key: 'seedsWhiteWidow', nameRu: 'Семя White Widow (1 шт)', nameEn: 'White Widow Seed', category: 'seeds', streetPrice: 110, marketPrice: 40, unitAmount: 1, unitLabel: 'сем.', icon: Sprout, badge: 'Втридорога x2.7' },
    { key: 'seedsAmnesiaHaze', nameRu: 'Семя Amnesia Haze (1 шт)', nameEn: 'Amnesia Haze Seed', category: 'seeds', streetPrice: 150, marketPrice: 55, unitAmount: 1, unitLabel: 'сем.', icon: Sprout, badge: 'Втридорога x2.7' },
    { key: 'seedsGorillaGlue', nameRu: 'Семя Gorilla Glue #4', nameEn: 'Gorilla Glue Seed', category: 'seeds', streetPrice: 175, marketPrice: 65, unitAmount: 1, unitLabel: 'сем.', icon: Sprout, badge: 'Втридорога x2.7' },
    { key: 'seedsPurpleHaze', nameRu: 'Семя Purple Haze', nameEn: 'Purple Haze Seed', category: 'seeds', streetPrice: 140, marketPrice: 50, unitAmount: 1, unitLabel: 'сем.', icon: Sprout, badge: 'Втридорога x2.8' },

    // Mycology
    { key: 'sporeSyringes', nameRu: 'Споровый шприц Golden Teacher', nameEn: 'Spore Syringe', category: 'mycology', streetPrice: 190, marketPrice: 70, unitAmount: 1, unitLabel: 'шт.', icon: Syringe, badge: 'Втридорога x2.7' },

    // Chemistry & Synthesis
    { key: 'ergotCultures', nameRu: 'Культура спорыньи Claviceps', nameEn: 'Ergot Culture', category: 'chemistry', streetPrice: 320, marketPrice: 120, unitAmount: 1, unitLabel: 'культ.', icon: FlaskConical, badge: 'Втридорога x2.6' },
    { key: 'diethylamineMl', nameRu: 'Диэтиламин (100 мл)', nameEn: 'Diethylamine 100ml', category: 'chemistry', streetPrice: 280, marketPrice: 90, unitAmount: 100, unitLabel: 'мл', icon: Droplets, badge: 'Втридорога x3.1' },
    { key: 'perforatedPaperSheets', nameRu: 'Хромо-бумага блоттеров (1 лист)', nameEn: 'Perforated Paper', category: 'chemistry', streetPrice: 95, marketPrice: 35, unitAmount: 1, unitLabel: 'лист', icon: Layers, badge: 'Втридорога x2.7' },

    // Nutrients & Water
    { key: 'nutrientVegMl', nameRu: 'Удобрение Вегетация N-Max (250 мл)', nameEn: 'Veg Nutrient N-Max', category: 'nutrients', streetPrice: 95, marketPrice: 35, unitAmount: 250, unitLabel: 'мл', icon: Droplets, badge: 'Втридорога x2.7' },
    { key: 'nutrientBloomMl', nameRu: 'Стимулятор Цветения PK 13/14 (200 мл)', nameEn: 'Bloom PK 13/14', category: 'nutrients', streetPrice: 110, marketPrice: 40, unitAmount: 200, unitLabel: 'мл', icon: Flame, badge: 'Втридорога x2.8' },
    { key: 'purifiedWaterLitres', nameRu: 'Дистиллированная вода (25 л)', nameEn: 'Osmotic Water 25L', category: 'nutrients', streetPrice: 50, marketPrice: 15, unitAmount: 25, unitLabel: 'л', icon: Droplets, badge: 'Втридорога x3.3' },
  ];

  const handleBuy = (item: BlackMarketItem) => {
    if (gameState.cash < item.streetPrice) {
      sounds.playAlarmBeep();
      setFeedbackMsg('Недостаточно наличных для сделки с барыгой!');
      setTimeout(() => setFeedbackMsg(null), 2500);
      return;
    }

    sounds.playCash();
    onBuyItem(item.key, item.streetPrice, item.unitAmount, 2);
    setFeedbackMsg(`Куплено: ${item.nameRu} за $${item.streetPrice} (+2% розыска)`);
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Banner: Shady Street Peddler & Chemical Heist */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#120f18] to-[#0d121c] border border-amber-500/30 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            <Skull className="w-4 h-4" />
            <span>Уличные барыги и Теневой склад</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-white">
            Черный рынок компонентов & Ограбление химсклада
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Покупайте прекурсоры, семена и реактивы у уличных посредников моментально (втридорога), либо совершите дерзкое ночное ограбление охраняемого склада химикатов.
          </p>
        </div>

        {/* Heist Launch Button */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowHeistModal(true);
          }}
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 transition-all shrink-0"
        >
          <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
          <span>Ограбить склад химикатов (Бесплатный лут)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {feedbackMsg && (
        <div className="py-2.5 px-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-mono font-bold flex items-center justify-between animate-pulse">
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Street Goods Catalog */}
      <div className="bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Каталог уличных барыг (Наценка ~270%-330%):</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Баланс: <strong className="text-emerald-400 font-mono">${gameState.cash.toLocaleString()}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {blackMarketItems.map((item) => {
            const Icon = item.icon;
            const canAfford = gameState.cash >= item.streetPrice;

            return (
              <div
                key={item.key}
                className="p-3.5 rounded-2xl bg-[#080c13] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                      {item.badge}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 line-through">
                      Норма: ${item.marketPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs leading-tight">{item.nameRu}</div>
                      <div className="text-[10px] font-mono text-slate-400">Количество: {item.unitAmount} {item.unitLabel}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="text-sm font-mono font-bold text-amber-400">
                    ${item.streetPrice}
                  </div>

                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canAfford}
                    className={`py-1.5 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                        : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Купить у барыги
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heist Modal */}
      {showHeistModal && (
        <ChemicalHeistMiniGame
          gameState={gameState}
          onHeistSuccess={(loot) => {
            onHeistSuccess(loot);
            setShowHeistModal(false);
          }}
          onHeistCaught={(heatIncrease, penaltyCash) => {
            onHeistCaught(heatIncrease, penaltyCash);
          }}
          onClose={() => setShowHeistModal(false)}
          language={language}
        />
      )}
    </div>
  );
};
