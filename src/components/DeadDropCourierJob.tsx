import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import {
  MapPin,
  ShieldAlert,
  AlertTriangle,
  Eye,
  EyeOff,
  Camera,
  Navigation,
  CheckCircle2,
  DollarSign,
  Footprints,
  Flame,
  Radio,
  Zap,
  TrendingUp,
  X,
  Timer,
  Lock,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

interface DeadDropCourierJobProps {
  gameState: GameState;
  onCourierSuccess: (rewardCash: number, heatChange: number) => void;
  onCourierCaught: (penaltyCash: number, heatAdded: number) => void;
  onDeductCash: (amount: number) => void;
  language: Language;
}

interface DropDistrict {
  id: string;
  nameRu: string;
  nameEn: string;
  descRu: string;
  rewardMin: number;
  rewardMax: number;
  baseRiskPercent: number;
  difficulty: 'Легко' | 'Средне' | 'Экстрим';
  diffColor: string;
  patrolSpeed: number;
}

type StashMethod = 'magnet' | 'bury' | 'panel';

export const DeadDropCourierJob: React.FC<DeadDropCourierJobProps> = ({
  gameState,
  onCourierSuccess,
  onCourierCaught,
  onDeductCash,
  language,
}) => {
  const [activeDistrict, setActiveDistrict] = useState<DropDistrict | null>(null);
  const [missionStage, setMissionStage] = useState<'selection' | 'running' | 'chase' | 'completed' | 'failed'>('selection');

  // Mini-game runner states
  const [scannerAngle, setScannerAngle] = useState<number>(0);
  const [suspicion, setSuspicion] = useState<number>(0);
  const [stashProgress, setStashProgress] = useState<number>(0);
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const [stashMethod, setStashMethod] = useState<StashMethod>('magnet');
  const [gpsLocked, setGpsLocked] = useState<boolean>(false);
  const [lastOutcome, setLastOutcome] = useState<{
    rewardCash: number;
    heatChange: number;
    msgRu: string;
  } | null>(null);

  const districts: DropDistrict[] = [
    {
      id: 'suburbs',
      nameRu: 'Спальный микрорайон «Южный»',
      nameEn: 'Southern Suburbs',
      descRu: 'Тихие дворы, детские площадки и подъезды. Редкие пешие патрули ППС.',
      rewardMin: 15,
      rewardMax: 25,
      baseRiskPercent: 25,
      difficulty: 'Легко',
      diffColor: 'text-emerald-400 border-emerald-500/30',
      patrolSpeed: 2.2,
    },
    {
      id: 'industrial',
      nameRu: 'Промзона и заброшенные склады',
      nameEn: 'Industrial Factory Zone',
      descRu: 'Тёмные цеха, теплотрассы и гаражи. Патрульные дроны с тепловизорами.',
      rewardMin: 25,
      rewardMax: 38,
      baseRiskPercent: 50,
      difficulty: 'Средне',
      diffColor: 'text-amber-400 border-amber-500/30',
      patrolSpeed: 3.6,
    },
    {
      id: 'downtown_towers',
      nameRu: 'Элитный ЖК «Золотые Башни»',
      nameEn: 'Penthouse Skyline District',
      descRu: 'VIP-доставка для закрытой вечеринки. Камеры с распознаванием лиц и ЧОП.',
      rewardMin: 40,
      rewardMax: 50,
      baseRiskPercent: 80,
      difficulty: 'Экстрим',
      diffColor: 'text-rose-400 border-rose-500/30',
      patrolSpeed: 5.5,
    },
  ];

  // Scanner sweep ticker with smooth requestAnimationFrame
  useEffect(() => {
    if (missionStage !== 'running' || !activeDistrict) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      setScannerAngle((prev) => (prev + activeDistrict.patrolSpeed * 30 * dt) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [missionStage, activeDistrict]);

  // Suspicion logic
  const isScannerTargetingDrop = scannerAngle >= 140 && scannerAngle <= 220;

  useEffect(() => {
    if (missionStage !== 'running') return;

    const tick = setInterval(() => {
      if (isHiding) {
        // Player is actively hiding the package
        if (isScannerTargetingDrop) {
          // Player is seen hiding! Suspicion spikes rapidly
          setSuspicion((prev) => {
            const next = prev + 14;
            if (next >= 100) {
              sounds.playAlarmBeep();
              setMissionStage('chase');
              return 100;
            }
            return next;
          });
        } else {
          // Safe to plant
          setStashProgress((prev) => {
            const speed = stashMethod === 'magnet' ? 7 : stashMethod === 'bury' ? 4.5 : 3.5;
            const next = prev + speed;
            if (next >= 100) {
              sounds.playOverrideSuccess();
              setGpsLocked(true);
              return 100;
            }
            return next;
          });
          // Suspicion slowly drops
          setSuspicion((prev) => Math.max(0, prev - 1.5));
        }
      } else {
        // Player is looking casual
        if (isScannerTargetingDrop) {
          // Patrol scans casual player: mild suspicion gain
          setSuspicion((prev) => {
            const next = prev + 1.2;
            if (next >= 100) {
              sounds.playAlarmBeep();
              setMissionStage('chase');
              return 100;
            }
            return next;
          });
        } else {
          setSuspicion((prev) => Math.max(0, prev - 2.5));
        }
      }
    }, 100);

    return () => clearInterval(tick);
  }, [missionStage, isHiding, isScannerTargetingDrop, stashMethod]);

  const handleStartMission = (district: DropDistrict) => {
    sounds.playClick();
    setActiveDistrict(district);
    setMissionStage('running');
    setSuspicion(10);
    setStashProgress(0);
    setGpsLocked(false);
    setIsHiding(false);
  };

  const handleFinishDrop = () => {
    if (!activeDistrict || !gpsLocked) return;
    sounds.playCash();
    const reward = Math.round(
      activeDistrict.rewardMin + Math.random() * (activeDistrict.rewardMax - activeDistrict.rewardMin)
    );
    const heat = Math.round(4 + activeDistrict.baseRiskPercent * 0.15);

    onCourierSuccess(reward, heat);
    setLastOutcome({
      rewardCash: reward,
      heatChange: heat,
      msgRu: `Закладка успешно спрятана! Координаты переданы покупателю в боте. Выплата $${reward} зачислена на баланс.`,
    });
    setMissionStage('completed');
  };

  // Chase resolution options
  const handleSprintEscape = () => {
    sounds.playClick();
    const success = Math.random() > 0.45;
    if (success) {
      sounds.playOverrideSuccess();
      const penaltyHeat = 15;
      const fine = Math.min(gameState.cash, 25);
      onCourierCaught(fine, penaltyHeat);
      setLastOutcome({
        rewardCash: 0,
        heatChange: penaltyHeat,
        msgRu: `Вы сбросили сверток и оторвались от патруля! Товар утерян, списан штраф за невыполненную закладку: ${fine}.`,
      });
      setMissionStage('completed');
    } else {
      sounds.playAlarmBeep();
      const fine = Math.min(gameState.cash, 50);
      const heat = 25;
      onCourierCaught(fine, heat);
      setLastOutcome({
        rewardCash: 0,
        heatChange: heat,
        msgRu: `Облава! Вас задержал наряд ППС. Конфискация и штраф за невыполненную закладку: ${fine}, уровень розыска +${heat}%.`,
      });
      setMissionStage('failed');
    }
  };

  const handleAbortMission = () => {
    sounds.playClick();
    const fine = Math.min(gameState.cash, 25);
    onCourierCaught(fine, 5);
    setLastOutcome({
      rewardCash: 0,
      heatChange: 5,
      msgRu: `Вы отменили доставку и выбросили товар. Списан штраф за невыполненную закладку: ${fine}.`,
    });
    setMissionStage('failed');
  };

  const handleBribePolice = () => {
    if (gameState.cash < 40) {
      sounds.playAlarmBeep();
      return;
    }
    sounds.playCash();
    onDeductCash(40);
    setLastOutcome({
      rewardCash: 0,
      heatChange: 0,
      msgRu: 'Вы сунули патрульным $40 на месте. Они закрыли глаза и отпустили вас без протокола.',
    });
    setMissionStage('completed');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                [РАБОТА НА КАРТЕЛЬ · DEAD DROP COURIER]
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                Завершено: <strong className="text-emerald-400">{gameState.courierStats?.successfulDrops || 0}</strong> закладок
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
              Разнос закладок в опасных районах города
            </h1>
          </div>
        </div>

        {missionStage !== 'selection' && (
          <button
            onClick={() => {
              sounds.playClick();
              setMissionStage('selection');
              setActiveDistrict(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono font-bold cursor-pointer border border-white/10"
          >
            ✕ Выйти из задания
          </button>
        )}
      </div>

      {/* STAGE 1: DISTRICT SELECTION */}
      {missionStage === 'selection' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#090d14] border border-white/10 space-y-2">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Navigation className="w-4 h-4 text-amber-400" />
              <span>Выберите сектор для доставки партии товара</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Картель выдает вам расфасованную партию. Ваша задача — прибыть на точку, дождаться пока патруль отвернется, скрытно спрятать сверток и сфотографировать координаты. 
              <strong> Внимание:</strong> при задержании вы рискуете деньгами и резким взлетом розыска полиции!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {districts.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-[#0b1018] border border-white/10 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4 shadow-xl group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${d.diffColor}`}>
                      {d.difficulty} · Риск {d.baseRiskPercent}%
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      ${d.rewardMin} – ${d.rewardMax}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm group-hover:text-amber-300 transition-colors">
                    {d.nameRu}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {d.descRu}
                  </p>
                </div>

                <button
                  onClick={() => handleStartMission(d)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-mono text-xs shadow-lg cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Взять заказ курьера</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 2: LIVE DROP STEALTH RUNNER MINI-GAME */}
      {missionStage === 'running' && activeDistrict && (
        <div className="bg-[#0b1018] border border-white/15 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Top Mission HUD */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                СЕКТОР: {activeDistrict.nameRu}
              </div>
              <h2 className="text-base font-bold text-white">
                Скрытная закладка тайника
              </h2>
            </div>

            {/* Suspicion Meter */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Подозрение:</span>
              <div className="w-36 h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/15 relative">
                <div
                  className={`h-full transition-all duration-150 ${
                    suspicion > 70 ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : suspicion > 40 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.min(100, suspicion)}%` }}
                />
              </div>
              <span className={`text-xs font-mono font-bold ${suspicion > 70 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                {Math.round(suspicion)}%
              </span>
            </div>
          </div>

          {/* Interactive Radar & Searchlight Canvas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Radar Sweep Visual */}
            <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-full bg-[#05080e] border-2 border-cyan-500/40 p-3 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              {/* Radar Grid Circles */}
              <div className="absolute inset-4 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-12 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-20 rounded-full border border-cyan-500/20" />
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-cyan-500/20" />
              <div className="absolute inset-y-0 left-1/2 w-[1px] bg-cyan-500/20" />

              {/* Police Searchlight Sector (Danger Cone from 140 to 220 deg) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <path
                  d="M 50,50 L 25,95 A 50,50 0 0,0 75,95 Z"
                  fill="rgba(244,63,94,0.18)"
                  stroke="rgba(244,63,94,0.6)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <text x="50" y="85" textAnchor="middle" fill="#f43f5e" fontSize="5" fontFamily="monospace" fontWeight="bold">
                  ЗОНА ВИДИМОСТИ ПАТРУЛЯ
                </text>
              </svg>

              {/* Rotating Radar Beam */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none flex items-center justify-center"
                style={{ transform: `rotate(${scannerAngle}deg)` }}
              >
                <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent to-cyan-400 absolute right-1/2 shadow-[0_0_8px_#22d3ee]" />
                <div className="w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee] absolute right-0" />
              </div>

              {/* Player Icon at Center / Stash Location */}
              <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center z-10 transition-all ${
                isHiding ? 'bg-amber-500 text-slate-950 scale-110 shadow-[0_0_20px_#f59e0b]' : 'bg-slate-800 text-slate-300'
              }`}>
                {isHiding ? <EyeOff className="w-6 h-6 animate-pulse" /> : <Eye className="w-6 h-6" />}
                <span className="text-[8px] font-mono font-bold mt-0.5">{isHiding ? 'ПРЯЧЕТ' : 'ЖДЕТ'}</span>
              </div>
            </div>

            {/* Controls & Actions */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-slate-400">Тип тайника:</span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    { id: 'magnet', label: '🧲 Магнит', speed: 'Быстро' },
                    { id: 'bury', label: '🌱 Прикоп', speed: 'Средне' },
                    { id: 'panel', label: '⚡ Щиток', speed: 'Надежно' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        sounds.playClick();
                        setStashMethod(m.id as StashMethod);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        stashMethod === m.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">{m.label}</div>
                      <div className="text-[9px] text-slate-500">{m.speed}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stash Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Закладка тайника:</span>
                  <span className="text-emerald-400 font-bold">{Math.round(stashProgress)}%</span>
                </div>
                <div className="h-4 bg-neutral-900 rounded-xl overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-lg transition-all duration-100"
                    style={{ width: `${stashProgress}%` }}
                  />
                </div>
              </div>

              {/* Hold to Hide Button */}
              {!gpsLocked ? (
                <button
                  onMouseDown={() => setIsHiding(true)}
                  onMouseUp={() => setIsHiding(false)}
                  onTouchStart={() => setIsHiding(true)}
                  onTouchEnd={() => setIsHiding(false)}
                  className={`w-full py-4 rounded-2xl font-mono font-bold text-sm flex items-center justify-center gap-2 select-none cursor-pointer transition-all active:scale-98 shadow-xl ${
                    isHiding
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/40'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                  }`}
                >
                  <Footprints className="w-5 h-5" />
                  <span>УДЕРЖИВАЙТЕ ДЛЯ ЗАКЛАДКИ ТОВАРА</span>
                </button>
              ) : (
                <button
                  onClick={handleFinishDrop}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-bold font-mono text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-bounce"
                >
                  <Camera className="w-5 h-5" />
                  <span>СФОТОГРАФИРОВАТЬ И ЗАВЕРШИТЬ ЗАКАЗ</span>
                </button>
              )}

              <p className="text-[11px] text-slate-400 text-center font-mono">
                {isScannerTargetingDrop
                  ? '⚠️ ПАТРУЛЬ СМОТРИТ НА ВАС! ОТПУСТИТЕ КНОПКУ, ЧТОБЫ НЕ ПРИВЛЕКАТЬ ВНИМАНИЕ!'
                  : '✅ Безопасно. Удерживайте кнопку, пока луч патруля не приблизился.'}
              </p>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleAbortMission}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Отменить доставку (Штраф за невыполненную закладку: $25)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: POLICE CHASE / BUSTED INTERACTION */}
      {missionStage === 'chase' && (
        <div className="bg-rose-950/40 border border-rose-500/50 rounded-3xl p-6 space-y-5 shadow-2xl relative">
          <div className="flex items-center gap-3 border-b border-rose-500/30 pb-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
                [ОБЛАВА ПАТРУЛЯ · POLICE INTERCEPTION]
              </span>
              <h2 className="text-base font-bold text-white">
                Вас заметил наряд полиции при попытке сделать закладку!
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            Патрульная машина включила мигалки и перекрывает выезд из двора. Выберите экстренное действие:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSprintEscape}
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold font-mono text-xs flex flex-col justify-between space-y-1 cursor-pointer transition-all active:scale-95 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4" />
                <span>1. Сбросить сверток и бежать</span>
              </div>
              <span className="text-[10px] text-rose-200 font-normal">
                55% шанс оторваться по дворам. При провале — арест и штраф $50.
              </span>
            </button>

            <button
              onClick={handleBribePolice}
              disabled={gameState.cash < 40}
              className={`p-4 rounded-2xl border text-xs font-mono font-bold flex flex-col justify-between space-y-1 transition-all ${
                gameState.cash >= 40
                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 cursor-pointer active:scale-95'
                  : 'bg-neutral-800 text-slate-500 border-white/10 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>2. Дать взятку патрульным ($40)</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">
                100% гарантия уйти без протокола и без повышения розыска.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: RESULT BANNER */}
      {(missionStage === 'completed' || missionStage === 'failed') && lastOutcome && (
        <div className={`p-6 rounded-3xl border space-y-4 shadow-2xl ${
          missionStage === 'completed'
            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {missionStage === 'completed' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            )}
            <div>
              <h3 className="text-base font-bold text-white">
                {missionStage === 'completed' ? 'Заказ выполнен!' : 'Провал задания'}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                {lastOutcome.msgRu}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setMissionStage('selection');
              setActiveDistrict(null);
            }}
            className="py-2.5 px-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs cursor-pointer transition-all"
          >
            ← Вернуться к списку заказов
          </button>
        </div>
      )}
    </div>
  );
};
