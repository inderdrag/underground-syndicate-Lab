import React, { useState } from 'react';
import { GameState } from '../types/game';
import { calculateDailyUpkeep } from '../engine/simulationEngine';
import { Zap, Sun, ShieldAlert, Users, DollarSign, Home, AlertTriangle, CheckCircle, ShieldCheck, RotateCcw, X } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { hapticFeedback } from '../utils/haptics';
import { Language, translations } from '../i18n/translations';

interface UpkeepOperationsProps {
  gameState: GameState;
  onBuySolarPanel: () => void;
  onToggleGenerator: () => void;
  onInstallCarbonFilter: () => void;
  onHireEmployee: (role: 'trimmers' | 'labChemists' | 'couriers') => void;
  onFireEmployee: (role: 'trimmers' | 'labChemists' | 'couriers') => void;
  onToggleLawyerRetainer: () => void;
  onPayPoliceBribe: () => void;
  onAdvanceDay: () => void;
  onResetGame?: () => void;
  language: Language;
}

export const UpkeepOperations: React.FC<UpkeepOperationsProps> = ({
  gameState,
  onBuySolarPanel,
  onToggleGenerator,
  onInstallCarbonFilter,
  onHireEmployee,
  onFireEmployee,
  onToggleLawyerRetainer,
  onPayPoliceBribe,
  onAdvanceDay,
  onResetGame,
  language,
}) => {
  const t = translations[language];
  const upkeep = calculateDailyUpkeep(gameState);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <span>{t.upkeepBadge1}</span>
            <span aria-hidden="true">·</span>
            <span>{t.upkeepBadge2}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
            {t.upkeepTitle}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed font-medium">
            {t.upkeepDesc}
          </p>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onAdvanceDay();
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95"
        >
          <span>{t.cycle24h}: ${upkeep.totalDaily.toLocaleString()})</span>
        </button>
      </div>

      {/* Daily Upkeep Breakdown Bento */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0f141d] border border-white/[0.08] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Home className="w-4 h-4 text-emerald-400" />
            <span>{t.upkeepLease}</span>
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-2 tabular-nums">
            ${upkeep.baseRent} <span className="text-xs text-slate-500 font-normal">{t.perDay}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Undisclosed commercial unit.</p>
        </div>

        <div className="p-4 bg-[#0f141d] border border-white/[0.08] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{t.upkeepGrid}</span>
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-2 tabular-nums">
            ${upkeep.electricityCost} <span className="text-xs text-slate-500 font-normal">{t.perDay}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Draw: {upkeep.gridWatts}W ({upkeep.dailyKwh} kWh/day)
          </p>
        </div>

        <div className="p-4 bg-[#0f141d] border border-white/[0.08] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{t.upkeepPayroll}</span>
          </div>
          <div className="text-xl font-bold text-slate-100 font-mono mt-2 tabular-nums">
            ${upkeep.salaries} <span className="text-xs text-slate-500 font-normal">{t.perDay}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Staff payroll.</p>
        </div>

        <div className="p-4 bg-[#0f141d] border border-white/[0.08] rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <DollarSign className="w-4 h-4 text-rose-400" />
            <span>{t.upkeepTotal}</span>
          </div>
          <div className="text-xl font-bold text-rose-400 font-mono mt-2 tabular-nums">
            ${upkeep.totalDaily} <span className="text-xs text-slate-500 font-normal">{t.perDay}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">24h cycle.</p>
        </div>
      </section>

      {/* Power & Risk Mitigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Electricity & Power System */}
        <section className="bg-[#0f141d] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                {t.powerGridTitle}
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {t.totalLoad}: <strong className="text-slate-200">{upkeep.totalWatts}W</strong>
            </span>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">
            {t.powerGridDesc}
          </p>

          <div className="space-y-3">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200 font-mono">{t.solarTitle}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {t.installedPanels} <strong className="text-amber-400">{gameState.solarPanels}</strong> ({gameState.solarPanels * 400}W {t.offset})
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playCash();
                  onBuySolarPanel();
                }}
                disabled={gameState.cash < 950}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {t.buyPanel}
              </button>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200 font-mono">{t.carbonFilterTitle}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {t.installedFilters} <strong className="text-cyan-400">{gameState.carbonFiltersInstalled}</strong>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playCash();
                  onInstallCarbonFilter();
                }}
                disabled={gameState.cash < 420}
                className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {t.addFilter}
              </button>
            </div>
          </div>
        </section>

        {/* Right: Police Heat & Legal Shield */}
        <section className="bg-[#0f141d] border border-white/[0.08] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-lg font-bold text-white">
                {t.policeShieldTitle}
              </h2>
            </div>
            <span className={`text-xs font-mono font-bold ${gameState.policeHeat > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
              HEAT: {Math.round(gameState.policeHeat)}%
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200 font-mono">{t.lawyerTitle}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {t.lawyerDesc}
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playCash();
                  onToggleLawyerRetainer();
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  gameState.lawyerRetainerActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
              >
                {gameState.lawyerRetainerActive ? t.lawyerActive : t.retainLawyer}
              </button>
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-200 font-mono">{t.bribeTitle}</div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {t.bribeDesc}
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playCash();
                  onPayPoliceBribe();
                }}
                disabled={gameState.cash < 1800 || gameState.policeHeat < 10}
                className="px-3.5 py-1.5 bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t.payBribe}
              </button>
            </div>
          </div>

          {/* Employees Roster */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-300 font-mono uppercase">
              {t.staffRoster}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-center">
                <div className="text-neutral-400">{t.trimmers} ({gameState.employees.trimmers})</div>
                <div className="text-emerald-400 font-bold mt-1">$85/d</div>
                <div className="flex justify-center gap-2 mt-2">
                  <button onClick={() => onHireEmployee('trimmers')} className="text-neutral-200 hover:text-white cursor-pointer">+</button>
                  <button onClick={() => onFireEmployee('trimmers')} className="text-neutral-500 hover:text-red-400 cursor-pointer">-</button>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-center">
                <div className="text-neutral-400">{t.chemists} ({gameState.employees.labChemists})</div>
                <div className="text-purple-400 font-bold mt-1">$190/d</div>
                <div className="flex justify-center gap-2 mt-2">
                  <button onClick={() => onHireEmployee('labChemists')} className="text-neutral-200 hover:text-white cursor-pointer">+</button>
                  <button onClick={() => onFireEmployee('labChemists')} className="text-neutral-500 hover:text-red-400 cursor-pointer">-</button>
                </div>
              </div>

              <div className="p-2.5 bg-neutral-950 rounded border border-neutral-800 text-center">
                <div className="text-neutral-400">{t.couriers} ({gameState.employees.couriers})</div>
                <div className="text-amber-400 font-bold mt-1">$115/d</div>
                <div className="flex justify-center gap-2 mt-2">
                  <button onClick={() => onHireEmployee('couriers')} className="text-neutral-200 hover:text-white cursor-pointer">+</button>
                  <button onClick={() => onFireEmployee('couriers')} className="text-neutral-500 hover:text-red-400 cursor-pointer">-</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Danger Zone: Start New Game */}
      <section className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <RotateCcw className="w-5 h-5" />
              <span>{language === 'ru' ? 'Новая игра' : 'New Game'}</span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl font-medium leading-relaxed">
              {language === 'ru'
                ? 'Начать игру полностью заново с нуля. Все сохранения, деньги, склад, растения и прогресс лабораторий будут безвозвратно очищены, ничего с прошлой игры не останется.'
                : 'Start a completely fresh game from scratch. All save data, cash, inventory, plants, and lab progression will be wiped with nothing remaining.'}
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setShowResetConfirm(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'ru' ? 'НОВАЯ ИГРА' : 'START NEW GAME'}</span>
          </button>
        </div>
      </section>

      {/* Reset Game Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0e121a] border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                <AlertTriangle className="w-5 h-5" />
                <span>{language === 'ru' ? 'Начать новую игру?' : 'Start New Game?'}</span>
              </div>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {language === 'ru'
                ? 'Вы уверены, что хотите начать чистую игру с нуля? Ничего с прошлой игры не останется: деньги, склад, растения, партии синтеза, открытые улучшения и все сохранения будут полностью очищены.'
                : 'Are you sure you want to start a fresh game from scratch? Nothing from the previous game will remain: cash, inventory, plants, synthesis batches, unlocked upgrades and all saves will be completely wiped.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors min-h-[44px]"
              >
                {language === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  hapticFeedback.heavy();
                  sounds.playCash();
                  setShowResetConfirm(false);
                  onResetGame?.();
                }}
                className="px-5 py-2 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 min-h-[44px]"
              >
                {language === 'ru' ? 'Да, начать заново' : 'Yes, Start Fresh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

