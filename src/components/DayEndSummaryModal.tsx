import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Zap,
  Users,
  Sun,
  Package,
  Calendar,
  Sparkles,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';
import { DaySummaryReport } from '../types/game';

interface DayEndSummaryModalProps {
  report: DaySummaryReport;
  onConfirmNextDay: () => void;
  language: Language;
}

export const DayEndSummaryModal: React.FC<DayEndSummaryModalProps> = ({
  report,
  onConfirmNextDay,
  language,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="bg-[#090d14] border-2 border-emerald-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_60px_rgba(16,185,129,0.25)] relative overflow-hidden">
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                [ФИНАНСОВЫЙ ОТЧЕТ ЗА СУТКИ]
              </span>
              <h2 className="text-xl font-black text-white">
                День {report.completedDay} завершен
              </h2>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-slate-400">Чистая прибыль:</span>
            <div
              className={`text-base font-black ${
                report.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {report.netProfit >= 0 ? `+$${report.netProfit.toLocaleString()}` : `-$${Math.abs(report.netProfit).toLocaleString()}`}
            </div>
          </div>
        </div>

        {/* Financial Flow Overview */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          {/* Income Box */}
          <div className="p-3.5 rounded-2xl bg-[#060b10] border border-emerald-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Доход за день:</span>
            </div>
            <div className="text-lg font-bold text-emerald-400">
              +${report.incomeCash.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              Сбыт на улице, в Darknet и картелю
            </div>
          </div>

          {/* Expenses Box */}
          <div className="p-3.5 rounded-2xl bg-[#060b10] border border-rose-500/30 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              <span>Расходы за день:</span>
            </div>
            <div className="text-lg font-bold text-rose-400">
              -${report.expensesUpkeep.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500">
              Электричество, персонал, фильтры
            </div>
          </div>
        </div>

        {/* Expenses Detailed Breakdown */}
        <div className="p-3.5 rounded-2xl bg-[#05080e] border border-white/10 space-y-2 text-xs font-mono text-slate-300">
          <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between">
            <span>Статьи расходов за сутки:</span>
            <span className="text-slate-500 font-normal">Авто-списание</span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400" /> Аренда помещения:
              </span>
              <span className="text-white">${report.breakdown.baseRent}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" /> Электросеть лаборатории:
              </span>
              <span className="text-white">${report.breakdown.electricity}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-400" /> Зарплаты персонала (тримеры, химики, курьеры):
              </span>
              <span className="text-white">${report.breakdown.salaries}</span>
            </div>

            {report.breakdown.generatorFuel > 0 && (
              <div className="flex justify-between text-amber-300">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-400" /> Топливо генератора:
                </span>
                <span>${report.breakdown.generatorFuel}</span>
              </div>
            )}

            {report.breakdown.lawyerRetainer > 0 && (
              <div className="flex justify-between text-purple-300">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3 h-3 text-purple-400" /> Гонорар адвоката:
                </span>
                <span>${report.breakdown.lawyerRetainer}</span>
              </div>
            )}
          </div>
        </div>

        {/* Police Heat Delta */}
        <div className="p-3 rounded-2xl bg-[#060a12] border border-white/10 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-slate-300">Текущий розыск полиции:</span>
          </div>
          <span className={`font-bold ${report.currentPoliceHeat > 50 ? 'text-rose-400' : 'text-amber-300'}`}>
            {Math.round(report.currentPoliceHeat)}% / 100%
          </span>
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => {
            sounds.playPsychedelicChime();
            onConfirmNextDay();
          }}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
        >
          <span>Начать новый день (День {report.completedDay + 1})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
