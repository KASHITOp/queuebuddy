'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Ticket,
  Users,
  Compass,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BuddyPortal: React.FC = () => {
  const {
    buddies,
    bookings,
    updateBookingStatus,
    updateQueueLiveStatus,
    t,
    locale,
  } = useApp();

  // Pick first verified buddy as current logged in buddy
  const currentBuddy = buddies[0];

  // Find active booking for this buddy
  const activeBooking = bookings.find(
    (b) =>
      b.buddy_id === currentBuddy.id &&
      b.status !== 'handover_completed' &&
      b.status !== 'cancelled'
  );

  // Available jobs (requested or unassigned)
  const availableJobs = bookings.filter((b) => b.status === 'requested' || !b.buddy_id);

  // Local state for queue updating
  const [tokenInput, setTokenInput] = useState(activeBooking?.token_number || 'KA03-B42');
  const [peopleAheadInput, setPeopleAheadInput] = useState<number>(
    activeBooking?.people_ahead ?? 4
  );
  const [noteInput, setNoteInput] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const handleCheckIn = () => {
    if (!activeBooking) return;
    updateBookingStatus(activeBooking.id, 'buddy_arrived', {
      notes: 'Buddy checked in at office entrance via GPS verification.',
    });
  };

  const handleStartQueue = () => {
    if (!activeBooking) return;
    updateBookingStatus(activeBooking.id, 'in_queue', {
      token_number: tokenInput,
      people_ahead: peopleAheadInput,
      notes: 'Buddy has entered the queue line.',
    });
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking) return;
    setIsUpdating(true);
    updateQueueLiveStatus(activeBooking.id, tokenInput, peopleAheadInput, noteInput);
    setTimeout(() => {
      setIsUpdating(false);
      setNoteInput('');
    }, 400);
  };

  const handleSummonCustomer = () => {
    if (!activeBooking) return;
    updateBookingStatus(activeBooking.id, 'customer_summoned', {
      people_ahead: peopleAheadInput,
      notes: `Counter is calling token ${tokenInput} shortly. Please arrive at counter room.`,
    });
  };

  const handleCompleteHandover = () => {
    if (!activeBooking) return;
    updateBookingStatus(activeBooking.id, 'handover_completed', {
      people_ahead: 0,
      notes: 'Spot handed over to customer successfully. Counter transaction underway.',
    });
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleAcceptJob = (booking: Booking) => {
    updateBookingStatus(booking.id, 'assigned', {
      buddy_id: currentBuddy.id,
      buddy: currentBuddy,
    });
  };

  const handlePayoutRequest = () => {
    setPayoutSuccess(true);
    setTimeout(() => setPayoutSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Buddy Header & Earnings Ribbon */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              {currentBuddy.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-white">{currentBuddy.full_name}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Buddy
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Languages: <strong className="text-amber-400">{currentBuddy.languages.join(', ')}</strong> • Zones:{' '}
                {currentBuddy.preferred_zones.join(', ')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">Rating</div>
            <div className="text-base font-bold text-amber-400">⭐ {currentBuddy.rating}</div>
          </div>
        </div>

        {/* Financial metrics */}
        <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Today Balance</span>
            <span className="text-base font-extrabold text-white">₹{currentBuddy.earnings_balance}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <span className="text-slate-400 block text-[11px]">Queues Done</span>
            <span className="text-base font-extrabold text-white">{currentBuddy.total_jobs}</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex flex-col justify-between">
            <span className="text-slate-400 block text-[11px]">Payout</span>
            <button
              onClick={handlePayoutRequest}
              className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>UPI Transfer</span>
              <TrendingUp className="w-3 h-3" />
            </button>
          </div>
        </div>

        {payoutSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Instant payout of ₹{currentBuddy.earnings_balance} initiated to your registered VPA UPI!
          </div>
        )}
      </div>

      {/* Active Job Cockpit */}
      {activeBooking ? (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/60 shadow-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wide">
                🔥 Active Queue Job
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {activeBooking.service.title}
              </h4>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{activeBooking.office.name}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400">Customer Language:</span>
              <div className="text-xs font-bold text-amber-500">
                {activeBooking.preferred_language}
              </div>
            </div>
          </div>

          {/* Customer contact pill */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                Customer: {activeBooking.customer_name}
              </div>
              <div className="text-slate-400">{activeBooking.customer_phone}</div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${activeBooking.customer_phone}`}
                className="p-2 rounded-xl bg-emerald-500 text-white font-bold"
              >
                <Phone className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://wa.me/${activeBooking.customer_phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* State 1: Arrive / Check-in */}
          {activeBooking.status === 'assigned' && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Please proceed to {activeBooking.office.name}. Click below when physically at the office.
              </p>
              <button
                onClick={handleCheckIn}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>I Have Arrived (GPS Office Check-in)</span>
              </button>
            </div>
          )}

          {/* State 2: Enter Queue */}
          {activeBooking.status === 'buddy_arrived' && (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Collect physical queue token from the counter and join the queue.
              </p>
              <button
                onClick={handleStartQueue}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>I Got Token & Entered Queue</span>
              </button>
            </div>
          )}

          {/* State 3: Live Queue Controller */}
          {(activeBooking.status === 'in_queue' ||
            activeBooking.status === 'customer_summoned') && (
            <form onSubmit={handlePostUpdate} className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="font-bold text-xs uppercase tracking-wide text-slate-400">
                Live Queue Cockpit
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Token / Counter No.
                  </label>
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-500">
                      People Ahead
                    </label>
                    <span className="text-xs font-bold text-white bg-slate-800 px-1.5 py-0.2 rounded">
                      {peopleAheadInput}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={peopleAheadInput}
                    onChange={(e) => setPeopleAheadInput(parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Queue Note for Customer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Counter 2 calling token 38, speed is 4 min/person"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors"
                >
                  {isUpdating ? 'Updating...' : 'Post Queue Update'}
                </button>

                <button
                  type="button"
                  onClick={handleSummonCustomer}
                  className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Call Customer to Counter!</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleCompleteHandover}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Spot Handover to Customer (Job Finished)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          No active queue assignment currently. Select an available job below!
        </div>
      )}

      {/* Available Jobs Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Available Queue Jobs in Bengaluru
          </h4>
          <span className="text-xs text-slate-400">{availableJobs.length} open</span>
        </div>

        {availableJobs.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            All current queue bookings are assigned. New bookings will pop up in real-time.
          </div>
        ) : (
          availableJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/50 transition-colors shadow-sm space-y-2.5"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {job.booking_code}
                  </span>
                  <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {job.service.title}
                  </h5>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.office.name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-500">
                    +₹{job.queue_buddy_fee}
                  </span>
                  <div className="text-[11px] text-slate-400">Buddy Earn</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-slate-500">
                  Customer language preference: <strong className="text-slate-800 dark:text-slate-200">{job.preferred_language}</strong>
                </div>
                <button
                  onClick={() => handleAcceptJob(job)}
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
                >
                  Accept Job
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
