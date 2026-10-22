'use client';

import React from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { useBackHandler } from '@/components/shell/BackStack';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Optional sticky footer (primary action). */
  footer?: React.ReactNode;
  label: string;
}

/** Native-style bottom sheet: slides up, drags down to dismiss, closes on Android back. */
export const Sheet: React.FC<SheetProps> = ({ open, onClose, children, footer, label }) => {
  useBackHandler(open, onClose);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-md max-h-[88dvh] flex flex-col rounded-t-[28px] bg-night-800 hairline overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={handleDragEnd}
          >
            <div className="pt-2.5 pb-1 flex justify-center shrink-0 cursor-grab">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div
              className="screen-scroll flex-1 min-h-0"
              // Let the list scroll without the sheet stealing the gesture.
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {children}
            </div>
            {footer && <div className="shrink-0 px-4 pt-3 pb-[calc(12px+var(--sab))] border-t border-white/5 bg-night-800">{footer}</div>}
            {!footer && <div className="shrink-0 h-[var(--sab)]" />}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
