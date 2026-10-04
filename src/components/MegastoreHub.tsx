import React, { useState } from 'react';
import { GameState, SyndicateLicenseId } from '../types/game';
import { MEGASTORE_ITEMS } from '../data/megastore_catalog';
import { PHARMA_DRUGS_CATALOG } from '../data/pharma_recipes_config';
import {
  ShoppingBag,
  Leaf,
  Moon,
  FlaskConical,
  Boxes,
  Zap,
  Shield,
  CheckCircle2,
  DollarSign,
  Package,
  TrendingUp,
  AlertCircle,
  Sun,
  Droplets,
  Wind,
  Layers,
  Flame,
  Lock,
  Unlock,
  Award,
  Key,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductArtwork } from './ProductArtwork';
import { hapticFeedback } from '../utils/haptics';

interface MegastoreHubProps {
  gameState: GameState;
  onDeductCash: (amount: number) => void;
  onAddInventory: (itemKey: string, amount: number) => void;
  onBuySolarPanel?: () => void;
  onInstallCarbonFilter?: () => void;
  onBuyLicense?: (licenseId: SyndicateLicenseId, cost: number) => void;
  language: Language;
}

type StoreCategory = 'botany' | 'mycology' | 'synthesis' | 'powder' | 'facility' | 'pharma' | 'licenses';

interface StoreProduct {
  id: string;
  itemKey: string;
  nameRu: string;
  nameEn: string;
  category: StoreCategory;
  categoryLabelRu: string;
  pricePerUnit: number;
  unitPackSize: number;
  unitLabel: string;
  descRu: string;
  rarity: 'Обычный' | 'Необычный' | 'Редкий' | 'Элитный';
  rarityColor: string;
  icon: typeof Leaf;
  requiredLicense: SyndicateLicenseId;
  isSpecialUpgrade?: boolean;
}

