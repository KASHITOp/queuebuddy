'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Building, Ticket, UserCheck, ShieldAlert } from 'lucide-react';

interface BottomNavProps {
  currentView: 'offices' | 'bookings' | 'buddy' | 'admin';
  onChangeView: (view: 'offices' | 'bookings' | 'buddy' | 'admin') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView }) => {
  const { bookings, role, setRole, t } = useApp();

  const activeBookingsCount = bookings.filter(
    (b) => b.status !== 'handover_completed' && b.status !== 'cancelled'
  ).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        <button
          onClick={() => {
            onChangeView('offices');
            setRole('customer');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === 'offices'
              ? 'text-amber-500 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Building className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.offices}</span>
        </button>

        <button
          onClick={() => {
            onChangeView('bookings');
            setRole('customer');
          }}
          className={`relative flex flex-col items-center gap-1 transition-all ${
            currentView === 'bookings'
              ? 'text-amber-500 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.myBookings}</span>
          {activeBookingsCount > 0 && (
            <span className="absolute -top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[9px] flex items-center justify-center animate-pulse">
              {activeBookingsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            onChangeView('buddy');
            setRole('buddy');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === 'buddy'
              ? 'text-amber-500 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.buddyPortal}</span>
        </button>

        <button
          onClick={() => {
            onChangeView('admin');
            setRole('admin');
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            currentView === 'admin'
              ? 'text-amber-500 font-bold scale-105'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
          }`}
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="text-[10px]">{t.nav.admin}</span>
        </button>
      </div>
    </nav>
  );
};
