import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  const content = (
    <div className="fixed inset-0 z-[99999] flex flex-col justify-end bg-black/85 backdrop-blur-md animate-fadeIn">
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
        className={`w-full bg-[#0b0f17] border-t border-white/20 rounded-t-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.95)] text-white flex flex-col overflow-hidden animate-slideUp ${maxHeightClass} pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle Bar */}
        <div 
          className="w-full py-3 flex items-center justify-center cursor-pointer active:opacity-60"
          onClick={() => {
            hapticFeedback.light();
            onClose();
          }}
        >
          <div className="w-14 h-1.5 bg-white/30 rounded-full" />
        </div>

        {/* Sheet Header */}
        {(title || subtitle) && (
          <div className="px-5 pb-3.5 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
            <div>
              {title && (
                <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
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
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px] shrink-0"
              aria-label="Закрыть"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Sheet Body Scroll Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs font-sans max-h-[calc(85dvh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
