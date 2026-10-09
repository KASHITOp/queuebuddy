'use client';

import React from 'react';
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
} from 'lucide-react';

interface LiveQueueTrackerProps {
  booking: Booking;
  onOpenChecklist: () => void;
}

export const LiveQueueTracker: React.FC<LiveQueueTrackerProps> = ({
  booking,
  onOpenChecklist,
}) => {
  const { t, locale } = useApp();

  const isSummoned = booking.status === 'customer_summoned';
  const isCompleted = booking.status === 'handover_completed';
  const isInQueue = booking.status === 'in_queue' || isSummoned;

  const peopleAhead = booking.people_ahead ?? 4;
  const tokenNumber = booking.token_number || 'KA03-B42';

  return (
    <div className="space-y-4">
      {/* Urgent Summon Alert Banner */}
      {isSummoned && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 text-slate-950 font-bold shadow-xl animate-pulse flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 text-white flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6 animate-spin text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-wider text-slate-900 font-extrabold">
              🚨 Buddy Ping: Time to Arrive!
            </div>
            <div className="text-sm sm:text-base font-extrabold leading-tight">
              Only {peopleAhead} people ahead! Please head to {booking.office.name} counter now.
            </div>
          </div>
        </div>
      )}

      {/* Booking Header Card */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {booking.booking_code}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {booking.booking_date}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1.5">
              {locale === 'kn' ? booking.service.title_kn : booking.service.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{booking.office.name}</span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                isCompleted
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : isSummoned
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}
            >
              {t.status[booking.status] || booking.status}
            </span>
          </div>
        </div>

        {/* Live Token & Counter Metric Display */}
        {isInQueue && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Ticket className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Token No.</span>
              </div>
              <div className="text-xl font-extrabold text-amber-400 mt-1">{tokenNumber}</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" />
                <span>People Ahead</span>
              </div>
              <div className="text-xl font-extrabold text-white mt-1">
                {peopleAhead} {t.common.peopleAhead}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Est. Call Time</span>
              </div>
              <div className="text-xl font-extrabold text-emerald-400 mt-1">
                ~{peopleAhead * 5} min
              </div>
            </div>
          </div>
        )}

        {/* Notes from Buddy */}
        {booking.notes && (
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300">
            <span className="font-semibold text-amber-400">Buddy Live Note: </span>
            <span>{booking.notes}</span>
          </div>
        )}
      </div>

      {/* Assigned Buddy Card */}
      {booking.buddy && (
        <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-extrabold text-lg flex items-center justify-center shadow-md">
              {booking.buddy.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {booking.buddy.full_name}
                </h4>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xs text-slate-500">
                ⭐ {booking.buddy.rating} ({booking.buddy.total_jobs} queues) • Speaks{' '}
                <strong className="text-amber-500">
                  {booking.buddy.languages.join(', ')}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${booking.buddy.phone}`}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              title="Call Buddy"
            >
              <Phone className="w-4 h-4 text-emerald-500" />
            </a>
            <a
              href={`https://wa.me/${booking.buddy.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 transition-colors"
              title="WhatsApp Buddy"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Quick Action to Checklist */}
      <div
        onClick={onOpenChecklist}
        className="cursor-pointer p-4 rounded-2xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 transition-all flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400">
              Interactive Document Checklist
            </div>
            <div className="text-[11px] text-slate-500">
              {booking.checklist_progress?.length || 0} documents marked ready. Check remainder!
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-amber-500" />
      </div>
    </div>
  );
};