export const MegastoreHub: React.FC<MegastoreHubProps> = ({
  gameState,
  onDeductCash,
  onAddInventory,
  onBuySolarPanel,
  onInstallCarbonFilter,
  onBuyLicense,
  language,
}) => {
  const [activeCategory, setActiveCategory] = useState<StoreCategory | 'all'>('all');
  const [multiplier, setMultiplier] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDrugId, setSelectedDrugId] = useState<string>('all');

  const licensesCatalog: {
    id: SyndicateLicenseId;
    nameRu: string;
    cost: number;
    category: StoreCategory;
    descRu: string;
    icon: typeof Leaf;
    color: string;
  }[] = [
    {
      id: 'botany_license',
      nameRu: 'Лицензия Гровера (Ботаника)',
      cost: 150,
      category: 'botany',
      descRu: 'Разрешает оптовую закупку феминизированных семян всех сортов, удобрений N-Max и бустеров PK 13/14.',
      icon: Leaf,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300',
    },
    {
      id: 'pharma_license',
      nameRu: 'Аптечный Сертификат (Фармацевтика)',
      cost: 200,
      category: 'pharma',
      descRu: 'Разрешает закупку базовой фарм-основы, активных катализаторов и блистерных упаковок.',
      icon: Package,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/40 text-purple-300',
    },
    {
      id: 'mycology_license',
      nameRu: 'Споровый Сертификат (Микология)',
      cost: 350,
      category: 'mycology',
      descRu: 'Разрешает закупку споровых наборов псило-грибов «Астрал», субстратов Mix-A и монотубов.',
      icon: Moon,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'facility_license',
      nameRu: 'Инженерная Лицензия (Инфраструктура)',
      cost: 500,
      category: 'facility',
      descRu: 'Разрешает заказ мощных промышленных угольных фильтров 250м³ и солнечных панелей 400W.',
      icon: Sun,
      color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/40 text-yellow-300',
    },
    {
      id: 'synthesis_license',
      nameRu: 'Химический Допуск Класса А (ЛСД & Кокаин)',
      cost: 800,
      category: 'synthesis',
      descRu: 'Разрешает приобретение прекурсоров эрготамина, безводного диэтиламина и перфорированных блоттеров.',
      icon: FlaskConical,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-300',
    },
    {
      id: 'powder_license',
      nameRu: 'Промышленный Допуск (Порошок «Аврора»)',
      cost: 1200,
      category: 'powder',
      descRu: 'Разрешает поставки чистого белого реагента, темного сырья, фильтр-порошков и стабилизаторов.',
      icon: Boxes,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
    },
  ];

  const isLicenseUnlocked = (licenseId: SyndicateLicenseId): boolean => {
    return Boolean(gameState.syndicateLicenses?.[licenseId]);
  };

  const handlePurchaseLicense = (licenseId: SyndicateLicenseId, cost: number) => {
    if (gameState.cash < cost) {
      sounds.playAlarmBeep();
      return;
    }
    if (onBuyLicense) {
      onBuyLicense(licenseId, cost);
    } else {
      onDeductCash(cost);
      if (gameState.syndicateLicenses) {
        gameState.syndicateLicenses[licenseId] = true;
      }
    }
    sounds.playCash();
  };

  const catalog: StoreProduct[] = [
    // --- BOTANY ---
    {
      id: 'seed_ww',
      itemKey: 'seedsWhiteWidow',
      nameRu: 'Семена White Widow (Феминизированные)',
      nameEn: 'White Widow Seeds (Feminized)',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 40,
      unitPackSize: 1,
      unitLabel: 'шт.',
      descRu: 'Классический голландский сорт. Плотные трихомы, высокая устойчивость.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Leaf,
      requiredLicense: 'botany_license',
    },
    {
      id: 'seed_amnesia',
      itemKey: 'seedsAmnesiaHaze',
      nameRu: 'Семена Amnesia Haze (Elite Cut)',
      nameEn: 'Amnesia Haze Seeds',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 55,
      unitPackSize: 1,
      unitLabel: 'шт.',
      descRu: 'Энергетическая сатива с цитрусовым профилем и рекордным урожаем.',
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Leaf,
      requiredLicense: 'botany_license',
    },
    {
      id: 'seed_gorilla',
      itemKey: 'seedsGorillaGlue',
      nameRu: 'Семена Gorilla Glue #4',
      nameEn: 'Gorilla Glue #4 Seeds',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 65,
      unitPackSize: 1,
      unitLabel: 'шт.',
      descRu: 'Экстремальная смолистость, дизельный терпеновый профиль и седативный эффект.',
      rarity: 'Редкий',
      rarityColor: 'text-purple-400 border-purple-500/30',
      icon: Leaf,
      requiredLicense: 'botany_license',
    },
    {
      id: 'seed_purple',
      itemKey: 'seedsPurpleHaze',
      nameRu: 'Семена Purple Haze',
      nameEn: 'Purple Haze Seeds',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 50,
      unitPackSize: 1,
      unitLabel: 'шт.',
      descRu: 'Психоделический фиолетовый сорт с глубоким ментальным воздействием.',
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Leaf,
      requiredLicense: 'botany_license',
    },
    {
      id: 'nutr_veg',
      itemKey: 'nutrientVegMl',
      nameRu: 'Удобрение N-Max (Вегетация)',
      nameEn: 'N-Max Growth Nutrients',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 45,
      unitPackSize: 100,
      unitLabel: '100 мл',
      descRu: 'Высокая концентрация азота для ускоренного наращивания биомассы.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Droplets,
      requiredLicense: 'botany_license',
    },
    {
      id: 'nutr_bloom',
      itemKey: 'nutrientBloomMl',
      nameRu: 'Бустер цветения PK 13/14',
      nameEn: 'PK 13/14 Bloom Booster',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 60,
      unitPackSize: 100,
      unitLabel: '100 мл',
      descRu: 'Фосфорно-калиевый комплекс для массивного уплотнения шишек.',
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Droplets,
      requiredLicense: 'botany_license',
    },
    {
      id: 'water_osmosis',
      itemKey: 'purifiedWaterLitres',
      nameRu: 'Осмотическая чистая вода',
      nameEn: 'Osmotic Purified Water',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 25,
      unitPackSize: 50,
      unitLabel: '50 л',
      descRu: 'Деминерализованная вода 0 ppm для точной гидропоники и полива.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Droplets,
      requiredLicense: 'botany_license',
    },
    {
      id: 'neem_oil',
      itemKey: 'neemOilMl',
      nameRu: 'Масло Нима (Анти-вредитель)',
      nameEn: 'Organic Neem Oil Spray',
      category: 'botany',
      categoryLabelRu: 'Ботаника',
      pricePerUnit: 35,
      unitPackSize: 50,
      unitLabel: '50 мл',
      descRu: 'Органическая защита от паутинного клеща и трипсов.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Shield,
      requiredLicense: 'botany_license',
    },

    // --- PHARMACEUTICAL INGREDIENTS (Dynamic catalog items from MEGASTORE_ITEMS) ---
    ...MEGASTORE_ITEMS.map(item => ({
      id: item.id,
      itemKey: item.id,
      nameRu: item.name,
      nameEn: item.name,
      category: 'pharma' as StoreCategory,
      categoryLabelRu: 'Аптека',
      pricePerUnit: item.unitPrice * item.packSize,
      unitPackSize: item.packSize,
      unitLabel: `${item.packSize} ед.`,
      descRu: item.description,
      rarity: (item.unitPrice > 100 ? 'Элитный' : item.unitPrice > 30 ? 'Редкий' : item.unitPrice > 10 ? 'Необычный' : 'Обычный') as 'Обычный' | 'Необычный' | 'Редкий' | 'Элитный',
      rarityColor: item.unitPrice > 100 ? 'text-amber-400 border-amber-500/40' : item.unitPrice > 30 ? 'text-purple-400 border-purple-500/30' : 'text-cyan-400 border-cyan-500/30',
      icon: Package,
      requiredLicense: item.licenseRequired as SyndicateLicenseId
    })),

    // --- MYCOLOGY ---
    {
      id: 'myco_kit',
      itemKey: 'fictionalMyceliumKits',
      nameRu: 'Мицелиевый набор «Астрал»',
      nameEn: 'Astral Mycelium Spore Kit',
      category: 'mycology',
      categoryLabelRu: 'Микология',
      pricePerUnit: 60,
      unitPackSize: 1,
      unitLabel: 'комплект',
      descRu: 'Стерилизованная споровая культура светящихся псило-грибов.',
      rarity: 'Редкий',
      rarityColor: 'text-purple-400 border-purple-500/30',
      icon: Moon,
      requiredLicense: 'mycology_license',
    },
    {
      id: 'myco_substrate',
      itemKey: 'nutrientMixAGrams',
      nameRu: 'Питательная смесь A (Субстрат)',
      nameEn: 'Nutrient Mix-A Substrate',
      category: 'mycology',
      categoryLabelRu: 'Микология',
      pricePerUnit: 35,
      unitPackSize: 100,
      unitLabel: '100 г',
      descRu: 'Обогащенный полисахаридный субстрат для взрывного роста гифов.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Boxes,
      requiredLicense: 'mycology_license',
    },
    {
      id: 'myco_stimulant',
      itemKey: 'growthStimulantDoses',
      nameRu: 'Стимулятор роста грибов',
      nameEn: 'Mycology Growth Stimulant',
      category: 'mycology',
      categoryLabelRu: 'Микология',
      pricePerUnit: 50,
      unitPackSize: 1,
      unitLabel: 'доза',
      descRu: 'Био-активатор ускорения созревания плодовых тел на +30%.',
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Zap,
      requiredLicense: 'mycology_license',
    },
    {
      id: 'myco_container',
      itemKey: 'fictionalContainers',
      nameRu: 'Герметичный монотуб-контейнер',
      nameEn: 'Hermetic Monotub Chamber',
      category: 'mycology',
      categoryLabelRu: 'Микология',
      pricePerUnit: 80,
      unitPackSize: 1,
      unitLabel: 'бокс',
      descRu: 'Профессиональный контейнер с микропорными фильтрами FAE.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Moon,
      requiredLicense: 'mycology_license',
    },
    {
      id: 'myco_stabilizer',
      itemKey: 'environmentStabilizers',
      nameRu: 'Стабилизатор среды (Анти-плесень)',
      nameEn: 'Mycology Environment Stabilizer',
      category: 'mycology',
      categoryLabelRu: 'Микология',
      pricePerUnit: 45,
      unitPackSize: 1,
      unitLabel: 'флакон',
      descRu: 'Мгновенно нормализует баланс влажности и нейтрализует патогены.',
      rarity: 'Редкий',
      rarityColor: 'text-amber-400 border-amber-500/30',
      icon: Droplets,
      requiredLicense: 'mycology_license',
    },

    // --- SYNTHESIS ---
    {
      id: 'chem_ergot',
      itemKey: 'ergotCultures',
      nameRu: 'Эрготовая культура (Прекурсор ЛСД)',
      nameEn: 'Ergot Alkaloid Culture',
      category: 'synthesis',
      categoryLabelRu: 'Хим-синтез',
      pricePerUnit: 220,
      unitPackSize: 1,
      unitLabel: 'порция',
      descRu: 'Базовый алкалоидный прекурсор для экстракции эрготамина.',
      rarity: 'Редкий',
      rarityColor: 'text-purple-400 border-purple-500/30',
      icon: FlaskConical,
      requiredLicense: 'synthesis_license',
    },
    {
      id: 'chem_diethyl',
      itemKey: 'diethylamineMl',
      nameRu: 'Диэтиламин (Реагент амидирования)',
      nameEn: 'Diethylamine Reagent',
      category: 'synthesis',
      categoryLabelRu: 'Хим-синтез',
      pricePerUnit: 180,
      unitPackSize: 50,
      unitLabel: '50 мл',
      descRu: 'Очищенный безводный реагент для синтеза активной молекулы ЛСД-25.',
      rarity: 'Редкий',
      rarityColor: 'text-purple-400 border-purple-500/30',
      icon: FlaskConical,
      requiredLicense: 'synthesis_license',
    },
    {
      id: 'chem_blotter',
      itemKey: 'perforatedPaperSheets',
      nameRu: 'Перфорированные листы блоттеров',
      nameEn: 'Perforated Blotter Sheets (900 tabs)',
      category: 'synthesis',
      categoryLabelRu: 'Хим-синтез',
      pricePerUnit: 120,
      unitPackSize: 1,
      unitLabel: 'лист (900 табов)',
      descRu: 'Абсорбирующая арт-бумага высокой плотности для точного дозирования.',
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Layers,
      requiredLicense: 'synthesis_license',
    },

    // --- POWDER REFINERY ---
    {
      id: 'pow_white',
      itemKey: 'whiteReagentGrams',
      nameRu: 'Белый порошковый реагент',
      nameEn: 'White Powder Reagent',
      category: 'powder',
      categoryLabelRu: 'Порошковый цех',
      pricePerUnit: 45,
      unitPackSize: 10,
      unitLabel: '10 г',
      descRu: 'Базовая кристаллическая основа для синтеза порошка «Аврора».',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Boxes,
      requiredLicense: 'powder_license',
    },
    {
      id: 'pow_dark',
      itemKey: 'darkRawGrams',
      nameRu: 'Тёмное сырьё цеха',
      nameEn: 'Dark Raw Material',
      category: 'powder',
      categoryLabelRu: 'Порошковый цех',
      pricePerUnit: 70,
      unitPackSize: 10,
      unitLabel: '10 г',
      descRu: 'Высокая плотность алкалоидов для премиального грейда S+.',
      rarity: 'Редкий',
      rarityColor: 'text-purple-400 border-purple-500/30',
      icon: Flame,
      requiredLicense: 'powder_license',
    },
    {
      id: 'pow_filter',
      itemKey: 'filterPowderGrams',
      nameRu: 'Фильтр-порошок тонкой очистки',
      nameEn: 'Fine Filter Powder',
      category: 'powder',
      categoryLabelRu: 'Порошковый цех',
      pricePerUnit: 35,
      unitPackSize: 10,
      unitLabel: '10 г',
      descRu: 'Устраняет балластный осадок и снижает потери сырья при промывке.',
      rarity: 'Необычный',
      rarityColor: 'text-cyan-400 border-cyan-500/30',
      icon: Wind,
      requiredLicense: 'powder_license',
    },
    {
      id: 'pow_stabilizer',
      itemKey: 'stabilizerPowderGrams',
      nameRu: 'Стабилизатор кристаллической решетки',
      nameEn: 'Crystal Lattice Stabilizer',
      category: 'powder',
      categoryLabelRu: 'Порошковый цех',
      pricePerUnit: 60,
      unitPackSize: 10,
      unitLabel: '10 г',
      descRu: 'Фиксирует молекулярную стабильность и обеспечивает 99% чистоту.',
      rarity: 'Редкий',
      rarityColor: 'text-amber-400 border-amber-500/30',
      icon: Zap,
      requiredLicense: 'powder_license',
    },
    {
      id: 'pow_packaging',
      itemKey: 'packagingPacks',
      nameRu: 'Упаковочные материалы цеха',
      nameEn: 'Refinery Packaging Material',
      category: 'powder',
      categoryLabelRu: 'Порошковый цех',
      pricePerUnit: 25,
      unitPackSize: 10,
      unitLabel: '10 уп.',
      descRu: 'Зиплоки, вакуумная термопленка и штампы Синдиката.',
      rarity: 'Обычный',
      rarityColor: 'text-slate-300 border-white/20',
      icon: Package,
      requiredLicense: 'powder_license',
    },

    // --- FACILITY & HARDWARE ---
    {
      id: 'fac_filter',
      itemKey: 'carbonFiltersInstalled',
      nameRu: 'Промышленный угольный фильтр 250м³',
      nameEn: 'Industrial Carbon Air Filter',
      category: 'facility',
      categoryLabelRu: 'Инфраструктура',
      pricePerUnit: 420,
      unitPackSize: 1,
      unitLabel: '1 блок',
      descRu: 'Поглощает до 25 единиц запаха цветущих растений, снижая розыск полиции.',
      rarity: 'Редкий',
      rarityColor: 'text-amber-400 border-amber-500/30',
      icon: Wind,
      requiredLicense: 'facility_license',
      isSpecialUpgrade: true,
    },
    {
      id: 'fac_solar',
      itemKey: 'solarPanels',
      nameRu: 'Солнечная панель 400W (Green Energy)',
      nameEn: '400W Solar Panel Unit',
      category: 'facility',
      categoryLabelRu: 'Инфраструктура',
      pricePerUnit: 1200,
      unitPackSize: 1,
      unitLabel: '1 панель',
      descRu: 'Генерирует 400W чистой энергии, снижая аномалию сети и счет за свет.',
      rarity: 'Элитный',
      rarityColor: 'text-emerald-400 border-emerald-500/30',
      icon: Sun,
      requiredLicense: 'facility_license',
      isSpecialUpgrade: true,
    },
  ];

  // Map ingredientId -> list of drug names using this ingredient
  const ingredientDrugMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    PHARMA_DRUGS_CATALOG.forEach((drug) => {
      [drug.base.id, drug.catalyst.id, drug.packaging.id].forEach((ingId) => {
        if (!map[ingId]) map[ingId] = [];
        if (!map[ingId].includes(drug.name)) {
          map[ingId].push(drug.name);
        }
      });
    });
    return map;
  }, []);

  // Map drugId -> list of required ingredient IDs
  const drugIngredientMap = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    PHARMA_DRUGS_CATALOG.forEach((drug) => {
      map[drug.id] = [drug.base.id, drug.catalyst.id, drug.packaging.id];
    });
    return map;
  }, []);

  const filteredCatalog = catalog.filter((prod) => {
    const matchCat = activeCategory === 'all' || prod.category === activeCategory;
    const matchSearch =
      prod.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.descRu.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Drug filter logic
    let matchDrug = true;
    if (selectedDrugId !== 'all') {
      const requiredIngs = drugIngredientMap[selectedDrugId] || [];
      matchDrug = requiredIngs.includes(prod.itemKey) || prod.category !== 'pharma';
    }

    return matchCat && matchSearch && matchDrug;
  });

  const handleBuy = (prod: StoreProduct) => {
    if (!isLicenseUnlocked(prod.requiredLicense)) {
      hapticFeedback.heavy();
      sounds.playAlarmBeep();
      return;
    }

    const totalCost = prod.pricePerUnit * multiplier;
    if (gameState.cash < totalCost) {
      hapticFeedback.heavy();
      sounds.playAlarmBeep();
      return;
    }

    if (prod.id === 'fac_solar' && onBuySolarPanel) {
      for (let i = 0; i < multiplier; i++) onBuySolarPanel();
      hapticFeedback.success();
      sounds.playCash();
      return;
    }

    if (prod.id === 'fac_filter' && onInstallCarbonFilter) {
      for (let i = 0; i < multiplier; i++) onInstallCarbonFilter();
      hapticFeedback.success();
      sounds.playCash();
      return;
    }

    hapticFeedback.medium();
    onDeductCash(totalCost);
    sounds.playCash();
    const totalUnits = prod.unitPackSize * multiplier;
    onAddInventory(prod.itemKey, totalUnits);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                [ТЕНЕВОЙ МЕГАМАРКЕТ СНАБЖЕНИЯ]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                Баланс: <strong className="text-emerald-400">${gameState.cash.toLocaleString()}</strong>
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Центральный оптовый склад сырья и оборудования
            </h1>
          </div>
        </div>

        {/* Quantity Multiplier Stepper & Buttons */}
        <div className="flex items-center gap-1.5 bg-[#0b0e14] p-1.5 rounded-2xl border border-white/10 text-xs font-mono">
          <span className="text-slate-400 px-1 text-[11px] hidden sm:inline">Закупка:</span>
          
          {/* Stepper Minus */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setMultiplier((m) => Math.max(1, m - 1));
            }}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
            title="Уменьшить"
          >
            −
          </button>

          <span className="px-2 text-emerald-400 font-bold font-mono text-sm min-w-[32px] text-center">
            x{multiplier}
          </span>

          {/* Stepper Plus */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setMultiplier((m) => Math.min(100, m + 1));
            }}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-white font-bold flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
            title="Увеличить"
          >
            +
          </button>

          {/* Quick Multipliers x1, x5, x10 */}
          {[1, 5, 10].map((m) => (
            <button
              key={m}
              onClick={() => {
                hapticFeedback.light();
                sounds.playClick();
                setMultiplier(m);
              }}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer font-bold min-h-[44px] ${
                multiplier === m
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              x{m}
            </button>
          ))}
        </div>
      </div>

      {/* Licenses & Permits Status Strip */}
      <div className="p-4 rounded-3xl bg-[#070b12] border border-cyan-500/20 space-y-3 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-mono font-bold">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Лицензии и допуски Синдиката (Обязательно для закупки сырья)</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Куплено: <strong className="text-cyan-400">
              {Object.values(gameState.syndicateLicenses || {}).filter(Boolean).length}/5
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {licensesCatalog.map((lic) => {
            const unlocked = isLicenseUnlocked(lic.id);
            const canAfford = gameState.cash >= lic.cost;
            const Icon = lic.icon;

            return (
              <div
                key={lic.id}
                className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2.5 transition-all ${
                  unlocked
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-[#090e17] border-white/10 text-slate-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${unlocked ? 'text-emerald-400' : 'text-slate-400'}`} />
                    {unlocked ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> ДОПУСК
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> ЗАКРЫТО
                      </span>
                    )}
                  </div>
                  <strong className="text-xs font-bold block leading-tight text-white">{lic.nameRu}</strong>
                  <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">{lic.descRu}</p>
                </div>

                {!unlocked && (
                  <button
                    onClick={() => handlePurchaseLicense(lic.id, lic.cost)}
                    disabled={!canAfford}
                    className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md ${
                      canAfford
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 active:scale-95'
                        : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Key className="w-3 h-3" />
                    <span>Купить (${lic.cost})</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="space-y-2.5 bg-[#080c13] p-3 rounded-2xl border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono w-full sm:w-auto">
            {[
              { id: 'all', label: 'Все товары' },
              { id: 'botany', label: '🌿 Ботаника' },
              { id: 'pharma', label: '💊 Аптека' },
              { id: 'mycology', label: '🍄 Микология' },
              { id: 'synthesis', label: '🧪 Хим-синтез' },
              { id: 'powder', label: '📦 Порошковый цех' },
              { id: 'facility', label: '⚙️ Инфраструктура' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveCategory(cat.id as StoreCategory | 'all');
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold whitespace-nowrap ${
                  activeCategory === cat.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Поиск сырья..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-1.5 bg-[#05080e] border border-white/10 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500/50"
          />
        </div>

        {/* Pharma Drug Filter Bar */}
        {(activeCategory === 'all' || activeCategory === 'pharma') && (
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono scrollbar-none">
            <span className="text-purple-300 text-[11px] font-bold whitespace-nowrap flex items-center gap-1 shrink-0">
              <Package className="w-3.5 h-3.5 text-purple-400" />
              <span>Фильтр по препарату Pharma:</span>
            </span>

            <select
              value={selectedDrugId}
              onChange={(e) => {
                sounds.playClick();
                setSelectedDrugId(e.target.value);
              }}
              className="bg-[#0e1422] border border-purple-500/30 text-purple-200 text-xs font-bold rounded-xl px-3 py-1 focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="all">🧪 Все препараты (22)</option>
              {PHARMA_DRUGS_CATALOG.map((drug) => (
                <option key={drug.id} value={drug.id}>
                  💊 {drug.name} ({drug.brand})
                </option>
              ))}
            </select>

            {selectedDrugId !== 'all' && (
              <button
                onClick={() => setSelectedDrugId('all')}
                className="text-[10px] text-rose-400 hover:text-rose-300 underline font-mono shrink-0 ml-1 cursor-pointer"
              >
                Сбросить
              </button>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCatalog.map((prod) => {
          const totalCost = prod.pricePerUnit * multiplier;
          const totalItemsToDeliver = prod.unitPackSize * multiplier;
          const hasLicense = isLicenseUnlocked(prod.requiredLicense);
          const canAfford = gameState.cash >= totalCost;
          const inStock = (gameState.inventory as Record<string, number>)[prod.itemKey] ?? (prod.id === 'fac_solar' ? gameState.solarPanels : prod.id === 'fac_filter' ? gameState.carbonFiltersInstalled : 0);
          const licenseDef = licensesCatalog.find((l) => l.id === prod.requiredLicense);

          return (
            <div
              key={prod.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                !hasLicense
                  ? 'bg-[#06090e]/70 border-rose-500/20 opacity-90'
                  : 'bg-[#090d14] border-white/10 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] group'
              }`}
            >
              <div className="space-y-3">
                {/* Visual Artwork Banner */}
                <div className="w-full h-32 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center relative">
                  <ProductArtwork productId={prod.id} size="banner" className="w-full h-full object-contain" />
                  
                  {/* Top Badges Overlay */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md backdrop-blur-md bg-black/70 border ${prod.rarityColor}`}>
                      {prod.rarity}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-md bg-black/70 border border-white/15 text-slate-300">
                      Склад: <strong className="text-white">{inStock}</strong>
                    </span>
                  </div>

                  {/* License Locked Watermark Overlay */}
                  {!hasLicense && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center text-center p-3 space-y-1">
                      <Lock className="w-6 h-6 text-rose-400 animate-pulse" />
                      <span className="text-[11px] font-mono font-bold text-rose-300">
                        ТРЕБУЕТСЯ ЛИЦЕНЗИЯ
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {licenseDef?.nameRu}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center justify-between">
                    <span>{prod.categoryLabelRu}</span>
                    {!hasLicense && (
                      <span className="text-rose-400 text-[10px] font-mono font-bold">🔒 Заблокировано</span>
                    )}
                  </div>
                  <h3 className="font-bold text-white text-sm leading-snug group-hover:text-emerald-300 transition-colors">
                    {prod.nameRu}
                  </h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                    {prod.descRu}
                  </p>

                  {/* Used for Drug badge */}
                  {prod.category === 'pharma' && ingredientDrugMap[prod.itemKey]?.length > 0 && (
                    <div className="pt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] font-mono text-purple-300 font-bold bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                        💊 Для: {ingredientDrugMap[prod.itemKey].join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
                <div>
                  <div className="text-base font-mono font-bold text-emerald-400">
                    ${totalCost.toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    +{totalItemsToDeliver} {prod.unitLabel}
                  </div>
                </div>

                {hasLicense ? (
                  <button
                    onClick={() => handleBuy(prod)}
                    disabled={!canAfford}
                    className={`py-2 px-4 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      canAfford
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md active:scale-95'
                        : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Купить x{multiplier}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => licenseDef && handlePurchaseLicense(licenseDef.id, licenseDef.cost)}
                    disabled={!licenseDef || gameState.cash < licenseDef.cost}
                    className={`py-2 px-3 rounded-xl text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 ${
                      licenseDef && gameState.cash >= licenseDef.cost
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 shadow-lg cursor-pointer active:scale-95'
                        : 'bg-neutral-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Key className="w-3 h-3" />
                    <span>Допуск (${licenseDef?.cost})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

