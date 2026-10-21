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
    <div className="min-h-screen bg-[#FFFCF2] text-[#111111] p-4 sm:p-6 pb-20">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#FFFFFF] border border-[#E5E0D5] text-[#111111] hover:bg-[#F4F0E6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-[#111111] tracking-tight">QueueBuddy Demo Cockpit</h1>
              <p className="text-xs text-[#555555]">Hidden testing environment & role switcher</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#FFD60A] text-[#111111] font-mono font-bold text-xs border border-[#111111]">
            DEV / EVAL
          </span>
        </div>

        {/* Role Switcher Section */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#111111] uppercase tracking-wide">
              1. Active Portal Role
            </h2>
            <span className="text-xs font-mono font-semibold text-[#555555]">
              Current: <strong className="text-[#0B7A4B]">{user?.role || role}</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs transition-all ${
                role === 'customer'
                  ? 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-sm'
                  : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Customer</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('buddy')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs transition-all ${
                role === 'buddy'
                  ? 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-sm'
                  : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
              }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>Queue Buddy</span>
            </button>

            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 font-bold text-xs transition-all ${
                role === 'admin'
                  ? 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-sm'
                  : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Admin Desk</span>
            </button>
          </div>

          <div className="flex gap-2 pt-1 text-xs">
            <Link
              href="/"
              className="flex-1 py-2 px-3 rounded-xl bg-[#111111] text-[#FFFCF2] text-center font-bold hover:bg-black transition-colors"
            >
              Open Customer App
            </Link>
            <Link
              href="/buddy"
              className="flex-1 py-2 px-3 rounded-xl bg-[#0B7A4B] text-white text-center font-bold hover:bg-[#09633d] transition-colors"
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
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/10 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#111111] uppercase tracking-wide">
              2. Taxi-Meter Queue Simulator
            </h2>
            <span className="text-xs font-mono font-bold text-[#FFD60A] bg-[#111111] px-2 py-0.5 rounded">
              Token: {activeBooking?.token_number || 'KA03-B42'}
            </span>
          </div>

          <p className="text-xs text-[#555555]">
            Simulate real-time counter changes to test the customer taxi-meter flip animation, summons, and timeline updates:
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5]">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#0B7A4B]" />
              <span className="text-xs font-bold">People Ahead:</span>
              <span className="text-lg font-mono font-black text-[#111111]">
                {activeBooking?.people_ahead ?? 4}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleSimulateQueueStep(-1)}
                className="px-3 py-1.5 rounded-lg bg-[#FFD60A] text-[#111111] font-bold text-xs border border-[#111111] active:scale-95"
              >
                -1 Advance Queue
              </button>
              <button
                onClick={() => handleSimulateQueueStep(1)}
                className="px-3 py-1.5 rounded-lg bg-[#FFFFFF] text-[#111111] font-bold text-xs border border-[#E5E0D5] active:scale-95"
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
              className="py-2.5 px-3 rounded-xl bg-[#0B7A4B] text-white font-bold active:scale-95 transition-transform"
            >
              ✓ Complete Handover
            </button>
          </div>
        </div>

        {/* Viewport Width Guides */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/10 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-sm font-black text-[#111111] uppercase tracking-wide">
            <Smartphone className="w-4 h-4 text-[#0B7A4B]" />
            <span>3. Mobile Target Widths</span>
          </div>
          <p className="text-xs text-[#555555]">
            Target tested widths: <strong>360px</strong> (Galaxy S8 / SE), <strong>390px</strong> (iPhone 13/14/15/16 default), and <strong>430px</strong> (iPhone Pro Max).
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setTestViewport('360')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === '360' ? 'bg-[#FFD60A] border-[#111111]' : 'bg-[#F4F0E6] border-[#E5E0D5]'
              }`}
            >
              360px
            </button>
            <button
              onClick={() => setTestViewport('390')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === '390' ? 'bg-[#FFD60A] border-[#111111]' : 'bg-[#F4F0E6] border-[#E5E0D5]'
              }`}
            >
              390px (Default)
            </button>
            <button
              onClick={() => setTestViewport('430')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === '430' ? 'bg-[#FFD60A] border-[#111111]' : 'bg-[#F4F0E6] border-[#E5E0D5]'
              }`}
            >
              430px
            </button>
            <button
              onClick={() => setTestViewport('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                testViewport === 'full' ? 'bg-[#FFD60A] border-[#111111]' : 'bg-[#F4F0E6] border-[#E5E0D5]'
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
