import React, { useState } from 'react';
import { ActiveDrugEffect, DrugEffectType, DosageTier, GameState } from '../types/game';
import { Sparkles, X, Activity, Zap, ShieldAlert, Droplets, Sun, Moon, Flame, HeartPulse, Package } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (type: DrugEffectType, dosage?: DosageTier) => void;
  gameState: GameState;
  language: Language;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelectEffect,
  gameState,
  language,
}) => {
  const [selectedDosage, setSelectedDosage] = useState<Record<string, DosageTier>>({
    white_widow: 'standard',
    amnesia_haze: 'standard',
    gorilla_glue: 'standard',
    purple_haze: 'standard',
    psilocybin: 'standard',
    lsd_25: 'standard',
    cocaine: 'standard',
  });

  if (!isOpen) return null;
  const t = translations[language];

  const getStockInfo = (type: DrugEffectType, tier: DosageTier) => {
    const inv = gameState.inventory;
    let stock = 0;
    let cost = 0.5;
    let unit = 'г';

    if (type === 'cocaine') {
      stock = inv.cocaineGrams || 0;
      cost = tier === 'micro' ? 0.1 : tier === 'standard' ? 0.3 : tier === 'high' ? 0.6 : 1.0;
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
    } else if (type === 'lsd_25') {
      stock = inv.lsdSheets || 0;
      cost = tier === 'micro' ? 0.05 : tier === 'standard' ? 0.1 : tier === 'high' ? 0.2 : 0.5;
      unit = 'лист';
    }

    return { stock: Math.round(stock * 100) / 100, cost, unit, hasStock: stock >= cost };
  };

  const substances: {
    type: DrugEffectType;
    title: string;
    category: string;
    description: string;
    visualShader: string;
    color: string;
    dosageOptions: { tier: DosageTier; label: string; amount: string; effectShort: string }[];
    icon: typeof Sparkles;
  }[] = [
    {
      type: 'cocaine',
      title: language === 'ru' ? 'Кокаин (Чешуйчатые кристаллы Fishscale 96%)' : 'Cocaine (Pure Fishscale Crystals 96%)',
      category: language === 'ru' ? 'Стимуляторы высшего грейда' : 'Premier Grade Stimulant',
      description: language === 'ru' ? 'Белоснежные кристаллы и порошок в стеклянной чаше. Мощный выброс дофамина, гиперфокус, тахикардия и ускорение восприятия.' : 'Pure crystalline white flake powder in borosilicate glass dish. Massive dopamine surge, razor hyperfocus and tachycardic pulse.',
      visualShader: language === 'ru' ? 'Золотые электрические молнии по краям, эффект туннельного зрения, пульсирующий датчик пульса 155 BPM и микро-дрожание.' : 'Golden peripheral lightning arcs, tunnel-vision focus vignette, pulsating 155 BPM heartbeat HUD, and high-frequency chromatic jitter.',
      color: 'border-amber-400/50 text-amber-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микродоза', amount: '20 мг', effectShort: 'Легкий тонус, чистый фокус' },
        { tier: 'standard', label: 'Стандарт', amount: '60 мг', effectShort: 'Эйфорический раш, туннельное зрение' },
        { tier: 'high', label: 'Высокая', amount: '120 мг', effectShort: 'Золотые молнии, пульс 150 BPM' },
        { tier: 'heroic', label: 'Овердрайв', amount: '200 мг', effectShort: 'Предельная стимуляция, тремор' },
      ],
      icon: HeartPulse,
    },
    {
      type: 'white_widow',
      title: language === 'ru' ? 'Белая Вдова (Сбалансированный гибрид)' : 'White Widow (Balanced Hybrid)',
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
      title: language === 'ru' ? 'Амнезия Хейз (Сатива-доминант)' : 'Amnesia Haze (Sativa-dominant)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Яркий церебральный подъем и цитрусовый лимоненовый взрыв.' : 'Intense cerebral surge with citrus limonene terpenes.',
      visualShader: language === 'ru' ? 'Вспышка повышенной яркости, размытие вращения и ускорение работы (+40%).' : 'High brightness boost, rotation motion blur, operational speed acceleration.',
      color: 'border-yellow-500/40 text-yellow-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Церебральный подъем +15%' },
        { tier: 'standard', label: 'Стандарт', amount: '0.3 г', effectShort: 'Вращающиеся лучи, скорость +40%' },
        { tier: 'high', label: 'Высокая', amount: '0.7 г', effectShort: 'Варп-шлейфы, яркая вспышка' },
        { tier: 'heroic', label: 'Героическая', amount: '1.4 г', effectShort: 'Гиперскоростной световой тоннель' },
      ],
      icon: Zap,
    },
    {
      type: 'gorilla_glue',
      title: language === 'ru' ? 'Горилла Глю #4 (Индика-доминант)' : 'Gorilla Glue #4 (Indica-dominant)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Тяжелая седация (диванное оцепенение couch-lock) и плотная мирценовая смола.' : 'Physical sedation with heavy myrcene resin coating.',
      visualShader: language === 'ru' ? 'Тяжелое размытие краев экрана, гашение дрожания и покачивание панелей.' : 'Couch-lock peripheral blur, camera dampening, gentle UI panel sway.',
      color: 'border-emerald-600/40 text-emerald-400',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Мягкий физический релакс' },
        { tier: 'standard', label: 'Стандарт', amount: '0.4 г', effectShort: 'Couch-lock размытие краев' },
        { tier: 'high', label: 'Высокая', amount: '0.9 г', effectShort: 'Тяжелые смоляные капли' },
        { tier: 'heroic', label: 'Героическая', amount: '1.8 г', effectShort: 'Глубокий гравитационный сон' },
      ],
      icon: Activity,
    },
    {
      type: 'purple_haze',
      title: language === 'ru' ? 'Пурпурный Хейз (Сатива-гибрид)' : 'Purple Haze (Sativa-hybrid)',
      category: language === 'ru' ? 'Ботаническое культивирование' : 'Botany Cultivation',
      description: language === 'ru' ? 'Эйфорический психоделический эффект и темно-фиолетовые антоциановые чашечки.' : 'Euphoric psychedelic high with dark purple anthocyanin calyxes.',
      visualShader: language === 'ru' ? 'Глубокий пурпурно-малиновый спектральный градиент и смена цветов всего текста.' : 'Deep purple/magenta screen tint, chromatic spectral shifting across all text.',
      color: 'border-purple-500/40 text-purple-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.1 г', effectShort: 'Мягкий фиолетовый оттенок' },
        { tier: 'standard', label: 'Стандарт', amount: '0.3 г', effectShort: 'Пурпурный спектральный сдвиг' },
        { tier: 'high', label: 'Высокая', amount: '0.8 г', effectShort: 'Неоновые волны и эйфория' },
        { tier: 'heroic', label: 'Героическая', amount: '1.5 г', effectShort: 'Ультрафиолетовая сингулярность' },
      ],
      icon: Sparkles,
    },
    {
      type: 'psilocybin',
      title: language === 'ru' ? 'Псилоцибин (Грибы Golden Teacher)' : 'Psilocybin (Golden Teacher Mushrooms)',
      category: language === 'ru' ? 'Микологический монотуб' : 'Mycology Monotub',
      description: language === 'ru' ? 'Агонист 5-HT2A рецепторов, визуальная и слуховая синестезия.' : 'Serotonergic 5-HT2A agonist with auditory and visual synesthesia.',
      visualShader: language === 'ru' ? 'Эффект жидкого плавления интерфейса синусоидальными волнами, RGB-сплит.' : 'Full screen trippy shader, UI elements melt with sine-wave vertex displacement, RGB chromatic aberration split.',
      color: 'border-cyan-500/40 text-cyan-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '0.25 г', effectShort: 'Яркость цветов, ясность' },
        { tier: 'standard', label: 'Стандарт', amount: '1.5 г', effectShort: 'Дыхание стен, RGB-сплит' },
        { tier: 'high', label: 'Высокая', amount: '3.5 г', effectShort: 'Жидкое плавление интерфейса' },
        { tier: 'heroic', label: 'Героическая', amount: '5.0 г', effectShort: 'Полное растворение эго' },
      ],
      icon: Droplets,
    },
    {
      type: 'lsd_25',
      title: language === 'ru' ? 'ЛСД-25 (Диэтиламид d-лизергиновой кислоты)' : 'LSD-25 (Lysergic Acid Diethylamide)',
      category: language === 'ru' ? 'Органический синтез' : 'Organic Synthesis',
      description: language === 'ru' ? 'Кристаллический тартрат на блоттере 1943 года. Мощное искажение реальности.' : 'Crystalline tartrate dosed on 1943 Bicycle Day blotter paper.',
      visualShader: language === 'ru' ? 'Сакральная геометрия, инверсия цветов каждые 3.5с, фрактальный калейдоскоп.' : 'Sacred geometry fractal overlay, rapid color inversions, kaleidoscopic warp, chromatic bleeding.',
      color: 'border-pink-500/40 text-pink-300',
      dosageOptions: [
        { tier: 'micro', label: 'Микро', amount: '25 мкг', effectShort: 'Кристальная четкость, легкость' },
        { tier: 'standard', label: 'Стандарт', amount: '125 мкг', effectShort: 'Инверсия цветов, фракталы' },
        { tier: 'high', label: 'Высокая', amount: '250 мкг', effectShort: 'Сакральный калейдоскоп' },
        { tier: 'heroic', label: 'Героическая', amount: '450 мкг', effectShort: 'Гиперпространственный прорыв' },
      ],
      icon: Sun,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#0b0e14] border border-white/10 rounded-2xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {language === 'ru' ? 'Дегустация собственного товара (Употребление из склада)' : 'Use Personal Lab Stock'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ru'
                  ? 'Каждое употребление списывает товар из инвентаря. Остерегайтесь передозировки!'
                  : 'Deducts physical inventory stock. Watch out for overdose!'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {substances.map((substance) => {
            const Icon = substance.icon;
            const currentDosage = selectedDosage[substance.type] || 'standard';
            const { stock, cost, unit, hasStock } = getStockInfo(substance.type, currentDosage);

            return (
              <div
                key={substance.type}
                className={`p-4 rounded-xl border bg-neutral-900/60 hover:bg-neutral-900 transition-all flex flex-col justify-between space-y-3 ${substance.color}`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-bold text-white text-sm">
                          {substance.title}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {substance.category}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold flex items-center gap-1 ${
                      hasStock ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}>
                      <Package className="w-3.5 h-3.5" />
                      <span>{stock} {unit}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {substance.description}
                  </p>

                  <div className="mt-2.5 p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400">
                    <strong className="text-white">Эффект: </strong>
                    {substance.visualShader}
                  </div>
                </div>

                {/* Dosage Selector Pills */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    {language === 'ru' ? 'Выберите дозировку:' : 'Select Dosage Tier:'}
                  </div>
                  <div className="grid grid-cols-4 gap-1 text-[10px] font-mono">
                    {substance.dosageOptions.map((opt) => (
                      <button
                        key={opt.tier}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedDosage((prev) => ({ ...prev, [substance.type]: opt.tier }));
                        }}
                        className={`p-1.5 rounded-lg border text-center transition-all cursor-pointer ${
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

                <button
                  disabled={!hasStock}
                  onClick={() => {
                    sounds.playClick();
                    onSelectEffect(substance.type, currentDosage);
                    onClose();
                  }}
                  className={`w-full mt-1 py-2.5 px-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md ${
                    hasStock
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 cursor-pointer active:scale-98'
                      : 'bg-neutral-800 text-slate-500 border border-white/5 cursor-not-allowed opacity-60'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {hasStock
                      ? language === 'ru'
                        ? `Употребить (${cost} ${unit})`
                        : `Consume (${cost} ${unit})`
                      : language === 'ru'
                        ? '❌ Нет на складе (Сначала произведите)'
                        : '❌ Out of stock (Produce first)'}
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
