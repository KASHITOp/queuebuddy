'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Users,
  AlertCircle,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Compass,
  Navigation,
  FileCheck2,
  Calendar,
} from 'lucide-react';

interface LiveQueueTrackerProps {
  booking: Booking;
  onOpenChecklist: () => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({
  booking,
  onOpenChecklist,
}) => {
  const { t, locale, updateBookingStatus } = useApp();
  const [onWayToast, setOnWayToast] = useState(false);

  const isSummoned = booking.status === 'customer_summoned';
  const isTraveling = booking.status === 'customer_traveling';
  const isCompleted = booking.status === 'handover_completed';
  const isInQueue =
    booking.status === 'in_queue' || isSummoned || isTraveling;

  const peopleAhead = booking.people_ahead ?? 4;
  const tokenNumber = booking.token_number || 'KA03-B42';
  const etaMins = Math.max(5, peopleAhead * 5);

  const handleOnMyWay = () => {
    updateBookingStatus(booking.id, 'customer_traveling');
    setOnWayToast(true);
    setTimeout(() => setOnWayToast(false), 4000);
  };

  const timelineSteps = [
    {
      id: 'step-1',
      title: 'Buddy Assigned',
      desc: `${booking.buddy?.full_name || 'Verified Buddy'} confirmed`,
      done: true,
      time: '09:45 AM',
    },
    {
      id: 'step-2',
      title: 'Buddy at Office',
      desc: `Reached ${booking.office.name}`,
      done: true,
      time: '10:10 AM',
    },
    {
      id: 'step-3',
      title: 'Token Collected',
      desc: `Spot secured: Token #${tokenNumber}`,
      done: true,
      time: '10:20 AM',
    },
    {
      id: 'step-4',
      title: 'Waiting at Counter Desk',
      desc: `${peopleAhead} people ahead • Buddy holding spot`,
      active: !isCompleted && !isSummoned && !isTraveling,
      done: isSummoned || isTraveling || isCompleted,
      time: 'Now',
    },
    {
      id: 'step-5',
      title: 'Customer Travelling',
      desc: isTraveling
        ? 'Buddy knows you are on your way!'
        : 'Alert sent when 3 tokens remain',
      active: isTraveling || isSummoned,
      done: isCompleted,
      time: isTraveling ? 'Active' : '~11:15 AM',
    },
    {
      id: 'step-6',
      title: 'Handover at Counter',
      desc: 'Step into counter with ready documents',
      done: isCompleted,
      active: false,
      time: 'Est. 11:30 AM',
    },
  ];

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Urgent Summon Alert Banner */}
      {isSummoned && (
        <div className="p-4 rounded-3xl bg-[#FF5A36] text-white font-bold shadow-lg animate-pulse flex items-center gap-3 border-2 border-[#111111]">
          <div className="w-12 h-12 rounded-2xl bg-[#111111] text-[#FFD60A] flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 animate-spin text-[#FFD60A]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-[#FFD60A] font-mono font-extrabold">
              🚨 Buddy Ping: Time to Arrive!
            </div>
            <div className="text-sm font-extrabold leading-tight text-white mt-0.5">
              Only {peopleAhead} ahead! Head to {booking.office.name} Counter 2 now.
            </div>
          </div>
        </div>
      )}

      {/* Main Taxi-Meter Status Box */}
      <div className="rounded-3xl bg-[#FFFFFF] border-2 border-[#111111] shadow-xl overflow-hidden">
        {/* Meter Top Branding */}
        <div className="bg-[#111111] px-4 py-3 flex items-center justify-between text-[#FFFCF2]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FFD60A] animate-ping" />
            <span className="font-mono font-bold text-xs tracking-wider text-[#FFD60A] uppercase">
              TAXI-METER QUEUE TRACKER
            </span>
          </div>
          <span className="font-mono text-xs text-[#E5E0D5] font-semibold">
            {booking.booking_code}
          </span>
        </div>

