'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { Navigation, Phone, MessageCircle, ShieldCheck, Star, Check, PartyPopper } from 'lucide-react';
import { Avatar, Pressable } from '@/components/ui/primitives';

export const LIVE_STATUSES: Booking['status'][] = ['in_queue', 'customer_summoned', 'customer_traveling', 'buddy_arrived'];

export const isLive = (b: Booking) => LIVE_STATUSES.includes(b.status);

const URGENCY: Partial<Record<Booking['status'], number>> = { customer_summoned: 0, customer_traveling: 1, in_queue: 2, buddy_arrived: 3 };

/** The live booking that matters most right now: called-in first, then the shortest line. */
export const pickLive = (bookings: Booking[]) =>
  bookings
    .filter(isLive)
    .sort((a, b) => (URGENCY[a.status] ?? 9) - (URGENCY[b.status] ?? 9) || (a.people_ahead ?? 99) - (b.people_ahead ?? 99))[0];

export const statusTone = (status: Booking['status']) => {
  switch (status) {
    case 'customer_summoned':
      return { color: '#FF6B4A', label: 'Head out now' };
    case 'customer_traveling':
      return { color: '#3DDC97', label: "You're on the way" };
    case 'handover_completed':
      return { color: '#3DDC97', label: 'Your turn' };
    case 'cancelled':
      return { color: '#8B8B94', label: 'Cancelled' };
    case 'assigned':
    case 'requested':
      return { color: '#60A5FA', label: 'Buddy assigned' };
    case 'buddy_arrived':
      return { color: '#FFD60A', label: 'Buddy at office' };
    default:
      return { color: '#FFD60A', label: 'Holding your spot' };
  }
};

/** Minutes each token takes at the counter in the demo estimate. */
const MINS_PER_TOKEN = 5;

const Ring: React.FC<{ ahead: number; color: string; size: number; stroke: number }> = ({ ahead, color, size, stroke }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // The ring fills as the line shrinks; 15 ahead reads as an empty ring.
  const progress = 1 - Math.min(ahead, 15) / 15;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={c}
        initial={false}
        animate={{ strokeDashoffset: c * (1 - Math.max(progress, 0.04)) }}
        transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
      />
    </svg>
  );
};

/** Rolling counter: each new value slides up like a mechanical meter. */
export const RollingNumber: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <span className={`relative inline-flex overflow-hidden ${className}`}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '-100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
        className="meter-digits"
      >
        {value.toString().padStart(2, '0')}
      </motion.span>
    </AnimatePresence>
  </span>
);

interface TokenMeterProps {
  booking: Booking;
  variant?: 'hero' | 'full';
  onOpen?: () => void;
}

