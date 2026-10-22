'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Booking, DocumentChecklistItem } from '@/types';
import { useApp } from '@/context/AppContext';
import { Check, MapPin, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { haptic } from '@/lib/capacitor';
import { Pressable } from '@/components/ui/primitives';

interface DocumentChecklistProps {
  booking: Booking;
  items: DocumentChecklistItem[];
  onToggleItem: (itemId: string) => void;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ booking, items, onToggleItem }) => {
  const { t, locale } = useApp();
  const checkedIds = booking.checklist_progress || [];
  const mandatory = items.filter((i) => i.is_mandatory);
  const allMandatoryReady = mandatory.length > 0 && mandatory.every((i) => checkedIds.includes(i.id));
  const done = items.filter((i) => checkedIds.includes(i.id)).length;
  const percent = items.length ? done / items.length : 0;

  // Celebrate only on the tap that completes the list, not when opening a finished one.
  const wasReady = useRef(allMandatoryReady);
  useEffect(() => {
    if (allMandatoryReady && !wasReady.current) {
      haptic('success');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 }, colors: ['#FFD60A', '#3DDC97', '#FAFAF7'] });
    }
    wasReady.current = allMandatoryReady;
  }, [allMandatoryReady]);

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] bg-night-700 hairline p-6 text-center">
        <ShieldCheck className="w-8 h-8 text-mint mx-auto" />
        <p className="mt-3 text-[14px] font-bold text-ink">No documents needed</p>
        <p className="mt-1 text-[12.5px] text-ink-mute">Just bring a photo ID to the counter.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-[24px] bg-night-700 hairline p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[15px] font-extrabold text-ink">
              {allMandatoryReady ? 'You’re counter-ready' : 'Get your folder ready'}
            </div>
            <div className="text-[12.5px] text-ink-mute mt-0.5">
              {done} of {items.length} {t.checklist.progressReady}
            </div>
          </div>
          <div className="meter-digits text-[22px] font-bold" style={{ color: allMandatoryReady ? '#3DDC97' : '#FFD60A' }}>
            {Math.round(percent * 100)}%
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/[0.07] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: allMandatoryReady ? '#3DDC97' : '#FFD60A' }}
            initial={false}
            animate={{ width: `${percent * 100}%` }}
            transition={{ type: 'spring', damping: 24, stiffness: 160 }}
          />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const checked = checkedIds.includes(item.id);
          return (
            <Pressable
              key={item.id}
              feedback="selection"
              onClick={() => onToggleItem(item.id)}
              className={`w-full text-left flex items-start gap-3 rounded-[20px] p-3.5 transition-colors ${
                checked ? 'bg-mint/[0.06]' : 'bg-night-700 hairline'
              }`}
            >
              <motion.span
                animate={{ scale: checked ? [1, 1.25, 1] : 1 }}
                transition={{ duration: 0.25 }}
                className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  checked ? 'bg-mint text-night' : 'border-2 border-white/20'
                }`}
              >
                {checked && <Check className="w-4 h-4" strokeWidth={3} />}
              </motion.span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[14px] font-bold leading-snug ${checked ? 'text-ink-mute line-through' : 'text-ink'}`}>
                    {locale === 'kn' ? item.item_name_kn : item.item_name}
                  </span>
                  {item.is_mandatory && !checked && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-coral bg-coral/10 rounded-full px-2 py-0.5 shrink-0">
                      Must
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-ink-mute mt-1 leading-relaxed">
                  {item.copy_type === 'original'
                    ? t.checklist.original
                    : item.copy_type === 'photocopy'
                    ? `${item.copies_count} × ${t.checklist.photocopy}`
                    : `${t.checklist.both} (${item.copies_count}×)`}{' '}
                  · {item.help_text}
                </div>
                {!checked && (
                  <div className="mt-1.5 flex items-start gap-1 text-[11.5px] text-ink-faint">
                    <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{item.where_to_get}</span>
                  </div>
                )}
              </div>
            </Pressable>
          );
        })}
      </div>

      <p className="mt-4 flex items-start gap-2 text-[11.5px] text-ink-faint leading-relaxed px-1">
        <ShieldCheck className="w-3.5 h-3.5 text-mint shrink-0 mt-0.5" />
        {t.common.privacyNote}
      </p>
    </div>
  );
};
