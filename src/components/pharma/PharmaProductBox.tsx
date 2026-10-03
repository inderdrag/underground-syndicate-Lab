import React from 'react';

export type PharmaRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface PharmaProductBoxProps {
  itemId: string;
  name: string;
  rarity?: PharmaRarity | string;
  subgroup?: string;
  form?: string;
  className?: string;
}

export const PharmaProductBox: React.FC<PharmaProductBoxProps> = ({
  itemId,
  name,
  rarity = 'common',
  className = 'w-full h-48'
}) => {
  // Theme styling based on the pharmaceutical items
  const getBoxStyle = () => {
    switch (itemId) {
      case 'paracetamol':
        return {
          brand: 'Парацетамол',
          dosage: '500 мг',
          type: '20 таблеток',
          bgHeader: 'bg-sky-700',
          textColor: 'text-sky-900',
          accentBorder: 'border-sky-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💊'
        };
      case 'ibuprofen':
        return {
          brand: 'Ибупрофен',
          dosage: '400 мг',
          type: '20 таблеток',
          bgHeader: 'bg-red-700',
          textColor: 'text-red-900',
          accentBorder: 'border-red-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💊'
        };
      case 'melatonin':
        return {
          brand: 'Мелатонин',
          dosage: '3 мг',
          type: '30 таблеток',
          bgHeader: 'bg-indigo-900',
          textColor: 'text-purple-300',
          accentBorder: 'border-indigo-500',
          pillColor: 'bg-purple-200 border-purple-400',
          iconSymbol: '🌙'
        };
      case 'gabapentin':
        return {
          brand: 'Габапентин',
          dosage: '300 мг',
          type: '50 капсул (teva)',
          bgHeader: 'bg-teal-700',
          textColor: 'text-teal-900',
          accentBorder: 'border-teal-500',
          pillColor: 'bg-amber-100 border-amber-300',
          iconSymbol: '💊'
        };
      case 'lyrica':
      case 'pregabalin_caps':
        return {
          brand: 'LYRICA',
          dosage: '75 мг / 300 мг',
          type: '56 капсул (Pfizer)',
          bgHeader: 'bg-blue-800',
          textColor: 'text-blue-900',
          accentBorder: 'border-blue-600',
          pillColor: 'bg-blue-600 border-blue-400',
          iconSymbol: '💊'
        };
      case 'zoloft':
      case 'sertraline_tabs':
        return {
          brand: 'Zoloft',
          dosage: '50 мг',
          type: '28 таблеток (Pfizer)',
          bgHeader: 'bg-pink-700',
          textColor: 'text-pink-900',
          accentBorder: 'border-pink-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '🟡'
        };
      case 'tramadol':
      case 'tramadol_caps':
        return {
          brand: 'Tramadol',
          dosage: '50 мг',
          type: '20 таблеток (Grünenthal)',
          bgHeader: 'bg-emerald-700',
          textColor: 'text-emerald-900',
          accentBorder: 'border-emerald-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💊'
        };
      case 'prozac':
        return {
          brand: 'PROZAC',
          dosage: '20 мг',
          type: '28 капсул (Lilly)',
          bgHeader: 'bg-green-700',
          textColor: 'text-green-900',
          accentBorder: 'border-green-500',
          pillColor: 'bg-yellow-300 border-green-500',
          iconSymbol: '💊'
        };
      case 'zolpidem':
        return {
          brand: 'Zolpidem',
          dosage: '10 мг',
          type: '20 таблеток',
          bgHeader: 'bg-slate-900',
          textColor: 'text-sky-300',
          accentBorder: 'border-sky-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '🌌'
        };
      case 'xanax':
      case 'alprazolam_tabs':
        return {
          brand: 'XANAX',
          dosage: '1 мг',
          type: '30 таблеток (Pfizer)',
          bgHeader: 'bg-amber-800',
          textColor: 'text-amber-900',
          accentBorder: 'border-amber-600',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💊'
        };
      case 'modafinil':
        return {
          brand: 'MODAFINIL',
          dosage: '200 мг',
          type: '30 таблеток',
          bgHeader: 'bg-cyan-800',
          textColor: 'text-cyan-900',
          accentBorder: 'border-cyan-600',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '⚡'
        };
      case 'ritalin':
        return {
          brand: 'Ritalin',
          dosage: '10 мг',
          type: '30 таблеток (Novartis)',
          bgHeader: 'bg-blue-600',
          textColor: 'text-blue-900',
          accentBorder: 'border-blue-400',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '⚡'
        };
      case 'codeine':
      case 'codeine_tabs':
        return {
          brand: 'Кодеин',
          dosage: '30 мг',
          type: '10 таблеток',
          bgHeader: 'bg-orange-700',
          textColor: 'text-orange-900',
          accentBorder: 'border-orange-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💊'
        };
      case 'codeine_syrup':
        return {
          brand: 'CODEINE',
          dosage: '6.25 mg/5ml',
          type: 'Оральный Сироп (Lean)',
          bgHeader: 'bg-purple-800',
          textColor: 'text-purple-200',
          accentBorder: 'border-purple-500',
          pillColor: 'bg-purple-300 border-purple-500',
          iconSymbol: '🍼'
        };
      case 'adderall':
        return {
          brand: 'ADDERALL XR',
          dosage: '20 мг',
          type: '30 капсул (Shire)',
          bgHeader: 'bg-purple-800',
          textColor: 'text-purple-900',
          accentBorder: 'border-purple-600',
          pillColor: 'bg-purple-400 border-purple-200',
          iconSymbol: '🔥'
        };
      case 'oxycodone':
        return {
          brand: 'OxyContin',
          dosage: '10 мг',
          type: '100 таблеток (Purdue)',
          bgHeader: 'bg-purple-900',
          textColor: 'text-purple-300',
          accentBorder: 'border-purple-400',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💀'
        };
      case 'morphine':
        return {
          brand: 'Morphine',
          dosage: '10 мг',
          type: '10 ампул (Standex)',
          bgHeader: 'bg-red-900',
          textColor: 'text-red-300',
          accentBorder: 'border-red-600',
          pillColor: 'bg-amber-600 border-amber-300',
          iconSymbol: '🧪'
        };
      case 'fentanyl':
        return {
          brand: 'FENTANYL',
          dosage: '100 mcg/h',
          type: '5 трансдермальных пластырей',
          bgHeader: 'bg-amber-600',
          textColor: 'text-amber-200',
          accentBorder: 'border-amber-400',
          pillColor: 'bg-amber-200 border-amber-500',
          iconSymbol: '👑'
        };
      default:
        return {
          brand: name || 'Препарат',
          dosage: '100 мг',
          type: 'Фармацевтическая форма',
          bgHeader: 'bg-slate-700',
          textColor: 'text-slate-900',
          accentBorder: 'border-slate-500',
          pillColor: 'bg-white border-slate-300',
          iconSymbol: '💊'
        };
    }
  };

  const style = getBoxStyle();

  const getRarityBadge = () => {
    switch (rarity) {
      case 'common':
        return { label: 'Обычная', bg: 'bg-slate-700 text-slate-200 border-slate-600' };
      case 'uncommon':
        return { label: 'Необычная', bg: 'bg-emerald-800/80 text-emerald-200 border-emerald-600' };
      case 'rare':
        return { label: 'Редкая', bg: 'bg-blue-800/80 text-blue-200 border-blue-600' };
      case 'epic':
        return { label: 'Эпическая', bg: 'bg-purple-800/80 text-purple-200 border-purple-600' };
      case 'legendary':
        return { label: 'Легендарная', bg: 'bg-amber-700/90 text-amber-100 border-amber-500 shadow-amber-500/50 shadow-md' };
      default:
        return { label: 'Обычная', bg: 'bg-slate-700 text-slate-200 border-slate-600' };
    }
  };

  const badge = getRarityBadge() || { label: 'Обычная', bg: 'bg-slate-700 text-slate-200 border-slate-600' };

  return (
    <div className={`relative bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-3 flex flex-col justify-between shadow-2xl ${className}`}>
      {/* 3D Box Rendering */}
      <div className="relative w-full h-32 bg-slate-100 rounded-lg shadow-2xl p-3 flex flex-col justify-between text-slate-900 border-r-4 border-b-4 border-slate-300">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-black tracking-tight text-slate-900 font-sans leading-none">
              {style.brand}
            </div>
            <div className="text-[10px] font-bold text-slate-500 mt-1">
              {style.dosage}
            </div>
          </div>

          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        <div>
          <div className="text-[9px] font-semibold text-slate-600">{style.type}</div>
        </div>

        {/* Accent Bar */}
        <div className={`w-full h-2 rounded-full ${style.bgHeader}`} />
      </div>

      {/* Blister and pills graphic */}
      <div className="mt-2 bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex items-center justify-between text-[11px]">
        <span className="text-slate-400 font-medium">Форма выпуска:</span>
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <span>{style.iconSymbol}</span>
          <span className="text-xs">{style.type}</span>
        </div>
      </div>
    </div>
  );
};
