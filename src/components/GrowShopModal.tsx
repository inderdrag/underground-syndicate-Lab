import React from 'react';
import { GameState } from '../types/game';
import { GROW_SHOP_CATALOG, GrowShopItem } from '../engine/cultivationEngine';
import { ShoppingBag, Droplets, Sparkles, Shield, X, Check, ArrowRight, Zap, Info } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

interface GrowShopModalProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
  onBuySupply: (item: GrowShopItem) => void;
  language: Language;
}

export const GrowShopModal: React.FC<GrowShopModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onBuySupply,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b1018] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>{language === 'ru' ? 'Гроушоп и коммунальные припасы' : 'Grow Shop & Utility Vault'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Store
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ru'
                  ? 'Осмотическая вода, комплексы удобрений N-P-K и органическая защита'
                  : 'RO Osmotic water, N-P-K nutrient blends and biological crop protection'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Supplies Overview Strip */}
        <div className="p-3.5 rounded-2xl bg-[#080d14] border border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">Вода (RO):</span>
            <strong className="text-cyan-400 font-bold">{gameState.inventory.purifiedWaterLitres} л</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Азот N-Max:</span>
            <strong className="text-emerald-400 font-bold">{gameState.inventory.nutrientVegMl} мл</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">PK 13/14 Бустер:</span>
            <strong className="text-amber-400 font-bold">{gameState.inventory.nutrientBloomMl} мл</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Биогумус:</span>
            <strong className="text-purple-400 font-bold">{gameState.inventory.nutrientOrganicMl} мл</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">Масло Нима:</span>
            <strong className="text-rose-400 font-bold">{gameState.inventory.neemOilMl} мл</strong>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {GROW_SHOP_CATALOG.map((item) => {
            const canAfford = gameState.cash >= item.price;
            let currentVal = 0;
            let unitLabel = '';
            if (item.inventoryKey === 'purifiedWaterLitres') {
              currentVal = gameState.inventory.purifiedWaterLitres;
              unitLabel = 'л';
            } else if (item.inventoryKey === 'nutrientVegMl') {
              currentVal = gameState.inventory.nutrientVegMl;
              unitLabel = 'мл';
            } else if (item.inventoryKey === 'nutrientBloomMl') {
              currentVal = gameState.inventory.nutrientBloomMl;
              unitLabel = 'мл';
            } else if (item.inventoryKey === 'nutrientOrganicMl') {
              currentVal = gameState.inventory.nutrientOrganicMl;
              unitLabel = 'мл';
            } else {
              currentVal = gameState.inventory.neemOilMl;
              unitLabel = 'мл';
            }

            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-[#0e141f] border border-white/[0.08] hover:border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {item.category === 'water' && <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />}
                    {item.category === 'fertilizer' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {item.category === 'protection' && <Shield className="w-4 h-4 text-rose-400 shrink-0" />}
                    <h4 className="font-bold text-white text-sm">
                      {item.nameRu}
                    </h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-slate-300">
                      {item.quantityDesc}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                    {item.descriptionRu}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400">
                    На складе: <strong className="text-white">{currentVal} {unitLabel}</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playCash();
                    onBuySupply(item);
                  }}
                  disabled={!canAfford}
                  className={`py-2 px-4 rounded-xl font-mono font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow ${
                    canAfford
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 active:scale-95'
                      : 'bg-[#141b26] text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span>Купить за ${item.price}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Utility Bills Note */}
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl flex items-start gap-2.5 text-xs font-mono text-cyan-300">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'ru'
              ? 'Реалистичный расход: если на складе заканчивается чистая вода, при поливе списывается $4 по городскому счетчику ЖКХ. Электроэнергия за свет ламп автоматически рассчитывается в ежедневном содержании.'
              : 'Realistic consumption: if pure RO water runs out, a $4 municipal utility fee is charged per watering. Electric power for lights is calculated in daily upkeep.'}
          </p>
        </div>
      </div>
    </div>
  );
};
