import React, { useState } from 'react';
import { GamePhase, GameState } from '../types/game';
import {
  Volume2,
  VolumeX,
  ShieldAlert,
  Zap,
  Type,
  RotateCcw,
  AlertTriangle,
  X,
  Factory,
  Cross,
  ShoppingCart,
  Truck,
  TrendingUp,
  Shield,
  BookOpen,
  ChevronLeft,
  Grid,
  Menu,
  Languages,
  Sparkles,
  Package
} from 'lucide-react';
import { MiniGameType } from './MiniGameManager';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { hapticFeedback } from '../utils/haptics';
import { MobileBottomSheet } from './MobileBottomSheet';

export type FontTheme = 'inter' | 'golos' | 'unbounded' | 'system';

interface NavigationProps {
  currentPhase: GamePhase;
  onSelectPhase: (phase: GamePhase) => void;
  gameState: GameState;
  isMuted: boolean;
  onToggleMute: () => void;
  onTriggerSampleModal: () => void;
  onOpenMiniGameManager?: (gameType?: MiniGameType) => void;
  onResetGame: () => void;
  onChangeSpeed?: (speed: number) => void;
  onTriggerDayEnd?: () => void;
  language: Language;
  onToggleLanguage: () => void;
  activeFont: FontTheme;
  onChangeFont: (font: FontTheme) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPhase,
  onSelectPhase,
  gameState,
  isMuted,
  onToggleMute,
  onTriggerSampleModal,
  onOpenMiniGameManager,
  onResetGame,
  onChangeSpeed,
  onTriggerDayEnd,
  language,
  onToggleLanguage,
  activeFont,
  onChangeFont,
}) => {
  const t = translations[language];
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showWorkshopsSheet, setShowWorkshopsSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const fontOptions: { id: FontTheme; name: string; preview: string }[] = [
    { id: 'inter', name: 'Inter', preview: 'Inter (Чёткий)' },
    { id: 'golos', name: 'Golos', preview: 'Golos Text' },
    { id: 'unbounded', name: 'Unbounded', preview: 'Unbounded' },
    { id: 'system', name: 'System', preview: 'Системный' },
  ];

  const productionPhases: GamePhase[] = ['botany', 'mycology', 'synthesis', 'powder_refinery', 'pharma_lab'];
  const isProductionActive = productionPhases.includes(currentPhase);

  // All 14 Workshops & Sections for the Mobile Bottom Sheet Selector
  const all14Workshops = [
    {
      id: 'botany' as GamePhase,
      nameRu: 'Каннабис (Ботаника)',
      descRu: 'Теплица гидропоники, N-Max и бустеры',
      icon: '🌿',
      category: 'Лаборатории'
    },
    {
      id: 'mycology' as GamePhase,
      nameRu: 'Псило-грибы (Микология)',
      descRu: 'Монотубы, споровые культуры «Астрал»',
      icon: '🍄',
      category: 'Лаборатории'
    },
    {
      id: 'synthesis' as GamePhase,
      nameRu: 'Хим-синтез ЛСД-25',
      descRu: '5-этапная рефлюксная реакция',
      icon: '🧪',
      category: 'Лаборатории'
    },
    {
      id: 'powder_refinery' as GamePhase,
      nameRu: 'Порошковый цех «Аврора»',
      descRu: 'Очистка кристаллов и грейд S+',
      icon: '📦',
      category: 'Лаборатории'
    },
    {
      id: 'pharma_lab' as GamePhase,
      nameRu: 'Лаборатория PHARMA',
      descRu: 'Производство 22 фарма-препаратов',
      icon: '💊',
      category: 'Лаборатории'
    },
    {
      id: 'pharma_facade' as GamePhase,
      nameRu: 'Моя Аптека (Витрина)',
      descRu: 'Продажи клиентам, бланки Rx',
      icon: '🏥',
      category: 'Торговля'
    },
    {
      id: 'megastore' as GamePhase,
      nameRu: 'Теневой Мегамаркет',
      descRu: 'Оптовые поставки сырья и баз',
      icon: '🛒',
      category: 'Торговля'
    },
    {
      id: 'side_jobs' as GamePhase,
      nameRu: 'Подработки Курьера',
      descRu: 'Закладки и быстрый наличный чек',
      icon: '🏃',
      category: 'Торговля'
    },
    {
      id: 'economy' as GamePhase,
      nameRu: 'Сбыт & Черный рынок',
      descRu: 'Оптовые каналы и курсы крипты',
      icon: '💰',
      category: 'Управление'
    },
    {
      id: 'upkeep' as GamePhase,
      nameRu: 'Инфраструктура & База',
      descRu: 'Солнечные панели и фильтры',
      icon: '⚙️',
      category: 'Управление'
    },
    {
      id: 'handbook' as GamePhase,
      nameRu: 'База знаний (Справочник)',
      descRu: 'Руководство Синдиката и рецепты',
      icon: '📖',
      category: 'Справочник'
    }
  ];

  const mainHubs = [
    {
      id: 'production_hub',
      label: language === 'ru' ? '🏭 Производство' : '🏭 Labs & Production',
      isActive: isProductionActive,
      onClick: () => onSelectPhase(isProductionActive ? currentPhase : 'botany'),
    },
    {
      id: 'megastore',
      label: language === 'ru' ? '🛒 Мегамаркет' : '🛒 Megastore',
      isActive: currentPhase === 'megastore',
      onClick: () => onSelectPhase('megastore'),
    },
    {
      id: 'side_jobs',
      label: language === 'ru' ? '🏃 Подработки (Закладки)' : '🏃 Side Jobs (Courier)',
      isActive: currentPhase === 'side_jobs',
      onClick: () => onSelectPhase('side_jobs'),
    },
    {
      id: 'pharma_facade',
      label: language === 'ru' ? '🏥 Моя Аптека' : '🏥 My Pharmacy',
      isActive: currentPhase === 'pharma_facade' || (currentPhase as string) === 'pharmacy_group',
      onClick: () => onSelectPhase('pharma_facade'),
    },
    {
      id: 'economy',
      label: language === 'ru' ? '💰 Сбыт & Рынок' : '💰 Market & Blacknet',
      isActive: currentPhase === 'economy',
      onClick: () => onSelectPhase('economy'),
    },
    {
      id: 'upkeep',
      label: language === 'ru' ? '⚙️ Инфраструктура' : '⚙️ Operations & Base',
      isActive: currentPhase === 'upkeep',
      onClick: () => onSelectPhase('upkeep'),
    },
    {
      id: 'handbook',
      label: language === 'ru' ? '📖 База знаний' : '📖 Handbook',
      isActive: currentPhase === 'handbook',
      onClick: () => onSelectPhase('handbook'),
    },
  ];

  const productionSubTabs: { id: GamePhase; label: string; icon: string }[] = [
    { id: 'botany', label: language === 'ru' ? '🌿 Каннабис' : '🌿 Botany', icon: '🌿' },
    { id: 'mycology', label: language === 'ru' ? '🍄 Грибы «Астрал»' : '🍄 Mycology', icon: '🍄' },
    { id: 'synthesis', label: language === 'ru' ? '🧪 Хим-синтез' : '🧪 Synthesis', icon: '🧪' },
    { id: 'powder_refinery', label: language === 'ru' ? '📦 Порошковый цех' : '📦 Powder Refinery', icon: '📦' },
    { id: 'pharma_lab', label: language === 'ru' ? '💊 Препараты PHARMA' : '💊 Pharma Lab', icon: '💊' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#090c10]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40 pt-safe">
      {/* Top App Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Mobile Back Button / Brand Title */}
        <div className="flex items-center gap-2">
          {isProductionActive && currentPhase !== 'botany' && (
            <button
              onClick={() => {
                hapticFeedback.light();
                sounds.playClick();
                onSelectPhase('botany');
              }}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label="Назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('botany');
            }}
            className="flex items-center gap-2 text-sm sm:text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-all cursor-pointer group shrink-0"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] group-hover:scale-125 transition-transform" />
            <span className="truncate max-w-[140px] sm:max-w-none">{t.brandTitle}</span>
          </button>
        </div>

        {/* Zone 2: Desktop Navigation Hubs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#141a24]/90 p-1.5 rounded-xl border border-white/[0.08] text-xs font-mono font-bold text-slate-200">
          {mainHubs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                hapticFeedback.light();
                sounds.playClick();
                item.onClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                item.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'hover:text-white hover:bg-white/[0.06] text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Actions & Quick Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Funds Badge on Mobile */}
          <div className="md:hidden px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-mono font-extrabold text-xs">
            ${gameState.cash.toLocaleString()}
          </div>

          {/* Font Selector */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                hapticFeedback.light();
                setShowFontMenu(!showFontMenu);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#141923] hover:bg-[#1c2332] text-slate-200 border border-white/10 rounded-lg transition-all cursor-pointer active:scale-95 min-h-[44px]"
            >
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono capitalize">{activeFont}</span>
            </button>

            {showFontMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-[#121822] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                {fontOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      hapticFeedback.light();
                      sounds.playClick();
                      onChangeFont(opt.id);
                      setShowFontMenu(false);
                    }}
                    className={`px-2.5 py-2 rounded-lg text-xs text-left flex items-center justify-between cursor-pointer ${
                      activeFont === opt.id
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                        : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <span>{opt.preview}</span>
                    {activeFont === opt.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher RU / EN */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1 px-2 py-1.5 text-xs font-mono font-bold bg-[#141923] hover:bg-[#1c2332] text-slate-200 border border-white/10 rounded-lg transition-all cursor-pointer active:scale-95 min-h-[44px]"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wider text-[11px]">{language.toUpperCase()}</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={() => {
              hapticFeedback.light();
              onToggleMute();
            }}
            className="p-2 text-slate-400 hover:text-slate-100 rounded-lg transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isMuted ? t.unmuteSounds : t.muteSounds}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Production Sub-Nav Strip (when inside any production workshop) */}
      {isProductionActive && (
        <div className="bg-[#06090e]/90 border-t border-white/[0.05] px-3 sm:px-6 py-1.5 overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5">
            <span className="text-emerald-400 font-bold text-[10px] font-mono uppercase tracking-wider shrink-0 mr-1">
              Цех:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {productionSubTabs.map((tab) => {
                const isCurrent = currentPhase === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      hapticFeedback.light();
                      sounds.playClick();
                      onSelectPhase(tab.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md font-extrabold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Strategic Stat Strip */}
      <div className="border-t border-white/[0.06] bg-[#0c1017]/80 backdrop-blur-md px-3 sm:px-6 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          {/* Funds & Crypto */}
          <div className="flex items-center gap-3 sm:gap-5 text-slate-200">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-sans text-xs">{t.cash}</span>
              <span className="text-emerald-400 font-bold tabular-nums text-xs sm:text-sm">
                ${gameState.cash.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-xs">XMR</span>
              <span className="text-amber-400 tabular-nums font-semibold text-xs">
                {gameState.cryptoXmr.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Risk & Police Heat */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className={`w-3.5 h-3.5 ${gameState.policeHeat > 50 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`} />
              <span className={`tabular-nums font-bold text-xs ${
                gameState.policeHeat > 60 ? 'text-rose-400' : gameState.policeHeat > 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {Math.round(gameState.policeHeat)}%
              </span>
              <div className="w-12 sm:w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    gameState.policeHeat > 60 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : gameState.policeHeat > 30 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, gameState.policeHeat)}%` }}
                />
              </div>
            </div>

            {/* Simulation Day & Speed */}
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-200 font-semibold text-xs">{t.day} {gameState.day}</span>
              <span className="text-emerald-400 tabular-nums font-bold text-xs">
                {String(gameState.hour).padStart(2, '0')}:00
              </span>

              {/* End Day Button */}
              {onTriggerDayEnd && (
                <button
                  onClick={() => {
                    hapticFeedback.medium();
                    sounds.playClick();
                    onTriggerDayEnd();
                  }}
                  className="px-2 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold cursor-pointer active:scale-95 shrink-0"
                >
                  День ➔
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (THUMB ZONE 5-BUTTON BAR WITH SAFE AREA) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080b12]/95 backdrop-blur-2xl border-t border-white/15 shadow-[0_-10px_35px_rgba(0,0,0,0.9)] pb-safe">
        <div className="grid grid-cols-5 gap-1 px-1 py-1.5">
          {/* 1. Лабы (Opens Workshops Bottom Sheet) */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setShowWorkshopsSheet(true);
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[48px] ${
              isProductionActive
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Factory className={`w-5 h-5 ${isProductionActive ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Лабы</span>
          </button>

          {/* 2. Аптека */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('pharma_facade');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[48px] ${
              currentPhase === 'pharma_facade'
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cross className={`w-5 h-5 ${currentPhase === 'pharma_facade' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Аптека</span>
          </button>

          {/* 3. Сбыт */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('economy');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[48px] ${
              currentPhase === 'economy'
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${currentPhase === 'economy' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Сбыт</span>
          </button>

          {/* 4. Инвентарь (Мегамаркет & Склад) */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('megastore');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[48px] ${
              currentPhase === 'megastore'
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className={`w-5 h-5 ${currentPhase === 'megastore' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Инвентарь</span>
          </button>

          {/* 5. Еще... (Opens Mobile Bottom Sheet with secondary functions) */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setShowMoreSheet(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer active:scale-95 min-h-[48px]"
          >
            <Menu className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Еще</span>
          </button>
        </div>
      </nav>

      {/* MOBILE BOTTOM SHEET 1: SELECT WORKSHOP (14 LABS & WORKSHOPS) */}
      <MobileBottomSheet
        isOpen={showWorkshopsSheet}
        onClose={() => setShowWorkshopsSheet(false)}
        title="🏭 Выбор Цеха & Лаборатории"
        subtitle="Выберите активную производственную линию"
      >
        <div className="grid grid-cols-1 gap-2.5">
          {all14Workshops.map((w) => {
            const isSelected = currentPhase === w.id;
            return (
              <button
                key={w.id}
                onClick={() => {
                  hapticFeedback.medium();
                  sounds.playClick();
                  onSelectPhase(w.id);
                  setShowWorkshopsSheet(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-98 min-h-[52px] ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-lg ring-1 ring-emerald-500/30'
                    : 'bg-[#121722] border-white/10 hover:border-white/20 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{w.icon}</span>
                  <div>
                    <strong className="text-sm font-bold block leading-snug">{w.nameRu}</strong>
                    <span className="text-[11px] text-slate-400 font-mono">{w.descRu}</span>
                  </div>
                </div>

                <div className="text-xs font-mono font-bold text-emerald-400">
                  {isSelected ? '✓ Выбрано' : 'Открыть ➔'}
                </div>
              </button>
            );
          })}
        </div>
      </MobileBottomSheet>

      {/* MOBILE BOTTOM SHEET 2: MORE SECTIONS & SETTINGS */}
      <MobileBottomSheet
        isOpen={showMoreSheet}
        onClose={() => setShowMoreSheet(false)}
        title="📋 Главное Меню & Разделы"
        subtitle="Сбыт, инфраструктура, база знаний и настройки"
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playClick();
                onSelectPhase('side_jobs');
                setShowMoreSheet(false);
              }}
              className="p-3 bg-[#121722] border border-white/10 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[64px]"
            >
              <Truck className="w-5 h-5 text-emerald-400" />
              <div>
                <strong className="text-xs font-bold text-white block">Курьер & Закладки</strong>
                <span className="text-[10px] text-slate-400 font-mono">Подработки & Чек</span>
              </div>
            </button>

            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playClick();
                onSelectPhase('upkeep');
                setShowMoreSheet(false);
              }}
              className="p-3 bg-[#121722] border border-white/10 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[64px]"
            >
              <Shield className="w-5 h-5 text-amber-400" />
              <div>
                <strong className="text-xs font-bold text-white block">Инфраструктура</strong>
                <span className="text-[10px] text-slate-400 font-mono">Солнечные панели & фильтры</span>
              </div>
            </button>

            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playClick();
                onSelectPhase('handbook');
                setShowMoreSheet(false);
              }}
              className="p-3 bg-[#121722] border border-white/10 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[64px]"
            >
              <BookOpen className="w-5 h-5 text-cyan-400" />
              <div>
                <strong className="text-xs font-bold text-white block">База знаний</strong>
                <span className="text-[10px] text-slate-400 font-mono">Рецепты & Справочник</span>
              </div>
            </button>

            {onOpenMiniGameManager && (
              <button
                onClick={() => {
                  hapticFeedback.medium();
                  sounds.playClick();
                  onOpenMiniGameManager('lsd_dosing');
                  setShowMoreSheet(false);
                }}
                className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[64px]"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <strong className="text-xs font-bold text-amber-300 block">Мини-Игры</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Челленджи Синдиката</span>
                </div>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playPsychedelicChime();
                onTriggerSampleModal();
                setShowMoreSheet(false);
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[48px]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{t.sampleFxButton}</span>
            </button>

            <button
              onClick={() => {
                hapticFeedback.heavy();
                setShowMoreSheet(false);
                setShowResetModal(true);
              }}
              className="w-full py-3 px-4 bg-rose-950/50 border border-rose-500/40 text-rose-300 font-bold text-xs rounded-2xl cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[48px]"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Начать новую игру с нуля</span>
            </button>
          </div>
        </div>
      </MobileBottomSheet>

      {/* Reset Game Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0e121a] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>{language === 'ru' ? 'Начать новую игру?' : 'Start New Game?'}</span>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {language === 'ru'
                ? 'Вы уверены, что хотите начать чистую игру с нуля? Все растения, партии синтеза, весь склад и оборудование будут полностью удалены. Начальный капитал составит ровно $40.'
                : 'Are you sure you want to start a fresh game from scratch? All plants, synthesis batches, inventory and upgrades will be wiped. You will start with exactly $40 cash.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors min-h-[44px]"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  hapticFeedback.heavy();
                  sounds.playCash();
                  setShowResetModal(false);
                  onResetGame();
                }}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 min-h-[44px]"
              >
                {language === 'ru' ? 'Да, начать заново' : 'Yes, Restart Game'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
