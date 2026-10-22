'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CheckCircle2, Info } from 'lucide-react';
import { AppToast } from '@/context/AppContext';
import { haptic } from '@/lib/capacitor';

/** Heads-up banner for queue events, like an Android notification dropping in from the top. */
export const Toaster: React.FC = () => {
  const [toast, setToast] = useState<(AppToast & { id: number }) | null>(null);
  const timer = useRef<number>();

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<AppToast>).detail;
      haptic(detail.kind === 'alert' ? 'warning' : detail.kind === 'success' ? 'success' : 'light');
      setToast({ ...detail, id: Date.now() });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setToast(null), detail.kind === 'alert' ? 6000 : 3800);
    };
    window.addEventListener('qb:toast', onToast);
    return () => window.removeEventListener('qb:toast', onToast);
  }, []);

  const Icon = toast?.kind === 'alert' ? BellRing : toast?.kind === 'success' ? CheckCircle2 : Info;
  const accent = toast?.kind === 'alert' ? '#FF6B4A' : toast?.kind === 'success' ? '#3DDC97' : '#FFD60A';

  return (
    <div className="fixed inset-x-0 top-0 z-[70] pointer-events-none flex justify-center px-3 pt-[calc(8px+var(--sat))]">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -80, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => info.offset.y < -20 && setToast(null)}
            className="pointer-events-auto w-full max-w-md rounded-[22px] glass hairline px-4 py-3 flex items-center gap-3 shadow-2xl"
            role="status"
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: `${accent}22`, color: accent }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[14px] font-bold text-ink leading-tight">{toast.title}</div>
              {toast.body && <div className="text-[12.5px] text-ink-mute truncate mt-0.5">{toast.body}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