        {/* Taxi-Meter Main Display */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* Office Header */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#555555] font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#0B7A4B] shrink-0" />
              <span className="truncate">{booking.office.name}</span>
            </div>
            <h2 className="text-lg font-black text-[#111111] tracking-tight mt-0.5 font-display">
              {locale === 'kn' ? booking.service.title_kn : booking.service.title}
            </h2>
          </div>

          {/* Mechanical Meter Display Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Digit 1: People Ahead */}
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

            {/* Digit 2: Token */}
            <div className="taxi-meter-display p-3 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-[#E5E0D5] uppercase tracking-wider flex items-center gap-1">
                <Ticket className="w-3 h-3 text-white" />
                <span>Token</span>
              </div>
              <div className="text-lg sm:text-xl font-black font-mono tracking-tight text-white mt-1">
                {tokenNumber}
              </div>
              <span className="text-[9px] text-[#0B7A4B] font-mono font-bold">Counter 2</span>
            </div>

            {/* Digit 3: Estimated Arrival Wait */}
            <div className="taxi-meter-display p-3 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="text-[10px] font-bold text-[#E5E0D5] uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0B7A4B]" />
                <span>ETA</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#0B7A4B] mt-0.5">
                ~{etaMins}m
              </div>
              <span className="text-[9px] text-white/60 font-mono">est. time</span>
            </div>
          </div>

          {/* Big "I'm On My Way" CTA Button */}
          <button
            onClick={handleOnMyWay}
            aria-label="I'm on my way"
            className={`w-full py-4 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all touch-target border-2 ${
              isTraveling
                ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                : isSummoned
                ? 'bg-[#FF5A36] text-white border-[#111111] animate-pulse'
                : 'bg-[#FFD60A] text-[#111111] border-[#111111]'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="tracking-tight text-base font-display">
              {isTraveling
                ? '✓ Notified Buddy: Traveling Now'
                : isSummoned
                ? '🚨 Arriving Now! Notify Buddy'
                : t.common.imOnMyWay}
            </span>
          </button>

          {onWayToast && (
            <div className="p-3 rounded-xl bg-[#E6F5ED] text-[#0B7A4B] text-xs font-bold text-center border border-[#0B7A4B]/20 animate-in fade-in">
              {t.common.onMyWayAlert}
            </div>
          )}

          {/* Assigned Buddy Card */}
          {booking.buddy && (
            <div className="p-3.5 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#FFD60A] border-2 border-[#111111] text-[#111111] font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                  {booking.buddy.full_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-extrabold text-[#111111] truncate font-display">
                      {booking.buddy.full_name}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-[#0B7A4B] shrink-0" />
                  </div>
                  <div className="text-[10px] text-[#555555] truncate font-medium">
                    ⭐ {booking.buddy.rating} ({booking.buddy.total_jobs} queues) • Speaks{' '}
                    <strong className="text-[#111111]">
                      {booking.buddy.languages.join(', ')}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${booking.buddy.phone}`}
                  className="p-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EAE6DF] text-[#0B7A4B] border border-[#E5E0D5] transition-colors touch-target flex items-center justify-center"
                  title="Call Buddy"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href={`https://wa.me/${booking.buddy.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl bg-[#0B7A4B] hover:bg-[#09633d] text-white transition-colors touch-target flex items-center justify-center"
                  title="WhatsApp Buddy"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* Document Checklist Quick Link */}
          <button
            onClick={onOpenChecklist}
            className="w-full p-3.5 rounded-2xl bg-[#FFFCF2] hover:bg-[#F4F0E6] border border-[#E5E0D5] transition-colors flex items-center justify-between touch-target text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FFD60A] text-[#111111] flex items-center justify-center shrink-0 border border-[#111111]/20">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#111111]">
                  Verify Required Documents
                </div>
                <div className="text-[10px] text-[#555555]">
                  {booking.checklist_progress?.length || 0} documents ready in folder
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#111111]" />
          </button>
        </div>
      </div>

      {/* Real-Time Queue Milestone Timeline */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/10 shadow-sm space-y-3.5">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#111111] font-mono">
          QUEUE MILESTONES
        </h3>

        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E0D5]">
          {timelineSteps.map((step, idx) => (
            <div key={step.id} className="relative flex items-start gap-3 pl-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                  step.done
                    ? 'bg-[#0B7A4B] text-white border-[#0B7A4B]'
                    : step.active
                    ? 'bg-[#FFD60A] text-[#111111] border-[#111111] animate-pulse'
                    : 'bg-[#FFFFFF] text-[#999999] border-[#E5E0D5]'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs font-bold truncate ${
                      step.active
                        ? 'text-[#111111]'
                        : step.done
                        ? 'text-[#111111]'
                        : 'text-[#888888]'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#888888] shrink-0">
                    {step.time}
                  </span>
                </div>
                <p className="text-[10px] text-[#555555] truncate leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
