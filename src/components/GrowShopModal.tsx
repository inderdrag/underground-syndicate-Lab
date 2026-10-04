import React from 'react';
import { GameState, SyndicateLicenseId } from '../types/game';
import { GROW_SHOP_CATALOG, GrowShopItem } from '../engine/cultivationEngine';
import { ShoppingBag, Droplets, Sparkles, Shield, X, Lock, Check, ArrowRight, Zap, Info } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

interface GrowShopModalProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
  onBuySupply: (item: GrowShopItem) => void;
  onBuyLicense?: (licenseId: SyndicateLicenseId, cost: number) => void;
  language: Language;
}

export const GrowShopModal: React.FC<GrowShopModalProps> = ({
  gameState,
  isOpen,
  onClose,
  onBuySupply,
  onBuyLicense,
  language,
}) => {
  if (!isOpen) return null;

  const hasBotanyLicense = Boolean(gameState.syndicateLicenses?.botany_license);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b1018] border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>{language === 'ru' ? 'Гроушоп и коммунальные припасы' : 'Grow Shop & Utility Vault'}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  hasBotanyLicense
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {hasBotanyLicense ? (language === 'ru' ? 'Лицензия активна' : 'Licensed') : (language === 'ru' ? 'Требуется лицензия' : 'License Required')}
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

        {/* License Required Banner (Synchronized with Megastore) */}
        {!hasBotanyLicense && (
          <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shrink-0">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <span>{language === 'ru' ? 'Требуется Лицензия Гровера (Ботаника)' : 'Grower License Required'}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Синдикат</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {language === 'ru'
                    ? 'Без лицензии оптовая закупка припасов заблокирована. Лицензия синхронизирована с Мегамаркетом.'
                    : 'Wholesale utility supply procurement requires a valid grower permit.'}
                </p>
              </div>
            </div>

            {onBuyLicense && (
              <button
                onClick={() => {
                  if (gameState.cash >= 150) {
                    sounds.playCash();
                    onBuyLicense('botany_license', 150);
                  } else {
                    sounds.playAlarmBeep();
                  }
                }}
                disabled={gameState.cash < 150}
                className={`px-4 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 shrink-0 transition-all shadow-md ${
                  gameState.cash >= 150
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 cursor-pointer active:scale-95'
                    : 'bg-neutral-800 text-slate-500 border border-white/5 cursor-not-allowed'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{language === 'ru' ? 'Купить лицензию ($150)' : 'Buy License ($150)'}</span>
              </button>
            )}
          </div>
        )}

        {/* Current Supplies Overview Strip */}
        <div className="p-3.5 rounded-2xl bg-[#080d14] border border-white/5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs font-mono shrink-0">
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
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {GROW_SHOP_CATALOG.map((item) => {
            const canAfford = gameState.cash >= item.price;
            const canPurchase = hasBotanyLicense && canAfford;

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
                className={`p-3.5 rounded-2xl bg-[#0e141f] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  hasBotanyLicense ? 'border-white/[0.08] hover:border-emerald-500/30' : 'border-white/5 opacity-70'
                }`}
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
                    if (!canPurchase) return;
                    sounds.playCash();
                    onBuySupply(item);
                  }}
                  disabled={!canPurchase}
                  className={`py-2 px-4 rounded-xl font-mono font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 transition-all shadow ${
                    canPurchase
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 cursor-pointer active:scale-95'
                      : !hasBotanyLicense
                      ? 'bg-amber-950/40 text-amber-500 border border-amber-500/30 cursor-not-allowed'
                      : 'bg-[#141b26] text-slate-600 border border-white/5 cursor-not-allowed'
                  }`}
                >
                  {!hasBotanyLicense ? (
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'ru' ? 'Нужна лицензия' : 'License Needed'}</span>
                    </span>
                  ) : (
                    <span>Купить за ${item.price}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Utility Bills Note */}
        <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl flex items-start gap-2.5 text-xs font-mono text-cyan-300 shrink-0">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {language === 'ru'
              ? 'Синхронизация с Мегамаркетом: наличие лицензии гровера открывает доступ к закупке семян, осмотической воды и удобрений по всем разделам Синдиката.'
              : 'Synced with Megastore: possessing the grower license unlocks seeds, RO water, and nutrient procurement across all Syndicate divisions.'}
          </p>
        </div>
      </div>
    </div>
  );
};
