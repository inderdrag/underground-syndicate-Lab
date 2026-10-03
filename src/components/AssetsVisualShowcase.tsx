import React, { useState } from 'react';
import { Copy, Sparkles, Layers, Image as ImageIcon, Camera, Sun, Leaf, Flame, ShieldCheck } from 'lucide-react';
import { sounds } from '../engine/soundEffects';
import { Language, translations } from '../i18n/translations';
import { DrugEffectType, DosageTier } from '../types/game';

interface AssetSpec {
  id: string;
  name: string;
  category: string;
  aspectRatio: string;
  prompt: string;
  badge?: string;
  renderIllustration: React.ReactNode;
}

interface AssetsVisualShowcaseProps {
  onIngestSample: (effectType: DrugEffectType, dosage?: DosageTier) => void;
  language: Language;
}

export const AssetsVisualShowcase: React.FC<AssetsVisualShowcaseProps> = ({ onIngestSample, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'iconic_assets' | 'growth_stages'>('iconic_assets');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    sounds.playClick();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // The 6 iconic visual assets matching the user's uploaded reference image (high-economy-icons-preview.jpg)
  const iconicAssets: AssetSpec[] = [
    {
      id: 'cured_bud_macro',
      name: language === 'ru' ? 'Спелые соцветия (Cured Buds)' : 'Cured Herbal Buds Macro',
      category: 'Botany Harvest Macro',
      aspectRatio: '1:1',
      badge: 'REF 1: BUDS',
      prompt:
        'A pair of dense, cured organic cannabis flower colas on pitch black background, covered in frosted milky and amber trichomes, fiery-orange curled pistils, studio macro photography, 8k resolution, crisp lighting --ar 1:1',
      renderIllustration: (
        <svg viewBox="0 0 200 200" className="w-full h-full object-contain rounded-xl bg-black p-2 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <defs>
            <radialGradient id="budCluster1" cx="45%" cy="38%" r="60%">
              <stop offset="0%" stopColor="#15803d" />
              <stop offset="60%" stopColor="#14532d" />
              <stop offset="90%" stopColor="#052e16" />
              <stop offset="100%" stopColor="#021c0b" />
            </radialGradient>
            <filter id="frostSparkle" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Left Main Cola */}
          <g transform="translate(68, 100)">
            <ellipse cx="0" cy="20" rx="35" ry="32" fill="url(#budCluster1)" />
            <ellipse cx="-12" cy="-10" rx="30" ry="28" fill="url(#budCluster1)" />
            <ellipse cx="10" cy="-20" rx="26" ry="24" fill="url(#budCluster1)" />
            <ellipse cx="0" cy="-40" rx="22" ry="20" fill="url(#budCluster1)" />

            {/* Frosty Sugar Leaves */}
            <path d="M -25 -5 Q -50 -15 -42 -2 Q -28 6 -25 -5" fill="#166534" />
            <path d="M 20 -25 Q 45 -40 38 -20 Q 22 -15 20 -25" fill="#15803d" />

            {/* Curled Fiery Pistils */}
            <path d="M -15 -35 Q -32 -48 -20 -52" stroke="#ea580c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M 12 -28 Q 28 -42 20 -46" stroke="#f97316" strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M -20 5 Q -40 -5 -32 15" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 15 15 Q 35 25 18 35" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 0 -12 Q -18 2 0 15" stroke="#ea580c" strokeWidth="2.3" fill="none" strokeLinecap="round" />

            {/* Trichome Crystal Frost */}
            <circle cx="-12" cy="-35" r="2.2" fill="#ffffff" filter="url(#frostSparkle)" />
            <circle cx="8" cy="-28" r="2.5" fill="#fef3c7" filter="url(#frostSparkle)" />
            <circle cx="0" cy="-15" r="2.8" fill="#ffffff" filter="url(#frostSparkle)" />
            <circle cx="-18" cy="8" r="2.4" fill="#fde68a" filter="url(#frostSparkle)" />
            <circle cx="16" cy="18" r="2.4" fill="#ffffff" filter="url(#frostSparkle)" />
          </g>

          {/* Right Secondary Cola */}
          <g transform="translate(138, 92)">
            <ellipse cx="0" cy="18" rx="30" ry="28" fill="url(#budCluster1)" />
            <ellipse cx="-8" cy="-12" rx="26" ry="24" fill="url(#budCluster1)" />
            <ellipse cx="6" cy="-32" rx="20" ry="18" fill="url(#budCluster1)" />

            <path d="M -10 -25 Q -25 -35 -15 -42" stroke="#f97316" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 12 -20 Q 28 -30 20 -38" stroke="#ea580c" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            <path d="M 0 0 Q -18 12 5 22" stroke="#f97316" strokeWidth="2.4" fill="none" strokeLinecap="round" />

            <circle cx="-5" cy="-22" r="2.2" fill="#ffffff" filter="url(#frostSparkle)" />
            <circle cx="6" cy="-10" r="2.5" fill="#fef3c7" filter="url(#frostSparkle)" />
            <circle cx="0" cy="12" r="2.4" fill="#ffffff" filter="url(#frostSparkle)" />
          </g>
        </svg>
      ),
    },
    {
      id: 'golden_teacher_shrooms',
      name: language === 'ru' ? 'Грибы Psilocybe Cubensis' : 'Psilocybe Mushroom Cluster',
      category: 'Mycology Specimen',
      aspectRatio: '1:1',
      badge: 'REF 2: SHROOMS',
      prompt:
        'A realistic studio photograph of a cluster of Psilocybe cubensis mushrooms on pitch black background, golden-brown umbrella caps, slender fibrous white stalks with gentle blue psilocin bruising, studio photography 8k --ar 1:1',
      renderIllustration: (
        <svg viewBox="0 0 200 200" className="w-full h-full object-contain rounded-xl bg-black p-2 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <defs>
            <radialGradient id="mushroomCap" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="45%" stopColor="#b45309" />
              <stop offset="85%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#451a03" />
            </radialGradient>
          </defs>

          {/* Tall Center Mushroom */}
          <g transform="translate(100, 110)">
            <path d="M 0 50 Q -6 10 -2 -30" stroke="#f8fafc" strokeWidth="9" strokeLinecap="round" fill="none" />
            <path d="M -2 -15 Q -4 0 -1 25" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.65" />
            <ellipse cx="-2" cy="-35" rx="36" ry="24" fill="url(#mushroomCap)" />
            <ellipse cx="-2" cy="-18" rx="33" ry="8" fill="#451a03" />
          </g>

          {/* Left Mid Mushroom */}
          <g transform="translate(52, 130)">
            <path d="M 25 40 Q -10 10 -20 -15" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round" fill="none" />
            <ellipse cx="-22" cy="-22" rx="24" ry="16" fill="url(#mushroomCap)" transform="rotate(-25 -22 -22)" />
          </g>

          {/* Right Smaller Mushroom */}
          <g transform="translate(142, 135)">
            <path d="M -20 35 Q 15 15 22 -10" stroke="#f1f5f9" strokeWidth="7" strokeLinecap="round" fill="none" />
            <ellipse cx="24" cy="-15" rx="20" ry="14" fill="url(#mushroomCap)" transform="rotate(20 24 -15)" />
          </g>
        </svg>
      ),
    },
    {
      id: 'bicycle_1943_blotter',
      name: language === 'ru' ? 'Блоттер «Bicycle 1943»' : 'Albert Hofmann 1943 Blotter',
      category: 'Blotter Art Sheet Macro',
      aspectRatio: '1:1',
      badge: 'REF 3: BLOTTER',
      prompt:
        'A macro studio shot of an authentic 1943 Albert Hofmann bicycle day perforated blotter art sheet, vibrant rainbow gradient, green hills, cyclist, 1943 typography, two detached mini tabs beside it on black background --ar 1:1',
      renderIllustration: (
        <svg viewBox="0 0 200 200" className="w-full h-full object-contain rounded-xl bg-black p-2 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <defs>
            <linearGradient id="blotterSky" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          <g transform="translate(90, 85) rotate(-22)">
            <rect x="-60" y="-45" width="120" height="90" rx="3" fill="#fde047" stroke="#eab308" strokeWidth="2" />
            <rect x="-54" y="-39" width="108" height="78" fill="url(#blotterSky)" />
            <path d="M -54 15 Q -25 -10 0 20 Q 25 -5 54 20 L 54 39 L -54 39 Z" fill="#15803d" />

            <circle cx="-12" cy="0" r="5" fill="#ffffff" />
            <path d="M -12 5 L -5 16 L 8 16" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="-16" cy="18" r="7" stroke="#ffffff" strokeWidth="2" fill="none" />
            <circle cx="12" cy="18" r="7" stroke="#ffffff" strokeWidth="2" fill="none" />
            <line x1="-16" y1="18" x2="12" y2="18" stroke="#ffffff" strokeWidth="1.5" />

            <text x="18" y="32" fill="#1e1b4b" fontSize="12" fontWeight="bold" fontFamily="monospace">
              1943
            </text>

            <line x1="-30" y1="-39" x2="-30" y2="39" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
            <line x1="0" y1="-39" x2="0" y2="39" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
            <line x1="30" y1="-39" x2="30" y2="39" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
            <line x1="-54" y1="-15" x2="54" y2="-15" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
            <line x1="-54" y1="12" x2="54" y2="12" stroke="rgba(255,255,255,0.4)" strokeDasharray="2 2" />
          </g>

          <g transform="translate(162, 140) rotate(-15)">
            <rect x="-8" y="-8" width="16" height="16" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            <rect x="-6" y="-6" width="12" height="12" fill="#10b981" />
            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </g>
          <g transform="translate(178, 155) rotate(10)">
            <rect x="-7" y="-7" width="14" height="14" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            <rect x="-5" y="-5" width="10" height="10" fill="#ec4899" />
          </g>
        </svg>
      ),
    },
    {
      id: 'led_grow_light_fixture',
      name: language === 'ru' ? 'LED Светильник 600W/1000W' : '600W/1000W LED Fixture',
      category: 'Equipment 3D Asset',
      aspectRatio: '1:1',
      badge: 'REF 4: GROW LIGHT',
      prompt:
        'Industrial square LED grow light fixture hanging by metal wire cables, aluminum heatsink chassis, 9 bright optical lens diodes emitting bright downward white light, black studio background, clean 3D render --ar 1:1',
      renderIllustration: (
        <svg viewBox="0 0 200 200" className="w-full h-full object-contain rounded-xl bg-black p-2 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <defs>
            <linearGradient id="metalChassis" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="40%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
            <radialGradient id="lightBeam" cx="50%" cy="0%" r="90%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
            </radialGradient>
          </defs>

          <line x1="100" y1="20" x2="55" y2="90" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="100" y1="20" x2="145" y2="90" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="100" cy="20" r="5" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />

          <polygon points="45,115 155,115 185,185 15,185" fill="url(#lightBeam)" />

          <polygon points="55,90 145,90 160,115 40,115" fill="url(#metalChassis)" stroke="#334155" strokeWidth="1.5" />
          <polygon points="40,115 160,115 150,128 50,128" fill="#1e293b" />

          <g fill="#ffffff">
            <ellipse cx="65" cy="120" rx="7" ry="4" opacity="0.95" />
            <ellipse cx="88" cy="120" rx="7" ry="4" opacity="0.95" />
            <ellipse cx="112" cy="120" rx="7" ry="4" opacity="0.95" />
            <ellipse cx="135" cy="120" rx="7" ry="4" opacity="0.95" />
            <ellipse cx="75" cy="124" rx="6" ry="3" opacity="0.9" />
            <ellipse cx="100" cy="124" rx="6" ry="3" opacity="0.9" />
            <ellipse cx="125" cy="124" rx="6" ry="3" opacity="0.9" />
          </g>
        </svg>
      ),
    },
    {
      id: 'crystal_petri_dish',
      name: language === 'ru' ? 'Кокаин: Кристаллы и порошок в чаше' : 'Cocaine: Pure Flake Crystals & Powder in Glass Dish',
      category: language === 'ru' ? 'Стимуляторы высшего грейда' : 'Premier Grade Stimulant',
      aspectRatio: '1:1',
      badge: 'REF 5: COCAINE',
      prompt:
        'A square transparent borosilicate glass petri dish on black background containing sparkling pure white geometric chemical crystals and fine pharmaceutical powder, laboratory macro shot, studio illumination 8k --ar 1:1',
      renderIllustration: (
        <svg viewBox="0 0 200 200" className="w-full h-full object-contain rounded-xl bg-black p-2 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <g transform="translate(100, 110)">
            <polygon points="-65,-25 0,-45 65,-25 0,-5" fill="none" stroke="#67e8f9" strokeWidth="2.5" opacity="0.8" />
            <polygon points="-65,-25 -65,10 0,30 65,10 65,-25 0,-5" fill="rgba(6,182,212,0.06)" stroke="#38bdf8" strokeWidth="2" />
            <line x1="0" y1="-5" x2="0" y2="30" stroke="#38bdf8" strokeWidth="2" />

            <polygon points="-28,-5 -15,-22 -5,-12 -8,5 -22,8" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
            <polygon points="-5,-12 15,-25 22,-8 10,8 -8,5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
            <polygon points="12,-8 28,-18 35,-2 25,12 10,8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

            <circle cx="15" cy="18" r="1.5" fill="#ffffff" />
            <circle cx="22" cy="15" r="1.2" fill="#ffffff" />
            <circle cx="8" cy="22" r="1.6" fill="#ffffff" />
            <circle cx="-12" cy="15" r="1.4" fill="#ffffff" />
            <circle cx="0" cy="24" r="1.8" fill="#ffffff" />
            <circle cx="28" cy="12" r="1.3" fill="#ffffff" />
            <circle cx="18" cy="25" r="1.5" fill="#ffffff" />

            <line x1="-50" y1="-20" x2="-20" y2="-30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
          </g>
        </svg>
      ),
    },
    {
      id: 'cash_bills_stack',
      name: language === 'ru' ? 'Пачка $100 банкнот с золотой лентой' : 'Banded Stack of $100 Bills',
      category: 'Market Finance Asset',
      aspectRatio: '1:1',
      badge: 'REF 6: CASH',
      prompt:
        'A thick, crisp bundle stack of hundred dollar US cash bills bound tightly with a golden money clip strap, isometric studio photograph on pure black background, hyper-detailed 8k --ar 1:1',
      renderIllustration: (
        <svg viewBox="0 0 200 200" className="w-full h-full object-contain rounded-xl bg-black p-2 filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
          <defs>
            <linearGradient id="moneyGreen" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="goldenBand" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="40%" stopColor="#fde047" />
              <stop offset="80%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          <g transform="translate(100, 105)">
            <g transform="rotate(-18)">
              {/* Stack Depth Base */}
              <polygon points="-55,-25 55,-25 55,25 -55,25" fill="#0f172a" />
              {/* Layered Paper Edges */}
              <polygon points="-55,0 55,0 55,30 -55,30" fill="url(#moneyGreen)" stroke="#64748b" strokeWidth="1" />
              <line x1="-55" y1="6" x2="55" y2="6" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="-55" y1="12" x2="55" y2="12" stroke="#64748b" strokeWidth="0.8" />
              <line x1="-55" y1="18" x2="55" y2="18" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="-55" y1="24" x2="55" y2="24" stroke="#64748b" strokeWidth="0.8" />

              {/* Top Bill Face */}
              <polygon points="-55,-25 55,-25 55,0 -55,0" fill="#cbd5e1" stroke="#475569" strokeWidth="1.2" />
              <ellipse cx="0" cy="-12" rx="14" ry="8" fill="none" stroke="#64748b" strokeWidth="1.2" />
              <text x="-10" y="-8" fill="#1e293b" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
                $100
              </text>

              {/* Golden Currency Strap Wrapper */}
              <polygon points="-12,-26 12,-26 12,30 -12,30" fill="url(#goldenBand)" stroke="#a16207" strokeWidth="1" />
              <circle cx="0" cy="-12" r="6" fill="#ca8a04" />
              <text x="-4" y="-9" fill="#fef08a" fontSize="8" fontWeight="bold">
                $
              </text>
            </g>
          </g>
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-[#0b0e14] border border-white/[0.08] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'ru' ? 'Визуальные ассеты референса' : 'Iconic Economy Reference Assets'}</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            {language === 'ru' ? 'Каталог ассетов и эффектов' : 'Asset Showcase & Effects Testing'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {language === 'ru'
              ? 'Все 6 эталонных графических ассетов: шишки, грибы, блоттер ЛСД, LED-светильник, чистый кокаин в чаше и пачка $100 банкнот.'
              : 'All 6 benchmark visual assets from the master reference: buds, mushrooms, blotter, LED fixture, pure cocaine in dish, and $100 cash stack.'}
          </p>
        </div>
      </div>

      {/* Grid of the 6 Iconic Reference Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {iconicAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-[#090c10] border border-white/[0.08] hover:border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between transition-colors shadow-sm"
          >
            <div>
              <div className="w-full aspect-square bg-black rounded-xl border border-white/5 flex items-center justify-center overflow-hidden mb-3 relative group">
                {asset.renderIllustration}
                {asset.badge && (
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 border border-white/10 text-[9px] font-mono text-emerald-400 font-bold">
                    {asset.badge}
                  </span>
                )}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {asset.name}
                  </h3>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {asset.category} · {asset.aspectRatio}
                  </div>
                </div>
              </div>

              <div className="mt-2.5 p-2 bg-[#121824] rounded-lg text-[10px] font-mono text-slate-400 leading-relaxed max-h-16 overflow-y-auto border border-white/5">
                {asset.prompt}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
              <button
                onClick={() => handleCopyPrompt(asset.prompt, asset.id)}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
              >
                <Copy className="w-3 h-3 text-slate-400" />
                <span>{copiedId === asset.id ? (language === 'ru' ? 'Скопировано!' : 'Copied!') : t.copyPrompt}</span>
              </button>

              {asset.id === 'cured_bud_macro' && (
                <button
                  onClick={() => {
                    sounds.playPsychedelicChime();
                    onIngestSample('white_widow');
                  }}
                  className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                >
                  {t.testFx}
                </button>
              )}

              {asset.id === 'golden_teacher_shrooms' && (
                <button
                  onClick={() => {
                    sounds.playPsychedelicChime();
                    onIngestSample('psilocybin');
                  }}
                  className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                >
                  {t.testFx}
                </button>
              )}

              {asset.id === 'bicycle_1943_blotter' && (
                <button
                  onClick={() => {
                    sounds.playPsychedelicChime();
                    onIngestSample('lsd_25');
                  }}
                  className="text-[11px] font-mono text-pink-400 hover:text-pink-300 font-semibold cursor-pointer"
                >
                  {t.testFx}
                </button>
              )}

              {asset.id === 'crystal_petri_dish' && (
                <button
                  onClick={() => {
                    sounds.playPsychedelicChime();
                    onIngestSample('cocaine');
                  }}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {t.testFx} (Кокаин)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
