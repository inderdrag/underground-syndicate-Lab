import React, { useState } from 'react';
import { pharmaPackConfig } from '../../config/pharmaPackData';
import { PHARMA_DRUGS_CATALOG, PharmaDrugRecipe } from '../../data/pharma_recipes_config';
import { MEGASTORE_ITEMS } from '../../data/megastore_catalog';
import { PharmaCraftingMiniGames, PharmaCraftBatchOutcome } from '../minigames/PharmaCraftingMiniGames';
import { PharmaItemDef, PharmaSubgroup, PharmaCraftBatchResult, PharmaGameState, PharmaStash } from '../../types/pharma';
import { processCraftingMiniGame } from '../../services/pharmaEngine';
import { PharmaProductBox } from './PharmaProductBox';
import {
  FlaskConical,
  Flame,
  Award,
  AlertTriangle,
  Play,
  Sliders,
  ShieldAlert,
  Box,
  Truck,
  Building,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  X
} from 'lucide-react';

import { GameState } from '../../types/game';

interface PharmaLabViewProps {
  gameState?: GameState;
  pharmaState: PharmaGameState;
  onUpdatePharmaState: (updater: (prev: PharmaGameState) => PharmaGameState) => void;
  onAddCash: (amount: number) => void;
  onAddHeat: (heat: number) => void;
  onDeductInventory?: (itemKey: string, amount: number) => void;
  playerLevel?: number;
  playerReputation?: number;
}

export function getIngredientStock(
  ingredientId: string,
  gameState?: GameState,
  pharmaState?: PharmaGameState
): number {
  const gInv = (gameState?.inventory || {}) as Record<string, number>;
  const pInv = (pharmaState?.inventory || {}) as Record<string, number>;

  const getVal = (k: string) => (gInv[k] || 0) + (pInv[k] || 0);

  let amount = getVal(ingredientId);

  // Fallbacks for base/catalyst/packaging
  if (ingredientId.includes('base') || ingredientId.includes('willow') || ingredientId.includes('charred') || ingredientId.includes('spasmo') || ingredientId.includes('citrus') || ingredientId.includes('moonflower') || ingredientId.includes('neuro') || ingredientId.includes('alba') || ingredientId.includes('sero') || ingredientId.includes('analga') || ingredientId.includes('somna') || ingredientId.includes('tranqui') || ingredientId.includes('vigil') || ingredientId.includes('focus') || ingredientId.includes('resin') || ingredientId.includes('stim') || ingredientId.includes('synth')) {
    amount += getVal('pharmaBase') + getVal('pharma_base') + getVal('pharma_base_extract') + getVal('base');
  }

  if (ingredientId.includes('cat') || ingredientId.includes('buffer') || ingredientId.includes('activator') || ingredientId.includes('module') || ingredientId.includes('solvent') || ingredientId.includes('sorbent') || ingredientId.includes('binder') || ingredientId.includes('catalyst')) {
    amount += getVal('pharmaCatalyst') + getVal('pharma_catalyst') + getVal('pharma_binder') + getVal('pharma_solvent') + getVal('pharma_stabilizer') + getVal('catalyst');
  }

  if (ingredientId.includes('pack') || ingredientId.includes('blister') || ingredientId.includes('strip') || ingredientId.includes('foil') || ingredientId.includes('tubus') || ingredientId.includes('jar') || ingredientId.includes('pkg') || ingredientId.includes('packaging')) {
    amount += getVal('pharmaPackaging') + getVal('pharma_packaging') + getVal('packaging');
  }

  return amount;
}

