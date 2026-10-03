import React, { useState } from 'react';
import { GamePhase, GameState } from '../types/game';
import { Volume2, VolumeX, ShieldAlert, Zap, DollarSign, Sun, Sparkles, Languages, Type, RotateCcw, AlertTriangle, X, Sliders, Factory, Cross, ShoppingCart, Truck, TrendingUp, Shield, BookOpen } from 'lucide-react';
import { MiniGameType } from './MiniGameManager';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';

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

  const fontOptions: { id: FontTheme; name: string; preview: string }[] = [
    { id: 'inter', name: 'Inter', preview: 'Inter (Чёткий)' },
    { id: 'golos', name: 'Golos', preview: 'Golos Text' },
    { id: 'unbounded', name: 'Unbounded', preview: 'Unbounded' },
    { id: 'system', name: 'System', preview: 'Системный' },
  ];

  const productionPhases: GamePhase[] = ['botany', 'mycology', 'synthesis', 'powder_refinery', 'pharma_lab'];
  const isProductionActive = productionPhases.includes(currentPhase);

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

  const mobileTabs = [
    {
      id: 'production_hub',
      label: language === 'ru' ? 'Цех' : 'Labs',
      icon: Factory,
      isActive: isProductionActive,
      onClick: () => onSelectPhase(isProductionActive ? currentPhase : 'botany'),
    },
    {
      id: 'pharma_facade',
      label: language === 'ru' ? 'Аптека' : 'Pharma',
      icon: Cross,
      isActive: currentPhase === 'pharma_facade',
      onClick: () => onSelectPhase('pharma_facade'),
    },
    {
      id: 'megastore',
      label: language === 'ru' ? 'Маркет' : 'Market',
      icon: ShoppingCart,
      isActive: currentPhase === 'megastore',
      onClick: () => onSelectPhase('megastore'),
    },
    {
      id: 'side_jobs',
      label: language === 'ru' ? 'Курьер' : 'Courier',
      icon: Truck,
      isActive: currentPhase === 'side_jobs',
      onClick: () => onSelectPhase('side_jobs'),
    },
    {
      id: 'economy',
      label: language === 'ru' ? 'Сбыт' : 'Sales',
      icon: TrendingUp,
      isActive: currentPhase === 'economy',
      onClick: () => onSelectPhase('economy'),
    },
    {
      id: 'upkeep',
      label: language === 'ru' ? 'База' : 'Base',
      icon: Shield,
      isActive: currentPhase === 'upkeep',
      onClick: () => onSelectPhase('upkeep'),
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#090c10]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-lg shadow-black/40">
      {/* 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            sounds.playClick();
            onSelectPhase('botany');
          }}
          className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-all cursor-pointer group shrink-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#10b981] group-hover:scale-125 transition-transform" />
          <span>{t.brandTitle}</span>
        </button>

        {/* Zone 2: 5 Clean Primary Hubs */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#141a24]/90 p-1.5 rounded-xl border border-white/[0.08] text-xs font-mono font-bold text-slate-200">
          {mainHubs.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                item.onClick();
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                item.isActive
                  ? 'bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : 'hover:text-white hover:bg-white/[0.06] text-slate-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1-2 primary actions & toggles */}
        <div className="flex items-center gap-2">
          {/* Font Selector */}
          <div className="relative">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-[#141923] hover:bg-[#1c2332] text-slate-200 border border-white/10 rounded-lg transition-all cursor-pointer active:scale-95"
              title="Выбрать шрифт / Change font"
            >
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline font-mono capitalize">{activeFont}</span>
            </button>

            {showFontMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-[#121822] border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 flex flex-col gap-1">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 border-b border-white/5 uppercase tracking-wider">
                  {language === 'ru' ? 'Шрифт интерфейса' : 'Interface Font'}
                </div>
                {fontOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      sounds.playClick();
                      onChangeFont(opt.id);
                      setShowFontMenu(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs text-left flex items-center justify-between cursor-pointer transition-colors ${
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
              sounds.playClick();
              onToggleLanguage();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold bg-[#141923] hover:bg-[#1c2332] text-slate-200 border border-white/10 rounded-lg transition-all cursor-pointer active:scale-95"
            title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tracking-wider">{language.toUpperCase()}</span>
          </button>

          <button
            onClick={() => {
              sounds.playPsychedelicChime();
              onTriggerSampleModal();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">{t.sampleFxButton}</span>
          </button>

          {/* Interactive MiniGame Manager Launcher */}
          {onOpenMiniGameManager && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenMiniGameManager('lsd_dosing');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              title={language === 'ru' ? 'Лабораторные Мини-Игры & Челленджи' : 'Crafting MiniGames & Challenges'}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">{language === 'ru' ? 'Мини-Игры' : 'MiniGames'}</span>
            </button>
          )}

          {/* New Game Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowResetModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-lg transition-all cursor-pointer active:scale-95"
            title={language === 'ru' ? 'Начать новую игру' : 'Start New Game'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">{language === 'ru' ? 'Сброс' : 'Reset'}</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer"
            aria-label={isMuted ? t.unmuteSounds : t.muteSounds}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Production Sub-Nav Strip (when inside any production workshop) */}
      {isProductionActive && (
        <div className="bg-[#06090e]/90 border-t border-white/[0.05] px-4 sm:px-6 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
              <span className="text-emerald-400 font-bold uppercase tracking-wider">Цех:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {productionSubTabs.map((tab) => {
                const isCurrent = currentPhase === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      sounds.playClick();
                      onSelectPhase(tab.id);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md font-extrabold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white border border-white/5'
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

      {/* Mobile Bottom-Tab Fixed Navigation Bar (Screen-efficient bottom navigation for smartphones) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#080b12]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-10px_35px_rgba(0,0,0,0.9)] pb-safe">
        {/* Production Sub-Tabs Strip on mobile if inside production */}
        {isProductionActive && (
          <div className="bg-[#0b0f18] border-b border-white/10 px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {productionSubTabs.map((tab) => {
              const isCurrent = currentPhase === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    onSelectPhase(tab.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 shrink-0 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Primary 6 Bottom Tabs Grid */}
        <div className="grid grid-cols-6 gap-0.5 px-1 py-1.5">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  tab.onClick();
                }}
                className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 min-h-[44px] ${
                  tab.isActive
                    ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-[9px] tracking-tight leading-none mt-1 font-mono font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Persistent Strategic Stat Strip */}
      <div className="border-t border-white/[0.06] bg-[#0c1017]/80 backdrop-blur-md px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          {/* Funds & Crypto */}
          <div className="flex items-center gap-5 text-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-sans text-xs font-medium">{t.cash}</span>
              <span className="text-emerald-400 font-bold tabular-nums text-sm tracking-tight">
                ${gameState.cash.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-xs font-semibold">XMR</span>
              <span className="text-amber-400 tabular-nums font-semibold">
                {gameState.cryptoXmr.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 hidden sm:flex">
              <span className="text-slate-400 text-xs font-semibold">BTC</span>
              <span className="text-orange-400 tabular-nums">
                {gameState.cryptoBtc.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Risk & Police Heat */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className={`w-3.5 h-3.5 ${gameState.policeHeat > 50 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`} />
              <span className="text-slate-300 font-sans text-xs font-medium">{t.heat}</span>
              <span className={`tabular-nums font-bold ${
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

            {/* Power grid vs solar */}
            <div className="flex items-center gap-1.5 text-slate-300 hidden lg:flex">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-sans text-xs">{t.power}</span>
              <span className="text-slate-100 tabular-nums font-semibold">
                {gameState.totalPowerWatts}W
              </span>
              <span className="text-slate-400 text-xs font-medium">({gameState.solarPanels * 400}W {t.solarOffset})</span>
            </div>

            {/* Simulation Day & Speed */}
            <div className="flex items-center gap-2.5 text-slate-300">
              <span className="text-slate-200 font-sans font-semibold">{t.day} {gameState.day}</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-400 tabular-nums font-bold text-sm">
                {String(gameState.hour).padStart(2, '0')}:00
              </span>

              {/* Time Speed Control Buttons */}
              <div className="flex items-center gap-1 bg-[#141923] p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                {[
                  { speed: 1.0, label: '1x' },
                  { speed: 2.0, label: '2x' },
                  { speed: 4.0, label: '4x' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => {
                      sounds.playClick();
                      if (onChangeSpeed) onChangeSpeed(btn.speed);
                    }}
                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors font-bold ${
                      (gameState.timeSpeedMultiplier || 1.0) === btn.speed
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* End Day Manual Trigger Button */}
              {onTriggerDayEnd && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onTriggerDayEnd();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-mono font-bold cursor-pointer transition-all shadow-xs active:scale-95"
                >
                  {language === 'ru' ? 'Завершить день ➔' : 'End Day ➔'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
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
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  sounds.playCash();
                  setShowResetModal(false);
                  onResetGame();
                }}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
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

