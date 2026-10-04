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
  X,
  Search,
  Filter,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';

export interface PharmaGroupInfo {
  id: PharmaSubgroup | 'all';
  name: string;
  shortName: string;
  icon: string;
  count: number;
  activeBg: string;
  border: string;
  text: string;
}

export const ALL_PHARMA_GROUPS: PharmaGroupInfo[] = [
  { id: 'all', name: 'Все группы (22)', shortName: 'Все группы', icon: '🧪', count: 22, activeBg: 'bg-emerald-500 text-slate-950 font-bold', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  { id: 'opioids', name: 'Опиоидные (5)', shortName: 'Опиоиды', icon: '🍼', count: 5, activeBg: 'bg-purple-600 text-white font-bold', border: 'border-purple-500/50', text: 'text-purple-400' },
  { id: 'benzodiazepines', name: 'Бензодиазепины (2)', shortName: 'Бензодиазепины', icon: '💊', count: 2, activeBg: 'bg-blue-600 text-white font-bold', border: 'border-blue-500/50', text: 'text-blue-400' },
  { id: 'gabapentinoids', name: 'Габапентиноиды (2)', shortName: 'Габапентиноиды', icon: '❄️', count: 2, activeBg: 'bg-cyan-600 text-white font-bold', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  { id: 'antidepressants', name: 'Антидепрессанты (2)', shortName: 'Антидепрессанты', icon: '🟡', count: 2, activeBg: 'bg-amber-600 text-white font-bold', border: 'border-amber-500/50', text: 'text-amber-400' },
  { id: 'nootropics', name: 'Ноотропы & Стимуляторы (3)', shortName: 'Ноотропы', icon: '🧠', count: 3, activeBg: 'bg-indigo-600 text-white font-bold', border: 'border-indigo-500/50', text: 'text-indigo-400' },
  { id: 'analgesics', name: 'Обезболивающие & Спазмолитики (4)', shortName: 'Обезболивающие', icon: '💊', count: 4, activeBg: 'bg-rose-600 text-white font-bold', border: 'border-rose-500/50', text: 'text-rose-400' },
  { id: 'antihistamines', name: 'Антигистаминные (1)', shortName: 'Антигистаминные', icon: '🌿', count: 1, activeBg: 'bg-teal-600 text-white font-bold', border: 'border-teal-500/50', text: 'text-teal-400' },
  { id: 'vitamins', name: 'Витамины & Мелатонин (2)', shortName: 'Витамины & Сон', icon: '🍋', count: 2, activeBg: 'bg-yellow-600 text-white font-bold', border: 'border-yellow-500/50', text: 'text-yellow-400' },
  { id: 'sorbents', name: 'Сорбенты & ЖКТ (1)', shortName: 'Сорбенты & ЖКТ', icon: '🫀', count: 1, activeBg: 'bg-emerald-600 text-white font-bold', border: 'border-emerald-500/50', text: 'text-emerald-400' }
];

export function getSubgroupNameRu(subgroup: string): { name: string; icon: string; badgeClass: string } {
  switch (subgroup) {
    case 'opioids':
      return { name: 'Опиоидные', icon: '🍼', badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    case 'benzodiazepines':
      return { name: 'Бензодиазепины', icon: '💊', badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    case 'gabapentinoids':
      return { name: 'Габапентиноиды', icon: '❄️', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
    case 'antidepressants':
      return { name: 'Антидепрессанты', icon: '🟡', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    case 'nootropics':
      return { name: 'Ноотропы & Стимуляторы', icon: '🧠', badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
    case 'analgesics':
    case 'antispasmodics':
      return { name: 'Обезболивающие', icon: '🩹', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
    case 'antihistamines':
      return { name: 'Антигистаминные', icon: '🌿', badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
    case 'vitamins':
      return { name: 'Витамины & Сон', icon: '🍋', badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
    case 'sorbents':
    case 'digestive':
      return { name: 'Сорбенты & ЖКТ', icon: '🫀', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    default:
      return { name: 'Фармацевтика', icon: '🧪', badgeClass: 'bg-slate-500/20 text-slate-300 border-slate-500/30' };
  }
}

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
  const [prescriptionFilter, setPrescriptionFilter] = useState<'all' | 'otc' | 'rx' | 'special' | 'elite'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSection, setMobileSection] = useState<'catalog' | 'workbench'>('catalog');
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
    // 1. Group / Subgroup filter
    if (activeSubgroup !== 'all') {
      if (activeSubgroup === 'sorbents' || (activeSubgroup as string) === 'digestive') {
        if (item.subgroup !== 'sorbents' && (item.subgroup as string) !== 'digestive') return false;
      } else if (activeSubgroup === 'analgesics' || (activeSubgroup as string) === 'antispasmodics') {
        if (item.subgroup !== 'analgesics' && (item.subgroup as string) !== 'antispasmodics') return false;
      } else if (item.subgroup !== activeSubgroup) {
        return false;
      }
    }

    // 2. Prescription Category filter
    if (prescriptionFilter !== 'all') {
      const recipeDef = PHARMA_DRUGS_CATALOG.find(d => d.id === item.id);
      const blank = recipeDef?.blankLevel || 'none';
      if (prescriptionFilter === 'otc' && blank !== 'none') return false;
      if (prescriptionFilter === 'rx' && blank !== 'form_107_1u') return false;
      if (prescriptionFilter === 'special' && blank !== 'form_148_1u_88') return false;
      if (prescriptionFilter === 'elite' && blank !== 'form_107_u_np') return false;
    }

    // 3. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(q);
      const descMatch = item.description?.toLowerCase().includes(q);
      const groupMatch = getSubgroupNameRu(item.subgroup).name.toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !groupMatch) return false;
    }

    return true;
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
        <div className="space-y-4">
          {/* Mobile Segmented Control: Catalog vs Workbench */}
          <div className="lg:hidden flex items-center bg-[#070b13] p-1 rounded-2xl border border-white/10 shadow-lg">
            <button
              onClick={() => setMobileSection('catalog')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileSection === 'catalog'
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" /> Каталог и Все Группы ({filteredItems.length})
            </button>
            <button
              onClick={() => setMobileSection('workbench')}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mobileSection === 'workbench'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FlaskConical className="w-4 h-4" /> Верстак {selectedItem ? `· ${selectedItem.name}` : ''}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
            {/* Left Column: Subgroups & Item Selection Catalog */}
            <div className={`lg:col-span-5 space-y-3 ${mobileSection === 'catalog' ? 'block' : 'hidden lg:block'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>Каталог медикаментов</span>
                    <span className="text-emerald-400 font-bold">({filteredItems.length} из {pharmaPackConfig.items.length})</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Все 10 групп препаратов и 22 формулы крафта
                  </p>
                </div>
              </div>

              {/* Search Bar & Quick Group Dropdown */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-7 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск препарата..."
                    className="w-full bg-[#080d15] border border-white/10 rounded-xl pl-9 pr-7 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="sm:col-span-5">
                  <select
                    value={activeSubgroup}
                    onChange={(e) => setActiveSubgroup(e.target.value as any)}
                    className="w-full bg-[#080d15] border border-white/10 rounded-xl px-2.5 py-2 text-xs font-bold font-mono text-slate-200 focus:outline-none focus:border-emerald-500/60 cursor-pointer"
                  >
                    {ALL_PHARMA_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ALL GROUPS SECTION - Fully visible, responsive grid! */}
              <div className="bg-[#080d16] p-2.5 sm:p-3 rounded-2xl border border-white/[0.08] space-y-2.5 shadow-md">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Фармакологические группы (10):</span>
                  </span>
                  {(activeSubgroup !== 'all' || prescriptionFilter !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveSubgroup('all');
                        setPrescriptionFilter('all');
                        setSearchQuery('');
                      }}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] underline cursor-pointer"
                    >
                      Сбросить фильтры
                    </button>
                  )}
                </div>

                {/* Grid of ALL 10 Groups - 100% visible on all devices, no hidden horizontal scroll! */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {ALL_PHARMA_GROUPS.map((g) => {
                    const isActive = activeSubgroup === g.id;
                    return (
                      <button
                        key={g.id}
                        onClick={() => setActiveSubgroup(g.id)}
                        className={`px-2 py-2 rounded-xl text-left text-xs transition-all flex items-center justify-between gap-1 border cursor-pointer active:scale-95 ${
                          isActive
                            ? `${g.activeBg} ${g.border} shadow-md`
                            : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border-white/5'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="text-sm shrink-0">{g.icon}</span>
                          <span className="truncate font-semibold">{g.shortName}</span>
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                          isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-slate-400'
                        }`}>
                          {g.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Prescription Status Filter Tabs */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 font-semibold flex items-center justify-between">
                    <span>Категория рецепта / учёт:</span>
                    <span className="text-slate-500 font-normal">По бланкам РФ</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono">
                    <button
                      onClick={() => setPrescriptionFilter('all')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        prescriptionFilter === 'all'
                          ? 'bg-slate-200 text-slate-950 font-black'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Все (22)
                    </button>
                    <button
                      onClick={() => setPrescriptionFilter('otc')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        prescriptionFilter === 'otc'
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                      }`}
                    >
                      🟢 OTC Без рецепта (8)
                    </button>
                    <button
                      onClick={() => setPrescriptionFilter('rx')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        prescriptionFilter === 'rx'
                          ? 'bg-blue-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-blue-400 hover:text-blue-300 border border-slate-800'
                      }`}
                    >
                      🔵 Rx 107-1 (5)
                    </button>
                    <button
                      onClick={() => setPrescriptionFilter('special')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        prescriptionFilter === 'special'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-amber-400 hover:text-amber-300 border border-slate-800'
                      }`}
                    >
                      🟠 Учет 148 (5)
                    </button>
                    <button
                      onClick={() => setPrescriptionFilter('elite')}
                      className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        prescriptionFilter === 'elite'
                          ? 'bg-rose-500 text-slate-950 font-black'
                          : 'bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800'
                      }`}
                    >
                      🔴 107-НП (4)
                    </button>
                  </div>
                </div>
              </div>

              {/* Catalog Item Cards */}
              <div className="space-y-2.5 max-h-[500px] lg:max-h-[640px] overflow-y-auto pr-1 scrollbar-none">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-white/5 space-y-2">
                    <p className="text-xs text-slate-400">В выбранной группе нет препаратов по указанным фильтрам</p>
                    <button
                      onClick={() => {
                        setActiveSubgroup('all');
                        setPrescriptionFilter('all');
                        setSearchQuery('');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Показать все 22 препарата
                    </button>
                  </div>
                ) : (
                  filteredItems.map(item => {
                    const isSelected = selectedItem?.id === item.id;
                    const stockCount = pharmaState.inventory[item.id] || 0;
                    const purity = pharmaState.purityStock[item.id] || item.basePurity;
                    const groupMeta = getSubgroupNameRu(item.subgroup);

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setSelectedItem(item);
                        }}
                        className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-slate-800/90 border-emerald-500 shadow-xl ring-1 ring-emerald-500/50'
                            : 'bg-slate-900/70 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 sm:gap-3">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xl sm:text-2xl shadow-inner shrink-0">
                              {item.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-bold text-slate-100 text-xs sm:text-sm">{item.name}</h4>
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${groupMeta.badgeClass} flex items-center gap-1`}>
                                  <span>{groupMeta.icon}</span>
                                  <span>{groupMeta.name}</span>
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-slate-400 capitalize">{item.form}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-[11px] text-emerald-400 font-semibold">${item.basePrice}/ед.</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-bold text-slate-200">
                              Склад: <span className="text-emerald-400">{stockCount} шт.</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Чистота: <span className="text-cyan-300 font-semibold">{purity}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Risk Badge Bar */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400">Зависимость: {Math.round(item.addictionRisk * 100)}%</span>
                            <span>•</span>
                            <span className="text-rose-400">Передоз: {Math.round(item.overdoseRisk * 100)}%</span>
                          </div>
                          <span className="text-orange-400 font-mono">Жар: +{item.heatOnCraft}</span>
                        </div>

                        {/* Quick Mobile Action Buttons */}
                        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedItem(item);
                              setMobileSection('workbench');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer active:scale-95"
                          >
                            <FlaskConical className="w-3 h-3" /> Верстак
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openCraftingModal(item);
                            }}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95"
                          >
                            <Play className="w-3 h-3 fill-white" /> Запустить Синтез
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Workbench Column */}
            <div className={`lg:col-span-7 ${mobileSection === 'workbench' ? 'block' : 'hidden lg:block'}`}>
              {/* Mobile Quick Drug & Group Selector inside Workbench */}
              <div className="lg:hidden bg-[#0c121c] p-2.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">Группа:</span>
                  <select
                    value={activeSubgroup}
                    onChange={(e) => setActiveSubgroup(e.target.value as any)}
                    className="bg-[#141b27] text-white font-bold text-xs px-2.5 py-1.5 rounded-xl border border-white/10 w-full outline-none cursor-pointer"
                  >
                    {ALL_PHARMA_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.icon} {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[11px] font-mono text-slate-400 font-bold shrink-0">Препарат:</span>
                  <select
                    value={selectedItem?.id || ''}
                    onChange={(e) => {
                      const it = pharmaPackConfig.items.find(i => i.id === e.target.value);
                      if (it) setSelectedItem(it);
                    }}
                    className="bg-[#141b27] text-white font-bold text-xs px-2.5 py-1.5 rounded-xl border border-white/10 w-full outline-none cursor-pointer"
                  >
                    {filteredItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.icon} {item.name} (${item.basePrice}/ед.)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedItem ? (
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xl backdrop-blur-md">
                  {/* Specs Header */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-slate-800 pb-4">
                    <div className="md:col-span-5 flex justify-center">
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
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-100 font-unbounded">{selectedItem.name}</h3>
                          <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg border border-emerald-500/30 shrink-0">
                            ${selectedItem.basePrice} / ед.
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {(() => {
                            const gm = getSubgroupNameRu(selectedItem.subgroup);
                            return (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${gm.badgeClass} flex items-center gap-1`}>
                                <span>{gm.icon}</span>
                                <span>{gm.name}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedItem.description}</p>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={() => setMobileSection('catalog')}
                          className="lg:hidden py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-white/10 transition-all cursor-pointer"
                        >
                          Все группы
                        </button>
                        <button
                          onClick={() => openCraftingModal(selectedItem)}
                          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 min-h-[48px]"
                        >
                          <Play className="w-4 h-4 fill-white" /> Запустить Синтез
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recipe & Requirements */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-emerald-400" /> Рецептура и Ингредиенты
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                            className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-between ${
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
                  <div className="bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4" /> Параметры «Золотой Зоны» для Мини-игры
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Целевая t°C</div>
                        <div className="font-bold text-amber-400">{selectedItem.recipe.goldenZone.targetTempC}°C</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Скорость RPM</div>
                        <div className="font-bold text-cyan-400">{selectedItem.recipe.goldenZone.targetRpm} RPM</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Дозировка</div>
                        <div className="font-bold text-purple-400">{selectedItem.recipe.goldenZone.targetDoseMg} mg</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-slate-400">Точность t°</div>
                        <div className="font-bold text-emerald-400">±{selectedItem.recipe.goldenZone.tempTolerance}°C</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
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
                    // Deduct ingredients (Base + Catalyst + Packaging + specific ingredients) from pharmaState / gameState
                    const reqSlotIds = [matchedRecipe.base.id, matchedRecipe.catalyst.id, matchedRecipe.packaging.id];
                    
                    reqSlotIds.forEach(ingId => {
                      if (onDeductInventory) {
                        onDeductInventory(ingId, 1);
                        // Also deduct generic keys if present
                        if (ingId.includes('base')) onDeductInventory('pharma_base', 1);
                        if (ingId.includes('cat')) onDeductInventory('pharma_catalyst', 1);
                        if (ingId.includes('pack')) onDeductInventory('pharma_packaging', 1);
                      }
                    });

                    if (selectedItem.recipe?.ingredients) {
                      selectedItem.recipe.ingredients.forEach(req => {
                        if (onDeductInventory) {
                          onDeductInventory(req.ingredientId, req.amount);
                        }
                      });
                    }

                    // Also add produced item directly to gameState inventory if onDeductInventory-like callback exists or via pharmaState
                    onUpdatePharmaState(prev => {
                      const nextInv = { ...prev.inventory };
                      
                      reqSlotIds.forEach(ingId => {
                        if (nextInv[ingId] && nextInv[ingId] > 0) {
                          nextInv[ingId] = Math.max(0, nextInv[ingId] - 1);
                        }
                        if (ingId.includes('base') && nextInv['pharma_base']) nextInv['pharma_base'] = Math.max(0, nextInv['pharma_base'] - 1);
                        if (ingId.includes('cat') && nextInv['pharma_catalyst']) nextInv['pharma_catalyst'] = Math.max(0, nextInv['pharma_catalyst'] - 1);
                        if (ingId.includes('pack') && nextInv['pharma_packaging']) nextInv['pharma_packaging'] = Math.max(0, nextInv['pharma_packaging'] - 1);
                      });

                      if (selectedItem.recipe?.ingredients) {
                        selectedItem.recipe.ingredients.forEach(req => {
                          if (nextInv[req.ingredientId]) {
                            nextInv[req.ingredientId] = Math.max(0, nextInv[req.ingredientId] - req.amount);
                          }
                        });
                      }

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
