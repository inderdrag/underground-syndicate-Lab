import React, { useState } from 'react';
import pharmaData from '../../data/pharma_content.json';
import { PharmaProductBox, PharmaRarity } from './PharmaProductBox';
import { GameState } from '../../types/game';
import {
  PharmaGameState,
  PharmaClient
} from '../../types/pharma';
import {
  Pill,
  Flame,
  AlertTriangle,
  Clock,
  Zap,
  ShoppingBag,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw,
  UserCheck,
  TrendingUp,
  Skull,
  User,
  FileText,
  Building,
  Box,
  PlusCircle,
  XCircle,
  Users,
  Store,
  Layers,
  Award,
  DollarSign,
  Shield,
  Heart,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

interface ComponentCost {
  componentId: string;
  amount: number;
}

interface PharmaItemConfig {
  id: string;
  name: string;
  brand: string;
  rarity: PharmaRarity;
  basePrice: number;
  effect: string;
  sideEffect: string;
  isPrescriptionRequired: boolean;
  shelfNumber: string;
  hasDebuff: boolean;
  debuffName: string;
  addictionRate: number;
  suspicionRate: number;
  craftTimeSeconds: number;
  recipe: ComponentCost[];
}

interface SalesHistoryLog {
  id: string;
  customerName: string;
  avatar: string;
  requestedItemName: string;
  outcome: 'official_sale' | 'black_market_sale' | 'rejected' | 'undercover_bust';
  price: number;
  timestamp: string;
}

interface CustomerPatient {
  id: string;
  name: string;
  avatar: string;
  requestedItemId: string;
  requestedItemName: string;
  categoryType: 'otc' | 'prescription' | 'narcotics';
  dialogueText: string;
  hasPrescription: boolean;
  prescriptionNumber?: string;
  offeredPrice: number;
  isUndercoverCop: boolean;
  amountRequested: number;
}

interface PharmaPharmacyTabProps {
  gameState?: GameState;
  pharmaState?: PharmaGameState;
  onUpdatePharmaState?: (state: PharmaGameState) => void;
  onAddCash: (amount: number) => void;
  onAddHeat: (heat: number) => void;
}

const FIRST_NAMES = [
  'Алексей', 'Дмитрий', 'Елена', 'Иван', 'Ольга', 'Сергей', 'Михаил', 'Татьяна',
  'Артем', 'Наталья', 'Игорь', 'Екатерина', 'Вадим', 'Светлана', 'Роман', 'Анна',
  'Виктор', 'Юлия', 'Денис', 'Мария', 'Максим', 'Дарья', 'Павел', 'Илья', 'Ксения',
  'Владимир', 'Алиса', 'Андрей', 'Кристина', 'Егор', 'Анастасия', 'Артур', 'Евгений',
  'Вероника', 'Георгий', 'Полина', 'Антон', 'Оксана', 'Григорий', 'Валерия'
];

const LAST_NAMES_OR_ROLES = [
  '«Мутный»', '«Шеф»', '(Клубный тусовщик)', '«Тень»', 'Смирнов', 'Васильева',
  '«Студент»', '(Психиатр выписал)', '«Дилер»', '«Психонавт»', '«Мажор»',
  '«VIP-Заказчик»', '«Босс»', 'Соколов', 'Морозов', 'Волков', 'Петров',
  '«Местный»', '(Ночной гость)', '«Курьер»', '«Агент»', '«Химик»', 'Зайцев',
  '«Техно-фанат»', 'Сидоров', 'Кузнецов', 'Ковалев', 'Попов', 'Лебедев'
];

const AVATARS = ['👵', '👴', '🧢', '🕶️', '👨‍💼', '👩‍💼', '👩‍⚕️', '🕺', '👩‍🎤', '🕵️‍♂️', '🕵️', '🧔', '👩', '👨', '🧑‍🎓', '🧑‍🎤', '🧟', '👱‍♂️', '👱‍♀️'];

const DRUG_REQUEST_POOL = [
  // OTC
  { id: 'paracetamol', name: 'Парацетамол 500 мг', category: 'otc' as const, basePrice: 12 },
  { id: 'ibuprofen', name: 'Ибупрофен 400 мг', category: 'otc' as const, basePrice: 15 },
  { id: 'melatonin', name: 'Мелатонин 3 мг', category: 'otc' as const, basePrice: 18 },

  // Prescription Rx
  { id: 'tramadol', name: 'Трамадол 50 мг', category: 'prescription' as const, basePrice: 55 },
  { id: 'lyrica', name: 'Лирика 75 мг', category: 'prescription' as const, basePrice: 85 },
  { id: 'zoloft', name: 'Золофт 50 мг', category: 'prescription' as const, basePrice: 50 },
  { id: 'xanax', name: 'Ксанакс 1 мг', category: 'prescription' as const, basePrice: 140 },
  { id: 'gabapentin', name: 'Габапентин 300 мг', category: 'prescription' as const, basePrice: 65 },
  { id: 'modafinil', name: 'Модафинил 100 мг', category: 'prescription' as const, basePrice: 110 },
  { id: 'codeine', name: 'Кодеин Сироп', category: 'prescription' as const, basePrice: 130 },
  { id: 'oxycodone', name: 'Оксикодон 10 мг', category: 'prescription' as const, basePrice: 180 },

  // Narcotics
  { id: 'whiteWidowGrams', name: 'Каннабис «White Widow» (10г)', category: 'narcotics' as const, basePrice: 220, amount: 10 },
  { id: 'mushroomsGrams', name: 'Грибы «Астрал» (15г)', category: 'narcotics' as const, basePrice: 280, amount: 15 },
  { id: 'lsdSheets', name: 'ЛСД Блоттер (1 лист)', category: 'narcotics' as const, basePrice: 450, amount: 1 },
  { id: 'cocaineGrams', name: 'Кокаин «Fishscale» (5г)', category: 'narcotics' as const, basePrice: 500, amount: 5 },
  { id: 'powderGrams', name: 'Порошок «Аврора» (10г)', category: 'narcotics' as const, basePrice: 600, amount: 10 },
];

let globalCustomerCounter = 1;

export function generateRandomCustomer(): CustomerPatient {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastNameRole = LAST_NAMES_OR_ROLES[Math.floor(Math.random() * LAST_NAMES_OR_ROLES.length)];
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const drug = DRUG_REQUEST_POOL[Math.floor(Math.random() * DRUG_REQUEST_POOL.length)];

  const isCop = Math.random() < 0.12; // 12% chance undercover cop
  const hasRx = drug.category === 'prescription' ? (isCop ? false : Math.random() < 0.45) : false;

  const priceVariance = Math.floor(Math.random() * 40) - 20; // -20 to +20
  const offeredPrice = Math.max(10, drug.basePrice + priceVariance + (isCop ? 50 : 0));

  let dialogueText = '';
  if (drug.category === 'otc') {
    dialogueText = `Здравствуйте! Мне нужна упаковка препарата «${drug.name}», голова раскалывается.`;
  } else if (drug.category === 'prescription') {
    if (hasRx) {
      dialogueText = `Добрый день, вот мой рецептивный бланк №${Math.floor(100 + Math.random() * 899)} на «${drug.name}».`;
    } else if (isCop) {
      dialogueText = `Эй, фарм! Срочно нужен «${drug.name}», рецепт забыл дома. Продай без него, я доплачу!`;
    } else {
      dialogueText = `Слушай, фармацевт... Рецепта нет, но мне очень нужно «${drug.name}». Доплачу сверху!`;
    }
  } else { // narcotics
    if (isCop) {
      dialogueText = `Продай мне «${drug.name}» из-под полы прямо сейчас! Даю $${offeredPrice} наличкой на руки!`;
    } else {
      dialogueText = `Привет, шеф! Есть из подсобки «${drug.name}»? Плачу $${offeredPrice} хрустящими!`;
    }
  }

  const name = isCop && Math.random() < 0.5 ? `${firstName} (Подставной агент)` : `${firstName} ${lastNameRole}`;

  return {
    id: `cust_${Date.now()}_${globalCustomerCounter++}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    avatar,
    requestedItemId: drug.id,
    requestedItemName: drug.name,
    categoryType: drug.category,
    dialogueText,
    hasPrescription: hasRx,
    prescriptionNumber: hasRx ? `№${Math.floor(100 + Math.random() * 899)}-ВРАЧ` : undefined,
    offeredPrice,
    isUndercoverCop: isCop,
    amountRequested: (drug as any).amount || 1
  };
}

export const PharmaPharmacyTab: React.FC<PharmaPharmacyTabProps> = ({
  gameState,
  pharmaState,
  onUpdatePharmaState,
  onAddCash,
  onAddHeat
}) => {
  // Main sub-tabs: 'counter' (Касса & Клиенты один за другим), 'profiles' (База клиентов), 'stock' (Склад веществ & Доходы)
  const [activeTab, setActiveTab] = useState<'counter' | 'profiles' | 'stock'>('counter');

  // Abstract Components stock
  const [components, setComponents] = useState<Record<string, number>>({
    base: 30,
    catalyst: 20,
    packaging: 40
  });

  // Zero ready-made drugs starting state
  const [pharmaInventory, setPharmaInventory] = useState<Record<string, number>>({
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
  });

  // CURRENT CLIENT AT THE WINDOW (Served ONE BY ONE directly at the counter!)
  const [currentCustomer, setCurrentCustomer] = useState<CustomerPatient>(() => generateRandomCustomer());

  // Sales history log
  const [salesHistory, setSalesHistory] = useState<SalesHistoryLog[]>([]);

  // Character status scales
  const [suspicionLevel, setSuspicionLevel] = useState<number>(0);

  // Selected item in catalog/craft
  const [selectedItem, setSelectedItem] = useState<PharmaItemConfig>(pharmaData.items[0] as PharmaItemConfig);
  const [isCrafting, setIsCrafting] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const activeRarityColor = (rarity: PharmaRarity) => {
    switch (rarity) {
      case 'common': return '#9ea0a5';
      case 'uncommon': return '#10b981';
      case 'rare': return '#3b82f6';
      case 'epic': return '#a855f7';
      case 'legendary': return '#f59e0b';
    }
  };

  const addHistoryLog = (
    outcome: 'official_sale' | 'black_market_sale' | 'rejected' | 'undercover_bust',
    price: number
  ) => {
    const newLog: SalesHistoryLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      customerName: currentCustomer.name,
      avatar: currentCustomer.avatar,
      requestedItemName: currentCustomer.requestedItemName,
      outcome,
      price,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setSalesHistory(prev => [newLog, ...prev.slice(0, 24)]);
  };

  // Serve current customer and immediately bring a NEW unique customer directly to the counter window!
  const handleNextCustomer = () => {
    setCurrentCustomer(generateRandomCustomer());
  };

  // Sell Official / With Prescription / OTC
  const handleSellOfficial = () => {
    if (!currentCustomer) return;

    if (currentCustomer.categoryType === 'narcotics') {
      setNotification(`❌ Наркотические вещества нельзя продать официально! Только из-под полы.`);
      return;
    }

    const item = pharmaData.items.find(i => i.id === currentCustomer.requestedItemId) as PharmaItemConfig;
    const stock = pharmaInventory[currentCustomer.requestedItemId] || 0;

    if (stock < 1) {
      setNotification(`⚠️ Нет на складе препарата «${currentCustomer.requestedItemName}»! Скрафтите его в Лаборатории.`);
      return;
    }

    if (item?.isPrescriptionRequired && !currentCustomer.hasPrescription) {
      setNotification(`❌ На препарат «${item.name}» СТРОГО ТРЕБУЕТСЯ РЕЦЕПТ! У клиента нет рецепта.`);
      return;
    }

    // Deduct stock
    setPharmaInventory(prev => ({ ...prev, [item.id]: prev[item.id] - 1 }));
    onAddCash(currentCustomer.offeredPrice);

    addHistoryLog('official_sale', currentCustomer.offeredPrice);
    setNotification(`✅ Продано официально: «${currentCustomer.requestedItemName}» за $${currentCustomer.offeredPrice}. Легальная сделка!`);
    handleNextCustomer();
  };

  // Sell Under-The-Counter (Illegal / Prescription Meds / Narcotics)
  const handleSellUnderTheCounter = () => {
    if (!currentCustomer) return;

    // Check stock for pharma or narcotics
    if (currentCustomer.categoryType === 'narcotics') {
      const key = currentCustomer.requestedItemId as keyof GameState['inventory'];
      const stock = gameState?.inventory?.[key] || 0;

      if (stock < currentCustomer.amountRequested) {
        setNotification(`⚠️ Нет на складе нужного количества веществ (${currentCustomer.amountRequested} ед.)!`);
        return;
      }

      // Deduct from gameState inventory if available
      if (gameState?.inventory) {
        (gameState.inventory as any)[key] = Math.max(0, (gameState.inventory as any)[key] - currentCustomer.amountRequested);
      }
    } else {
      const stock = pharmaInventory[currentCustomer.requestedItemId] || 0;
      if (stock < 1) {
        setNotification(`⚠️ Нет на складе препарата «${currentCustomer.requestedItemName}»!`);
        return;
      }
      setPharmaInventory(prev => ({ ...prev, [currentCustomer.requestedItemId]: prev[currentCustomer.requestedItemId] - 1 }));
    }

    // UNDERCOVER COP CHECK!
    if (currentCustomer.isUndercoverCop) {
      const fine = 300;
      onAddCash(-fine);
      onAddHeat(30);
      setSuspicionLevel(prev => Math.min(100, prev + 35));

      addHistoryLog('undercover_bust', -fine);
      setNotification(`🚨 ВНИМАНИЕ: ЭТО БЫЛ ПОДСТАВНОЙ АГЕНТ ПОЛИЦИИ! Контрольная закупка! Штраф -$${fine}, Жар +30!`);
    } else {
      onAddCash(currentCustomer.offeredPrice);
      setSuspicionLevel(prev => Math.min(100, prev + 10));

      addHistoryLog('black_market_sale', currentCustomer.offeredPrice);
      setNotification(`🔴 Продано ИЗ-ПОД ПОЛЫ: «${currentCustomer.requestedItemName}» за $${currentCustomer.offeredPrice}!`);
    }

    handleNextCustomer();
  };

  // Refuse Sale
  const handleRefuseSale = () => {
    if (!currentCustomer) return;
    addHistoryLog('rejected', 0);
    setNotification(`⚪ Вы отказали клиенту «${currentCustomer.name}». Безопасный выбор.`);
    handleNextCustomer();
  };

  // Craft Drug
  const handleCraft = (item: PharmaItemConfig) => {
    const missing = item.recipe.find(req => (components[req.componentId] || 0) < req.amount);
    if (missing) {
      setNotification(`Недостаточно компонента «${missing.componentId}»! Закупите их в МЕГАМАРКЕТЕ.`);
      return;
    }

    setIsCrafting(true);

    setTimeout(() => {
      setComponents(prev => {
        const next = { ...prev };
        item.recipe.forEach(req => {
          next[req.componentId] = Math.max(0, next[req.componentId] - req.amount);
        });
        return next;
      });

      setPharmaInventory(prev => ({
        ...prev,
        [item.id]: (prev[item.id] || 0) + 1
      }));

      setIsCrafting(false);
      setNotification(`Успешно произведено: «${item.name}» (+1 шт.) на склад!`);
    }, 800);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Unified Banner Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-500/10 border border-purple-500/40 flex items-center justify-center text-3xl shadow-inner">
            🏥
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-unbounded text-purple-400">Моя Аптека «Авиценна»</h2>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Клиенты идут один за другим
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              Единый комплекс: Касса обслуживания, Профили постоянников, Полный склад веществ и Лаборатория
            </p>
          </div>
        </div>

        {/* Unified Hub Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('counter')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'counter'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" /> 1. Касса & Клиенты
          </button>

          <button
            onClick={() => setActiveTab('profiles')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'profiles'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> 2. База Клиентов
          </button>

          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all flex items-center gap-2 ${
              activeTab === 'stock'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4" /> 3. Склад Веществ & Доходы
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="bg-purple-950/90 border border-purple-500/50 p-3.5 rounded-xl text-purple-200 text-xs font-bold flex items-center justify-between shadow-lg">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* TAB 1: Касса & Обслуживание Клиентов (Один за другим!) */}
      {activeTab === 'counter' && currentCustomer && (
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl max-w-4xl mx-auto">
          {/* Header Window */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-4xl shadow-inner">
                {currentCustomer.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-100">{currentCustomer.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    Клиент у окошка
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                  <span className="text-emerald-400 font-bold">Готов заплатить: ${currentCustomer.offeredPrice}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleNextCustomer}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Следующий Клиент
            </button>
          </div>

          {/* Speech Dialogue */}
          <div className="bg-slate-950 border border-purple-500/30 p-5 rounded-2xl space-y-2 relative">
            <div className="text-xs text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Обращение посетителя у окна кассы:
            </div>
            <p className="text-base text-slate-100 font-medium italic">
              «{currentCustomer.dialogueText}»
            </p>
          </div>

          {/* Requested Item Badge & Prescription Check */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Запрашиваемый товар:</div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">{currentCustomer.requestedItemName}</div>

              {/* Status Tags */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {currentCustomer.categoryType === 'otc' && (
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> БЕЗРЕЦЕПТУРНЫЙ ПРЕПАРАТ
                  </span>
                )}

                {currentCustomer.categoryType === 'prescription' && (
                  <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" /> СТРОГО ПО РЕЦЕПТУ
                  </span>
                )}

                {currentCustomer.categoryType === 'narcotics' && (
                  <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1">
                    <Skull className="w-3.5 h-3.5" /> ЗАПРЕЩЕННОЕ ВЕЩЕСТВО (Из-под полы)
                  </span>
                )}

                {currentCustomer.hasPrescription && (
                  <span className="px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
                    Рецепт на руках ({currentCustomer.prescriptionNumber})
                  </span>
                )}
              </div>
            </div>

            {/* Warehouse Stock Check */}
            <div className="text-right shrink-0">
              <div className="text-xs text-slate-400">На вашем складе:</div>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                {currentCustomer.categoryType === 'narcotics'
                  ? `${gameState?.inventory?.[currentCustomer.requestedItemId as keyof GameState['inventory']] || 0} ед.`
                  : `${pharmaInventory[currentCustomer.requestedItemId] || 0} шт.`
                }
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={handleSellOfficial}
              disabled={currentCustomer.categoryType === 'narcotics'}
              className={`py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                currentCustomer.categoryType === 'narcotics'
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              <span className="flex items-center gap-1.5">🟢 Продать легально</span>
              <span className="text-[10px] font-normal opacity-90">По рецепту / OTC (${currentCustomer.offeredPrice})</span>
            </button>

            <button
              onClick={handleSellUnderTheCounter}
              className="py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all flex flex-col items-center justify-center gap-1"
            >
              <span className="flex items-center gap-1.5">🔴 Продать из-под полы</span>
              <span className="text-[10px] font-normal text-purple-100">Нелегально (${currentCustomer.offeredPrice})</span>
            </button>

            <button
              onClick={handleRefuseSale}
              className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all flex flex-col items-center justify-center gap-1"
            >
              <span className="flex items-center gap-1.5">⚪ Отказать</span>
              <span className="text-[10px] font-normal text-slate-400">Безопасный пропуск</span>
            </button>
          </div>

          {/* Sales & Service History Log */}
          <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl space-y-3 mt-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" /> История Обслуживания Клиентов ({salesHistory.length})
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Журнал сделок у кассы</span>
            </div>

            {salesHistory.length === 0 ? (
              <div className="text-center py-5 text-xs text-slate-500 italic">
                История обслуживания пока пуста. Обслужите первого клиента у кассового окна!
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                {salesHistory.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{log.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{log.customerName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Запрошено: <span className="text-slate-200 font-medium">«{log.requestedItemName}»</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {log.outcome === 'official_sale' && (
                        <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Продано легально (+${log.price})
                        </span>
                      )}

                      {log.outcome === 'black_market_sale' && (
                        <span className="px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold text-[10px] flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Из-под полы (+${log.price})
                        </span>
                      )}

                      {log.outcome === 'undercover_bust' && (
                        <span className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Контрольная закупка! (-${Math.abs(log.price)})
                        </span>
                      )}

                      {log.outcome === 'rejected' && (
                        <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px] flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Отказ в продаже
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Профили Постоянных Клиентов (База) */}
      {activeTab === 'profiles' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4" /> База Постоянных Клиентов Аптеки
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pharmaState?.clients?.map((client) => (
              <div key={client.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-3xl">
                    {client.avatarIcon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-base">{client.name}</h4>
                    <div className="text-xs text-purple-300 font-medium capitalize mt-0.5">{client.type}</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Лояльность:</span>
                    <span className="font-bold text-emerald-400 font-mono">{client.loyalty}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Уровень жажды:</span>
                    <span className="font-bold text-purple-400 font-mono">{client.cravingLevel}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Бюджет наличных:</span>
                    <span className="font-bold text-amber-400 font-mono">${client.walletCash}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Всего покупок:</span>
                    <span className="font-bold text-slate-200 font-mono">{client.totalPurchasesCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Склад Веществ & Доходы Фасада */}
      {activeTab === 'stock' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 font-unbounded">
                  <Box className="w-5 h-5 text-purple-400" /> Полный Склад Веществ & Параметры Фасада
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Остатки аптечных препаратов, запрещенных веществ и отмывание денег</p>
              </div>

              <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs text-cyan-300 font-bold flex items-center gap-2">
                <Store className="w-4 h-4 text-cyan-400" /> Все компоненты и семена закупаются в Мегамаркете!
              </div>
            </div>

            {/* Facade Launder Stats */}
            {pharmaState?.facade && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Суточный лимит отмыва кэша:</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">${pharmaState.facade.dailyLaunderLimit}</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Риск проверки Минздрава:</div>
                  <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">{pharmaState.facade.inspectionRisk}%</div>
                </div>

                <div>
                  <div className="text-xs text-slate-400">Персонал аптеки:</div>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    {pharmaState.facade.hasActivePharmacist ? '✅ Провизор нанят' : '❌ Нет провизора'}
                  </div>
                </div>
              </div>
            )}

            {/* Illicit Drug Stock */}
            {gameState && (
              <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <Skull className="w-4 h-4" /> Наркотические Запрещенные Вещества
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">White Widow:</span>
                    <div className="font-bold text-emerald-400 font-mono text-sm mt-0.5">
                      {gameState.inventory.whiteWidowGrams || 0} г (Семена: {gameState.inventory.seedsWhiteWidow || 0} шт.)
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Грибы «Астрал»:</span>
                    <div className="font-bold text-cyan-400 font-mono text-sm mt-0.5">
                      {gameState.inventory.mushroomsGrams || 0} г
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">ЛСД Блоттеры:</span>
                    <div className="font-bold text-purple-400 font-mono text-sm mt-0.5">
                      {gameState.inventory.lsdSheets || 0} листов
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Кокаин:</span>
                    <div className="font-bold text-amber-400 font-mono text-sm mt-0.5">
                      {gameState.inventory.cocaineGrams || 0} г
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 17 Pharma Stock */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4" /> Запасы 17 Аптечных Препаратов на Полках
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {pharmaData.items.map((itemAny) => {
                  const item = itemAny as PharmaItemConfig;
                  const count = pharmaInventory[item.id] || 0;
                  const rarityColor = activeRarityColor(item.rarity);

                  return (
                    <div key={item.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-7 rounded-full" style={{ backgroundColor: rarityColor }} />
                        <div>
                          <div className="font-bold text-slate-100">{item.name}</div>
                          <div className="text-[10px] text-slate-500">{item.shelfNumber}</div>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className={`font-bold ${count > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {count} шт.
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {item.isPrescriptionRequired ? 'Rx (Рецепт)' : 'OTC (Без)'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
