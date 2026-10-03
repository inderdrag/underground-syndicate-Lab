import React from 'react';

interface ProductArtworkProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'banner';
}

export const ProductArtwork: React.FC<ProductArtworkProps> = ({
  productId,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    banner: 'w-full h-36',
  }[size];

  switch (productId) {
    // --- 1. BOTANY: SEEDS & BUDS ---
    case 'seed_ww':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0c1815] to-[#050c0a] rounded-2xl overflow-hidden border border-emerald-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.4)]">
            <ellipse cx="50" cy="52" rx="22" ry="28" fill="#064e3b" stroke="#10b981" strokeWidth="2.5" />
            <path d="M 42,32 Q 50,48 42,72" stroke="#34d399" strokeWidth="1.8" fill="none" opacity="0.8" />
            <path d="M 52,30 Q 60,50 56,74" stroke="#a7f3d0" strokeWidth="1.8" fill="none" opacity="0.9" />
            <circle cx="45" cy="45" r="2" fill="#ecfdf5" />
            <circle cx="58" cy="55" r="1.5" fill="#ecfdf5" />
            <circle cx="50" cy="62" r="1.8" fill="#34d399" />
            {/* Sparkles */}
            <path d="M 30,25 L 32,20 L 34,25 L 39,27 L 34,29 L 32,34 L 30,29 L 25,27 Z" fill="#6ee7b7" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-emerald-400">FEM</span>
        </div>
      );

    case 'seed_amnesia':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#18160c] to-[#0c0903] rounded-2xl overflow-hidden border border-amber-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            <ellipse cx="50" cy="52" rx="24" ry="29" fill="#78350f" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M 40,32 Q 48,50 42,70" stroke="#fde68a" strokeWidth="2" fill="none" />
            <path d="M 54,28 Q 62,50 55,75" stroke="#fef3c7" strokeWidth="2" fill="none" />
            <circle cx="48" cy="42" r="2.5" fill="#ffffff" />
            <circle cx="58" cy="58" r="2" fill="#ffffff" />
            {/* Sativa Lightning */}
            <path d="M 68,18 L 62,30 L 67,30 L 59,44" stroke="#fbbf24" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-400">HAZE</span>
        </div>
      );

    case 'seed_gorilla':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#160e1e] to-[#09050d] rounded-2xl overflow-hidden border border-purple-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(168,85,247,0.4)]">
            <ellipse cx="50" cy="52" rx="25" ry="30" fill="#4c1d95" stroke="#a855f7" strokeWidth="2.5" />
            <path d="M 38,34 Q 48,52 40,72" stroke="#d8b4fe" strokeWidth="2" fill="none" />
            <path d="M 55,30 Q 64,52 58,75" stroke="#f3e8ff" strokeWidth="2" fill="none" />
            <circle cx="46" cy="46" r="3" fill="#ffffff" />
            <circle cx="56" cy="60" r="2.2" fill="#c084fc" />
            {/* Resin drop */}
            <path d="M 72,32 C 72,32 78,40 78,44 C 78,47 75,50 72,50 C 69,50 66,47 66,44 C 66,40 72,32 72,32 Z" fill="#c084fc" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-purple-400">GG#4</span>
        </div>
      );

    case 'seed_purple':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1a0a20] to-[#0a020d] rounded-2xl overflow-hidden border border-pink-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(236,72,153,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(236,72,153,0.4)]">
            <ellipse cx="50" cy="52" rx="24" ry="29" fill="#831843" stroke="#ec4899" strokeWidth="2.5" />
            <path d="M 40,32 Q 48,50 42,70" stroke="#fbcfe8" strokeWidth="2" fill="none" />
            <path d="M 54,28 Q 62,50 56,74" stroke="#fdf2f8" strokeWidth="2" fill="none" />
            <circle cx="48" cy="44" r="2.5" fill="#ffffff" />
            <circle cx="58" cy="58" r="2" fill="#f472b6" />
            {/* Purple Aura Stars */}
            <circle cx="28" cy="28" r="2" fill="#f472b6" />
            <circle cx="75" cy="25" r="2.5" fill="#fbcfe8" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-pink-400">PURPLE</span>
        </div>
      );

    // --- 2. NUTRIENTS & CARE ---
    case 'nutr_veg':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0a161f] to-[#03090e] rounded-2xl overflow-hidden border border-cyan-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(6,182,212,0.4)]">
            <rect x="36" y="24" width="28" height="12" rx="3" fill="#0891b2" />
            <rect x="44" y="16" width="12" height="10" rx="2" fill="#06b6d4" />
            <path d="M 32,36 L 68,36 L 74,84 C 74,88 70,90 66,90 L 34,90 C 30,90 26,88 26,84 Z" fill="#164e63" stroke="#06b6d4" strokeWidth="2.5" />
            <rect x="32" y="48" width="36" height="26" rx="4" fill="#0e7490" />
            <text x="50" y="66" textAnchor="middle" fill="#cffafe" fontSize="11" fontWeight="bold" fontFamily="monospace">N-MAX</text>
            <path d="M 42,78 Q 50,72 58,78" stroke="#67e8f9" strokeWidth="2" fill="none" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-cyan-400">VEG</span>
        </div>
      );

    case 'nutr_bloom':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1a0f0a] to-[#0c0502] rounded-2xl overflow-hidden border border-amber-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            <rect x="36" y="24" width="28" height="12" rx="3" fill="#d97706" />
            <rect x="44" y="16" width="12" height="10" rx="2" fill="#f59e0b" />
            <path d="M 32,36 L 68,36 L 74,84 C 74,88 70,90 66,90 L 34,90 C 30,90 26,88 26,84 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="32" y="48" width="36" height="26" rx="4" fill="#b45309" />
            <text x="50" y="66" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="bold" fontFamily="monospace">PK13/14</text>
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-400">BLOOM</span>
        </div>
      );

    case 'water_osmosis':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#081724] to-[#02070d] rounded-2xl overflow-hidden border border-blue-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
            <path d="M 50,18 C 50,18 76,52 76,68 C 76,82 64,90 50,90 C 36,90 24,82 24,68 C 24,52 50,18 50,18 Z" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="2.5" />
            <path d="M 40,54 Q 50,44 60,54 Q 70,64 64,76" stroke="#bfdbfe" strokeWidth="2" fill="none" opacity="0.8" />
            <circle cx="42" cy="66" r="3" fill="#ffffff" />
            <text x="50" y="82" textAnchor="middle" fill="#dbeafe" fontSize="9" fontWeight="bold" fontFamily="monospace">0 PPM</text>
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-blue-400">H2O</span>
        </div>
      );

    case 'neem_oil':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0c180f] to-[#040a06] rounded-2xl overflow-hidden border border-emerald-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.4)]">
            <rect x="42" y="16" width="16" height="12" rx="2" fill="#047857" />
            <path d="M 38,28 L 62,28 L 68,84 C 68,88 64,90 60,90 L 40,90 C 36,90 32,88 32,84 Z" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
            <path d="M 50,42 L 56,54 L 68,54 L 58,62 L 62,74 L 50,66 L 38,74 L 42,62 L 32,54 L 44,54 Z" fill="#34d399" opacity="0.8" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-emerald-400">NEEM</span>
        </div>
      );

    // --- 3. MYCOLOGY ---
    case 'myco_kit':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#120a22] to-[#06030c] rounded-2xl overflow-hidden border border-purple-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(168,85,247,0.5)]">
            <circle cx="50" cy="50" r="34" fill="#3b0764" stroke="#c084fc" strokeWidth="2.5" />
            {/* Glowing Mushroom in Petri Dish */}
            <path d="M 48,65 L 52,65 L 53,42 L 47,42 Z" fill="#f1f5f9" />
            <ellipse cx="50" cy="40" rx="20" ry="12" fill="#a855f7" stroke="#e9d5ff" strokeWidth="2" />
            <ellipse cx="50" cy="36" rx="12" ry="6" fill="#06b6d4" />
            <circle cx="42" cy="38" r="1.8" fill="#ffffff" />
            <circle cx="58" cy="38" r="1.8" fill="#ffffff" />
            {/* Spores */}
            <circle cx="32" cy="56" r="2" fill="#38bdf8" className="animate-pulse" />
            <circle cx="68" cy="54" r="2.5" fill="#38bdf8" className="animate-pulse" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-cyan-400">SPORES</span>
        </div>
      );

    case 'myco_substrate':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1a140d] to-[#090603] rounded-2xl overflow-hidden border border-amber-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            <rect x="24" y="32" width="52" height="52" rx="8" fill="#451a03" stroke="#f59e0b" strokeWidth="2.5" />
            <rect x="30" y="38" width="40" height="16" rx="4" fill="#78350f" />
            <circle cx="38" cy="64" r="3" fill="#fde68a" />
            <circle cx="52" cy="68" r="4" fill="#fde68a" />
            <circle cx="62" cy="62" r="3.5" fill="#fde68a" />
            <text x="50" y="50" textAnchor="middle" fill="#fef3c7" fontSize="10" fontWeight="bold" fontFamily="monospace">MIX-A</text>
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-400">SUB</span>
        </div>
      );

    case 'myco_stimulant':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#06181f] to-[#02090d] rounded-2xl overflow-hidden border border-cyan-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(6,182,212,0.5)]">
            {/* Syringe/Ampoule */}
            <rect x="42" y="16" width="16" height="6" rx="2" fill="#0891b2" />
            <rect x="44" y="22" width="12" height="48" rx="4" fill="#155e75" stroke="#06b6d4" strokeWidth="2" />
            <rect x="46" y="36" width="8" height="30" rx="2" fill="#22d3ee" className="animate-pulse" />
            <path d="M 50,70 L 50,86" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
            {/* Lightning energy */}
            <path d="M 28,34 L 34,44 L 28,48 L 36,60" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-cyan-400">+30%</span>
        </div>
      );

    case 'myco_container':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#101724] to-[#050910] rounded-2xl overflow-hidden border border-blue-500/20 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(59,130,246,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
            <rect x="20" y="36" width="60" height="46" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
            <rect x="16" y="28" width="68" height="10" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="34" cy="56" r="5" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="66" cy="56" r="5" fill="#334155" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="24" y="68" width="52" height="10" rx="3" fill="#38bdf8" opacity="0.3" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-blue-400">TUB</span>
        </div>
      );

    case 'myco_stabilizer':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1c1208] to-[#090502] rounded-2xl overflow-hidden border border-amber-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
            <path d="M 40,24 L 60,24 L 66,42 L 72,82 C 72,86 68,90 64,90 L 36,90 C 32,90 28,86 28,82 L 34,42 Z" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 44,16 L 56,16 L 56,24 L 44,24 Z" fill="#b45309" />
            <path d="M 50,48 L 50,76 M 38,62 L 62,62" stroke="#fef3c7" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-400">STAB</span>
        </div>
      );

    // --- 4. SYNTHESIS ---
    case 'chem_ergot':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#180824] to-[#07020d] rounded-2xl overflow-hidden border border-purple-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(168,85,247,0.5)]">
            <path d="M 44,18 L 56,18 L 56,36 L 76,78 C 80,86 74,90 66,90 L 34,90 C 26,90 20,86 24,78 L 44,36 Z" fill="#3b0764" stroke="#c084fc" strokeWidth="2.5" />
            <path d="M 32,68 Q 50,60 68,68 L 64,84 L 36,84 Z" fill="#a855f7" opacity="0.8" />
            <circle cx="44" cy="74" r="2.5" fill="#ffffff" />
            <circle cx="56" cy="76" r="3" fill="#ffffff" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-purple-400">ERGOT</span>
        </div>
      );

    case 'chem_diethyl':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0c1822] to-[#03080e] rounded-2xl overflow-hidden border border-cyan-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(6,182,212,0.5)]">
            <rect x="36" y="18" width="28" height="12" rx="3" fill="#0e7490" />
            <path d="M 32,30 L 68,30 L 72,84 C 72,88 68,90 64,90 L 36,90 C 32,90 28,88 28,84 Z" fill="#155e75" stroke="#06b6d4" strokeWidth="2.5" />
            <rect x="34" y="44" width="32" height="32" rx="4" fill="#22d3ee" opacity="0.7" />
            <text x="50" y="64" textAnchor="middle" fill="#083344" fontSize="10" fontWeight="bold" fontFamily="monospace">DEA</text>
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-cyan-400">50ml</span>
        </div>
      );

    case 'chem_blotter':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1a0f28] to-[#080310] rounded-2xl overflow-hidden border border-pink-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(236,72,153,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(236,72,153,0.5)]">
            <rect x="22" y="22" width="56" height="56" rx="4" fill="#831843" stroke="#f472b6" strokeWidth="2.5" />
            {/* Grid perforations */}
            <path d="M 36,22 L 36,78 M 50,22 L 50,78 M 64,22 L 64,78 M 22,36 L 78,36 M 22,50 L 78,50 M 22,64 L 78,64" stroke="#fbcfe8" strokeWidth="1" strokeDasharray="2 2" />
            {/* Center Fractal Eye */}
            <circle cx="50" cy="50" r="10" fill="#ec4899" />
            <circle cx="50" cy="50" r="4" fill="#ffffff" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-pink-400">900 TABS</span>
        </div>
      );

    // --- 5. POWDER REFINERY ---
    case 'pow_white':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#141b24] to-[#080c10] rounded-2xl overflow-hidden border border-slate-400/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.2),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]">
            {/* White Crystal Mound */}
            <path d="M 22,78 L 38,36 L 52,24 L 66,36 L 78,78 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
            <path d="M 38,36 L 52,48 L 66,36" stroke="#cbd5e1" strokeWidth="2" fill="none" />
            <path d="M 52,24 L 52,78" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="45" cy="40" r="2" fill="#ffffff" />
            <circle cx="60" cy="52" r="2.5" fill="#ffffff" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-white">99%</span>
        </div>
      );

    case 'pow_dark':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1a0824] to-[#07010f] rounded-2xl overflow-hidden border border-purple-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(168,85,247,0.5)]">
            <path d="M 22,78 L 38,34 L 52,20 L 68,34 L 78,78 Z" fill="#2e1065" stroke="#a855f7" strokeWidth="2" />
            <path d="M 38,34 L 52,46 L 68,34" stroke="#c084fc" strokeWidth="2" fill="none" />
            <path d="M 52,20 L 52,78" stroke="#c084fc" strokeWidth="2" />
            <circle cx="45" cy="40" r="2.5" fill="#d8b4fe" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-purple-400">RAW</span>
        </div>
      );

    case 'pow_filter':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0c1a24] to-[#03090e] rounded-2xl overflow-hidden border border-cyan-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(6,182,212,0.5)]">
            <ellipse cx="50" cy="35" rx="30" ry="12" fill="#0891b2" stroke="#22d3ee" strokeWidth="2" />
            <path d="M 20,35 L 50,85 L 80,35 Z" fill="#164e63" stroke="#22d3ee" strokeWidth="2" />
            <path d="M 34,48 Q 50,60 66,48" stroke="#a5f3fc" strokeWidth="2" fill="none" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-cyan-400">FILTER</span>
        </div>
      );

    case 'pow_stabilizer':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#1c1408] to-[#0a0601] rounded-2xl overflow-hidden border border-amber-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
            <polygon points="50,18 78,38 78,72 50,90 22,72 22,38" fill="#78350f" stroke="#f59e0b" strokeWidth="2.5" />
            <path d="M 50,18 L 50,90 M 22,38 L 78,72 M 22,72 L 78,38" stroke="#fde68a" strokeWidth="1.5" opacity="0.8" />
            <circle cx="50" cy="54" r="6" fill="#ffffff" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-400">STAB</span>
        </div>
      );

    case 'pow_packaging':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0c1815] to-[#030a08] rounded-2xl overflow-hidden border border-emerald-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]">
            <rect x="24" y="24" width="52" height="60" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
            <rect x="24" y="24" width="52" height="12" fill="#047857" />
            <line x1="24" y1="36" x2="76" y2="36" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="50" cy="56" r="10" fill="#10b981" />
            <text x="50" y="60" textAnchor="middle" fill="#ecfdf5" fontSize="10" fontWeight="bold">AUR</text>
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-emerald-400">PACK</span>
        </div>
      );

    // --- 6. INFRASTRUCTURE & UPGRADES ---
    case 'fac_filter':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#181208] to-[#080501] rounded-2xl overflow-hidden border border-amber-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.25),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(245,158,11,0.4)]">
            <ellipse cx="50" cy="28" rx="26" ry="10" fill="#78350f" stroke="#f59e0b" strokeWidth="2" />
            <path d="M 24,28 L 24,72 C 24,80 35,86 50,86 C 65,86 76,80 76,72 L 76,28 Z" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
            <ellipse cx="50" cy="50" rx="24" ry="8" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <ellipse cx="50" cy="68" rx="24" ry="8" stroke="#fde68a" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-amber-400">250m³</span>
        </div>
      );

    case 'fac_solar':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-[#0c1815] to-[#020a06] rounded-2xl overflow-hidden border border-emerald-500/30 ${sizeClasses} ${className}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.3),transparent_70%)]" />
          <svg viewBox="0 0 100 100" className="w-full h-full p-2 filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)]">
            {/* Slanted Solar Panel */}
            <polygon points="18,78 82,78 72,24 28,24" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
            <path d="M 36,24 L 30,78 M 50,24 L 50,78 M 64,24 L 70,78 M 24,42 L 76,42 M 20,60 L 80,60" stroke="#6ee7b7" strokeWidth="1.8" />
            {/* Sun Rays */}
            <circle cx="82" cy="18" r="8" fill="#facc15" />
          </svg>
          <span className="absolute bottom-1 right-2 text-[9px] font-mono font-bold text-emerald-400">400W</span>
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 ${sizeClasses} ${className}`}>
          <div className="w-6 h-6 rounded-full bg-cyan-400/20" />
        </div>
      );
  }
};
