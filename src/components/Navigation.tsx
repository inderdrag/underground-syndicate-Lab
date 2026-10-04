import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Package,
  Settings,
  ChevronDown,
  Check,
  Flame,
  Clock,
  Layers,
  Smartphone,
  Download,
  Share2,
  HelpCircle
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
  const [showSystemMenu, setShowSystemMenu] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showInstallGuideModal, setShowInstallGuideModal] = useState(false);
  const [showWorkshopsSheet, setShowWorkshopsSheet] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Check if running as installed PWA and listen for install prompt
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
      setIsStandalone(isPWA);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Close system dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(target) &&
        mobileMenuRef.current && !mobileMenuRef.current.contains(target)
      ) {
        setShowSystemMenu(false);
      }
    };
    if (showSystemMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSystemMenu]);

  const handleInstallClick = async () => {
    hapticFeedback.medium();
    sounds.playClick();
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } catch (err) {
        setShowInstallGuideModal(true);
      }
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const handleDownloadOfflineGame = () => {
    hapticFeedback.medium();
    sounds.playCash();
    const link = document.createElement('a');
    link.href = '/Underground-Syndicate-Game.html';
    link.download = 'Underground-Syndicate-Game.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fontOptions: { id: FontTheme; name: string; preview: string; desc: string }[] = [
    { id: 'inter', name: 'Inter', preview: 'Inter', desc: 'Четкий гротеск' },
    { id: 'golos', name: 'Golos', preview: 'Golos Text', desc: 'Читаемый интерфейс' },
    { id: 'unbounded', name: 'Unbounded', preview: 'Unbounded', desc: 'Киберпанк-стиль' },
    { id: 'system', name: 'System', preview: 'Системный', desc: 'Шрифт ОС' },
  ];

  const productionPhases: GamePhase[] = ['botany', 'mycology', 'synthesis', 'powder_refinery', 'pharma_lab'];
  const isProductionActive = productionPhases.includes(currentPhase);

  // 14 Workshops & Sections for Mobile Bottom Sheet
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
      label: language === 'ru' ? '🏭 Лаборатории' : '🏭 Labs & Prod',
      isActive: isProductionActive,
      onClick: () => onSelectPhase(isProductionActive ? currentPhase : 'botany'),
    },
    {
      id: 'pharma_facade',
      label: language === 'ru' ? '🏥 Аптека' : '🏥 Pharmacy',
      isActive: currentPhase === 'pharma_facade' || (currentPhase as string) === 'pharmacy_group',
      onClick: () => onSelectPhase('pharma_facade'),
    },
    {
      id: 'megastore',
      label: language === 'ru' ? '🛒 Мегамаркет' : '🛒 Megastore',
      isActive: currentPhase === 'megastore',
      onClick: () => onSelectPhase('megastore'),
    },
    {
      id: 'side_jobs',
      label: language === 'ru' ? '🏃 Подработки' : '🏃 Side Jobs',
      isActive: currentPhase === 'side_jobs',
      onClick: () => onSelectPhase('side_jobs'),
    },
    {
      id: 'economy',
      label: language === 'ru' ? '💰 Сбыт & Рынок' : '💰 Market',
      isActive: currentPhase === 'economy',
      onClick: () => onSelectPhase('economy'),
    },
    {
      id: 'upkeep',
      label: language === 'ru' ? '⚙️ База' : '⚙️ Operations',
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
    { id: 'mycology', label: language === 'ru' ? '🍄 Грибы' : '🍄 Mycology', icon: '🍄' },
    { id: 'synthesis', label: language === 'ru' ? '🧪 Хим-синтез' : '🧪 Synthesis', icon: '🧪' },
    { id: 'powder_refinery', label: language === 'ru' ? '📦 Порошковый цех' : '📦 Refinery', icon: '📦' },
    { id: 'pharma_lab', label: language === 'ru' ? '💊 PHARMA' : '💊 Pharma Lab', icon: '💊' },
  ];

  // Shared System Menu Dropdown Content
  const renderSystemMenuContent = () => (
    <div className="space-y-3.5 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
          <Settings className="w-4 h-4" />
          <span>{language === 'ru' ? 'СИСТЕМА И НАСТРОЙКИ' : 'SYSTEM & SETTINGS'}</span>
        </div>
        <button
          onClick={() => setShowSystemMenu(false)}
          className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors min-h-[32px] min-w-[32px]"
          aria-label="Закрыть"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Install to Phone / Download Standalone HTML */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{language === 'ru' ? 'Установка и офлайн-доступ:' : 'Install & Offline Play:'}</span>
        </span>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              setShowSystemMenu(false);
              handleInstallClick();
            }}
            className="p-2.5 bg-gradient-to-r from-emerald-500/25 to-teal-500/25 hover:from-emerald-500/35 hover:to-teal-500/35 border border-emerald-500/50 rounded-xl text-left flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[58px]"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-base">📲</span>
              <span className="text-[9px] font-mono text-emerald-300 font-bold uppercase">PWA</span>
            </div>
            <div>
              <strong className="text-xs font-bold text-white block">
                {isStandalone ? (language === 'ru' ? 'Установлено' : 'Installed') : (language === 'ru' ? 'На телефон' : 'Install App')}
              </strong>
              <span className="text-[9px] text-slate-300 font-mono">
                {language === 'ru' ? 'Как приложение' : 'Home screen'}
              </span>
            </div>
          </button>

          <button
            onClick={() => {
              setShowSystemMenu(false);
              handleDownloadOfflineGame();
            }}
            className="p-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 rounded-xl text-left flex flex-col justify-between cursor-pointer active:scale-95 transition-all min-h-[58px]"
          >
            <div className="flex items-center justify-between w-full">
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="text-[9px] font-mono text-cyan-300 font-bold uppercase">HTML</span>
            </div>
            <div>
              <strong className="text-xs font-bold text-white block">
                {language === 'ru' ? 'Скачать .html' : 'Download HTML'}
              </strong>
              <span className="text-[9px] text-slate-300 font-mono">
                {language === 'ru' ? '100% офлайн файл' : 'Offline game'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Substance Sampling & Shaders (Дегустация) */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <span className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{language === 'ru' ? 'Дегустационная лаборатория:' : 'Substance Sampling Room:'}</span>
        </span>
        <button
          onClick={() => {
            hapticFeedback.medium();
            sounds.playPsychedelicChime();
            setShowSystemMenu(false);
            onTriggerSampleModal();
          }}
          className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-cyan-500/25 hover:from-emerald-500/35 hover:to-cyan-500/35 border border-emerald-500/50 hover:border-emerald-400 rounded-2xl text-left flex items-center justify-between transition-all cursor-pointer group shadow-lg shadow-emerald-500/10 active:scale-98 min-h-[48px]"
        >
          <div>
            <strong className="text-xs font-bold text-emerald-300 block flex items-center gap-1.5">
              <span>✨ {language === 'ru' ? 'Открыть Дегустацию Веществ' : 'Open Substance Sampler'}</span>
            </strong>
            <span className="text-[10px] font-mono text-slate-400">
              {language === 'ru' ? '16 эффектов, шейдеры и аудио-волны' : '16 effects, GL shaders & visual trip'}
            </span>
          </div>
          <span className="text-xs text-emerald-400 font-bold group-hover:translate-x-1 transition-transform font-mono">
            ➔
          </span>
        </button>
      </div>

      {/* 3. Language Switcher (Язык) */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ru' ? 'Язык интерфейса:' : 'Interface Language:'}</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-bold font-mono uppercase">{language}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
          <button
            onClick={() => {
              if (language !== 'ru') {
                hapticFeedback.light();
                sounds.playClick();
                onToggleLanguage();
              }
            }}
            className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
              language === 'ru'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
            }`}
          >
            <span>🇷🇺 Русский</span>
            {language === 'ru' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          <button
            onClick={() => {
              if (language !== 'en') {
                hapticFeedback.light();
                sounds.playClick();
                onToggleLanguage();
              }
            }}
            className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[40px] ${
              language === 'en'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-bold shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-white/5'
            }`}
          >
            <span>🇬🇧 English</span>
            {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* 4. Font Switcher (Шрифт Inter, Golos, Unbounded, System) */}
      <div className="space-y-1.5 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ru' ? 'Шрифт темы:' : 'Typography Theme:'}</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-bold font-mono uppercase">{activeFont}</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {fontOptions.map((opt) => {
            const isSelected = activeFont === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  hapticFeedback.light();
                  sounds.playClick();
                  onChangeFont(opt.id);
                }}
                className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[42px] ${
                  isSelected
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold shadow-sm'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-white/5'
                }`}
              >
                <div>
                  <div className="text-xs font-bold">{opt.preview}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{opt.desc}</div>
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Audio & Sounds and Reset */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <button
          onClick={() => {
            hapticFeedback.light();
            onToggleMute();
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[44px] ${
            isMuted
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10'
          }`}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? (language === 'ru' ? 'Звук: Выкл' : 'Muted') : (language === 'ru' ? 'Звук: Вкл' : 'Sound: ON')}</span>
        </button>

        <button
          onClick={() => {
            hapticFeedback.heavy();
            setShowSystemMenu(false);
            setShowResetModal(true);
          }}
          className="py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all min-h-[44px]"
          title="Сброс прогресса"
        >
          <RotateCcw className="w-4 h-4 text-rose-400" />
          <span>{language === 'ru' ? 'Сброс' : 'Reset'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 bg-[#090c12]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/60 pt-safe">
      {/* ================= MOBILE TOP APP BAR (Compact & Clean) ================= */}
      <div className="md:hidden flex items-center justify-between px-2.5 h-13 gap-1.5 border-b border-white/[0.04] relative">
        {/* Left: Brand */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isProductionActive && currentPhase !== 'botany' && (
            <button
              onClick={() => {
                hapticFeedback.light();
                sounds.playClick();
                onSelectPhase('botany');
              }}
              className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white cursor-pointer min-h-[36px] min-w-[36px]"
              aria-label="Назад"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('botany');
            }}
            className="flex items-center gap-1.5 text-xs font-black font-mono tracking-wider text-white hover:text-emerald-400 transition-colors py-1"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span>SYNDICATE</span>
          </button>
        </div>

        {/* Center: Vitals (Cash, Heat, Clock) */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <div className="px-2 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 font-extrabold text-[11px] tabular-nums">
            ${gameState.cash.toLocaleString()}
          </div>

          <div className={`px-1.5 py-1 rounded-lg border font-bold text-[11px] tabular-nums flex items-center gap-0.5 ${
            gameState.policeHeat > 50
              ? 'bg-rose-950/70 border-rose-500/50 text-rose-400 animate-pulse'
              : 'bg-[#141a24] border-white/10 text-slate-300'
          }`}>
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>{Math.round(gameState.policeHeat)}%</span>
          </div>

          <div className="px-1.5 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] text-slate-300 tabular-nums">
            Д.{gameState.day} {String(gameState.hour).padStart(2, '0')}:00
          </div>
        </div>

        {/* Right: Unified System & Settings Trigger */}
        <div className="relative shrink-0" ref={mobileMenuRef}>
          <button
            onClick={() => {
              hapticFeedback.medium();
              sounds.playClick();
              setShowSystemMenu(!showSystemMenu);
            }}
            className={`p-2 rounded-xl border flex items-center justify-center transition-all cursor-pointer active:scale-95 min-h-[38px] min-w-[38px] ${
              showSystemMenu
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/30 font-bold'
                : 'bg-[#121824] hover:bg-[#1a2333] text-emerald-400 border-white/10'
            }`}
            title="Меню настроек, дегустации и языка"
            aria-label="Настройки и дегустация"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* MOBILE SYSTEM MENU POPOVER */}
        {showSystemMenu && (
          <div className="absolute right-2 top-14 w-[calc(100vw-1rem)] max-w-sm bg-[#0d121c]/98 backdrop-blur-2xl border border-emerald-500/40 rounded-3xl shadow-[0_15px_60px_rgba(0,0,0,0.95)] p-4 z-50 animate-fadeIn">
            {renderSystemMenuContent()}
          </div>
        )}
      </div>

      {/* ================= DESKTOP TOP APP BAR ================= */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 lg:px-6 h-14 items-center justify-between gap-3">
        {/* Zone 1: Brand & Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('botany');
            }}
            className="flex items-center gap-2.5 text-sm lg:text-base font-black tracking-tight text-white hover:text-emerald-400 transition-all cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center group-hover:border-emerald-400 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            </div>
            <span className="font-mono">{t.brandTitle}</span>
          </button>
        </div>

        {/* Zone 2: Grouped Navigation Hubs (Clean segmented dock) */}
        <nav className="flex items-center gap-1 bg-[#101622]/90 p-1 rounded-2xl border border-white/[0.08] shadow-inner text-xs font-mono font-bold text-slate-200">
          {mainHubs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                hapticFeedback.light();
                sounds.playClick();
                item.onClick();
              }}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                item.isActive
                  ? 'bg-gradient-to-r from-emerald-500/25 to-teal-500/25 text-emerald-300 shadow-sm border border-emerald-500/40 font-extrabold'
                  : 'hover:text-white hover:bg-white/[0.06] text-slate-400'
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Zone 3: Unified System & Options Menu Dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setShowSystemMenu(!showSystemMenu);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer active:scale-95 shadow-md ${
              showSystemMenu
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20'
                : 'bg-[#121824] hover:bg-[#1a2333] text-slate-200 border-white/10 hover:border-emerald-500/40'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${showSystemMenu ? 'text-slate-950' : 'text-emerald-400'}`} />
            <span>{language === 'ru' ? 'Опции & Дегустация' : 'Options & Sample'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 border border-white/10 uppercase">
              {language} · {activeFont}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSystemMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* DESKTOP POPOVER MENU */}
          {showSystemMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d121c]/98 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl shadow-[0_15px_50px_rgba(0,0,0,0.8)] p-4 z-50 text-slate-100 font-sans space-y-4 animate-fadeIn">
              {renderSystemMenuContent()}
            </div>
          )}
        </div>
      </div>

      {/* ================= PRODUCTION SUB-NAV STRIP ================= */}
      {isProductionActive && (
        <div className="bg-[#06090e]/95 border-t border-white/[0.05] px-2.5 sm:px-6 py-1.5 overflow-x-auto scrollbar-none shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-emerald-400 font-bold text-[11px] font-mono uppercase tracking-wider shrink-0 mr-1">
              <Layers className="w-3 h-3" />
              <span>Цех:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full">
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
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shrink-0 min-h-[38px] ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 font-black scale-102'
                        : 'bg-[#101520] text-slate-300 hover:bg-[#182030] border border-white/5'
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

      {/* ================= DESKTOP PERSISTENT STRATEGIC STAT STRIP ================= */}
      <div className="hidden md:block border-t border-white/[0.06] bg-[#0b0f16]/90 backdrop-blur-md px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Card 1: Funds & Crypto */}
          <div className="flex items-center gap-4 bg-[#0e1420] px-3 py-1.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans text-xs">{t.cash}:</span>
              <span className="text-emerald-400 font-black tabular-nums text-sm">
                ${gameState.cash.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-3.5 bg-white/10" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs">XMR:</span>
              <span className="text-amber-400 tabular-nums font-bold text-xs">
                {gameState.cryptoXmr.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Card 2: Risk & Police Heat */}
          <div className="flex items-center gap-3 bg-[#0e1420] px-3 py-1.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-3.5 h-3.5 ${gameState.policeHeat > 50 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              <span className="text-slate-400 text-xs">Розыск:</span>
              <span className={`tabular-nums font-bold text-xs ${
                gameState.policeHeat > 60 ? 'text-rose-400' : gameState.policeHeat > 30 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {Math.round(gameState.policeHeat)}%
              </span>
              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-white/10">
                <div
                  className={`h-full transition-all duration-500 ${
                    gameState.policeHeat > 60 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : gameState.policeHeat > 30 ? 'bg-amber-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, gameState.policeHeat)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Simulation Day, Time & Speed */}
          <div className="flex items-center gap-3 bg-[#0e1420] px-3 py-1.5 rounded-xl border border-white/5 text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-200 font-bold">{t.day} {gameState.day}</span>
              <span className="text-emerald-400 tabular-nums font-bold flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {String(gameState.hour).padStart(2, '0')}:00
              </span>
            </div>

            {/* Speed Multipliers */}
            {onChangeSpeed && (
              <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-0.5 gap-0.5">
                {[1, 2, 3].map((sp) => {
                  const active = (gameState.timeSpeedMultiplier || 1) === sp;
                  return (
                    <button
                      key={sp}
                      onClick={() => {
                        hapticFeedback.light();
                        sounds.playClick();
                        onChangeSpeed(sp);
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        active
                          ? sp === 3
                            ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.8)] scale-105 font-black'
                            : sp === 2
                            ? 'bg-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-105 font-black'
                            : 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(52,211,153,0.8)] scale-105 font-black'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                      title={`Скорость симуляции x${sp}`}
                    >
                      x{sp}
                    </button>
                  );
                })}
              </div>
            )}

            {/* End Day Button */}
            {onTriggerDayEnd && (
              <button
                onClick={() => {
                  hapticFeedback.medium();
                  sounds.playClick();
                  onTriggerDayEnd();
                }}
                className="px-2.5 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold cursor-pointer active:scale-95 shrink-0"
              >
                День ➔
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080b12]/98 backdrop-blur-2xl border-t border-white/15 shadow-[0_-10px_35px_rgba(0,0,0,0.9)] pb-safe">
        <div className="grid grid-cols-5 gap-1 px-1.5 py-2">
          {/* 1. Лабы */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setShowWorkshopsSheet(true);
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[50px] ${
              isProductionActive
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-sm'
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
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[50px] ${
              currentPhase === 'pharma_facade'
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-sm'
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
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[50px] ${
              currentPhase === 'economy'
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className={`w-5 h-5 ${currentPhase === 'economy' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Сбыт</span>
          </button>

          {/* 4. Мегамаркет */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              onSelectPhase('megastore');
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[50px] ${
              currentPhase === 'megastore'
                ? 'bg-emerald-500/25 text-emerald-300 font-extrabold border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className={`w-5 h-5 ${currentPhase === 'megastore' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="text-[10px] tracking-tight leading-none mt-1 font-mono font-bold">Склад</span>
          </button>

          {/* 5. Меню Еще... */}
          <button
            onClick={() => {
              hapticFeedback.light();
              sounds.playClick();
              setShowMoreSheet(true);
            }}
            className="flex flex-col items-center justify-center py-1.5 rounded-xl text-slate-400 hover:text-slate-200 transition-all cursor-pointer active:scale-95 min-h-[50px]"
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
                className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer active:scale-98 min-h-[56px] ${
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

                <div className="text-xs font-mono font-bold text-emerald-400 shrink-0 ml-2">
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
        <div className="space-y-3.5">
          {/* Direct Install and Download Actions on Mobile */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                setShowMoreSheet(false);
                handleInstallClick();
              }}
              className="p-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[72px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">📲</span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">PWA</span>
              </div>
              <div>
                <strong className="text-xs font-bold text-emerald-300 block">
                  {isStandalone ? 'Установлено' : 'Установить на телефон'}
                </strong>
                <span className="text-[10px] text-slate-300 font-mono">Ярлык на экране</span>
              </div>
            </button>

            <button
              onClick={() => {
                setShowMoreSheet(false);
                handleDownloadOfflineGame();
              }}
              className="p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[72px]"
            >
              <div className="flex items-center justify-between">
                <Download className="w-5 h-5 text-cyan-400" />
                <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase">HTML</span>
              </div>
              <div>
                <strong className="text-xs font-bold text-cyan-300 block">Скачать .html файл</strong>
                <span className="text-[10px] text-slate-300 font-mono">100% офлайн игра</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playClick();
                onSelectPhase('side_jobs');
                setShowMoreSheet(false);
              }}
              className="p-3.5 bg-[#121722] border border-white/10 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[70px]"
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
              className="p-3.5 bg-[#121722] border border-white/10 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[70px]"
            >
              <Shield className="w-5 h-5 text-amber-400" />
              <div>
                <strong className="text-xs font-bold text-white block">Инфраструктура</strong>
                <span className="text-[10px] text-slate-400 font-mono">Панели & фильтры</span>
              </div>
            </button>

            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playClick();
                onSelectPhase('handbook');
                setShowMoreSheet(false);
              }}
              className="p-3.5 bg-[#121722] border border-white/10 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[70px]"
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
                className="p-3.5 bg-amber-950/30 border border-amber-500/40 rounded-2xl text-left flex flex-col justify-between space-y-2 cursor-pointer active:scale-95 min-h-[70px]"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <strong className="text-xs font-bold text-amber-300 block">Мини-Игры</strong>
                  <span className="text-[10px] text-slate-400 font-mono">Челленджи</span>
                </div>
              </button>
            )}
          </div>

          <div className="pt-3 border-t border-white/10 space-y-2.5">
            <button
              onClick={() => {
                hapticFeedback.medium();
                sounds.playPsychedelicChime();
                onTriggerSampleModal();
                setShowMoreSheet(false);
              }}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 font-bold text-xs rounded-2xl shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95 min-h-[50px]"
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

      {/* ================= PWA INSTALLATION GUIDE MODAL (PORTAL) ================= */}
      {showInstallGuideModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-fadeIn">
          <div className="bg-[#0e1420] border border-emerald-500/40 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-base">
                <Smartphone className="w-5 h-5" />
                <span>Установка игры на телефон</span>
              </div>
              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer min-h-[40px] min-w-[40px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-200">
              {/* Android Instructions */}
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl space-y-2">
                <div className="font-bold text-emerald-300 flex items-center gap-2 text-sm">
                  <span>🤖 Для Android (Chrome / Яндекс / Brave):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <li>Нажмите три точки <strong>⋮</strong> в правом верхнем углу браузера.</li>
                  <li>Выберите <strong>«Установить приложение»</strong> или <strong>«Добавить на главный экран»</strong>.</li>
                  <li>Игра установится как полноценное приложение и сможет работать без интернета!</li>
                </ol>
              </div>

              {/* iOS Safari Instructions */}
              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-2">
                <div className="font-bold text-indigo-300 flex items-center gap-2 text-sm">
                  <span>🍎 Для iPhone / iPad (Safari):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 leading-relaxed font-sans">
                  <li>Внизу экрана Safari нажмите кнопку <strong>«Поделиться»</strong> <Share2 className="inline w-3.5 h-3.5 text-indigo-300" /> (квадрат со стрелкой вверх).</li>
                  <li>Прокрутите вниз и нажмите <strong>«На экран «Домой»»</strong> (Add to Home Screen).</li>
                  <li>Нажмите <strong>«Добавить»</strong> в правом верхнем углу.</li>
                </ol>
              </div>

              {/* Standalone HTML File Option */}
              <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <strong className="text-xs font-bold text-cyan-300 block">Прямое скачивание файла:</strong>
                  <span className="text-[10px] text-slate-400">Сохранить игру как один .html файл</span>
                </div>
                <button
                  onClick={() => {
                    setShowInstallGuideModal(false);
                    handleDownloadOfflineGame();
                  }}
                  className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-mono text-xs font-bold cursor-pointer active:scale-95 shrink-0"
                >
                  Скачать ➔
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInstallGuideModal(false)}
                className="w-full py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors"
              >
                Понятно
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= RESET GAME CONFIRMATION MODAL (PORTAL) ================= */}
      {showResetModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
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
        </div>,
        document.body
      )}
    </header>
  );
};
