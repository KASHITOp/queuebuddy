'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { LiveQueueTracker } from './LiveQueueTracker';
import { DocumentChecklist } from './DocumentChecklist';
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  FileCheck,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const MyBookingsView: React.FC = () => {
  const { bookings, checklists, toggleChecklistItem, t, locale } = useApp();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings.length > 0 ? bookings[0].id : null
  );
  const [viewMode, setViewMode] = useState<'tracker' | 'checklist'>('tracker');

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const bookingChecklistItems = selectedBooking
    ? checklists.filter((c) => c.service_id === selectedBooking.service_id)
    : [];

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* Bookings Selector Horizontal Scroll */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span className="font-bold uppercase tracking-wider">Your Queue Appointments</span>
          <span>{bookings.length} total</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {bookings.map((booking) => {
            const isSelected = selectedBookingId === booking.id;
            const checkedCount = booking.checklist_progress?.length || 0;
            const totalDocs = checklists.filter((c) => c.service_id === booking.service_id).length;

            return (
              <div
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                className={`cursor-pointer min-w-[240px] p-3.5 rounded-2xl border transition-all shrink-0 ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-amber-500">
                    {booking.booking_code}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 truncate">
                  {booking.service.title}
                </h4>
                <div className="text-[11px] text-slate-400 truncate">{booking.office.name}</div>
                <div className="text-[10px] text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  <span>
                    {checkedCount}/{totalDocs} documents ready
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Booking View Mode Toggle */}
      {selectedBooking && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('tracker')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'tracker'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Live Queue Tracking</span>
            </button>
            <button
              onClick={() => setViewMode('checklist')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                viewMode === 'checklist'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Document Checklist ({bookingChecklistItems.length})</span>
            </button>
          </div>

          {/* View Render */}
          {viewMode === 'tracker' ? (
            <LiveQueueTracker
              booking={selectedBooking}
              onOpenChecklist={() => setViewMode('checklist')}
            />
          ) : (
            <DocumentChecklist
              booking={selectedBooking}
              items={bookingChecklistItems}
              onToggleItem={(itemId) => toggleChecklistItem(selectedBooking.id, itemId)}
            />
          )}
        </div>
      )}
    </div>
  );
};
