import React, { useState } from 'react';
import {
  BookOpen,
  Leaf,
  Moon,
  FlaskConical,
  Boxes,
  Zap,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  DollarSign,
  Sun,
  Droplets,
  Wind,
  CheckCircle2,
  ChevronRight,
  Flame,
  Layers,
  Cpu,
  Eye,
  Scale,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductArtwork } from './ProductArtwork';

interface SyndicateHandbookProps {
  language: Language;
}

type SectionKey = 'botany' | 'mycology' | 'synthesis' | 'powder' | 'side_jobs' | 'effects' | 'economy' | 'pharma';

export const SyndicateHandbook: React.FC<SyndicateHandbookProps> = ({ language }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('botany');

  const sections: { id: SectionKey; title: string; icon: typeof Leaf }[] = [
    { id: 'botany', title: '1. Ботаника & Гроубокс', icon: Leaf },
    { id: 'mycology', title: '2. Микология «Астрал»', icon: Moon },
    { id: 'synthesis', title: '3. Хим-синтез (ЛСД & Кокаин)', icon: FlaskConical },
    { id: 'powder', title: '4. Порошковый цех «Аврора»', icon: Boxes },
    { id: 'side_jobs', title: '5. Закладки & Разнос товара', icon: Zap },
    { id: 'effects', title: '6. Эффекты & Передозировка', icon: Sparkles },
    { id: 'economy', title: '7. Экономика, Сбыт & Розыск', icon: TrendingUp },
    { id: 'pharma', title: '8. Фармацевтика & Аптечный Сбыт', icon: FlaskConical },
  ];

  return (
    <div className="space-y-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                [РУКОВОДСТВО СИНДИКАТА · FIELD MANUAL]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Полная база знаний лаборатории
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Инструкции по культивации, синтезу, эффектам и экономике
            </h1>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Nav Tabs, Right Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Navigation Column */}
        <div className="space-y-1.5 md:col-span-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;

            return (
              <button
                key={sec.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveSection(sec.id);
                }}
                className={`w-full p-3 rounded-2xl border text-left text-xs font-mono font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-[#080c13] text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3 bg-[#0b1017] border border-white/[0.08] rounded-2xl p-5 space-y-6 shadow-xl text-slate-200 text-xs leading-relaxed">
          {/* 1. BOTANY GUIDE */}
          {activeSection === 'botany' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2 font-mono">
                  <Leaf className="w-5 h-5" />
                  <span>1. Ботаника: Полное руководство по выращиванию каннабиса</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  От проращивания феминизированных семян до пролечки премиальных шишек высшего грейда.
                </p>
              </div>

              {/* Strains Grid with Artwork */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-emerald-300">
                  Сорта каннабиса синдиката:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div className="p-2.5 bg-[#070b10] rounded-xl border border-emerald-500/20 space-y-2 text-center">
                    <ProductArtwork productId="seed_ww" size="sm" className="mx-auto" />
                    <div>
                      <strong className="text-white text-xs block">White Widow</strong>
                      <span className="text-[10px] text-emerald-400">18-22% THC · 60 дней</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#070b10] rounded-xl border border-amber-500/20 space-y-2 text-center">
                    <ProductArtwork productId="seed_amnesia" size="sm" className="mx-auto" />
                    <div>
                      <strong className="text-white text-xs block">Amnesia Haze</strong>
                      <span className="text-[10px] text-amber-400">22-25% THC · 70 дней</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#070b10] rounded-xl border border-purple-500/20 space-y-2 text-center">
                    <ProductArtwork productId="seed_gorilla" size="sm" className="mx-auto" />
                    <div>
                      <strong className="text-white text-xs block">Gorilla Glue #4</strong>
                      <span className="text-[10px] text-purple-400">25-28% THC · 65 дней</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#070b10] rounded-xl border border-pink-500/20 space-y-2 text-center">
                    <ProductArtwork productId="seed_purple" size="sm" className="mx-auto" />
                    <div>
                      <strong className="text-white text-xs block">Purple Haze</strong>
                      <span className="text-[10px] text-pink-400">20-23% THC · 65 дней</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Substrates */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-cyan-300">
                  Типы субстратов и среды:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono">
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                    <strong className="text-emerald-300 text-xs">Почва (Soil)</strong>
                    <p className="text-[11px] text-slate-400">
                      Прощает ошибки, удерживает буфер питательных веществ. Оптимальный выбор для новичков.
                    </p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                    <strong className="text-cyan-300 text-xs">Гидропоника (DWC)</strong>
                    <p className="text-[11px] text-slate-400">
                      Максимальная скорость усвоения NPK (+40% к росту), требует строгого контроля pH 5.8.
                    </p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                    <strong className="text-purple-300 text-xs">Кокосовое волокно (Coco)</strong>
                    <p className="text-[11px] text-slate-400">
                      Идеальная аэрация корневой системы, высокая защита от перелива и гнили.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nutrients & pH Corridor */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-amber-300">
                  Питание NPK и контроль pH коридора:
                </h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                  <li><strong>pH Коридор:</strong> Держите уровень кислотности в диапазоне <strong>5.8 – 6.5 pH</strong>. Отклонение блокирует всасывание макроэлементов (Lockout).</li>
                  <li><strong>N-Max (Азот):</strong> Вносите на стадии всходов и развивающегося куста для быстрого роста листьев и стеблей.</li>
                  <li><strong>PK 13/14 (Фосфор и Калий):</strong> Вносите на стадии цветения для формирования плотных смолистых соцветий.</li>
                  <li><strong>Осмотическая вода:</strong> Предотвращает отложение солей в субстрате.</li>
                </ul>
              </div>

              {/* Training and Harvest */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider text-purple-300">
                  Формирование куста, сбор и пролечка:
                </h3>
                <p>
                  Установка сетки <strong>SCROG</strong> распределяет колы равномерно под лампами, увеличивая урожайность на <strong>+25%</strong>. При достижении 100% созревания проведите <strong>Сушку (7-10 дней)</strong> и <strong>Пролечку в банках</strong> для достижения 95%+ чистоты и пиковой рыночной стоимости.
                </p>
              </div>
            </div>
          )}

          {/* 2. MYCOLOGY GUIDE */}
          {activeSection === 'mycology' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2 font-mono">
                  <Moon className="w-5 h-5" />
                  <span>2. Микология: Культивация псило-грибов «Астрал»</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Засев монотубов, микроклиматический контроль, сублимация и фасовка.
                </p>
              </div>

              <div className="space-y-3 font-mono">
                <div className="p-3 bg-[#070b10] rounded-xl border border-cyan-500/30 space-y-1.5">
                  <strong className="text-cyan-300 text-xs">Цепочка запуска:</strong>
                  <p className="text-[11px] text-slate-300">
                    Купите в Мегамаркете: <strong>1 Мицелиевый набор + 50г Питательной смеси A + 1 Контейнер</strong> ➔ Нажмите «Засеять новую колонию».
                  </p>
                </div>

                <div className="space-y-2">
                  <strong className="text-white text-xs uppercase tracking-wide">6 Визуальных стадий развития:</strong>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                    <li><strong>Начало (0-20%):</strong> Споровые биолюминесцентные точки.</li>
                    <li><strong>Маленький росток (20-40%):</strong> Разветвление тонких нитей гифов.</li>
                    <li><strong>Формирование колонии (40-60%):</strong> Сплошной неоновый мицелиальный ковер.</li>
                    <li><strong>Появление грибов (60-80%):</strong> Первые золотистые примордии и шляпки.</li>
                    <li><strong>Зрелая колония (80-99%):</strong> Пышные биолюминесцентные грибы.</li>
                    <li><strong>Готовность к сбору (100%):</strong> Споровое свечение, урожай ~85-120г.</li>
                  </ol>
                </div>

                <div className="p-3 bg-[#070b10] rounded-xl border border-emerald-500/30 space-y-1.5">
                  <strong className="text-emerald-300 text-xs">Обработка и Фасовка:</strong>
                  <p className="text-[11px] text-slate-300">
                    После сбора перейдите во вкладку «3. Обработка» ➔ Запустите вакуумную сублимационную сушку ➔ Расфасуйте в <strong>5г Крафтовые пакеты ($140)</strong>, <strong>25г Банки микродозинга ($680)</strong> или <strong>100г Вакуум-боксы ($2,850)</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. SYNTHESIS GUIDE */}
          {activeSection === 'synthesis' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-purple-400 flex items-center gap-2 font-mono">
                  <FlaskConical className="w-5 h-5" />
                  <span>3. Пошаговое руководство: Как делать ЛСД-25 и Кокаин</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Интуитивно понятная химическая инструкция по стадиям, температуре, свету и пропитке.
                </p>
              </div>

              <div className="space-y-4 font-mono">
                <div className="p-3.5 bg-[#060a12] rounded-2xl border border-purple-500/40 space-y-3">
                  <strong className="text-purple-300 text-xs flex items-center gap-2 uppercase tracking-wide">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Пошаговый алгоритм производства ЛСД-25 (4 Простых Шага):
                  </strong>

                  <div className="space-y-2.5 text-[11px] text-slate-300">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 space-y-1">
                      <div className="font-bold text-indigo-300">Шаг 1: Запуск и Экстракция прекурсоров</div>
                      <p className="text-slate-400">
                        В Мегамаркете купите лицензию синтеза, <strong>1 Культуру спорыньи</strong> и <strong>50 мл Диэтиламина</strong>. Нажмите кнопку <strong>«+ Запустить синтез ЛСД-25»</strong>.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 space-y-1">
                      <div className="font-bold text-purple-300">Шаг 2: Настройка Реакции (Температура и Мешалка)</div>
                      <p className="text-slate-400">
                        Установите ползунок температуры в зеленую зону <strong>42°C – 48°C (идеал: 45°C)</strong> и скорость магнитной мешалки на <strong>450 – 600 RPM</strong>. Нажмите <strong>«Перейти к следующей стадии»</strong>.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 space-y-1">
                      <div className="font-bold text-rose-300">Шаг 3: Колоночная очистка и ВКЛЮЧЕНИЕ Неактиничного света (Safelight)</div>
                      <p className="text-slate-400">
                        <strong>КРИТИЧЕСКИ ВАЖНО:</strong> Обязательно нажмите тумблер <strong>«Неактиничный свет (Safelight)»</strong>! Обычный свет разрушает чистоту партии на <strong>-1% в час</strong>. После очистки нажмите <strong>«Перейти к дозированию»</strong>.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/10 space-y-1">
                      <div className="font-bold text-amber-300">Шаг 4: Пропитка арт-блока перфорированных марок</div>
                      <p className="text-slate-400">
                        Выберите дозу (например, 150 мкг) и нажмите <strong>«Завершить пропитку марок»</strong>. Готовый лист из 900 табов поступит на склад (стоимость листа: <strong>~$3,850</strong>).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-[#070b10] rounded-2xl border border-amber-500/30 space-y-1.5">
                  <strong className="text-amber-300 text-xs">Гидрохлоридная очистка кокаина «Fishscale»:</strong>
                  <p className="text-[11px] text-slate-300">
                    1. Выдержите пасту в мацерационной чаше ➔ 2. Добавьте HCl и откачайте вакуумным насосом (-25 PSI) ➔ 3. Заберите 50г перламутровых монокристаллов чистотой 96%+ ($85/г).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. SIDE JOBS & COURIER MANUAL */}
          {activeSection === 'side_jobs' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2 font-mono">
                  <Zap className="w-5 h-5" />
                  <span>6. Подработки: Разнос закладок и Работа курьером</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Правила скрытной доставки, риски, штрафы и побег от патрулей.
                </p>
              </div>

              <div className="space-y-3 font-mono text-slate-300 text-[11px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#070b10] rounded-xl border border-emerald-500/30 space-y-1">
                    <strong className="text-emerald-400">Спальный район «Южный»</strong>
                    <p className="text-slate-400">Выплата: <strong>$15 – $25</strong>. Низкий риск патрулей (25%).</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                    <strong className="text-amber-400">Промзона и склады</strong>
                    <p className="text-slate-400">Выплата: <strong>$25 – $38</strong>. Патрульные дроны (50% риск).</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-rose-500/30 space-y-1">
                    <strong className="text-rose-400">ЖК «Золотые Башни»</strong>
                    <p className="text-slate-400">Выплата: <strong>$40 – $50</strong>. Экстремальный риск (80%).</p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#060a12] rounded-2xl border border-rose-500/30 space-y-2">
                  <strong className="text-rose-400 text-xs uppercase tracking-wide">
                    ⚠️ Штрафы за невыполненную закладку и облаву:
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Если вы сбросите товар при погоне или отмените доставку — списывается штраф <strong>$25</strong> за сорванную закладку.</li>
                    <li>При аресте полицией из баланса удерживается штраф <strong>$50</strong>, а уровень розыска возрастает на <strong>+25%</strong>.</li>
                    <li>Можно дать взятку патрульным за <strong>$40</strong>, чтобы уйти без протокола.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 4. POWDER REFINERY GUIDE */}
          {activeSection === 'powder' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2 font-mono">
                  <Boxes className="w-5 h-5" />
                  <span>5. Порошковый цех: Производство порошка «Аврора»</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Рецептура, синхронизация роторного помола, прессование и брикетирование.
                </p>
              </div>

              <div className="space-y-3 font-mono text-slate-300 text-[11px]">
                <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                  <strong className="text-amber-300 text-xs">4 Необходимых реагента:</strong>
                  <p>1. Белый реагент (10г) + 2. Тёмное сырьё (10г) + 3. Фильтр-порошок (10г) + 4. Стабилизатор (10г).</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10">
                    <strong className="text-cyan-400">Роторный помол:</strong>
                    <p className="mt-1">Держите ползунок в диапазоне <strong>2600 – 3100 RPM</strong>. Ошибки снижают качество.</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10">
                    <strong className="text-amber-400">Давление пресса:</strong>
                    <p className="mt-1">Удерживайте в коридоре <strong>68 – 78 Bar</strong> для монолитной структуры.</p>
                  </div>
                </div>

                <p>
                  После тройной очистки расфасуйте партию в <strong>1г Зиплоки ($75)</strong>, <strong>10г Брикеты ($700)</strong> или <strong>50г Вакуум-блоки ($3,400)</strong>.
                </p>
              </div>
            </div>
          )}

          {/* 6. EFFECTS, ADDICTION & PHARMACOLOGY */}
          {activeSection === 'effects' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-pink-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>7. Эффекты веществ, Зависимость & Толерантность</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Каждый продукт обладает уникальным физиологическим эффектом, визуальным шейдером и влиянием на организм.
                </p>
              </div>

              {/* Addiction Mechanism Box */}
              <div className="p-4 bg-rose-950/25 border border-rose-500/40 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>МЕХАНИКА ЗАВИСИМОСТИ И ТОЛЕРАНТНОСТИ (ADDICTION SYSTEM)</span>
                </div>

                <div className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
                  <p>
                    <strong>Как появляется зависимость в игре:</strong><br />
                    Зависимость и толерантность возникают при <strong>регулярном дегустировании веществ</strong> (особенно стимуляторов типа Кокаина Fishscale) или при частых приемах в дозировках <strong>«Высокая»</strong> и <strong>«Овердрайв»</strong> (2 и более раза за один игровой день или несколько дней подряд).
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-black/50 rounded-xl border border-rose-500/30">
                      <strong className="text-amber-300 text-[11px]">1. Нарастание Толерантности:</strong>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        При частых приемах организм привыкает. Позитивный бафф длится на <strong>30–50% меньше</strong>, а для активации шейдеров требуется большая доза.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/50 rounded-xl border border-rose-500/30">
                      <strong className="text-rose-400 text-[11px]">2. Синдром отмены (Ломка):</strong>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Если не принимать вещества при высоком уровне зависимости, скорость работы лаборатории и перемещения курьера падает на <strong>15–20%</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl">
                    <strong className="text-emerald-300 text-[11px]">Как снять или предотвратить зависимость:</strong>
                    <ul className="list-disc list-inside text-[10px] text-slate-300 mt-1 space-y-0.5">
                      <li><strong>Детокс-пауза:</strong> Пропустите 2–3 игровых дня без приёма веществ (уровень зависимости спадёт до 0).</li>
                      <li><strong>Микродозирование:</strong> Используйте дозировку «Микродоза» (0.1g / 20mg) — она дает фокус без риска зависимости.</li>
                      <li><strong>Медицинская очистка:</strong> Намите штатного юриста или врача в разделе «Инфраструктура».</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Substances Shader Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                  <strong className="text-amber-300 text-xs">Cocaine Fishscale (Hyper-Dopamine)</strong>
                  <p className="text-[11px] text-slate-400">
                    Золотые электрические дуги по краям экрана, туннельное зрение, пульс 150 BPM и мгновенное ускорение крафта. <em>Высокий риск быстрого развития зависимости!</em>
                  </p>
                </div>

                <div className="p-3 bg-[#070b10] rounded-xl border border-cyan-500/30 space-y-1">
                  <strong className="text-cyan-300 text-xs">White Widow (Time-Dilation)</strong>
                  <p className="text-[11px] text-slate-400">
                    Замедляет игровое время на <strong>30%</strong>, позволяя идеально контролировать тонкие химические реакции. Эфирная белая морозная виньетка.
                  </p>
                </div>

                <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                  <strong className="text-amber-300 text-xs">Amnesia Haze (Hyper-Speed)</strong>
                  <p className="text-[11px] text-slate-400">
                    Ускоряет обработку операций и симуляцию на <strong>1.4x</strong>. Неоновые вспышки и динамический blur движения.
                  </p>
                </div>

                <div className="p-3 bg-[#070b10] rounded-xl border border-purple-500/30 space-y-1">
                  <strong className="text-purple-300 text-xs">Gorilla Glue #4 & Грибы / ЛСД</strong>
                  <p className="text-[11px] text-slate-400">
                    Гашение дрожания UI, калейдоскопические RGB аберрации, биолюминесцентные контуры и обострение фокуса.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 7. ECONOMY & HEAT */}
          {activeSection === 'economy' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2 font-mono">
                  <TrendingUp className="w-5 h-5" />
                  <span>7. Теневая экономика, Розыск полиции и Баланс суточных расходов</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Сбыт, криптовалютные шлюзы, снижение рисков и финансовые отчеты.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                    <strong className="text-white text-xs">1. Уличный сбыт</strong>
                    <p className="text-slate-400">Мгновенный кэш, но создает +2-5% розыска полиции за каждую партию.</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                    <strong className="text-amber-300 text-xs">2. Darknet (XMR/BTC)</strong>
                    <p className="text-slate-400">Безопасные крипто-сделки. Требуют конвертации в фиат через отмывочный шлюз (-8% комиссия).</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-purple-500/30 space-y-1">
                    <strong className="text-purple-300 text-xs">3. Картельные контракты</strong>
                    <p className="text-slate-400">Крупные оптовые чеки ($10,000+), жесткие дедлайны и штрафы за срыв.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-[#060a12] rounded-2xl border border-rose-500/30 space-y-2">
                  <strong className="text-rose-400 text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Факторы розыска полиции (Police Heat):
                  </strong>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li><strong>Запах растений:</strong> Устанавливайте угольные фильтры (каждый нейтрализует 25 единиц запаха).</li>
                    <li><strong>Аномалии электросети:</strong> Нагрузка свыше 1800W привлекает внимание. Покупайте <strong>Солнечные панели 400W</strong> для снижения сетевого следа.</li>
                    <li><strong>Адвокатский ретейнер:</strong> За $200/сутки снижает генерацию розыска на <strong>50%</strong>.</li>
                  </ul>
                </div>

                <div className="p-3 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                  <strong className="text-emerald-400 text-xs">Суточный цикл и отчетность:</strong>
                  <p className="text-slate-400">
                    Каждые сутки останавливаются на 24:00. При нажатии «Завершить день» открывается финансовое окно с полным расчетом прибыли, аренды, зарплат персонала и чистой прибыли.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'pharma' && (
            <div className="space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2 font-mono">
                  <FlaskConical className="w-5 h-5 text-cyan-400" />
                  <span>8. Руководство по Аптеке & Рецептурному Отпуску</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Кассовый терминал, рецептурный и безрецептурный учет, подставные покупатели и нелегальные сделки.
                </p>
              </div>

              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-xl space-y-1 text-slate-300">
                <div className="font-bold text-white">Правила работы аптечной кассы:</div>
                <p className="text-xs">
                  В вашей аптеке каждый входящий клиент запрашивает нужный ему медикамент. Легальные безрецептурные препараты (Парацетамол, Ибупрофен, Мелатонин, Аспирин) отпускаются без ограничений.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                <div className="p-3 bg-[#0e1622] border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="font-bold text-emerald-400">1. Продажа По Рецепту (Официально)</div>
                  <p className="text-slate-400">
                    Если клиент имеет действующий рецепт на рецептурные средства (Лирика, Трамадол, Золофт, Ксанакс и др.), продажа 100% легальна. Ноль внимания копов.
                  </p>
                </div>

                <div className="p-3 bg-[#0e1622] border border-rose-500/30 rounded-xl space-y-1">
                  <div className="font-bold text-rose-400">2. Продажа БЕЗ Рецепта / Из-под полы</div>
                  <p className="text-slate-400">
                    Клиенты без рецепта платят двойной ценник за нелегальный отпуск препаратов. Однако это повышает риск инспекции Минздрава и полиции!
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-2xl space-y-2">
                <strong className="text-amber-400 text-xs flex items-center gap-1.5 font-mono">
                  <ShieldAlert className="w-4 h-4 text-amber-400" /> Подставные покупатели и агенты полиции:
                </strong>
                <p className="text-[11px] text-amber-300/90 font-mono">
                  Будьте осторожны! Некоторые заходящие клиенты — это переодетые агенты ОБНОН или инспекторы Минздрава. Если вы продадите им строго рецептурный препарат без рецепта или наркотик из-под полы, произойдет контрольная закупка, штраф и рейд на склад!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
