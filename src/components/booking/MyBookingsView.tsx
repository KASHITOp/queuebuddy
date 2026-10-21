'use client';

import React, { useState } from 'react';
import { Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import { LiveQueueTracker } from './LiveQueueTracker';
import { DocumentChecklist } from './DocumentChecklist';
import { EmptyIllustration } from '@/components/illustrations/EmptyIllustration';
import {
  Ticket,
  MapPin,
  Calendar,
  Clock,
  FileCheck,
  Compass,
  Sparkles,
} from 'lucide-react';

interface MyBookingsViewProps {
  onBookNew?: () => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({ onBookNew }) => {
  const { bookings, checklists, toggleChecklistItem, t, locale } = useApp();

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    bookings.length > 0 ? bookings[0].id : null
  );
  const [viewMode, setViewMode] = useState<'tracker' | 'checklist'>('tracker');

  const selectedBooking = bookings.find((b) => b.id === selectedBookingId);
  const bookingChecklistItems = selectedBooking
    ? checklists.filter((c) => c.service_id === selectedBooking.service_id)
    : [];

  if (bookings.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 text-center space-y-4 flex flex-col items-center">
        <EmptyIllustration className="w-40 h-40" />
        <div className="space-y-1">
          <h3 className="text-lg font-black text-[#111111] font-display">
            No Active Bookings Yet
          </h3>
          <p className="text-xs text-[#555555] max-w-xs">
            Book a verified Queue Buddy at any Bengaluru government office and your live token will appear here.
          </p>
        </div>
        {onBookNew && (
          <button
            onClick={onBookNew}
            className="py-3 px-5 rounded-2xl bg-[#FFD60A] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-md active:scale-95 transition-transform"
          >
            Book a Buddy Now
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Bookings Carousel Pills */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-[#555555] px-1 font-bold">
          <span className="uppercase">YOUR APPOINTMENTS ({bookings.length})</span>
          <span>Tap to switch</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {bookings.map((booking) => {
            const isSelected = selectedBookingId === booking.id;
            const checkedCount = booking.checklist_progress?.length || 0;
            const totalDocs = checklists.filter((c) => c.service_id === booking.service_id).length;

            return (
              <div
                key={booking.id}
                onClick={() => setSelectedBookingId(booking.id)}
                className={`cursor-pointer min-w-[200px] p-3 rounded-2xl border-2 transition-all shrink-0 active:scale-95 touch-target ${
                  isSelected
                    ? 'border-[#111111] bg-[#FFD60A] text-[#111111] shadow-md'
                    : 'border-[#E5E0D5] bg-[#FFFFFF] text-[#111111] hover:border-[#111111]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-black">
                    {booking.token_number || booking.booking_code}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-black text-[#FFD60A]' : 'bg-[#F4F0E6] text-[#555555]'
                    }`}
                  >
                    {t.status[booking.status] || booking.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-xs mt-1 truncate font-display">
                  {booking.service.title}
                </h4>
                <div className="text-[10px] text-current/80 truncate">{booking.office.name}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Booking View Mode Toggle */}
      {selectedBooking && (
        <div className="space-y-4">
          <div className="flex items-center p-1 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5]">
            <button
              onClick={() => setViewMode('tracker')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-target ${
                viewMode === 'tracker'
                  ? 'bg-[#111111] text-[#FFFCF2] shadow-sm font-black'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#FFD60A]" />
              <span>Taxi-Meter Tracker</span>
            </button>
            <button
              onClick={() => setViewMode('checklist')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 touch-target ${
                viewMode === 'checklist'
                  ? 'bg-[#111111] text-[#FFFCF2] shadow-sm font-black'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <FileCheck className="w-4 h-4 text-[#0B7A4B]" />
              <span>Doc Checklist</span>
            </button>
          </div>

          {/* Active View: Tracker or Checklist */}
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