export const TokenMeter: React.FC<TokenMeterProps> = ({ booking, variant = 'hero', onOpen }) => {
  const { updateBookingStatus, locale } = useApp();
  const tone = statusTone(booking.status);
  const ahead = booking.people_ahead ?? 0;
  const eta = Math.max(1, ahead * MINS_PER_TOKEN);
  const isSummoned = booking.status === 'customer_summoned';
  const isTraveling = booking.status === 'customer_traveling';
  const isDone = booking.status === 'handover_completed';
  const waitingForToken = booking.status === 'assigned' || booking.status === 'buddy_arrived';
  const full = variant === 'full';

  const handleOnMyWay = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBookingStatus(booking.id, 'customer_traveling');
  };

  const ringSize = full ? 208 : 132;

  const stats = (
    <div className={`grid grid-cols-2 gap-2 mt-4`}>
      <div className="rounded-2xl bg-white/[0.05] px-3 py-2 text-left">
        <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Token</div>
        <div className="meter-digits text-[15px] font-bold text-ink mt-0.5 whitespace-nowrap">{booking.token_number || '— —'}</div>
      </div>
      <div className="rounded-2xl bg-white/[0.05] px-3 py-2 text-left">
        <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">Your turn</div>
        <div className="meter-digits text-[15px] font-bold mt-0.5" style={{ color: tone.color }}>
          {isDone ? 'Now' : waitingForToken ? '—' : `~${eta}m`}
        </div>
      </div>
    </div>
  );

  return (
    <motion.div
      layout
      onClick={onOpen}
      className={`relative overflow-hidden rounded-[28px] grain ${onOpen ? 'cursor-pointer' : ''}`}
      style={{
        background: `radial-gradient(120% 90% at 0% 0%, ${tone.color}2E 0%, transparent 55%), linear-gradient(180deg, #1A1A1F 0%, #111114 100%)`,
        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.07), 0 30px 60px -30px ${tone.color}55`,
      }}
    >
      {/* Status strip */}
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full live-dot shrink-0" style={{ background: tone.color }} />
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] truncate" style={{ color: tone.color }}>
            {tone.label}
          </span>
        </div>
        <span className="meter-digits text-[11px] text-ink-mute shrink-0">{booking.booking_code}</span>
      </div>

      <div className={`px-5 ${full ? 'pt-2 pb-5' : 'pt-3 pb-5'}`}>
        <div className={full ? 'flex flex-col items-center text-center' : 'flex items-center gap-4'}>
          {/* Ring */}
          <div className="relative shrink-0" style={{ width: ringSize, height: ringSize }}>
            <Ring ahead={isDone ? 0 : waitingForToken ? 15 : ahead} color={tone.color} size={ringSize} stroke={full ? 12 : 9} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isDone ? (
                <PartyPopper className={full ? 'w-14 h-14' : 'w-10 h-10'} style={{ color: tone.color }} />
              ) : waitingForToken ? (
                <span className="text-[11px] font-bold text-ink-mute uppercase tracking-wider px-3 text-center leading-tight">
                  Getting
                  <br />
                  token
                </span>
              ) : (
                <>
                  <RollingNumber
                    value={ahead}
                    className={`font-black text-ink ${full ? 'text-[64px] leading-[1]' : 'text-[40px] leading-[1]'}`}
                  />
                  <span className={`font-semibold text-ink-mute ${full ? 'text-[13px] mt-1' : 'text-[11px]'}`}>ahead of you</span>
                </>
              )}
            </div>
          </div>

          {/* Office + stats */}
          <div className={`min-w-0 ${full ? 'mt-4 w-full' : 'flex-1'}`}>
            <div className={`text-[12px] text-ink-mute font-medium truncate ${full ? '' : ''}`}>{booking.office.name}</div>
            <h3 className={`font-extrabold text-ink leading-snug ${full ? 'text-[20px] mt-1' : 'text-[15px] mt-0.5 line-clamp-2'}`}>
              {locale === 'kn' ? booking.service.title_kn : booking.service.title}
            </h3>
            {full && stats}
          </div>
        </div>

        {!full && stats}

        {/* Buddy */}
        {booking.buddy && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white/[0.04] hairline p-2.5 pr-2">
            <Avatar name={booking.buddy.full_name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="text-[14px] font-bold text-ink truncate">{booking.buddy.full_name}</span>
                <ShieldCheck className="w-4 h-4 text-mint shrink-0" />
              </div>
              <div className="flex items-center gap-1 text-[11.5px] text-ink-mute">
                <Star className="w-3 h-3 fill-brand text-brand" />
                <span>{booking.buddy.rating}</span>
                <span className="text-ink-faint">•</span>
                <span className="truncate">{booking.buddy.languages.slice(0, 2).join(', ')}</span>
              </div>
            </div>
            <a
              href={`tel:${booking.buddy.phone}`}
              onClick={(e) => e.stopPropagation()}
              aria-label="Call buddy"
              className="w-10 h-10 rounded-full bg-white/[0.07] flex items-center justify-center text-ink active:scale-90 transition-transform"
            >
              <Phone className="w-[18px] h-[18px]" />
            </a>
            <a
              href={`https://wa.me/${booking.buddy.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label="WhatsApp buddy"
              className="w-10 h-10 rounded-full bg-mint/15 text-mint flex items-center justify-center active:scale-90 transition-transform"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
            </a>
          </div>
        )}

        {/* Primary action */}
        {!isDone && !waitingForToken && (
          <Pressable
            feedback="medium"
            onClick={handleOnMyWay}
            disabled={isTraveling}
            className={`relative overflow-hidden mt-3 w-full h-[52px] rounded-2xl font-display font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:!opacity-100 ${
              isTraveling
                ? 'bg-mint/15 text-mint'
                : isSummoned
                ? 'bg-coral text-white sheen'
                : 'bg-brand text-night'
            }`}
          >
            {isTraveling ? <Check className="w-5 h-5" /> : <Navigation className="w-[18px] h-[18px]" />}
            <span>{isTraveling ? 'Buddy knows you’re coming' : isSummoned ? 'I’m heading out now' : 'I’m on my way'}</span>
          </Pressable>
        )}
      </div>
    </motion.div>
  );
};
