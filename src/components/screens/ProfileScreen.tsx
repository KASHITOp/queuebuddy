'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useApp, emitToast } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Locale } from '@/lib/i18n';
import { Avatar, Pressable } from '@/components/ui/primitives';
import { MadeByCreditFooter } from '@/components/layout/MadeByCredit';
import {
  Bell,
  ChevronRight,
  HandHeart,
  LogOut,
  RotateCcw,
  ShieldCheck,
  Trash2,
  UserCog,
  Briefcase,
  LucideIcon,
} from 'lucide-react';

const LANGUAGES: { id: Locale; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'kn', label: 'ಕನ್ನಡ' },
  { id: 'hi', label: 'हिंदी' },
];

const Row: React.FC<{
  icon: LucideIcon;
  label: string;
  hint?: string;
  tint?: string;
  onPress?: () => void;
  right?: React.ReactNode;
}> = ({ icon: Icon, label, hint, tint = '#FAFAF7', onPress, right }) => (
  <Pressable feedback="selection" onClick={onPress} className="w-full flex items-center gap-3.5 px-4 py-3.5 text-left">
    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tint}1A`, color: tint }}>
      <Icon className="w-[18px] h-[18px]" />
    </span>
    <span className="flex-1 min-w-0">
      <span className="block text-[14.5px] font-semibold text-ink">{label}</span>
      {hint && <span className="block text-[12px] text-ink-mute mt-0.5 truncate">{hint}</span>}
    </span>
    {right ?? <ChevronRight className="w-[18px] h-[18px] text-ink-faint" />}
  </Pressable>
);

const Toggle: React.FC<{ on: boolean }> = ({ on }) => (
  <span className={`w-12 h-7 rounded-full p-0.5 flex transition-colors ${on ? 'bg-mint justify-end' : 'bg-white/15 justify-start'}`}>
    <motion.span layout transition={{ type: 'spring', stiffness: 600, damping: 32 }} className="w-6 h-6 rounded-full bg-white shadow" />
  </span>
);

export const ProfileScreen: React.FC = () => {
  const { locale, setLocale, bookings, resetDemo } = useApp();
  const { user, signOut, deleteAccountAndData, quickDemoLogin } = useAuth();
  const [notify, setNotify] = useState(true);
  const [confirmErase, setConfirmErase] = useState(false);

  const completed = bookings.filter((b) => b.status !== 'cancelled').length;
  const hoursSaved = bookings.reduce((sum, b) => sum + (b.status === 'cancelled' ? 0 : b.expected_wait_hours), 0);

  return (
    <div className="pb-4">
      <div className="px-5 pt-4 pb-5">
        <h1 className="text-[28px] font-black text-ink">Profile</h1>
      </div>

      <div className="px-4">
        <div
          className="relative overflow-hidden rounded-[28px] p-5 grain"
          style={{
            background: 'radial-gradient(100% 120% at 100% 0%, rgba(255,214,10,0.22), transparent 55%), #141417',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar name={user?.full_name || 'Q B'} size={60} ring />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[20px] font-black text-ink truncate">{user?.full_name || 'Guest'}</h2>
                <ShieldCheck className="w-[18px] h-[18px] text-mint shrink-0" />
              </div>
              <div className="text-[13px] text-ink-mute truncate">{user?.phone || user?.email}</div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <div className="meter-digits text-[24px] font-bold text-ink">{completed}</div>
              <div className="text-[11.5px] text-ink-mute">bookings</div>
            </div>
            <div className="rounded-2xl bg-white/[0.05] p-3">
              <div className="meter-digits text-[24px] font-bold text-brand">{hoursSaved}h</div>
              <div className="text-[11.5px] text-ink-mute">not spent in lines</div>
            </div>
          </div>
        </div>

        {/* Language */}
        <h3 className="mt-7 mb-2.5 px-1 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">App language</h3>
        <div className="relative grid grid-cols-3 p-1 rounded-2xl bg-night-700 hairline">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(33.333%-2.67px)] rounded-xl bg-brand"
            animate={{ x: `${LANGUAGES.findIndex((l) => l.id === locale) * 100}%` }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          />
          {LANGUAGES.map((l) => (
            <Pressable
              key={l.id}
              feedback="selection"
              onClick={() => setLocale(l.id)}
              className={`relative h-10 text-[14px] font-bold transition-colors ${locale === l.id ? 'text-night' : 'text-ink-soft'}`}
            >
              {l.label}
            </Pressable>
          ))}
        </div>

        <h3 className="mt-7 mb-2.5 px-1 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">Settings</h3>
        <div className="rounded-[22px] bg-night-700 hairline divide-y divide-white/[0.05] overflow-hidden">
          <Row
            icon={Bell}
            label="Turn alerts"
            hint="Ping me when 3 people are left"
            tint="#FFD60A"
            onPress={() => setNotify((v) => !v)}
            right={<Toggle on={notify} />}
          />
          <Link href="/buddy/apply" className="block">
            <Row icon={HandHeart} label="Become a Queue Buddy" hint="Earn ₹800–1,500 a day near you" tint="#3DDC97" />
          </Link>
        </div>

        <h3 className="mt-7 mb-2.5 px-1 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">Demo</h3>
        <div className="rounded-[22px] bg-night-700 hairline divide-y divide-white/[0.05] overflow-hidden">
          <Row icon={Briefcase} label="Open Buddy app" hint="See jobs as Ramesh, a verified buddy" tint="#60A5FA" onPress={() => quickDemoLogin('buddy')} />
          <Row icon={UserCog} label="Open Admin desk" hint="Approve buddies, resolve disputes" tint="#A78BFA" onPress={() => quickDemoLogin('admin', 'super_admin')} />
          <Row
            icon={RotateCcw}
            label="Restart live demo"
            hint="Reset bookings and the queue meter"
            tint="#FDBA74"
            onPress={() => {
              resetDemo();
              emitToast({ kind: 'success', title: 'Demo reset', body: 'Your token is back in line' });
            }}
          />
        </div>

        <h3 className="mt-7 mb-2.5 px-1 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint">Privacy</h3>
        <div className="rounded-[22px] bg-night-700 hairline divide-y divide-white/[0.05] overflow-hidden">
          <Row
            icon={Trash2}
            label={confirmErase ? 'Tap again to erase everything' : 'Erase my data'}
            hint="DPDP Act: no documents are ever stored"
            tint="#FF6B4A"
            onPress={() => (confirmErase ? deleteAccountAndData() : setConfirmErase(true))}
            right={<span />}
          />
          <Row icon={LogOut} label="Sign out" tint="#8B8B94" onPress={signOut} right={<span />} />
        </div>

        <MadeByCreditFooter tone="dark" className="pt-8" />
        <div className="text-center text-[11px] text-ink-faint -mt-2">QueueBuddy 1.1 · Bengaluru</div>
      </div>
    </div>
  );
};
