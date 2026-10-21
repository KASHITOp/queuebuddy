'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  Compass,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  ChevronRight,
  Phone,
  MessageCircle,
  Navigation,
  Sparkles,
} from 'lucide-react';

interface LiveTokenHeroCardProps {
  booking?: Booking;
  onTrackClick: () => void;
  onBookClick: () => void;
}

export const LiveTokenHeroCard: React.FC<LiveTokenHeroCardProps> = ({
  booking,
  onTrackClick,
  onBookClick,
}) => {
  const { t, locale, updateBookingStatus } = useApp();
  const [onWayAlert, setOnWayAlert] = useState(false);

  if (!booking) {
    // Empty Hero Card (Zero dense lists above the fold)
    return (
      <div className="relative overflow-hidden rounded-3xl bg-[#111111] text-[#FFFCF2] p-6 border-2 border-black shadow-xl">
        {/* Subtle yellow gradient glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#FFD60A]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-[#FFD60A] text-[#111111] font-mono font-bold text-[11px] tracking-wide uppercase">
              Bengaluru Only
            </span>
            <span className="text-xs text-white/70 font-medium">
              RTO • Sub-Registrar • PSK • BBMP
            </span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight font-display">
              {locale === 'kn' ? (
                <>
                  ಸರ್ಕಾರಿ ಕಚೇರಿಗಳಲ್ಲಿ ಸಾಲಿನಲ್ಲಿ ನಿಲ್ಲಬೇಡಿ.{' '}
                  <span className="text-[#FFD60A]">ನಿಮ್ಮ ಸರದಿ ಬಂದಾಗ ತಲುಪಿ.</span>
                </>
              ) : locale === 'hi' ? (
                <>
                  सरकारी कतारों में अब समय मत गँवाइए.{' '}
                  <span className="text-[#FFD60A]">अपनी बारी पर पहुँचे.</span>
                </>
              ) : (
                <>
                  Never stand in queues again.{' '}
                  <span className="text-[#FFD60A]">Arrive when your turn is near.</span>
                </>
              )}
            </h1>
            <p className="text-xs text-[#E5E0D5] leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <button
            onClick={onBookClick}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#FFD60A] text-[#111111] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FFD60A]/20 active:scale-[0.98] transition-transform touch-target border border-black/10"
          >
            <Sparkles className="w-4 h-4 text-[#111111]" />
            <span>{t.common.bookBuddy}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const isSummoned = booking.status === 'customer_summoned';
  const isTraveling = booking.status === 'customer_traveling';
  const peopleAhead = booking.people_ahead ?? 4;
  const tokenNumber = booking.token_number || 'KA03-B42';
  const etaMinutes = Math.max(5, peopleAhead * 5);

  const handleImOnMyWay = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateBookingStatus(booking.id, 'customer_traveling');
    setOnWayAlert(true);
    setTimeout(() => setOnWayAlert(false), 4000);
  };

  return (
    <div
      onClick={onTrackClick}
      className="cursor-pointer relative overflow-hidden rounded-3xl bg-[#FFFFFF] border-2 border-[#111111] shadow-xl text-[#111111] transition-transform active:scale-[0.99] touch-target"
    >
      {/* Top Taxi-Meter Header Strip */}
      <div className="bg-[#111111] text-[#FFFCF2] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isSummoned ? 'bg-[#FF5A36]' : 'bg-[#0B7A4B]'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isSummoned ? 'bg-[#FF5A36]' : 'bg-[#0B7A4B]'
              }`}
            />
          </span>
          <span className="text-xs font-mono font-bold tracking-wide uppercase text-[#FFD60A]">
            {isSummoned ? '🚨 Summon Alert' : isTraveling ? '🚗 Traveling to Office' : '🟢 Live Token Active'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#E5E0D5]">
          {booking.booking_code}
        </div>
      </div>

      {/* Main Hero Card Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Office & Service */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-[#555555] font-medium truncate">
              <MapPin className="w-3.5 h-3.5 text-[#0B7A4B] shrink-0" />
              <span className="truncate">{booking.office.name}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#111111] tracking-tight truncate mt-0.5 font-display">
              {locale === 'kn' ? booking.service.title_kn : booking.service.title}
            </h2>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F4F0E6] text-[#111111] shrink-0 border border-[#E5E0D5]">
            Counter 2
          </span>
        </div>

        {/* Taxi-Meter Style Digits Display */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* People Ahead (Key Metric with Flip Animation) */}
          <div className="taxi-meter-display p-3 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-[#E5E0D5] uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-[#FFD60A]" />
              <span>Ahead</span>
            </div>
            <div className="text-3xl font-black font-mono tracking-tight text-[#FFD60A] mt-0.5 animate-meter-flip">
              {peopleAhead < 10 ? `0${peopleAhead}` : peopleAhead}
            </div>
            <span className="text-[9px] text-white/60 font-mono">tokens</span>
          </div>

          {/* Token Number */}
          <div className="taxi-meter-display p-3 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-[#E5E0D5] uppercase tracking-wider">
              Token
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white mt-1">
              {tokenNumber}
            </div>
            <span className="text-[9px] text-[#0B7A4B] font-mono font-bold">Counter Desk</span>
          </div>

          {/* Wait ETA */}
          <div className="taxi-meter-display p-3 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="text-[10px] font-bold text-[#E5E0D5] uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0B7A4B]" />
              <span>ETA</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#0B7A4B] mt-0.5">
              ~{etaMinutes}m
            </div>
            <span className="text-[9px] text-white/60 font-mono">est. arrive</span>
          </div>
        </div>

        {/* Assigned Buddy Snippet */}
        {booking.buddy && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFD60A] border border-[#111111] text-[#111111] font-black text-sm flex items-center justify-center shrink-0">
                {booking.buddy.full_name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#111111] truncate">
                    {booking.buddy.full_name}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0B7A4B] shrink-0" />
                </div>
                <div className="text-[10px] text-[#555555] truncate">
                  ⭐ {booking.buddy.rating} • Speaks {booking.buddy.languages.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <a
                href={`tel:${booking.buddy.phone}`}
                className="p-2 rounded-lg bg-[#FFFFFF] hover:bg-[#E5E0D5] text-[#0B7A4B] border border-[#E5E0D5] transition-colors"
                title="Call Buddy"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/${booking.buddy.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-[#0B7A4B] hover:bg-[#09633d] text-white transition-colors"
                title="WhatsApp Buddy"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Big "I'm on my way" Button */}
        <div className="space-y-1.5">
          <button
            onClick={handleImOnMyWay}
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all touch-target border-2 ${
              isTraveling
                ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                : isSummoned
                ? 'bg-[#FF5A36] text-white border-[#111111] animate-pulse'
                : 'bg-[#FFD60A] text-[#111111] border-[#111111]'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>
              {isTraveling
                ? '✓ Notified Buddy: Traveling Now'
                : isSummoned
                ? '🚨 Arriving Now! Notify Buddy'
                : t.common.imOnMyWay}
            </span>
          </button>

          {onWayAlert && (
            <div className="text-center text-[11px] font-bold text-[#0B7A4B] animate-in fade-in duration-200">
              {t.common.onMyWayAlert}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
