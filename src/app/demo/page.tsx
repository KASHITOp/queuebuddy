'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';
import {
  ShieldAlert,
  UserCheck,
  User,
  ArrowLeft,
  Sparkles,
  Smartphone,
  RefreshCw,
  Clock,
  Ticket,
} from 'lucide-react';

export default function DemoCockpitPage() {
  const { role, setRole, bookings, updateQueueLiveStatus, updateBookingStatus, locale, setLocale } = useApp();
  const { user, quickDemoLogin } = useAuth();
  const [testViewport, setTestViewport] = useState<'360' | '390' | '430' | 'full'>('full');

  const handleRoleSwitch = (targetRole: UserRole) => {
    setRole(targetRole);
    if (targetRole === 'buddy') {
      quickDemoLogin('buddy');
    } else if (targetRole === 'admin') {
      quickDemoLogin('admin', 'super_admin');
    } else {
      quickDemoLogin('customer');
    }
  };

  const activeBooking = bookings.find((b) => b.id === 'book-1') || bookings[0];

  const handleSimulateQueueStep = (stepDelta: number) => {
    if (!activeBooking) return;
    const current = activeBooking.people_ahead ?? 4;
    const nextPeopleAhead = Math.max(0, current + stepDelta);
    updateQueueLiveStatus(
      activeBooking.id,
      activeBooking.token_number || 'KA03-B42',
      nextPeopleAhead,
      nextPeopleAhead <= 2
        ? 'Counter 2 calling next! Customer alerted to move to front desk.'
        : `Buddy Ramesh holding spot. ${nextPeopleAhead} tokens remaining.`
    );
  };

  return (
    <div className="min-h-[100dvh] bg-night text-ink p-4 sm:p-6 pb-20 pt-[calc(16px+var(--sat))]">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-night-700 border border-white/10 text-ink hover:bg-white/[0.05] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-ink tracking-tight">QueueBuddy Demo Cockpit</h1>
              <p className="text-xs text-ink-mute">Hidden testing environment & role switcher</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-brand text-night font-mono font-bold text-xs border border-white/10">
            DEV / EVAL
          </span>
        </div>

        {/* Role Switcher Section */}
        <div className="p-5 rounded-2xl bg-night-700 border border-white/10/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-ink uppercase tracking-wide">
              1. Active Portal Role
            </h2>
            <span className="text-xs font-mono font-semibold text-ink-mute">
              Current: <strong className="text-mint">{user?.role || role}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs transition-all ${
                role === 'customer'
                  ? 'bg-brand text-night border-white/10 shadow-sm'
                  : 'bg-white/[0.05] text-ink-mute border-white/10 hover:text-night'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('buddy')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs transition-all ${
                role === 'buddy'
                  ? 'bg-brand text-night border-white/10 shadow-sm'
                  : 'bg-white/[0.05] text-ink-mute border-white/10 hover:text-night'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>Queue Buddy</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs transition-all ${
                role === 'admin'
                  ? 'bg-brand text-night border-white/10 shadow-sm'
                  : 'bg-white/[0.05] text-ink-mute border-white/10 hover:text-night'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Admin Desk</span>
            </button>
          </div>

          <div className="flex gap-2 pt-1 text-xs">
            <Link
              href="/"
              className="flex-1 py-2 px-3 rounded-xl bg-ink text-night text-center font-bold hover:bg-black transition-colors"
            >
              Open Customer App
            </Link>
            <Link
              href="/buddy"
              className="flex-1 py-2 px-3 rounded-xl bg-mint text-white text-center font-bold hover:bg-[#09633d] transition-colors"
            >
              Open Buddy Cockpit
            </Link>
            <Link
              href="/admin"
              className="flex-1 py-2 px-3 rounded-xl bg-[#FF5A36] text-white text-center font-bold hover:bg-[#e04523] transition-colors"
            >
              Open Admin Desk
            </Link>
          </div>
        </div>

        {/* Live Queue Simulation */}
        <div className="p-5 rounded-2xl bg-night-700 border border-white/10/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-ink uppercase tracking-wide">
              2. Taxi-Meter Queue Simulator
            </h2>
            <span className="text-xs font-mono font-bold text-brand bg-night-600 px-2 py-0.5 rounded">
              Token: {activeBooking?.token_number || 'KA03-B42'}
            </span>
          </div>

          <p className="text-xs text-ink-mute">
            Simulate real-time counter changes to test the customer taxi-meter flip animation, summons, and timeline updates:
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.05] border border-white/10">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-mint" />
              <span className="text-xs font-bold">People Ahead:</span>
              <span className="text-lg font-mono font-black text-ink">
                {activeBooking?.people_ahead ?? 4}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSimulateQueueStep(-1)}
                className="px-3 py-1.5 rounded-lg bg-brand text-night font-bold text-xs border border-white/10 active:scale-95"
              >
                -1 Advance Queue
              </button>
              <button
                onClick={() => handleSimulateQueueStep(1)}
                className="px-3 py-1.5 rounded-lg bg-night-700 text-ink font-bold text-xs border border-white/10 active:scale-95"
              >
                +1 Add Wait
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => activeBooking && updateBookingStatus(activeBooking.id, 'customer_summoned')}
              className="py-2.5 px-3 rounded-xl bg-[#FF5A36] text-white font-bold active:scale-95 transition-transform"
            >
              🚨 Trigger Urgent Summon
            </button>
            <button
              onClick={() => activeBooking && updateBookingStatus(activeBooking.id, 'handover_completed')}
              className="py-2.5 px-3 rounded-xl bg-mint text-white font-bold active:scale-95 transition-transform"
            >
              ✓ Complete Handover
            </button>
          </div>
        </div>

        {/* Viewport Width Guides */}
        <div className="p-5 rounded-2xl bg-night-700 border border-white/10/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-ink uppercase tracking-wide">
            <Smartphone className="w-4 h-4 text-mint" />
            <span>3. Mobile Target Widths</span>
          </div>
          <p className="text-xs text-ink-mute">
            Target tested widths: <strong>360px</strong> (Galaxy S8 / SE), <strong>390px</strong> (iPhone 13/14/15/16 default), and <strong>430px</strong> (iPhone Pro Max).
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setTestViewport('360')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === '360' ? 'bg-brand border-white/10' : 'bg-white/[0.05] border-white/10'
              }`}
            >
              360px
            </button>
            <button
              onClick={() => setTestViewport('390')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === '390' ? 'bg-brand border-white/10' : 'bg-white/[0.05] border-white/10'
              }`}
            >
              390px (Default)
            </button>
            <button
              onClick={() => setTestViewport('430')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === '430' ? 'bg-brand border-white/10' : 'bg-white/[0.05] border-white/10'
              }`}
            >
              430px
            </button>
            <button
              onClick={() => setTestViewport('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === 'full' ? 'bg-brand border-white/10' : 'bg-white/[0.05] border-white/10'
              }`}
            >
              Full Width
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
