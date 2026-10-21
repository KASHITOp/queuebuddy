'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Home, Building2, Ticket, User, Sparkles, ArrowRight } from 'lucide-react';

export type MainNavTab = 'home' | 'offices' | 'bookings' | 'account';

interface BottomNavProps {
  currentTab: MainNavTab;
  onChangeTab: (tab: MainNavTab) => void;
  onQuickBook?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onQuickBook,
}) => {
  const { bookings, t } = useApp();

  // Find active booking if any
  const activeBooking = bookings.find(
    (b) =>
      b.status === 'in_queue' ||
      b.status === 'customer_summoned' ||
      b.status === 'customer_traveling' ||
      b.status === 'buddy_arrived'
  );

  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'handover_completed' && b.status !== 'cancelled'
  ).length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-safe">
      <div className="max-w-md mx-auto px-3.5 pb-2">
        {/* Sticky Primary Action Bar above the bottom tabs */}
        <div className="pointer-events-auto mb-2">
          {activeBooking ? (
            <button
              onClick={() => onChangeTab('bookings')}
              aria-label="View active queue status"
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#111111] text-[#FFFCF2] shadow-xl border border-black/10 active:scale-[0.98] transition-transform touch-target group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0B7A4B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0B7A4B]" />
                </span>
                <div className="text-left truncate">
                  <div className="text-[11px] font-mono font-bold text-[#FFD60A] uppercase tracking-wider">
                    {activeBooking.token_number || activeBooking.booking_code} • {activeBooking.people_ahead ?? 4} ahead
                  </div>
                  <div className="text-xs font-semibold text-white/90 truncate">
                    {activeBooking.office.name}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#FFD60A] shrink-0 pl-2">
                <span>Track</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ) : currentTab === 'offices' || currentTab === 'home' ? (
            onQuickBook && (
              <button
                onClick={onQuickBook}
                aria-label="Book a Queue Buddy"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#FFD60A] text-[#111111] font-extrabold text-sm shadow-lg shadow-[#FFD60A]/30 border-2 border-[#111111] active:scale-[0.98] transition-transform touch-target"
              >
                <Sparkles className="w-4 h-4 text-[#111111]" />
                <span>Book a Buddy (Bengaluru)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          ) : null}
        </div>

        {/* Bottom Tab Bar */}
        <nav
          aria-label="Mobile Bottom Navigation"
          className="pointer-events-auto bg-[#FFFFFF]/95 backdrop-blur-xl rounded-2xl border-2 border-[#111111]/10 shadow-xl px-2 py-1 flex items-center justify-around"
        >
          {/* Home Tab */}
          <button
            onClick={() => onChangeTab('home')}
            aria-label={t.nav.home}
            aria-selected={currentTab === 'home'}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all touch-target ${
              currentTab === 'home'
                ? 'bg-[#FFD60A] text-[#111111] font-black shadow-sm'
                : 'text-[#111111]/70 hover:text-[#111111] font-semibold active:bg-[#F4F0E6]'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5 stroke-[2.2]" />
            <span className="text-[11px] leading-tight tracking-tight">{t.nav.home}</span>
          </button>

          {/* Offices Tab */}
          <button
            onClick={() => onChangeTab('offices')}
            aria-label={t.nav.offices}
            aria-selected={currentTab === 'offices'}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all touch-target ${
              currentTab === 'offices'
                ? 'bg-[#FFD60A] text-[#111111] font-black shadow-sm'
                : 'text-[#111111]/70 hover:text-[#111111] font-semibold active:bg-[#F4F0E6]'
            }`}
          >
            <Building2 className="w-5 h-5 mb-0.5 stroke-[2.2]" />
            <span className="text-[11px] leading-tight tracking-tight">{t.nav.offices}</span>
          </button>

          {/* My Booking Tab */}
          <button
            onClick={() => onChangeTab('bookings')}
            aria-label={t.nav.myBookings}
            aria-selected={currentTab === 'bookings'}
            className={`relative flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all touch-target ${
              currentTab === 'bookings'
                ? 'bg-[#FFD60A] text-[#111111] font-black shadow-sm'
                : 'text-[#111111]/70 hover:text-[#111111] font-semibold active:bg-[#F4F0E6]'
            }`}
          >
            <Ticket className="w-5 h-5 mb-0.5 stroke-[2.2]" />
            <span className="text-[11px] leading-tight tracking-tight whitespace-nowrap">{t.nav.myBookings}</span>
            {activeBookingsCount > 0 && (
              <span className="absolute top-1 right-2 min-w-4 h-4 px-1 rounded-full bg-[#0B7A4B] text-white font-mono font-black text-[10px] flex items-center justify-center border border-white shadow-sm">
                {activeBookingsCount}
              </span>
            )}
          </button>

          {/* Account Tab */}
          <button
            onClick={() => onChangeTab('account')}
            aria-label={t.nav.account}
            aria-selected={currentTab === 'account'}
            className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all touch-target ${
              currentTab === 'account'
                ? 'bg-[#FFD60A] text-[#111111] font-black shadow-sm'
                : 'text-[#111111]/70 hover:text-[#111111] font-semibold active:bg-[#F4F0E6]'
            }`}
          >
            <User className="w-5 h-5 mb-0.5 stroke-[2.2]" />
            <span className="text-[11px] leading-tight tracking-tight">{t.nav.account}</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
