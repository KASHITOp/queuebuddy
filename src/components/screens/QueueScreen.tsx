'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { TokenMeter, statusTone } from '@/components/queue/TokenMeter';
import { DocumentChecklist } from '@/components/booking/DocumentChecklist';
import { OfficeGlyph, Pressable, PrimaryButton } from '@/components/ui/primitives';
import { CalendarDays, Check, Ticket, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface QueueScreenProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBook: () => void;
}

const STAGES: { key: string; title: string; reached: (b: Booking) => boolean }[] = [
  { key: 'assigned', title: 'Buddy assigned', reached: () => true },
  { key: 'arrived', title: 'Buddy at the office', reached: (b) => b.status !== 'assigned' && b.status !== 'requested' },
  { key: 'token', title: 'Token collected', reached: (b) => !!b.token_number && b.status !== 'buddy_arrived' && b.status !== 'assigned' },
  {
    key: 'summoned',
    title: 'You’re called in',
    reached: (b) => ['customer_summoned', 'customer_traveling', 'handover_completed'].includes(b.status),
  },
  { key: 'handover', title: 'Spot handed over', reached: (b) => b.status === 'handover_completed' },
];

const Timeline: React.FC<{ booking: Booking }> = ({ booking }) => {
  const reachedCount = STAGES.filter((s) => s.reached(booking)).length;
  return (
    <div className="rounded-[24px] bg-night-700 hairline p-5">
      <h3 className="text-[15px] font-extrabold text-ink mb-4">Progress</h3>
      <div>
        {STAGES.map((stage, i) => {
          const reached = i < reachedCount;
          const current = i === reachedCount;
          return (
            <div key={stage.key} className="flex gap-3.5">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{ scale: current ? [1, 1.12, 1] : 1 }}
                  transition={{ repeat: current ? Infinity : 0, duration: 1.6 }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    reached ? 'bg-mint text-night' : current ? 'bg-brand/20 shadow-[inset_0_0_0_2px_#FFD60A]' : 'bg-white/[0.06]'
                  }`}
                >
                  {reached && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </motion.div>
                {i < STAGES.length - 1 && <div className={`w-0.5 h-7 ${reached ? 'bg-mint/50' : 'bg-white/[0.08]'}`} />}
              </div>
              <div className={`pt-0.5 text-[14px] ${reached ? 'text-ink font-semibold' : current ? 'text-brand font-bold' : 'text-ink-faint'}`}>
                {stage.title}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const QueueScreen: React.FC<QueueScreenProps> = ({ selectedId, onSelect, onBook }) => {
  const { bookings, checklists, toggleChecklistItem } = useApp();
  const [tab, setTab] = useState<'live' | 'docs'>('live');

  const visible = bookings.filter((b) => b.status !== 'cancelled');
  const selected = visible.find((b) => b.id === selectedId) || visible[0];

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-10">
        <div className="w-20 h-20 rounded-[26px] bg-brand/10 text-brand flex items-center justify-center">
          <Ticket className="w-9 h-9" />
        </div>
        <h2 className="mt-5 text-[22px] font-black text-ink">No bookings yet</h2>
        <p className="mt-2 text-[14px] text-ink-mute leading-relaxed">
          Book a buddy and your live token shows up here, counting down to your turn.
        </p>
        <PrimaryButton className="mt-6 max-w-[260px]" onClick={onBook}>
          Book a buddy
        </PrimaryButton>
      </div>
    );
  }

  const docs = checklists.filter((c) => c.service_id === selected.service_id);
  const docsDone = docs.filter((d) => selected.checklist_progress?.includes(d.id)).length;

  return (
    <div className="pb-6">
      <div className="px-5 pt-4 pb-4 flex items-center justify-between">
        <h1 className="text-[28px] font-black text-ink">My queue</h1>
        <Pressable onClick={onBook} aria-label="New booking" className="w-10 h-10 rounded-full bg-night-700 hairline flex items-center justify-center text-ink">
          <Plus className="w-5 h-5" />
        </Pressable>
      </div>

      {/* Booking switcher */}
      {visible.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pb-4">
          {visible.map((b) => {
            const active = b.id === selected.id;
            const tone = statusTone(b.status);
            return (
              <Pressable
                key={b.id}
                feedback="selection"
                onClick={() => onSelect(b.id)}
                className={`shrink-0 flex items-center gap-2.5 rounded-2xl pl-2 pr-3.5 py-2 text-left transition-colors ${
                  active ? 'bg-night-600 shadow-[inset_0_0_0_1.5px_rgba(255,214,10,0.7)]' : 'bg-night-700 hairline'
                }`}
              >
                <OfficeGlyph type={b.office.office_type} size={34} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-ink max-w-[140px] truncate">{b.office.area}</div>
                  <div className="text-[11px] font-semibold" style={{ color: tone.color }}>
                    {tone.label}
                  </div>
                </div>
              </Pressable>
            );
          })}
        </div>
      )}

      <div className="px-4">
        {/* Segmented control */}
        <div className="relative grid grid-cols-2 p-1 rounded-2xl bg-night-700 hairline mb-4">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl bg-night-500"
            animate={{ x: tab === 'live' ? 0 : '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
          {(['live', 'docs'] as const).map((k) => (
            <Pressable
              key={k}
              feedback="selection"
              onClick={() => setTab(k)}
              className={`relative h-10 text-[13.5px] font-bold transition-colors ${tab === k ? 'text-ink' : 'text-ink-mute'}`}
            >
              {k === 'live' ? 'Live tracker' : `Documents ${docs.length ? `${docsDone}/${docs.length}` : ''}`}
            </Pressable>
          ))}
        </div>

        {tab === 'live' ? (
          <div className="space-y-3">
            <TokenMeter booking={selected} variant="full" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-[20px] bg-night-700 hairline p-3.5">
                <CalendarDays className="w-4 h-4 text-ink-faint" />
                <div className="text-[10.5px] uppercase tracking-wider text-ink-faint font-bold mt-2">Date</div>
                <div className="text-[14px] font-bold text-ink mt-0.5">{format(parseISO(selected.booking_date), 'EEE, d MMM')}</div>
              </div>
              <div className="rounded-[20px] bg-night-700 hairline p-3.5">
                <Ticket className="w-4 h-4 text-ink-faint" />
                <div className="text-[10.5px] uppercase tracking-wider text-ink-faint font-bold mt-2">Paid</div>
                <div className="text-[14px] font-bold text-ink mt-0.5">
                  ₹{selected.total_amount}{' '}
                  {selected.government_fee > 0 && (
                    <span className="text-ink-faint font-medium text-[12px]">+ ₹{selected.government_fee} at desk</span>
                  )}
                </div>
              </div>
            </div>
            <Timeline booking={selected} />
          </div>
        ) : (
          <DocumentChecklist booking={selected} items={docs} onToggleItem={(id) => toggleChecklistItem(selected.id, id)} />
        )}
      </div>
    </div>
  );
};
