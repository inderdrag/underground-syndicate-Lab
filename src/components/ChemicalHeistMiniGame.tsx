import React, { useState, useEffect, useRef } from 'react';
import { GameState } from '../types/game';
import {
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  Flame,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Radio,
  Eye,
  Crosshair,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language } from '../i18n/translations';

interface ChemicalHeistMiniGameProps {
  gameState: GameState;
  onHeistSuccess: (loot: {
    diethylamineMl: number;
    ergotCultures: number;
    sporeSyringes: number;
    nutrientBloomMl: number;
    nutrientVegMl: number;
    bonusCash: number;
  }) => void;
  onHeistCaught: (heatIncrease: number, penaltyCash: number) => void;
  onClose: () => void;
  language: Language;
}

type HeistPhase = 'briefing' | 'lasers' | 'lockpick' | 'cipher' | 'escaped' | 'busted';

export const ChemicalHeistMiniGame: React.FC<ChemicalHeistMiniGameProps> = ({
  gameState,
  onHeistSuccess,
  onHeistCaught,
  onClose,
  language,
}) => {
  const [phase, setPhase] = useState<HeistPhase>('briefing');
  const [alarmMeter, setAlarmMeter] = useState<number>(0);

  // --- 1. LASERS STATE ---
  const [laserPosition, setLaserPosition] = useState<number>(10);
  const [laserDirection, setLaserDirection] = useState<'right' | 'left'>('right');
  const [layersPassed, setLayersPassed] = useState<number>(0);
  const laserPosRef = useRef<number>(10);

  // Target green gap corridor: 30% to 70% (Very clear and generous hit zone!)
  const targetGapStart = 30;
  const targetGapEnd = 70;

  useEffect(() => {
    if (phase !== 'lasers') return;

    const interval = setInterval(() => {
      setLaserPosition((prev) => {
        const speed = 2.2 + layersPassed * 0.6;
        let next = prev;
        if (laserDirection === 'right') {
          next = prev + speed;
          if (next >= 90) {
            setLaserDirection('left');
            next = 89;
          }
        } else {
          next = prev - speed;
          if (next <= 10) {
            setLaserDirection('right');
            next = 11;
          }
        }
        laserPosRef.current = next;
        return next;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [phase, laserDirection, layersPassed]);

  const handleLaserStep = () => {
    sounds.playClick();
    const currentPos = laserPosRef.current || laserPosition;
    // Check if within green corridor (30% to 70%) with extra +5% tolerance for click latency
    const inGap = currentPos >= (targetGapStart - 3) && currentPos <= (targetGapEnd + 3);

    if (inGap) {
      sounds.playResonanceLock();
      const next = layersPassed + 1;
      setLayersPassed(next);
      if (next >= 3) {
        setPhase('lockpick');
      }
    } else {
      sounds.playAlarmBeep();
      setAlarmMeter((prev) => {
        const nextAlarm = prev + 25;
        if (nextAlarm >= 100) {
          handleBusted();
          return 100;
        }
        return nextAlarm;
      });
    }
  };

  // --- 2. LOCKPICK STATE ---
  const [activePin, setActivePin] = useState<number>(1);
  const [tensionAngle, setTensionAngle] = useState<number>(20);
  const [lockTimeLeft, setLockTimeLeft] = useState<number>(18);
  const [pinsSet, setPinsSet] = useState<boolean[]>([false, false, false]);

  const targetPinAngles = [35, 68, 82];
  const isCurrentPinAligned = Math.abs(tensionAngle - targetPinAngles[activePin - 1]) <= 9;

  useEffect(() => {
    if (phase !== 'lockpick') return;
    const timer = setInterval(() => {
      setLockTimeLeft((prev) => {
        if (prev <= 0.1) {
          sounds.playAlarmBeep();
          handleBusted();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  const handlePickPin = () => {
    const target = targetPinAngles[activePin - 1];
    const isAligned = Math.abs(tensionAngle - target) <= 9;

    if (isAligned) {
      sounds.playOverrideSuccess();
      const updatedPins = [...pinsSet];
      updatedPins[activePin - 1] = true;
      setPinsSet(updatedPins);

      if (activePin >= 3) {
        setPhase('cipher');
      } else {
        setActivePin((p) => p + 1);
        setTensionAngle(15);
      }
    } else {
      sounds.playAlarmBeep();
      setAlarmMeter((prev) => {
        const next = prev + 25;
        if (next >= 100) {
          handleBusted();
          return 100;
        }
        return next;
      });
    }
  };

  // --- 3. TERMINAL CIPHER STATE ---
  const [cipherSequence, setCipherSequence] = useState<string[]>(['0x4A', '0x8F', '0xC2', '0x1B']);
  const [selectedCipher, setSelectedCipher] = useState<string[]>([]);
  const [cipherTimeLeft, setCipherTimeLeft] = useState<number>(12);

  const cipherOptions = ['0x4A', '0x8F', '0xC2', '0x1B', '0x7E', '0x99', '0x3D', '0xFE'];

  useEffect(() => {
    if (phase !== 'cipher') return;
    const timer = setInterval(() => {
      setCipherTimeLeft((prev) => {
        if (prev <= 0.1) {
          sounds.playAlarmBeep();
          handleBusted();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    return () => clearInterval(timer);
  }, [phase]);

  const handleSelectCipherKey = (key: string) => {
    sounds.playClick();
    const nextSeq = [...selectedCipher, key];
    setSelectedCipher(nextSeq);

    const stepIdx = nextSeq.length - 1;
    if (cipherSequence[stepIdx] !== key) {
      // Wrong sequence
      sounds.playAlarmBeep();
      setSelectedCipher([]);
      setAlarmMeter((prev) => {
        const next = prev + 35;
        if (next >= 100) {
          handleBusted();
          return 100;
        }
        return next;
      });
      return;
    }

    if (nextSeq.length === cipherSequence.length) {
      // Complete heist success!
      sounds.playTriumphFanfare();
      setPhase('escaped');
      onHeistSuccess({
        diethylamineMl: 300,
        ergotCultures: 3,
        sporeSyringes: 4,
        nutrientBloomMl: 250,
        nutrientVegMl: 250,
        bonusCash: 1200,
      });
    }
  };

  const handleBusted = () => {
    setPhase('busted');
    sounds.playAlarmBeep();
    const penalty = Math.min(gameState.cash, 400);
    onHeistCaught(50, penalty);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
      <div className="bg-[#090d15] border-2 border-red-500/40 rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-[0_0_60px_rgba(239,68,68,0.25)] relative my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Рейд на химсклад «Синтез-Фарма»</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  ВЫСОКИЙ РИСК
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Кража прекурсоров, культур эрготамина, растворителей и удобрений
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 bg-white/5 rounded-lg border border-white/10 cursor-pointer"
          >
            ✕ Отмена
          </button>
        </div>

        {/* Alarm Risk Meter */}
        <div className="p-3 bg-[#05080e] rounded-xl border border-white/10 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              Датчик тревоги охраны:
            </span>
            <span className={`font-bold ${alarmMeter > 60 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {alarmMeter}% / 100%
            </span>
          </div>
          <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden border border-white/10">
            <div
              className={`h-full transition-all duration-300 ${
                alarmMeter > 60 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-amber-400'
              }`}
              style={{ width: `${alarmMeter}%` }}
            />
          </div>
        </div>

        {/* --- PHASE: BRIEFING --- */}
        {phase === 'briefing' && (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3 text-xs font-sans text-slate-300 leading-relaxed">
              <p>
                Охраняемый склад фармацевтической компании содержит очищенный <strong className="text-purple-400">Диэтиламин</strong>, штаммы <strong className="text-cyan-400">Claviceps</strong> и профессиональные <strong className="text-emerald-400">N-P-K нутриенты</strong>.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 bg-black/50 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400">Шаг 1</span>
                  <div className="font-bold text-red-400">Лазерный барьер</div>
                </div>
                <div className="p-2 bg-black/50 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400">Шаг 2</span>
                  <div className="font-bold text-amber-400">Взлом 3 пинов</div>
                </div>
                <div className="p-2 bg-black/50 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400">Шаг 3</span>
                  <div className="font-bold text-cyan-400">Код хранилища</div>
                </div>
              </div>
              <div className="text-[11px] text-amber-300 font-mono flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>При провале: розыск полиции +50% и штраф $400 залог.</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setPhase('lasers');
              }}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Начать проникновение на склад</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- PHASE 1: LASERS --- */}
        {phase === 'lasers' && (
          <div className="p-5 bg-[#05080e] rounded-2xl border border-white/10 text-center space-y-4">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Этап 1/3: Проход через лазерные лучи</span>
              <span className="text-emerald-400 font-bold">Пройдено: {layersPassed}/3 барьеров</span>
            </div>

            {/* Laser Visual Field */}
            <div className="relative h-20 bg-black rounded-xl overflow-hidden border border-red-500/30 flex items-center justify-center">
              {/* Target Green Safe Corridor */}
              <div
                className="absolute inset-y-0 bg-emerald-500/30 border-x border-emerald-400/80"
                style={{ left: `${targetGapStart}%`, width: `${targetGapEnd - targetGapStart}%` }}
              />

              {/* Moving Laser Beam */}
              <div
                className="absolute inset-y-0 w-3 bg-red-500 shadow-[0_0_15px_#ef4444] transition-all duration-75"
                style={{ left: `${laserPosition}%` }}
              />

              <span className="text-[10px] font-mono text-emerald-300 z-10 font-bold bg-black/60 px-2 py-0.5 rounded border border-emerald-500/40">
                [ БЕЗОПАСНЫЙ ПРОХОД: {targetGapStart}% - {targetGapEnd}% ]
              </span>
            </div>

            <button
              onClick={handleLaserStep}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg active:scale-95"
            >
              Сделать рывок через лазер (Тайминг-клик)
            </button>
          </div>
        )}

        {/* --- PHASE 2: LOCKPICKING --- */}
        {phase === 'lockpick' && (
          <div className="p-5 bg-[#05080e] rounded-2xl border border-white/10 text-center space-y-4">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Этап 2/3: Отмычка замка сейфа</span>
              <span className="text-amber-400 font-bold">Таймер: {lockTimeLeft.toFixed(1)} сек</span>
            </div>

            {/* 3 Tumbler Pins Indicator */}
            <div className="flex justify-center gap-3">
              {[1, 2, 3].map((pin) => (
                <div
                  key={pin}
                  className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border font-mono ${
                    pinsSet[pin - 1]
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                      : activePin === pin
                      ? 'bg-amber-950/40 border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-black/50 border-white/10 text-slate-600'
                  }`}
                >
                  <Lock className="w-4 h-4 mb-1" />
                  <span className="text-[10px] font-bold">Пин {pin}</span>
                </div>
              ))}
            </div>

            {/* Tension Slider */}
            <div className="space-y-1.5 max-w-md mx-auto">
              <div className="flex justify-between text-[11px] font-mono text-slate-400">
                <span>Угол натяжения отмычки:</span>
                <strong className={isCurrentPinAligned ? 'text-emerald-400 font-bold animate-pulse' : 'text-cyan-400'}>
                  {Math.round(tensionAngle)}° {isCurrentPinAligned ? '(В пазе! Жмите фиксацию)' : ''}
                </strong>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={tensionAngle}
                onChange={(e) => setTensionAngle(Number(e.target.value))}
                className={`w-full cursor-pointer h-3 ${isCurrentPinAligned ? 'accent-emerald-400' : 'accent-amber-400'}`}
              />
            </div>

            <button
              onClick={handlePickPin}
              className={`py-2.5 px-8 rounded-xl font-bold text-xs cursor-pointer shadow-lg active:scale-95 transition-all ${
                isCurrentPinAligned
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:from-amber-300 hover:to-yellow-400'
              }`}
            >
              Зафиксировать пин #{activePin} (Клик)
            </button>
          </div>
        )}

        {/* --- PHASE 3: TERMINAL CIPHER --- */}
        {phase === 'cipher' && (
          <div className="p-5 bg-[#05080e] rounded-2xl border border-white/10 text-center space-y-4">
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Этап 3/3: Взлом терминала хранилища</span>
              <span className="text-cyan-400 font-bold">Таймер: {cipherTimeLeft.toFixed(1)} сек</span>
            </div>

            {/* Target Sequence */}
            <div className="p-3 bg-black rounded-xl border border-cyan-500/30 flex justify-center gap-3">
              {cipherSequence.map((key, idx) => (
                <div
                  key={idx}
                  className={`px-3 py-1.5 rounded-lg font-mono text-sm font-bold border ${
                    selectedCipher.length > idx
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                      : selectedCipher.length === idx
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse ring-1 ring-cyan-400'
                      : 'bg-white/5 border-white/10 text-slate-500'
                  }`}
                >
                  {key}
                </div>
              ))}
            </div>

            {/* Available Hex Keys Grid */}
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
              {cipherOptions.map((key) => {
                const isNextExpected = cipherSequence[selectedCipher.length] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectCipherKey(key)}
                    className={`p-2.5 rounded-xl border font-mono font-bold text-xs cursor-pointer active:scale-95 transition-all ${
                      isNextExpected
                        ? 'bg-cyan-950/60 hover:bg-cyan-900 border-cyan-400 text-cyan-100 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-400'
                    }`}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* --- PHASE: ESCAPED (VICTORY) --- */}
        {phase === 'escaped' && (
          <div className="p-6 bg-gradient-to-b from-[#082217] to-[#090d15] rounded-2xl border-2 border-emerald-500 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]">
              <Sparkles className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Ограбление успешно завершено!</h3>
              <p className="text-xs text-emerald-300">
                Вы скрылись со склада до прибытия наряда полиции. Добыча доставлена на склад:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono max-w-md mx-auto">
              <div className="p-2.5 bg-black/60 rounded-xl border border-purple-500/30 text-purple-300">
                +300 мл Диэтиламин
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-indigo-500/30 text-indigo-300">
                +3 Культуры Claviceps
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-cyan-500/30 text-cyan-300">
                +4 Шприца споров
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-emerald-500/30 text-emerald-300">
                +500 мл N-P-K Удобрений
              </div>
              <div className="p-2.5 bg-black/60 rounded-xl border border-amber-500/30 text-amber-300 col-span-2 sm:col-span-2">
                +$1,200 Наличных из сейфа
              </div>
            </div>

            <button
              onClick={onClose}
              className="py-2.5 px-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
            >
              Забрать добычу и вернуться
            </button>
          </div>
        )}

        {/* --- PHASE: BUSTED (FAILURE) --- */}
        {phase === 'busted' && (
          <div className="p-6 bg-gradient-to-b from-[#25080c] to-[#090d15] rounded-2xl border-2 border-red-500 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/50 mx-auto flex items-center justify-center text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-bounce">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-red-300">ВАС ПОЙМАЛИ НА СКЛАДЕ!</h3>
              <p className="text-xs text-slate-300">
                Сработала бесшумная сигнализация. Группа быстрого реагирования заблокировала выходы.
              </p>
            </div>

            <div className="p-3 bg-black/70 rounded-xl border border-red-500/40 text-xs font-mono text-red-300 space-y-1">
              <div>Розыск полиции повышен на <strong className="text-white">+50%</strong></div>
              <div>Штраф и изъятие залога: <strong className="text-white">-$400</strong></div>
            </div>

            <button
              onClick={onClose}
              className="py-2.5 px-8 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer shadow-lg"
            >
              Оплатить залог и выйти
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
