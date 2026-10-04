import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxHeightClass?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeightClass = 'max-h-[85dvh]'
}) => {
  useEffect(() => {
    if (isOpen) {
      hapticFeedback.light();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop Tap to Close */}
      <div 
        className="flex-1 w-full" 
        onClick={() => {
          hapticFeedback.light();
          onClose();
        }} 
      />

      {/* Sheet Container */}
      <div
        className={`w-full bg-[#0b0f17] border-t border-white/15 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.9)] text-white flex flex-col overflow-hidden animate-slideUp ${maxHeightClass} pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        <div 
          className="w-full py-2.5 flex items-center justify-center cursor-pointer active:opacity-60"
          onClick={() => {
            hapticFeedback.light();
            onClose();
          }}
        >
          <div className="w-12 h-1.5 bg-white/25 rounded-full" />
        </div>

        {/* Sheet Header */}
        {(title || subtitle) && (
          <div className="px-5 pb-3 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              {title && (
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-400 font-mono mt-0.5">{subtitle}</p>
              )}
            </div>

            <button
              onClick={() => {
                hapticFeedback.light();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px]"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Sheet Body Scroll Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};