export const PharmaLabView: React.FC<PharmaLabViewProps> = ({
  gameState,
  pharmaState,
  onUpdatePharmaState,
  onAddCash,
  onAddHeat,
  onDeductInventory,
  playerLevel = 2,
  playerReputation = 35
}) => {
  const [activeSubgroup, setActiveSubgroup] = useState<PharmaSubgroup | 'all'>('all');
  const [selectedItem, setSelectedItem] = useState<PharmaItemDef | null>(pharmaPackConfig.items[0]);
  const [showCraftModal, setShowCraftModal] = useState(false);

  // Mini-game interactive states
  const [tempC, setTempC] = useState(50);
  const [rpm, setRpm] = useState(500);
  const [doseMg, setDoseMg] = useState(100);
  const [dilutionPercent, setDilutionPercent] = useState(0);

  const [lastCraftResult, setLastCraftResult] = useState<PharmaCraftBatchResult | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);

  // Stash management state
  const [activeTab, setActiveTab] = useState<'craft' | 'stashes' | 'purity_lab'>('craft');

  const filteredItems = pharmaPackConfig.items.filter(item => {
    if (activeSubgroup === 'all') return true;
    return item.subgroup === activeSubgroup;
  });

  const openCraftingModal = (item: PharmaItemDef) => {
    setSelectedItem(item);
    setTempC(item.recipe.goldenZone.targetTempC);
    setRpm(item.recipe.goldenZone.targetRpm);
    setDoseMg(item.recipe.goldenZone.targetDoseMg);
    setDilutionPercent(0);
    setLastCraftResult(null);
    setShowCraftModal(true);
  };

  const handleStartCraft = () => {
    if (!selectedItem) return;

    // Check ingredients using getIngredientStock
    const reqIngredients = selectedItem.recipe.ingredients;
    const missing = reqIngredients.find(req => getIngredientStock(req.ingredientId, gameState, pharmaState) < req.amount);

    if (missing) {
      alert(`Недостаточно ингредиента: ${missing.ingredientId} (требуется ${missing.amount})`);
      return;
    }

    setIsCrafting(true);

    setTimeout(() => {
      const result = processCraftingMiniGame(
        selectedItem,
        tempC,
        rpm,
        doseMg,
        dilutionPercent
      );

      // Deduct ingredients and add produced items to inventory
      onUpdatePharmaState(prev => {
        const nextInv = { ...prev.inventory };
        reqIngredients.forEach(req => {
          let needed = req.amount;
          if (nextInv[req.ingredientId]) {
            const take = Math.min(nextInv[req.ingredientId], needed);
            nextInv[req.ingredientId] -= take;
            needed -= take;
          }
        });

        const currentCount = nextInv[selectedItem.id] || 0;
        nextInv[selectedItem.id] = currentCount + result.amountProduced;

        // Update purity stock average
        const prevPurity = prev.purityStock[selectedItem.id] || selectedItem.basePurity;
        const newPurity = currentCount === 0
          ? result.purity
          : Math.round((prevPurity * currentCount + result.purity * result.amountProduced) / (currentCount + result.amountProduced));

        const nextPurityStock = { ...prev.purityStock, [selectedItem.id]: newPurity };

        return {
          ...prev,
          inventory: nextInv,
          purityStock: nextPurityStock
        };
      });

      onAddHeat(result.heatGenerated);
      setLastCraftResult(result);
      setIsCrafting(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-3xl shadow-inner">
            🧪
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-unbounded text-emerald-400">Лаборатория PHARMA</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                Контент-Пак v1.0
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Синтез фармацевтических препаратов, регулировка чистоты, заказы и управление схронами
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('craft')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'craft'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> Крафт и Станции
          </button>

          <button
            onClick={() => setActiveTab('stashes')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              activeTab === 'stashes'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Box className="w-4 h-4" /> Схроны и Фургоны
          </button>
        </div>
      </div>

      {activeTab === 'craft' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Subgroups & Item Selection Catalog */}
          <div className="lg:col-span-5 space-y-4">
            {/* Subgroup Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveSubgroup('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                Все группы
              </button>
              <button
                onClick={() => setActiveSubgroup('opioids')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'opioids'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🍼 Опиоидные
              </button>
              <button
                onClick={() => setActiveSubgroup('benzodiazepines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'benzodiazepines'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                💊 Бензодиазепины
              </button>
              <button
                onClick={() => setActiveSubgroup('gabapentinoids')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'gabapentinoids'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                ❄️ Габапентиноиды
              </button>
              <button
                onClick={() => setActiveSubgroup('antidepressants')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'antidepressants'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🟡 Антидепрессанты
              </button>
              <button
                onClick={() => setActiveSubgroup('analgesics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'analgesics'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🩹 Обезболивающие
              </button>
              <button
                onClick={() => setActiveSubgroup('antihistamines')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'antihistamines'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🌿 Аллергические
              </button>
              <button
                onClick={() => setActiveSubgroup('vitamins')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'vitamins'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🍋 Витамины
              </button>
              <button
                onClick={() => setActiveSubgroup('nootropics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'nootropics'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🧠 Ноотропы
              </button>
              <button
                onClick={() => setActiveSubgroup('digestive')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeSubgroup === 'digestive' || activeSubgroup === 'sorbents'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                🫀 Пищеварение & Сорбенты
              </button>
            </div>

            {/* Catalog Item Cards */}
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredItems.map(item => {
                const isSelected = selectedItem?.id === item.id;
                const stockCount = pharmaState.inventory[item.id] || 0;
                const purity = pharmaState.purityStock[item.id] || item.basePurity;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl shadow-inner">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400 capitalize">{item.form}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs text-emerald-400 font-semibold">${item.basePrice} / ед.</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-200">
                          На складе: <span className="text-emerald-400">{stockCount} шт.</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Чистота: <span className="text-cyan-300 font-semibold">{purity}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk Badge Bar */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">Зависимость: {Math.round(item.addictionRisk * 100)}%</span>
                        <span>•</span>
                        <span className="text-rose-400">Передозировка: {Math.round(item.overdoseRisk * 100)}%</span>
                      </div>
                      <span className="text-orange-400 font-mono">Жар: +{item.heatOnCraft}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Item Specs & Crafting Bench */}
          <div className="lg:col-span-7">
            {selectedItem ? (
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl backdrop-blur-md">
                {/* Specs Header */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-slate-800 pb-4">
                  <div className="md:col-span-5">
                    <PharmaProductBox
                      itemId={selectedItem.id}
                      name={selectedItem.name}
                      rarity={(selectedItem as any).rarity || 'uncommon'}
                      subgroup={selectedItem.subgroup}
                      form={selectedItem.form}
                    />
                  </div>

                  <div className="md:col-span-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-100 font-unbounded">{selectedItem.name}</h3>
                        <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/30">
                          ${selectedItem.basePrice} / ед.
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedItem.description}</p>
                    </div>

                    <button
                      onClick={() => openCraftingModal(selectedItem)}
                      className="mt-4 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" /> Запустить Синтез
                    </button>
                  </div>
                </div>

                {/* Recipe & Requirements */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" /> Рецептура и Ингредиенты
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedItem.recipe.ingredients.map(ing => {
                      const ingDef = pharmaPackConfig.ingredients.find(i => i.id === ing.ingredientId);
                      const megaItem = MEGASTORE_ITEMS.find(m => m.id === ing.ingredientId);
                      const displayName = megaItem?.name || ingDef?.name || ing.ingredientId;
                      const displayIcon = megaItem?.icon || ingDef?.icon || '🧪';

                      const available = getIngredientStock(ing.ingredientId, gameState, pharmaState);
                      const hasEnough = available >= ing.amount;

                      return (
                        <div
                          key={ing.ingredientId}
                          className={`p-3 rounded-xl border flex items-center justify-between ${
                            hasEnough ? 'bg-slate-950/60 border-slate-800' : 'bg-rose-950/20 border-rose-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{displayIcon}</span>
                            <div>
                              <div className="text-xs font-bold text-slate-200">{displayName}</div>
                              <div className="text-[11px] text-slate-400">Требуется: {ing.amount} ед.</div>
                            </div>
                          </div>

                          <div className={`text-xs font-mono font-bold ${hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {available} / {ing.amount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Golden Zone Parameters preview */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4" /> Параметры «Золотой Зоны» для Мини-игры
                  </h4>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400">Целевая Температура</div>
                      <div className="text-sm font-bold text-amber-400 mt-1">{selectedItem.recipe.goldenZone.targetTempC} °C</div>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400">Скорость Перемешивания</div>
                      <div className="text-sm font-bold text-cyan-400 mt-1">{selectedItem.recipe.goldenZone.targetRpm} RPM</div>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400">Дозировка Активного Вещества</div>
                      <div className="text-sm font-bold text-purple-400 mt-1">{selectedItem.recipe.goldenZone.targetDoseMg} мг</div>
                    </div>
                  </div>
                </div>

                {/* District Prices Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Прогноз цен по районам
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(selectedItem.districtPriceRanges).map(([district, range]) => (
                      <div key={district} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-center">
                        <div className="text-[11px] text-slate-400 capitalize">{district}</div>
                        <div className="text-xs font-bold text-emerald-400 mt-0.5">${range[0]} - ${range[1]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500">
                Выберите препарат из списка слева для просмотра параметров крафта
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'stashes' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Box className="w-5 h-5 text-emerald-400" /> Сеть Схронов и Мобильных Фургонов
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pharmaState.stashes.map(stash => (
              <div key={stash.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
                      {stash.locationType === 'van' ? '🚚' : '🏚️'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">{stash.name}</h4>
                      <div className="text-xs text-slate-400">Район: <span className="text-emerald-400 capitalize">{stash.currentDistrict}</span></div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
                    Скрытность: {stash.stealthLevel}%
                  </span>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Запас наличных:</span>
                    <span className="text-emerald-400 font-bold">${stash.cashStashed}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Риск обнаружения рейдом:</span>
                    <span className="text-rose-400 font-bold">{stash.detectionRisk}%</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 mb-2">Хранящиеся товары:</div>
                  <div className="space-y-1">
                    {Object.entries(stash.items).map(([itemId, count]) => (
                      <div key={itemId} className="flex justify-between text-xs bg-slate-800/40 px-3 py-1.5 rounded-lg">
                        <span className="text-slate-300">{itemId}</span>
                        <span className="font-mono text-emerald-400">{count} ед.</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crafting Mini-Game Interactive Modal */}
      {/* Crafting Interactive Mini-Game Modal */}
      {showCraftModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            {(() => {
              const matchedRecipe = PHARMA_DRUGS_CATALOG.find(d => d.id === selectedItem.id) || PHARMA_DRUGS_CATALOG[0];

              return (
                <PharmaCraftingMiniGames
                  recipe={matchedRecipe}
                  onCraftCompleted={(outcome: PharmaCraftBatchOutcome) => {
                    // Deduct 3 ingredients (Base + Catalyst + Packaging) from pharmaState / gameState
                    const reqSlotIds = [matchedRecipe.base.id, matchedRecipe.catalyst.id, matchedRecipe.packaging.id];
                    
                    reqSlotIds.forEach(ingId => {
                      if (onDeductInventory && (gameState?.inventory?.[ingId as keyof GameState['inventory']] || 0) > 0) {
                        onDeductInventory(ingId, 1);
                      }
                    });

                    onUpdatePharmaState(prev => {
                      const nextInv = { ...prev.inventory };
                      
                      reqSlotIds.forEach(ingId => {
                        if (nextInv[ingId] && nextInv[ingId] > 0) {
                          nextInv[ingId] = Math.max(0, nextInv[ingId] - 1);
                        }
                      });

                      const prevCount = nextInv[selectedItem.id] || 0;
                      nextInv[selectedItem.id] = prevCount + outcome.producedUnits;

                      const nextPurity = {
                        ...prev.purityStock,
                        [selectedItem.id]: outcome.qualityScore
                      };

                      return {
                        ...prev,
                        inventory: nextInv,
                        purityStock: nextPurity
                      };
                    });

                    onAddHeat(outcome.isDefective ? 5 : 1);
                    setShowCraftModal(false);
                    alert(`Синтез ${matchedRecipe.name} завершён (${outcome.batchNumber})!\nКачество: ${outcome.qualityScore}%\nПроизведено: ${outcome.producedUnits} шт.`);
                  }}
                  onCancel={() => setShowCraftModal(false)}
                />
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
