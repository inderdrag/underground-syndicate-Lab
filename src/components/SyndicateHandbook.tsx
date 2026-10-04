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
  Clock,
  Pill,
  Award,
  Lock,
  RotateCw,
  Box,
  Sliders,
  Thermometer,
  FileText,
  Activity,
  PackageCheck,
  Check,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { ProductArtwork } from './ProductArtwork';

interface SyndicateHandbookProps {
  language: Language;
}

type SectionKey =
  | 'botany'
  | 'mycology'
  | 'synthesis'
  | 'powder'
  | 'pharma'
  | 'side_jobs'
  | 'effects'
  | 'economy';

export const SyndicateHandbook: React.FC<SyndicateHandbookProps> = ({ language }) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('botany');

  const sections: { id: SectionKey; title: string; subtitle: string; icon: typeof Leaf }[] = [
    { id: 'botany', title: '1. Ботаника: Выращивание', subtitle: 'Полив, NPK, DWC, SCROG, сушка и пролечка', icon: Leaf },
    { id: 'mycology', title: '2. Микология «Астрал»', subtitle: 'Монотубы, субстраты, сублимация и фасовка', icon: Moon },
    { id: 'synthesis', title: '3. Хим-синтез (ЛСД & Кокаин)', subtitle: '5 шагов ЛСД (мешалка 20с) и 5 шагов Кокаина 96%', icon: FlaskConical },
    { id: 'powder', title: '4. Цех порошка «Аврора»', subtitle: '4 реагента, ротор 2800 RPM, пресс 72 Bar', icon: Boxes },
    { id: 'pharma', title: '5. Варка Фармы (22 Препарата)', subtitle: 'Мини-игры варки, бланки 107-1/у, 148, 107/у-НП', icon: Pill },
    { id: 'side_jobs', title: '6. Подработки & Закладки', subtitle: '3 района, дроны, облавы, взятки ($40)', icon: Zap },
    { id: 'effects', title: '7. Дегустация & 18 Шейдеров', subtitle: '4 дозировки на лету, вертиго Лирики, детокс', icon: Sparkles },
    { id: 'economy', title: '8. Экономика, Darknet & Розыск', subtitle: 'Крипта, шлюз -8%, панели 400W, тепло и Heat', icon: TrendingUp },
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-bold">
                Исчерпывающие пошаговые инструкции
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Полная база знаний лаборатории: рецепты, варка, культивация и сбыт
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
                className={`w-full p-3 rounded-2xl border text-left text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                    : 'bg-[#080c13] text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{sec.title}</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 pl-6 font-normal truncate">
                  {sec.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-3 bg-[#0b1017] border border-white/[0.08] rounded-2xl p-4 sm:p-6 space-y-6 shadow-xl text-slate-200 text-xs leading-relaxed max-h-[85vh] overflow-y-auto">
          {/* ================= 1. BOTANY GUIDE ================= */}
          {activeSection === 'botany' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2 font-mono">
                  <Leaf className="w-5 h-5" />
                  <span>1. Ботаника: Ускоренное выращивание, уход, сушка и пролечка</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Подробный гид по ультрабыстрой культивации (полный цикл созревания занимает всего 2–4 игровых часа).
                </p>
              </div>

              {/* Step-by-Step Cultivation Guide */}
              <div className="space-y-3 font-mono">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2.5">
                  <strong className="text-emerald-300 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Пошаговая инструкция выращивания (от семени до готовых шишек):
                  </strong>

                  <div className="space-y-2 text-[11px] text-slate-300">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-white block">Шаг 1. Покупка лицензии и семян</strong>
                      <p className="text-slate-400">
                        Купите «Лицензию Гровера» ($150) в Гроушопе или Мегамаркете. Выберите семена одного из 4 сортов (White Widow, Amnesia Haze, Gorilla Glue #4, Purple Haze) и нажмите «Посадить семя».
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-cyan-300 block">Шаг 2. Выбор субстрата</strong>
                      <p className="text-slate-400">
                        • <strong>Гидропоника DWC:</strong> дает максимальный множитель роста <strong>+35%</strong>.<br />
                        • <strong>Кокосовый субстрат:</strong> ускорение <strong>+20%</strong>.<br />
                        • <strong>Органическая почва:</strong> базовая простота ухода.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-emerald-300 block">Шаг 3. Регулярный полив (Мгновенный буст +8% роста!)</strong>
                      <p className="text-slate-400">
                        Держите влажность в оптимальной зеленой зоне <strong>50% – 75%</strong>. Каждый клик полива осмотической водой RO моментально добавляет <strong>+8% к созреванию куста</strong>!
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-amber-300 block">Шаг 4. Внесение удобрений (Мгновенный буст +12% роста!)</strong>
                      <p className="text-slate-400">
                        • <strong>N-Max (Азот):</strong> вносите на вегетативной фазе для взрывного набора зеленой массы.<br />
                        • <strong>PK 13/14 Бустер:</strong> вносите на стадии цветения для наливания плотных смолистых шишек.<br />
                        • <strong>Биогумус:</strong> повышает естественный иммунитет растения. Каждая подкормка дает <strong>+12% мгновенного прогресса</strong>!
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-purple-300 block">Шаг 5. Освещение 1000W и Сетка SCROG</strong>
                      <p className="text-slate-400">
                        Установите мощную LED-лампу на 1000W (+35% скорости) и натяните сетку SCROG (+15% к скорости, +25% к финальному весу урожая).
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-emerald-400 block">Шаг 6. Харвест, Сушка и Пролечка в банках Curing Jars</strong>
                      <p className="text-slate-400">
                        При достижении 100% нажмите «Собрать урожай». Высушите шишки и проведите пролечку в стеклянных банках — это поднимет чистоту до 96–98% и позволит продавать товар по максимальной цене ($18–$35/г).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. MYCOLOGY GUIDE ================= */}
          {activeSection === 'mycology' && (
            <div className="space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2 font-mono">
                  <Moon className="w-5 h-5" />
                  <span>2. Микология: Культивация, субстраты, сублимация и фасовка грибов «Астрал»</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Руководство по засеву монотубов, контролю FAE-аэрации и созданию фасованного премиум-продукта.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[11px] text-slate-300">
                <div className="p-3.5 bg-cyan-950/25 border border-cyan-500/40 rounded-2xl space-y-2">
                  <strong className="text-cyan-300 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Пошаговый цикл микологии:
                  </strong>

                  <div className="space-y-2">
                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-white block">1. Закупка сырья (Требуется Споровый Сертификат $350):</strong>
                      <p className="text-slate-400">
                        В магазине купите: <strong>1 Набор мицелия «Астрал» ($60) + 50г Питательной смеси A ($35) + 1 Герметичный монотуб ($80)</strong>.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-indigo-300 block">2. Засев и 6 стадий развития:</strong>
                      <p className="text-slate-400">
                        Нажмите «Засеять новую колонию». Монотуб проходит 6 визуальных фаз: Споры (0-20%) ➔ Гифы (20-40%) ➔ Мицелиальный ковер (40-60%) ➔ Примордии (60-80%) ➔ Зрелые грибы (80-99%) ➔ Сбор (100%).
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-cyan-300 block">3. Микроклимат и стимуляторы роста:</strong>
                      <p className="text-slate-400">
                        Поддерживайте температуру 24–27°C и влажность 90%. Применяйте «Стимулятор роста» (+30% к скорости) и «Стабилизатор среды» для мгновенного снятия любых болезней и патогенов.
                      </p>
                    </div>

                    <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 space-y-1">
                      <strong className="text-emerald-300 block">4. Сублимационная сушка (Freeze-Drying) и Фасовка:</strong>
                      <p className="text-slate-400">
                        Соберите урожай (~85–120г) ➔ Перейдите во вкладку «3. Обработка» ➔ Запустите вакуумную сублимацию ➔ Расфасуйте в:
                        <br />• <strong>Крафтовые пакеты 5г:</strong> продажа по $140.
                        <br />• <strong>Банки микродозинга 25г:</strong> продажа по $680.
                        <br />• <strong>Вакуум-блоки 100г:</strong> оптовая цена $2,850.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. SYNTHESIS GUIDE ================= */}
          {activeSection === 'synthesis' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-purple-400 flex items-center gap-2">
                  <FlaskConical className="w-5 h-5" />
                  <span>3. Хим-синтез: Как варить ЛСД-25 и рафинировать Кокаин Fishscale 96%</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Исчерпывающий разбор всех 5 этапов синтеза ЛСД и 5 этапов очистки кокаина высокой чистоты.
                </p>
              </div>

              {/* LSD 5 STEPS */}
              <div className="p-4 bg-purple-950/20 border border-purple-500/40 rounded-2xl space-y-3">
                <strong className="text-purple-300 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Инструкция по синтезу ЛСД-25 (Все 5 Этапов):
                </strong>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
                    <div className="font-bold text-indigo-300">Этап 1: Сборка стеклянного контура («Схема реактора»)</div>
                    <p className="text-slate-400">
                      Соедините 5 портов: Круглодонная колба ➔ Дефлегматор ➔ Термометр ➔ Вакуумный алонж ➔ Приемник. При 5 правильных соединениях открывается переход.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
                    <div className="font-bold text-cyan-300">Этап 2: Водяная баня («Термостатирование»)</div>
                    <p className="text-slate-400">
                      Удерживайте температуру в зеленом коридоре <strong>42°C – 48°C (идеал 45°C)</strong> в течение 10 секунд. Не допускайте перегрева выше 55°C.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-amber-500/40 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Этап 3: Магнитная мешалка («Вихрь») — Таймер 20 секунд!</span>
                    </div>
                    <p className="text-slate-400">
                      Нажимайте импульсы вращения, удерживая стрелку тахометра в зеленой зоне <strong>450 – 600 RPM</strong> в течение ровно <strong>20 секунд</strong>. Это обеспечивает идеальную реакцию пептидного связывания.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-rose-500/30 space-y-1">
                    <div className="font-bold text-rose-300">Этап 4: Хроматография на силикагеле под Safelight</div>
                    <p className="text-slate-400">
                      Обязательно включите красный неактиничный свет (Safelight) — обычный свет разрушает d-изомер. Дождитесь, когда светящаяся полоса d-ЛСД войдет в фокусное окно, и перекройте кран.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-emerald-500/30 space-y-1">
                    <div className="font-bold text-emerald-300">Этап 5: Пропитка листа марок («Капля за каплей»)</div>
                    <p className="text-slate-400">
                      Нанесите пипеткой точную дозу (150 мкг) на 100 перфорированных квадратиков арт-блока. Готовый лист поступает на склад (рыночная стоимость: <strong>~$3,850</strong>).
                    </p>
                  </div>
                </div>
              </div>

              {/* COCAINE 5 STEPS */}
              <div className="p-4 bg-amber-950/20 border border-amber-500/40 rounded-2xl space-y-3">
                <strong className="text-amber-300 text-sm flex items-center gap-2 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Инструкция по рафинированию Кокаина Fishscale 96% (Все 5 Этапов):
                </strong>

                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
                    <div className="font-bold text-amber-300">Этап 1: Экстракция и расслоение фаз (Таймер 10 секунд)</div>
                    <p className="text-slate-400">
                      Удерживайте ползунок крана на дрейфующей красной точке раздела эфирного и водного слоев. Таймер 10 секунд считает непрерывно без сбоев.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
                    <div className="font-bold text-cyan-300">Этап 2: 3-цикловая промывка растворителем</div>
                    <p className="text-slate-400">
                      1. Залейте 40–60 мл чистого эфира ➔ 2. Удерживайте кнопку встряхивания делительной воронки до 100% ➔ 3. Слейте примеси и перекройте кран на отметке 20 мл (повторить 3 раза для максимальной чистоты).
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
                    <div className="font-bold text-blue-300">Этап 3: Кристаллизация соли HCl</div>
                    <p className="text-slate-400">
                      При охлаждении реактора до 4°C образуются монокристаллы. Кликайте по всем появляющимся кристаллам соли.
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-white/10 space-y-1">
                    <div className="font-bold text-purple-300">Этап 4: Вакуумное сито 200 мкм</div>
                    <p className="text-slate-400">
                      Нажимайте «Просеять фракцию» для измельчения комков (6 чистых фракций).
                    </p>
                  </div>

                  <div className="p-2.5 bg-black/50 rounded-xl border border-emerald-500/40 space-y-1">
                    <div className="font-bold text-emerald-300">Этап 5: Гидравлический пресс 96%</div>
                    <p className="text-slate-400">
                      Откалибруйте давление в зеленую зону <strong>65–80 PSI (идеал 72 PSI)</strong> и запечатайте зеркальный килограммовый брикет чистотой 96%+ ($85/г).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. POWDER REFINERY GUIDE ================= */}
          {activeSection === 'powder' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Boxes className="w-5 h-5" />
                  <span>4. Порошковый цех: Как варить и прессовать порошок «Аврора»</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Формула 4 реагентов, синхронизация помола в роторном реакторе и гидравлическое брикетирование.
                </p>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="p-3.5 bg-amber-950/25 border border-amber-500/30 rounded-2xl space-y-2">
                  <strong className="text-amber-300 text-xs uppercase tracking-wide">
                    Пошаговый рецепт порошка «Аврора»:
                  </strong>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li><strong>Загрузка реагентов в реактор:</strong> 10г Белого реагента + 10г Тёмного сырья + 10г Фильтр-порошка + 10г Стабилизатора.</li>
                    <li><strong>Роторный помол:</strong> Удерживайте ползунок скорости вращения в диапазоне <strong>2600 – 3100 RPM</strong>.</li>
                    <li><strong>Гидравлическое прессование:</strong> Зафиксируйте давление на отметке <strong>68 – 78 Bar</strong>.</li>
                    <li><strong>Фасовка:</strong> Расфасуйте в 1г Зиплоки ($75), 10г Брикеты ($700) или 50г Вакуум-блоки ($3,400).</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. PHARMA LAB & COOKING ================= */}
          {activeSection === 'pharma' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-cyan-400" />
                  <span>5. Фармацевтика: Инструкции по варке 22 препаратов и проверке рецептов</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Механика мини-игр синтеза таблеток, капсул и ампул, экспертиза бланков 107-1/у, 148-1/у-88 и 107/у-НП.
                </p>
              </div>

              {/* 4 Pharma Categories */}
              <div className="space-y-3 text-[11px]">
                <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl space-y-1.5">
                  <div className="font-bold text-emerald-400 text-xs">Группа A. Безрецептурные препараты (Полки A):</div>
                  <p className="text-slate-300">
                    • <strong>Парацетамол, Ибупрофен, Мелатонин, Аспирин, Уголь, Лоратадин, Но-шпа, Витамин C.</strong><br />
                    <em>Как варить:</em> Стандартный калибровочный ползунок гранулирования. Выравнивайте стрелку в зеленую зону и прессуйте блистер.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-blue-500/30 rounded-2xl space-y-1.5">
                  <div className="font-bold text-blue-400 text-xs">Группа B. Рецептурные препараты (Сейфы B / Бланк 107-1/у):</div>
                  <p className="text-slate-300">
                    • <strong>Габапентин, Лирика, Золофт, Прозак, Трамадол.</strong><br />
                    <em>Как варить:</em> Медленная варка с поддержанием температуры + удержание капсулятора по таймеру. Не допускайте перегрева.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-2xl space-y-1.5">
                  <div className="font-bold text-amber-400 text-xs">Группа C. Особый Учёт (Сейфы C / Бланк 148-1/у-88):</div>
                  <p className="text-slate-300">
                    • <strong>Золпидем, Ксанакс, Модафинил, Риталин, Кодеин.</strong><br />
                    <em>Как варить:</em> Высокоточный ползунок с узким допуском (±2%) и ритмическая экстракция алкалоидов.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-rose-500/30 rounded-2xl space-y-1.5">
                  <div className="font-bold text-rose-400 text-xs">Группа D. Элитные Препараты (Подсобка D / Спецбланк 107/у-НП):</div>
                  <p className="text-slate-300">
                    • <strong>Аддерол, Оксикодон, Морфин, Фентанил.</strong><br />
                    <em>Как варить:</em> Стерильная ампульная фильтрация и микродозирование активной матрицы.
                  </p>
                </div>

                {/* Blanks Verification Rules */}
                <div className="p-3.5 bg-amber-950/25 border border-amber-500/40 rounded-2xl space-y-1.5">
                  <strong className="text-amber-300 text-xs flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-amber-400" /> Экспертиза рецептурных бланков:
                  </strong>
                  <p className="text-slate-300">
                    Сверяйте 4 фактора: 1. Срок действия даты (15 или 60 дней) ➔ 2. Подлинность треугольной печати врача ➔ 3. Совпадение подписи главврача ➔ 4. Дозировка (отсутствие превышения).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 6. SIDE JOBS ================= */}
          {activeSection === 'side_jobs' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>6. Подработки: Доставка, раскладка закладок и уход от полиции</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Тактика выбора районов, раскладки тайников и минимизации рисков.
                </p>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#070b10] rounded-xl border border-emerald-500/30 space-y-1">
                    <strong className="text-emerald-400">1. Спальный район «Южный»</strong>
                    <p className="text-slate-400">Выплата: $15 – $25. Риск: 25%. Идеально для старта.</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                    <strong className="text-amber-400">2. Промзона и склады</strong>
                    <p className="text-slate-400">Выплата: $25 – $38. Риск: 50%. Патрульные дроны.</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-rose-500/30 space-y-1">
                    <strong className="text-rose-400">3. ЖК «Золотые Башни»</strong>
                    <p className="text-slate-400">Выплата: $40 – $50. Риск: 80%. Элитные клиенты.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-1">
                  <strong className="text-rose-400 text-xs">Правила безопасности курьера:</strong>
                  <p>• При приближении патруля можно дать взятку <strong>$40</strong> и уйти без протокола.</p>
                  <p>• Сброс товара при погоне или отмена заказа влечет штраф <strong>$25</strong>.</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 7. EFFECTS & SHADERS ================= */}
          {activeSection === 'effects' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-pink-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>7. Дегустация 18 Веществ, 4 Дозировки, Шейдеры & Детокс</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Каждый препарат обладает уникальным полноэкранным шейдером, переключением дозировки на лету и влиянием на организм.
                </p>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="p-3.5 bg-purple-950/25 border border-purple-500/40 rounded-2xl space-y-2">
                  <strong className="text-purple-300 text-xs uppercase tracking-wide">
                    4 Уровня Дозировки (Переключение на лету в правом верхнем углу):
                  </strong>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                      <strong className="text-emerald-400 block">1. Микро:</strong>
                      Мягкий фокус, 0% зависимости.
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                      <strong className="text-cyan-400 block">2. Стандарт:</strong>
                      Сбалансированные шейдеры и эффекты.
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                      <strong className="text-amber-400 block">3. Высокая:</strong>
                      Усиленные волны, +18% риска.
                    </div>
                    <div className="p-2 bg-black/40 rounded-lg border border-white/10">
                      <strong className="text-rose-400 block">4. Овердрайв:</strong>
                      Максимальный раш / вертиго.
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-1">
                  <strong className="text-emerald-300 text-xs">Очистка от зависимости (Детокс):</strong>
                  <p>Пропустите 2–3 игровых дня без употребления веществ или активируйте детокс-программу через адвоката.</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= 8. ECONOMY & HEAT ================= */}
          {activeSection === 'economy' && (
            <div className="space-y-5 font-mono">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>8. Теневая экономика, Darknet (XMR/BTC), Отмыв & Розыск полиции (Heat)</span>
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Управление денежными потоками, криптовалютные шлюзы и снижение подозрительности властей.
                </p>
              </div>

              <div className="space-y-3 text-[11px] text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 bg-[#070b10] rounded-xl border border-white/10 space-y-1">
                    <strong className="text-white text-xs">1. Уличный сбыт</strong>
                    <p className="text-slate-400">Быстрые деньги, но повышает розыск на +2-5% за партию.</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-amber-500/30 space-y-1">
                    <strong className="text-amber-300 text-xs">2. Darknet (XMR/BTC)</strong>
                    <p className="text-slate-400">Анонимные крипто-сделки. Отмыв через шлюз берет комиссию 8%.</p>
                  </div>
                  <div className="p-3 bg-[#070b10] rounded-xl border border-purple-500/30 space-y-1">
                    <strong className="text-purple-300 text-xs">3. Картельные контракты</strong>
                    <p className="text-slate-400">Крупные оптовые чеки ($10,000+), строгие дедлайны.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-1">
                  <strong className="text-rose-400 text-xs">Снижение розыска полиции (Police Heat):</strong>
                  <p>• <strong>Угольные фильтры:</strong> устраняют запах растений (каждый фильтр снимает 25 единиц запаха).</p>
                  <p>• <strong>Солнечные панели 400W:</strong> снижают нагрузку на электросеть ниже порога 1800W.</p>
                  <p>• <strong>Адвокатский ретейнер:</strong> за $200/сутки режет генерацию розыска на 50%.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
