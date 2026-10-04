import React, { useState } from 'react';
import { ActiveDrugEffect, DrugEffectType, DosageTier, GameState } from '../types/game';
import { PharmaGameState } from '../types/pharma';
import {
  Sparkles,
  X,
  Activity,
  Zap,
  ShieldAlert,
  Droplets,
  Sun,
  Moon,
  Flame,
  HeartPulse,
  Package,
  Pill,
  AlertTriangle,
  Radio,
  Eye,
  Crosshair,
  Skull,
  FlaskConical,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (type: DrugEffectType, dosage?: DosageTier) => void;
  gameState: GameState;
  pharmaState?: PharmaGameState;
  language: Language;
}

type SubstanceCategory = 'all' | 'stimulants' | 'psychedelics' | 'botany' | 'pharma';

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelectEffect,
  gameState,
  pharmaState,
  language,
}) => {
  const [activeCategory, setActiveCategory] = useState<SubstanceCategory>('all');
  const [selectedDosage, setSelectedDosage] = useState<Record<string, DosageTier>>({
    white_widow: 'standard',
    amnesia_haze: 'standard',
    gorilla_glue: 'standard',
    purple_haze: 'standard',
    psilocybin: 'standard',
    lsd_25: 'standard',
    cocaine: 'standard',
    astral_mushrooms: 'standard',
    aurora_powder: 'standard',
    neuro_fractal: 'standard',
    tramadol: 'standard',
    lyrica: 'standard',
    xanax: 'standard',
    morphine: 'standard',
    codeine: 'standard',
    ritalin: 'standard',
    zolpidem: 'standard',
    prozac: 'standard',
  });

  if (!isOpen) return null;
  const t = translations[language];

  const getStockInfo = (type: DrugEffectType, tier: DosageTier) => {
    const inv = gameState.inventory;
    const pInv = pharmaState?.inventory || {};
    let stock = 0;
    let cost = 0.5;
    let unit = 'г';

    if (type === 'cocaine') {
      stock = inv.cocaineGrams || 0;
      cost = tier === 'micro' ? 0.1 : tier === 'standard' ? 0.3 : tier === 'high' ? 0.6 : 1.0;
    } else if (type === 'aurora_powder') {
      stock = (inv as any).powderGrams || (pInv as any)['powder_aurora'] || (inv as any)['auroraBags'] || 0;
      cost = tier === 'micro' ? 0.1 : tier === 'standard' ? 0.25 : tier === 'high' ? 0.5 : 1.0;
    } else if (type === 'white_widow') {
      stock = inv.whiteWidowGrams || 0;
      cost = tier === 'micro' ? 0.2 : tier === 'standard' ? 0.5 : tier === 'high' ? 1.0 : 2.0;
    } else if (type === 'amnesia_haze') {
      stock = inv.amnesiaHazeGrams || 0;
      cost = tier === 'micro' ? 0.2 : tier === 'standard' ? 0.5 : tier === 'high' ? 1.0 : 2.0;
    } else if (type === 'gorilla_glue') {
      stock = inv.gorillaGlueGrams || 0;
      cost = tier === 'micro' ? 0.2 : tier === 'standard' ? 0.5 : tier === 'high' ? 1.0 : 2.0;
    } else if (type === 'purple_haze') {
      stock = inv.purpleHazeGrams || 0;
      cost = tier === 'micro' ? 0.2 : tier === 'standard' ? 0.5 : tier === 'high' ? 1.0 : 2.0;
    } else if (type === 'psilocybin') {
      stock = inv.mushroomsGrams || 0;
      cost = tier === 'micro' ? 0.5 : tier === 'standard' ? 1.5 : tier === 'high' ? 3.5 : 5.0;
    } else if (type === 'astral_mushrooms') {
      const dried = inv.astralMushroomsDriedGrams || 0;
      const raw = inv.astralMushroomsRawGrams || 0;
      cost = tier === 'micro' ? 0.25 : tier === 'standard' ? 1.5 : tier === 'high' ? 3.5 : 6.0;
      stock = dried > 0 ? dried : raw / 10;
      unit = dried > 0 ? 'г (суш.)' : 'г (сыр.)';
    } else if (type === 'lsd_25') {
      stock = inv.lsdSheets || 0;
      cost = tier === 'micro' ? 0.05 : tier === 'standard' ? 0.1 : tier === 'high' ? 0.2 : 0.5;
      unit = 'лист';
    } else if (type === 'neuro_fractal') {
      stock = (inv as any).neuroFractalSheets || inv.lsdSheets || 0;
      cost = tier === 'micro' ? 0.05 : tier === 'standard' ? 0.1 : tier === 'high' ? 0.2 : 0.5;
      unit = 'лист';
    } else {
      // Pharma products
      stock = (pInv[type] || 0) + ((inv as any)[type] || 0);
      cost = 1;
      unit = 'таб';
    }

    // Strictly require real inventory stock to sample
    const hasStock = stock >= cost && stock > 0;
    return { stock: Math.round(stock * 100) / 100, cost, unit, hasStock };
  };

  const substances: {
    type: DrugEffectType;
    categoryGroup: 'stimulants' | 'psychedelics' | 'botany' | 'pharma';
    title: string;
    category: string;
    description: string;
    visualShader: string;
    color: string;
    isSickening?: boolean;
    dosageOptions: { tier: DosageTier; label: string; amount: string; effectShort: string }[];
    icon: any;
  }[] = [
    // --- STIMULANTS ---
    {
      type: 'cocaine',
      categoryGroup: 'stimulants',
      title: language === 'ru' ? 'Кокаин Fishscale 96%' : 'Cocaine Pure Fishscale Crystals 96%',
      category: language === 'ru' ? 'Стимуляторы высшего грейда' : 'Premier Grade Stimulant',
      description: language === 'ru' ? 'Белоснежные кристаллы и порошок в стеклянной чаше. Мощный выброс дофамина, гиперфокус, тахикардия и ускорение восприятия.' : 'Pure crystalline white flake powder in borosilicate glass dish. Massive dopamine surge, razor hyperfocus and tachycardic pulse.',
      visualShader: language === 'ru' ? 'Золотые электрические молнии по краям, эффект туннельного зрения, пульсирующий датчик пульса 155 BPM и микро-дрожание.' : 'Golden peripheral lightning arcs, tunnel-vision focus vignette, pulsating 155 BPM heartbeat HUD, and high-frequency chromatic jitter.',
      color: 'border-amber-400/50 text-amber-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '20 мг', effectShort: 'Чистый фокус' },
        { tier: 'standard', label: 'Стандарт', amount: '60 мг', effectShort: 'Эйфорический раш' },
        { tier: 'high', label: 'Высокая', amount: '120 мг', effectShort: 'Золотые молнии, 150 BPM' },
        { tier: 'heroic', label: 'Овердрайв', amount: '200 мг', effectShort: 'Предельная стимуляция' },
      ],
      icon: HeartPulse,
    },
    {
      type: 'aurora_powder',
      categoryGroup: 'stimulants',
      title: language === 'ru' ? 'Порошок «Аврора» (Метамфетамин)' : 'Aurora Powder Stimulant',
      category: language === 'ru' ? 'Синтез цеха рефайнери' : 'Refinery Synthesis Workshop',
      description: language === 'ru' ? 'Сверхчистый гидрохлорид. Разгон ЦНС на 200%, электрические синие разряды, стробоскопические вспышки и адреналиновый прилив.' : 'Ultra-pure refined crystal powder. Overclocks CNS by 200%, high-voltage electric discharges and adrenaline storm.',
      visualShader: language === 'ru' ? 'Электрические неоново-голубые молнии, стробоскопические искры, круговой тахометр 180 BPM и ускорение симуляции (+75%).' : 'Electric cyan strobe lightning, tachometer 180 BPM HUD and hyper-velocity overclock (+75%).',
      color: 'border-cyan-400/50 text-cyan-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '10 мг', effectShort: 'Ускорение +25%' },
        { tier: 'standard', label: 'Стандарт', amount: '35 мг', effectShort: 'Синие молнии, скорость +50%' },
        { tier: 'high', label: 'Высокая', amount: '75 мг', effectShort: 'Стробоскоп, скорость +75%' },
        { tier: 'heroic', label: 'Овердрайв', amount: '150 мг', effectShort: 'Гипердрайв перегрузка' },
      ],
      icon: Zap,
    },

    // --- PSYCHEDELICS ---
    {
      type: 'astral_mushrooms',
      categoryGroup: 'psychedelics',
      title: language === 'ru' ? 'Неоновые Грибы «Астрал»' : 'Neon Astral Mushrooms',
      category: language === 'ru' ? 'Микологическая лаборатория' : 'Mycology Lab',
      description: language === 'ru' ? 'Психоделический серотониновый агонист. Волны чистой эйфории, биолюминесцентные споры и фрактальное искривление пространства.' : 'Serotonergic psychedelic agonist. Waves of pure euphoria, bioluminescent spores, and fractal ripples.',
      visualShader: language === 'ru' ? 'Концентрические неоновые кольца, рой светящихся спор, жидкое плавление интерфейса и сияние сакральной мандалы.' : 'Concentric neon ripples, floating glowing bio-spores, liquid displacement and sacred mandala glow.',
      color: 'border-purple-500/50 text-purple-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.25 г', effectShort: 'Эйфория 35%, ясность' },
        { tier: 'standard', label: 'Стандарт', amount: '1.5 г', effectShort: 'Эйфория 70%, дыхание стен' },
        { tier: 'high', label: 'Высокая', amount: '3.5 г', effectShort: 'Эйфория 95%, фракталы' },
        { tier: 'heroic', label: 'Сингулярность', amount: '6.0 г', effectShort: 'Растворение эго 100%' },
      ],
      icon: Sparkles,
    },
    {
      type: 'lsd_25',
      categoryGroup: 'psychedelics',
      title: language === 'ru' ? 'ЛСД-25 (Bicycle Day 1943)' : 'LSD-25 (Lysergic Acid Diethylamide)',
      category: language === 'ru' ? 'Органический синтез' : 'Organic Synthesis',
      description: language === 'ru' ? 'Кристаллический тартрат на блоттере. Сакральная геометрия, циклы инверсии цветов и гиперпространственный калейдоскоп.' : 'Crystalline tartrate dosed on 1943 Bicycle Day blotter paper.',
      visualShader: language === 'ru' ? 'Многослойный калейдоскоп сакральной геометрии, пульсирующая инверсия цветов каждые 3.5с, RGB-хроматический сплит.' : 'Sacred geometry fractal overlay, rapid color inversions, kaleidoscopic warp, chromatic bleeding.',
      color: 'border-pink-500/40 text-pink-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '25 мкг', effectShort: 'Кристальная четкость' },
        { tier: 'standard', label: 'Стандарт', amount: '125 мкг', effectShort: 'Инверсия цветов, фракталы' },
        { tier: 'high', label: 'Высокая', amount: '250 мкг', effectShort: 'Сакральный калейдоскоп' },
        { tier: 'heroic', label: 'Героическая', amount: '450 мкг', effectShort: 'Гиперпространственный прорыв' },
      ],
      icon: Sun,
    },
    {
      type: 'neuro_fractal',
      categoryGroup: 'psychedelics',
      title: language === 'ru' ? 'Neuro-Fractal (Кибер-Синтез)' : 'Neuro-Fractal Cyber Matrix',
      category: language === 'ru' ? 'Нейро-синтез' : 'Neuro Synthesis',
      description: language === 'ru' ? 'Цифровой психоактивный интерфейс. Потоки матричного зеленого кода, кибернетические сетки и глитч-артефакты реальности.' : 'Cyber matrix digital code rain and holographic glitch grid.',
      visualShader: language === 'ru' ? 'Зеленый матричный бинарный дождь 0101, цифровые глитч-полосы, тактическая сетка прицеливания и CRT-сканлинии.' : 'Green matrix binary code rain, cybernetic HUD grid, digital glitch bars and CRT scanlines.',
      color: 'border-emerald-400/50 text-emerald-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.05 таб', effectShort: 'Сканлинии и глитч' },
        { tier: 'standard', label: 'Стандарт', amount: '0.1 таб', effectShort: 'Матричный код rain' },
        { tier: 'high', label: 'Высокая', amount: '0.25 таб', effectShort: 'Полный кибер-трип' },
        { tier: 'heroic', label: 'Оверклок', amount: '0.5 таб', effectShort: 'Сингулярность ИИ' },
      ],
      icon: Radio,
    },
    {
      type: 'psilocybin',
      categoryGroup: 'psychedelics',
      title: language === 'ru' ? 'Псилоцибин (Golden Teacher)' : 'Psilocybin (Golden Teacher)',
      category: language === 'ru' ? 'Микологический монотуб' : 'Mycology Monotub',
      description: language === 'ru' ? 'Классический психоделический монотуб. Жидкое синусоидальное плавление интерфейса, органическое мерцание и дыхание стен.' : 'Serotonergic 5-HT2A agonist with auditory and visual synesthesia.',
      visualShader: language === 'ru' ? 'Жидкое волновое плавление интерфейса, радужные кольца мерцания и споровые частицы.' : 'Full screen trippy shader, UI elements melt with sine-wave vertex displacement, RGB chromatic aberration split.',
      color: 'border-cyan-500/40 text-cyan-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.25 г', effectShort: 'Яркость цветов' },
        { tier: 'standard', label: 'Стандарт', amount: '1.5 г', effectShort: 'Дыхание стен, RGB-сплит' },
        { tier: 'high', label: 'Высокая', amount: '3.5 г', effectShort: 'Жидкое плавление' },
        { tier: 'heroic', label: 'Героическая', amount: '5.0 г', effectShort: 'Растворение эго' },
      ],
      icon: Droplets,
    },

    // --- BOTANY (CANNABIS) ---
    {
      type: 'white_widow',
      categoryGroup: 'botany',
      title: language === 'ru' ? 'Белая Вдова (White Widow)' : 'White Widow (Balanced Hybrid)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Обильный кристаллический налет трихом и мягкое телесное расслабление.' : 'Crystalline trichome stasis with heavy trichome frosting.',
      visualShader: language === 'ru' ? 'Замедление времени мира на 30%, морозная белая виньетка вокруг UI.' : 'Time-dilation shader (slows game world by 30%), soft white fog vignette around UI.',
      color: 'border-emerald-500/40 text-emerald-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Легкое расслабление' },
        { tier: 'standard', label: 'Стандарт', amount: '0.3 г', effectShort: 'Замедление времени -30%' },
        { tier: 'high', label: 'Высокая', amount: '0.8 г', effectShort: 'Густой морозный туман' },
        { tier: 'heroic', label: 'Героическая', amount: '1.5 г', effectShort: 'Полный временной стазис' },
      ],
      icon: Moon,
    },
    {
      type: 'amnesia_haze',
      categoryGroup: 'botany',
      title: language === 'ru' ? 'Амнезия Хейз (Amnesia Haze)' : 'Amnesia Haze (Sativa-dominant)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Яркий церебральный подъем и цитрусовый лимоненовый взрыв.' : 'Intense cerebral surge with citrus limonene terpenes.',
      visualShader: language === 'ru' ? 'Вспышка повышенной яркости, размытие вращения и ускорение работы (+40%).' : 'High brightness boost, rotation motion blur, operational speed acceleration.',
      color: 'border-yellow-500/40 text-yellow-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Церебральный подъем' },
        { tier: 'standard', label: 'Стандарт', amount: '0.3 г', effectShort: 'Вращающиеся лучи' },
        { tier: 'high', label: 'Высокая', amount: '0.7 г', effectShort: 'Варп-шлейфы' },
        { tier: 'heroic', label: 'Героическая', amount: '1.4 г', effectShort: 'Световой тоннель' },
      ],
      icon: Zap,
    },
    {
      type: 'gorilla_glue',
      categoryGroup: 'botany',
      title: language === 'ru' ? 'Горилла Глю #4 (Gorilla Glue)' : 'Gorilla Glue #4 (Indica-dominant)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Тяжелая седация (couch-lock) и плотная мирценовая смола.' : 'Physical sedation with heavy myrcene resin coating.',
      visualShader: language === 'ru' ? 'Тяжелое размытие краев экрана, гашение дрожания и покачивание панелей.' : 'Couch-lock peripheral blur, camera dampening, gentle UI panel sway.',
      color: 'border-emerald-600/40 text-emerald-400',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Физический релакс' },
        { tier: 'standard', label: 'Стандарт', amount: '0.4 г', effectShort: 'Couch-lock размытие' },
        { tier: 'high', label: 'Высокая', amount: '0.9 г', effectShort: 'Смоляные капли' },
        { tier: 'heroic', label: 'Героическая', amount: '1.8 г', effectShort: 'Гравитационный сон' },
      ],
      icon: Activity,
    },
    {
      type: 'purple_haze',
      categoryGroup: 'botany',
      title: language === 'ru' ? 'Пурпурный Хейз (Purple Haze)' : 'Purple Haze (Sativa-hybrid)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Эйфорический психоделический эффект и темно-фиолетовые чашечки.' : 'Euphoric psychedelic high with dark purple anthocyanin calyxes.',
      visualShader: language === 'ru' ? 'Глубокий пурпурно-малиновый спектральный градиент и смена цветов всего текста.' : 'Deep purple/magenta screen tint, chromatic spectral shifting across all text.',
      color: 'border-purple-500/40 text-purple-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Фиолетовый оттенок' },
        { tier: 'standard', label: 'Стандарт', amount: '0.3 г', effectShort: 'Пурпурный спектр' },
        { tier: 'high', label: 'Высокая', amount: '0.8 г', effectShort: 'Неоновые волны' },
        { tier: 'heroic', label: 'Героическая', amount: '1.5 г', effectShort: 'УФ сингулярность' },
      ],
      icon: Sparkles,
    },

    // --- PHARMACEUTICALS & SICKENING NAUSEA EFFECTS ---
    {
      type: 'tramadol',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Трамадол (Опиоидный анальгетик)' : 'Tramadol (Opioid Analgesic)',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Синтетический опиоид. Сильнейший дискомфорт при приеме без показаний: желто-зеленая желчь, морская качка, волновые спазмы и тошнотворное головокружение.' : 'Synthetic opioid agonist. Induces visceral motion sickness, bile-green vertigo waves and nauseating heave.',
      visualShader: language === 'ru' ? '🤢 ТОШНОТВОРНЫЙ ЭФФЕКТ: Волновые токсично-зеленые спазмы, качка экрана как на штормовом корабле, вихревое вертиго и желчная виньетка.' : '🤢 SICKENING NAUSEA SHADER: Undulating bile-green wave spasms, sea-sickness rocking camera tilt and dizzy vortex.',
      color: 'border-lime-500/60 text-lime-300 bg-lime-950/20',
      isSickening: true,
      dosageOptions: [
        { tier: 'micro', label: '50 мг', amount: '1 таб', effectShort: 'Легкое вертиго и подташнивание' },
        { tier: 'standard', label: '100 мг', amount: '1 таб', effectShort: 'Морская качка, зеленая виньетка' },
        { tier: 'high', label: '200 мг', amount: '2 таб', effectShort: 'Сильная тошнота, спазмы экрана' },
        { tier: 'heroic', label: '400 мг', amount: '4 таб', effectShort: 'Штормовое вертиго и спазмы' },
      ],
      icon: AlertTriangle,
    },
    {
      type: 'lyrica',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Лирика / Прегабалин' : 'Lyrica / Pregabalin',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Мощный ГАМК-модулятор. Вызывает выраженную мозжечковую атаксию, пьяное двоение в глазах (диплопию), занос горизонта и неустойчивость.' : 'Potent GABA modulator. Induces drunken ataxia, double-vision diplopia and disorienting horizon tilt.',
      visualShader: language === 'ru' ? '🤢 ЭФФЕКТ АТАКСИИ: Двойное зрение (диплопия), размытое дублирование интерфейса со сдвигом, пьяное раскачивание и занос взгляда.' : '🤢 DIPLOPIA & ATAXIA SHADER: Double-vision ghost layer, drunken swaying horizon and vertigo wobble.',
      color: 'border-purple-400/50 text-purple-300 bg-purple-950/20',
      isSickening: true,
      dosageOptions: [
        { tier: 'micro', label: '75 мг', amount: '1 капс', effectShort: 'Легкое двоение контуров' },
        { tier: 'standard', label: '150 мг', amount: '1 капс', effectShort: 'Пьяная диплопия, занос UI' },
        { tier: 'high', label: '300 мг', amount: '2 капс', effectShort: 'Сильная атаксия и покачивание' },
        { tier: 'heroic', label: '600 мг', amount: '4 капс', effectShort: 'Полная дезориентация' },
      ],
      icon: Eye,
    },
    {
      type: 'xanax',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Ксанакс / Алпразолам' : 'Xanax / Alprazolam',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Бензодиазепиновый транквилизатор. Полное гашение тревоги, глубокое замедление реакций, тяжелая темная виньетка и умиротворение.' : 'Potent benzodiazepine downer. Complete anxiety extinction, dark vignette and slow-motion calm.',
      visualShader: language === 'ru' ? 'Глубокое затемнение по краям, обесцвечивание мира до серо-стального тона, ультра-медленное дыхание виньетки.' : 'Deep black edge vignette, monochrome desaturation, slow soporific breathing pulse.',
      color: 'border-slate-500/50 text-slate-300',
      dosageOptions: [
        { tier: 'micro', label: '0.5 мг', amount: '1 таб', effectShort: 'Легкий релакс' },
        { tier: 'standard', label: '1 мг', amount: '1 таб', effectShort: 'Темная виньетка, слоу-мо' },
        { tier: 'high', label: '2 мг', amount: '1 бар', effectShort: 'Полный штиль, апатия' },
        { tier: 'heroic', label: '4 мг', amount: '2 бара', effectShort: 'Глубокий сонливый блэкаут' },
      ],
      icon: Moon,
    },
    {
      type: 'morphine',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Морфин / Оксикодон' : 'Morphine / Oxycodone',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Эталонный опиат. Бархатное тепло в груди, золотисто-малиновые облака, безболезненная невесомость и безмятежный транс.' : 'Pure pharmaceutical opioid. Warm crimson and amber dreamscape with floating golden embers.',
      visualShader: language === 'ru' ? 'Теплый золотисто-малиновый опиоидный ореол, мягкий фокус, поднимающиеся золотые искры-угольки.' : 'Warm crimson/amber euphoric dreamscape, soft focus and drifting golden embers.',
      color: 'border-rose-500/50 text-rose-300',
      dosageOptions: [
        { tier: 'micro', label: '10 мг', amount: '1 таб', effectShort: 'Теплый покой' },
        { tier: 'standard', label: '30 мг', amount: '1 таб', effectShort: 'Золотые искры, эйфория' },
        { tier: 'high', label: '60 мг', amount: '2 таб', effectShort: 'Глубокий опиоидный транс' },
        { tier: 'heroic', label: '100 мг', amount: '3 таб', effectShort: 'Абсолютная невесомость' },
      ],
      icon: Flame,
    },
    {
      type: 'codeine',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Кодеин (Фиолетовый сироп Lean)' : 'Codeine Purple Syrup (Lean)',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Тягучий фиолетовый сироп с прометазином. Медленное, вязкое восприятие времени и неоновые фиолетовые подтеки.' : 'Viscous purple syrup distortion with dripping neon streaks and slow-mo.',
      visualShader: language === 'ru' ? 'Фиолетовые неоновые капли сиропа, стекающие по экрану, глубокий пурпурный градиент и эффект замедления.' : 'Dripping purple syrup droplets, viscous violet ambient gradient and molasses slow-down.',
      color: 'border-purple-500/50 text-purple-300',
      dosageOptions: [
        { tier: 'micro', label: '60 мг', amount: '1 доза', effectShort: 'Фиолетовая дымка' },
        { tier: 'standard', label: '120 мг', amount: '1 доза', effectShort: 'Стекающие капли сиропа' },
        { tier: 'high', label: '240 мг', amount: '2 дозы', effectShort: 'Вязкое замедление' },
        { tier: 'heroic', label: '400 мг', amount: '3 дозы', effectShort: 'Ультра-слоумо транс' },
      ],
      icon: Droplets,
    },
    {
      type: 'ritalin',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Риталин / Метилфенидат' : 'Ritalin / Methylphenidate',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Психостимулятор для лечения СДВГ. Предельная концентрация внимания, лазерный прицельный фокус и тактическая четкость.' : 'ADHD prescription stimulant. Razor laser focus, HUD telemetry brackets and sharp contrast.',
      visualShader: language === 'ru' ? 'Оранжевое тактическое прицельное перекрестие, радарные круги, повышенная резкость и контраст интерфейса.' : 'Neon-orange tactical crosshairs, radar circles, edge contrast boost and razor focus HUD.',
      color: 'border-orange-500/50 text-orange-300',
      dosageOptions: [
        { tier: 'micro', label: '10 мг', amount: '1 таб', effectShort: 'Повышение фокуса' },
        { tier: 'standard', label: '20 мг', amount: '1 таб', effectShort: 'Оранжевое перекрестие' },
        { tier: 'high', label: '40 мг', amount: '2 таб', effectShort: 'Лазерный гиперфокус' },
        { tier: 'heroic', label: '80 мг', amount: '4 таб', effectShort: 'Тактический овердрайв' },
      ],
      icon: Crosshair,
    },
    {
      type: 'zolpidem',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Золпидем (Гипнотик / Ивадал)' : 'Zolpidem Hypnotic',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'Снотворное быстрого действия. Сумеречные тени, гипнагогические миражи и лавандовая дымка на грани сна.' : 'Fast-acting sleep hypnotic. Twilight shadows, hypnagogic mirages and drifting lavender veil.',
      visualShader: language === 'ru' ? 'Лавандово-фиолетовая сумеречная вуаль, мягкий блюр, блуждающие концентрические волны сна.' : 'Twilight lavender dream veil, soft dream blur and hypnotic slumber ripples.',
      color: 'border-indigo-400/50 text-indigo-300',
      dosageOptions: [
        { tier: 'micro', label: '5 мг', amount: '1 таб', effectShort: 'Сонная дымка' },
        { tier: 'standard', label: '10 мг', amount: '1 таб', effectShort: 'Лавандовые тени' },
        { tier: 'high', label: '20 мг', amount: '2 таб', effectShort: 'Гипнагогический мираж' },
        { tier: 'heroic', label: '40 мг', amount: '4 таб', effectShort: 'Сонный паралич' },
      ],
      icon: Moon,
    },
    {
      type: 'prozac',
      categoryGroup: 'pharma',
      title: language === 'ru' ? 'Прозак / Флуоксетин' : 'Prozac / Fluoxetine (SSRI)',
      category: language === 'ru' ? 'Аптека «Авиценна»' : 'Pharmacy Avicenna',
      description: language === 'ru' ? 'СИОЗС-антидепрессант. Эмоциональный штиль, мягкие пастельные бирюзово-розовые волны и мерцание серотонина.' : 'Selective serotonin reuptake inhibitor. Gentle pastel serotonin waves and serene emotional calm.',
      visualShader: language === 'ru' ? 'Пастельные бирюзово-розовые гармоничные волны, мягкое рассеянное сияние серотонина.' : 'Serene pastel turquoise and pink harmonic waves with sparkling serotonin glow.',
      color: 'border-teal-400/50 text-teal-300',
      dosageOptions: [
        { tier: 'micro', label: '10 мг', amount: '1 таб', effectShort: 'Пастельный свет' },
        { tier: 'standard', label: '20 мг', amount: '1 таб', effectShort: 'Серотониновые волны' },
        { tier: 'high', label: '40 мг', amount: '2 таб', effectShort: 'Эмоциональный штиль' },
        { tier: 'heroic', label: '80 мг', amount: '4 таб', effectShort: 'Абсолютный дзен' },
      ],
      icon: Sparkles,
    },
  ];

  const filteredSubstances = substances.filter((s) => {
    if (activeCategory === 'all') return true;
    return s.categoryGroup === activeCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b0e14] border border-white/10 rounded-2xl max-w-5xl w-full p-3.5 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl relative max-h-[96dvh] sm:max-h-[94vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-wide">
                {language === 'ru' ? 'Тестирование & Дегустация всех веществ' : 'Substance Sampling & Shader Test Bench'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
                {language === 'ru'
                  ? 'Каждое вещество активирует уникальный шейдер (стимуляторы, психоделики, тошнотворные эффекты).'
                  : 'Experience live visual post-processing shaders for every compound, including stims and psychedelics.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer min-h-[44px] min-w-[44px] shrink-0"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Strip */}
        <div className="flex items-center gap-1.5 shrink-0 bg-white/[0.03] p-1.5 rounded-xl border border-white/5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
              activeCategory === 'all'
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {language === 'ru' ? 'Все вещества (18)' : 'All (18)'}
          </button>
          <button
            onClick={() => setActiveCategory('stimulants')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap min-h-[38px] ${
              activeCategory === 'stimulants'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ru' ? 'Стимуляторы' : 'Stimulants'}</span>
          </button>
          <button
            onClick={() => setActiveCategory('psychedelics')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap min-h-[38px] ${
              activeCategory === 'psychedelics'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{language === 'ru' ? 'Психоделики' : 'Psychedelics'}</span>
          </button>
          <button
            onClick={() => setActiveCategory('botany')}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap min-h-[38px] ${
              activeCategory === 'botany'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ru' ? 'Каннабис' : 'Botany'}</span>
          </button>
          <button
            onClick={() => setActiveCategory('pharma')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeCategory === 'pharma'
                ? 'bg-lime-500/25 text-lime-300 border border-lime-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-lime-400" />
            <span>{language === 'ru' ? 'Аптека (🤢 Тошнотворные & Фарма)' : 'Pharma & Sickening FX'}</span>
          </button>
        </div>

        {/* Scrollable Substances Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 overflow-y-auto pr-1 flex-1">
          {filteredSubstances.map((substance) => {
            const Icon = substance.icon;
            const currentDosage = selectedDosage[substance.type] || 'standard';
            const { stock, cost, unit, hasStock } = getStockInfo(substance.type, currentDosage);

            return (
              <div
                key={substance.type}
                className={`p-4 rounded-xl border bg-neutral-900/70 hover:bg-neutral-900 transition-all flex flex-col justify-between space-y-3 ${substance.color}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/10 shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{substance.title}</span>
                          {substance.isSickening && (
                            <span className="px-1.5 py-0.5 rounded bg-lime-500/30 text-lime-300 border border-lime-500/50 text-[10px] font-bold animate-pulse">
                              🤢 Тошнотворный
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {substance.category}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 shrink-0 ${
                        hasStock
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                          : 'bg-white/5 border-white/10 text-slate-400'
                      }`}
                    >
                      <Package className="w-3.5 h-3.5" />
                      <span>{stock} {unit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {substance.description}
                  </p>

                  <div className={`mt-2.5 p-2 rounded-lg border text-[11px] font-mono leading-relaxed ${
                    substance.isSickening
                      ? 'bg-lime-950/40 border-lime-500/40 text-lime-200'
                      : 'bg-black/40 border-white/5 text-slate-300'
                  }`}>
                    <strong className="text-white">Шейдер эффекта: </strong>
                    {substance.visualShader}
                  </div>
                </div>

                {/* Dosage Selector Pills */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    {language === 'ru' ? 'Выберите дозировку:' : 'Select Dosage Tier:'}
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                    {substance.dosageOptions.map((opt) => (
                      <button
                        key={opt.tier}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedDosage((prev) => ({ ...prev, [substance.type]: opt.tier }));
                        }}
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer min-h-[42px] flex flex-col justify-center active:scale-95 ${
                          currentDosage === opt.tier
                            ? 'bg-white/20 border-white/60 text-white font-bold shadow-sm'
                            : 'bg-black/30 border-white/5 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-semibold">{opt.label}</div>
                        <div className="text-[9px] opacity-75">{opt.amount}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingest / Test Button */}
                <button
                  onClick={() => {
                    if (!hasStock) return;
                    sounds.playClick();
                    onSelectEffect(substance.type, currentDosage);
                    onClose();
                  }}
                  disabled={!hasStock}
                  className={`w-full mt-1 py-3 px-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md min-h-[46px] ${
                    !hasStock
                      ? 'bg-slate-900/80 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                      : substance.isSickening
                      ? 'bg-gradient-to-r from-lime-500 to-yellow-400 hover:from-lime-400 hover:to-yellow-300 text-slate-950 cursor-pointer active:scale-98'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 cursor-pointer active:scale-98'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {hasStock
                      ? language === 'ru'
                        ? `Употребить из склада (${cost} ${unit})`
                        : `Consume from Stock (${cost} ${unit})`
                      : language === 'ru'
                        ? `🔒 Нет на складе (требуется ${cost} ${unit})`
                        : `🔒 Out of Stock (${cost} ${unit} needed)`}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
