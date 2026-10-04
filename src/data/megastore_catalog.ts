/**
 * Complete Data-Driven Megastore Catalog including all 22 Bases, 22 Catalysts, 18 Packaging types,
 * Prescription Blank Supplies, Doctor Stamps, and Lab Hardware.
 */

export interface MegastoreCatalogItem {
  id: string;
  name: string;
  category: 'base' | 'catalyst' | 'packaging' | 'blanks' | 'raw_materials' | 'hardware';
  licenseRequired: 'pharma_license' | 'synthesis_license' | 'botany_license' | 'mycology_license' | 'facility_license';
  unitPrice: number;
  packSize: number;
  description: string;
  icon: string;
}

export const MEGASTORE_ITEMS: MegastoreCatalogItem[] = [
  // --- 🧪 БАЗОВЫЕ СЫРЬЕВЫЕ ИНГРЕДИЕНТЫ (RAW MATERIALS) ---
  { id: 'pharma_base_extract', name: 'Базовый Фарм-Экстракт', category: 'raw_materials', licenseRequired: 'pharma_license', unitPrice: 65, packSize: 1, description: 'Концентрированное химическое сырьё высокой степени очистки', icon: '🧪' },
  { id: 'pharma_binder', name: 'Фармо-Основа (Связующее)', category: 'raw_materials', licenseRequired: 'pharma_license', unitPrice: 25, packSize: 10, description: 'Медицинский наполнитель для прессования таблеток и капсулирования', icon: '⚪' },
  { id: 'pharma_stabilizer', name: 'Органический Стабилизатор', category: 'raw_materials', licenseRequired: 'pharma_license', unitPrice: 40, packSize: 5, description: 'Защищает активные химические соединения от окисления и распада', icon: '🛡️' },
  { id: 'pharma_solvent', name: 'Очищенный Растворитель', category: 'raw_materials', licenseRequired: 'pharma_license', unitPrice: 30, packSize: 10, description: 'Безводный растворитель для приготовления сиропов и экстракций', icon: '💧' },
  // --- 22 ОСНОВЫ (BASES) ---
  { id: 'base_willow_extract', name: 'Ивовый экстракт', category: 'base', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Природный салицилатный экстракт коры ивы для обычных анальгетиков', icon: '🌿' },
  { id: 'base_charred_wood', name: 'Обожжённая древесина', category: 'base', licenseRequired: 'pharma_license', unitPrice: 1, packSize: 20, description: 'Высокопористый берёзовый сорбент глубокого обжига', icon: '🪵' },
  { id: 'base_alba_anti', name: '«Альба-Анти»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Очищенная противоаллергическая фармацевтическая матрица', icon: '⚪' },
  { id: 'base_spasmo_lyte', name: '«Спазмо-лит»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Миотропная органо-основа для снятия гладкомышечных спазмов', icon: '💊' },
  { id: 'base_citrus_concentrate', name: 'Цитрусовый концентрат', category: 'base', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Концентрированная аскорбиновая выжимка высокого качества', icon: '🍋' },
  { id: 'base_alba', name: '«Альба»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Классическая фармакопейная белая основа для жаропонижающих', icon: '⚪' },
  { id: 'base_alba_pro', name: '«Альба-Про»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Усиленный микрокапсулированный наполнитель пролонгированного действия', icon: '⚪' },
  { id: 'base_moonflower_extract', name: 'Экстракт «Лунный цвет»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 4, packSize: 10, description: 'Фито-экстракт ночных соцветий для снотворных капсул', icon: '🌙' },
  { id: 'base_neuro_seda', name: 'Нейро-экстракт «Седа»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 8, packSize: 10, description: 'Седативный аминокислотный субстрат для габапентиноидов', icon: '🧪' },
  { id: 'base_neuro_seda_pro', name: 'Нейро-экстракт «Седа-Про»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 12, packSize: 10, description: 'Концентрированная прегабалиновая основа глубокой очистки', icon: '🧪' },
  { id: 'base_sero', name: 'Основа «Серо»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 14, packSize: 10, description: 'Серотонинергическая основа для производства антидепрессантов', icon: '🟡' },
  { id: 'base_sero_lite', name: 'Основа «Серо-Лайт»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 15, packSize: 10, description: 'Легкий флуоксетиновый прекурсор для рецептурных таблеток', icon: '🟡' },
  { id: 'base_analga', name: '«Анальга»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 16, packSize: 10, description: 'Центрально-действующая опиоидная анальгетическая матрица', icon: '💉' },
  { id: 'base_somna', name: '«Сомна»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 22, packSize: 10, description: 'Высокочистый золпидемовый субстрат для препаратов строгого учёта', icon: '💤' },
  { id: 'base_tranqui', name: '«Транкви»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 28, packSize: 10, description: 'Бензодиазепиновая основа повышенной активности для Ксанакса', icon: '💊' },
  { id: 'base_vigil', name: '«Вигил»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 32, packSize: 10, description: 'Аналептический субстрат модафинила для стимуляции бодрствования', icon: '👁️' },
  { id: 'base_focus_stim', name: '«Фокус-Стим»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 38, packSize: 10, description: 'Метилфенидатовая стимуляционная база для Риталина', icon: '⚡' },
  { id: 'base_dark_resin_lite', name: '«Тёмная смола-Лайт»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 42, packSize: 10, description: 'Очищенный алкалоидный кодеиновый концентрат', icon: '🟤' },
  { id: 'base_stim_mix', name: '«Стим-Микс»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 60, packSize: 10, description: 'Смесь солей амфетаминового ряда для производства Аддерола', icon: '⚡' },
  { id: 'base_dark_resin_pro', name: '«Тёмная смола-Про»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 90, packSize: 10, description: 'Полусинтетическая оксикодоновая основа глубокой экстракции', icon: '🟤' },
  { id: 'base_dark_resin_elite', name: '«Тёмная смола-Элит»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 140, packSize: 10, description: 'Кристаллический морфиновый субстрат высокой фармакопейной чистоты', icon: '💎' },
  { id: 'base_synth_neuro', name: '«Синт-Нейро»', category: 'base', licenseRequired: 'pharma_license', unitPrice: 320, packSize: 5, description: 'Ультра-мощный синтетический фенилпиперидиновый субстрат Фентанила', icon: '☣️' },

  // --- 22 КАТАЛИЗАТОРА (CATALYSTS) ---
  { id: 'cat_acid_buffer', name: 'Кислотный буфер', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Лимоннокислый стабилизатор кислотности таблетки', icon: '🧪' },
  { id: 'cat_porous_activator', name: 'Пористый активатор', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Катализатор увеличения площади удельной адсорбции', icon: '🧼' },
  { id: 'cat_antihistamine_module', name: 'Антигистаминный модуль', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Модуль блокатор Н1-гистаминовых рецепторов', icon: '🛡️' },
  { id: 'cat_soft_solvent', name: 'Мягкий растворитель', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Органический пропиленгликолевый растворитель', icon: '💧' },
  { id: 'cat_effervescent_activator', name: 'Шипучий активатор', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Карбонатно-кислотный шипучий агент быстрого растворения', icon: '🫧' },
  { id: 'cat_starch_binder', name: 'Крахмальное связующее', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Медицинский кукурузный крахмал высокой степени прессования', icon: '🌾' },
  { id: 'cat_citrus_buffer', name: 'Цитрусовый буфер', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Буферный агент для защиты слизистой желудка', icon: '🍊' },
  { id: 'cat_plant_sorbent', name: 'Растительный сорбент', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Микрокристаллическая целлюлоза для постепенного высвобождения', icon: '🌿' },
  { id: 'cat_alkaline_buffer', name: 'Щелочной буфер', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 6, packSize: 10, description: 'Щелочной катализатор всасывания в кишечнике', icon: '🧪' },
  { id: 'cat_silent_leaf', name: '«Тихий лист»', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 8, packSize: 10, description: 'Успокаивающий органо-катализатор усилитель прегабалина', icon: '🍃' },
  { id: 'cat_sunny_citrus', name: '«Солнечный цитрус»', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 10, packSize: 10, description: 'Катализатор стабилизации серотониновых рецепторов', icon: '☀️' },
  { id: 'cat_focus_module', name: 'Фокус-модуль', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 12, packSize: 10, description: 'Модуль усиления синаптической передачи', icon: '🎯' },
  { id: 'cat_slow_releaser', name: 'Медленный высвободитель', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 12, packSize: 10, description: 'Полимерный катализатор замедления всасывания опиоидов', icon: '⏳' },
  { id: 'cat_fast_dissolver', name: 'Быстрый растворитель', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 18, packSize: 10, description: 'Сублингвальный дезинтегрант субоптимального действия', icon: '⚡' },
  { id: 'cat_silence_stab', name: 'Стабилизатор «Тишина»', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 22, packSize: 10, description: 'Ультра-чистый стабилизатор транквилизаторных молекул', icon: '🤫' },
  { id: 'cat_clarity_tonic', name: 'Тоник «Ясность»', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 24, packSize: 10, description: 'Катализатор возбуждения орексиновых рецепторов мозга', icon: '✨' },
  { id: 'cat_neuro_activator', name: 'Нейро-активатор', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 28, packSize: 10, description: 'Дофаминергический активирующий модуль', icon: '🧠' },
  { id: 'cat_softener', name: 'Смягчитель', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 30, packSize: 10, description: 'Ограничитель побочных явлений и спазмов гладкой мускулатуры', icon: '🪶' },
  { id: 'cat_prolongator_xr', name: 'Пролонгатор XR', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 45, packSize: 10, description: 'Двухфазная диффузионная оболочка длительного высвобождения', icon: '⏱️' },
  { id: 'cat_release_ctrl', name: 'Контроль высвобождения', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 70, packSize: 10, description: 'Матричный водонерастворимый полимер с защитой от разжевывания', icon: '🔐' },
  { id: 'cat_sterile_sol', name: 'Стерильный раствор', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 100, packSize: 10, description: 'Апирогенная стерильная вода для инъекционных ампул', icon: '💉' },
  { id: 'cat_transdermal_matrix', name: 'Матрица трансдермы', category: 'catalyst', licenseRequired: 'pharma_license', unitPrice: 240, packSize: 5, description: 'Адгезивная полимерная матрица для чрескожного переноса фентанила', icon: '🩹' },

  // --- 18 УПАКОВОК (PACKAGING) ---
  { id: 'pack_paper_blister', name: 'Бумажный блистер', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 1, packSize: 20, description: 'Стандартный бумажный блистер для анальгетиков', icon: '📄' },
  { id: 'pack_cardboard_strip', name: 'Картонный стрип', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 1, packSize: 20, description: 'Экологичная стрип-лента из ламинированного картона', icon: '📦' },
  { id: 'pack_foil', name: 'Фольга', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 20, description: 'Алюминиевая медицинская фольга с термолаком', icon: '✨' },
  { id: 'pack_plastic_blister', name: 'Пластиковый блистер', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 20, description: 'Прозрачный ПВХ блистер с фольгированной подложкой', icon: '💊' },
  { id: 'pack_tubus', name: 'Тубус', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 2, packSize: 10, description: 'Пластиковый герметичный тубус с осушителем в крышке', icon: '🧪' },
  { id: 'pack_dark_jar', name: 'Тёмная банка', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 3, packSize: 10, description: 'Янтарное светозащитное стекло от уф-излучения', icon: '🫙' },
  { id: 'pack_grey_foil', name: 'Серая фольга', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 4, packSize: 10, description: 'Светонепроницаемая серебряно-серая плотная фольга', icon: '🛡️' },
  { id: 'pack_capsule_pkg', name: 'Капсульная упаковка', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 5, packSize: 10, description: 'Желатиновые двухсоставные капсулы с блистером', icon: '💊' },
  { id: 'pack_shell_blister', name: 'Оболочка + блистер', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 6, packSize: 10, description: 'Кишечнорастворимая пленочная оболочка в блистере', icon: '💊' },
  { id: 'pack_capsule', name: 'Капсула', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 6, packSize: 10, description: 'Кислотоустойчивые непрозрачные капсулы', icon: '💊' },
  { id: 'pack_thermo', name: 'Термоупаковка', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 7, packSize: 10, description: 'Термоизолирующий слой для защиты чувствительных веществ', icon: '🧊' },
  { id: 'pack_sealed_blister', name: 'Герметичный блистер', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 10, packSize: 10, description: 'Вакуумированный влагозащищенный металлизированный блистер', icon: '🔒' },
  { id: 'pack_protected_blister', name: 'Защищённый блистер', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 12, packSize: 10, description: 'Блистер с детской защитой от вскрытия Push-Through', icon: '🛡️' },
  { id: 'pack_blister', name: 'Блистер', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 12, packSize: 10, description: 'Классический блистер строгого фармакопейного стандарта', icon: '💊' },
  { id: 'pack_granule_capsule', name: 'Капсула с гранулами', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 20, packSize: 10, description: 'Прозрачная капсула со сфераметрическими микрогранулами', icon: '💊' },
  { id: 'pack_tamper_proof', name: 'Защита от вскрытия', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 30, packSize: 10, description: 'Бронированная крипто-упаковка с индикатором первого вскрытия', icon: '🔐' },
  { id: 'pack_glass_ampoules', name: 'Стеклянные ампулы', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 45, packSize: 10, description: 'Нейтральное медицинское ампульное стекло с точкой излома', icon: '🧪' },
  { id: 'pack_laminated_patch', name: 'Ламинированный пластырь', category: 'packaging', licenseRequired: 'pharma_license', unitPrice: 100, packSize: 5, description: 'Многослойный водонепроницаемый фольгированный пластырь', icon: '🩹' },

  // --- 📝 БЛАНКИ, ПЕЧАТИ И РАСХОДНИКИ ПОДДЕЛКИ (BLANKS & FORGERY SUPPLIES) ---
  { id: 'clean_blank_107_1u', name: 'Чистый бланк 107-1/у (Rx)', category: 'blanks', licenseRequired: 'pharma_license', unitPrice: 25, packSize: 5, description: 'Официальный типографский чистый бланковый лист формы 107-1/у', icon: '📜' },
  { id: 'clean_blank_148_1u_88', name: 'Чистый бланк 148-1/у-88 (Особый Учёт)', category: 'blanks', licenseRequired: 'pharma_license', unitPrice: 65, packSize: 5, description: 'Бланковый лист особого учета с индивидуальной серией', icon: '📋' },
  { id: 'clean_blank_107_u_np', name: 'Чистый спецбланк 107/у-НП (Элитный)', category: 'blanks', licenseRequired: 'pharma_license', unitPrice: 180, packSize: 3, description: 'Розовый бланковый документ с водяными знаками и защитной сеткой', icon: '🎟️' },
  { id: 'clean_dea_222_quota', name: 'Квотный бланк DEA-222 (Заказ Опта)', category: 'blanks', licenseRequired: 'pharma_license', unitPrice: 350, packSize: 1, description: 'Форма государственного заказа оптовых партий элитных сырьевых баз', icon: '🏛️' },
  { id: 'doctor_stamp_kit', name: 'Штамп и печать врача (Набор)', category: 'blanks', licenseRequired: 'pharma_license', unitPrice: 400, packSize: 1, description: 'Клише врачебной печати "Для рецептов" и личная подпись врача', icon: '🪪' },
  { id: 'forgery_ink_and_paper', name: 'Чернила и бумаги для подделки', category: 'blanks', licenseRequired: 'pharma_license', unitPrice: 120, packSize: 5, description: 'Специальные штемпельные чернила и копировальная бумага', icon: '🖊️' }
];
