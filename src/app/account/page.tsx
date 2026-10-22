'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { SupportedLanguage } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Phone,
  Globe,
  Bell,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Moon,
  Sun,
} from 'lucide-react';
import { MadeByCreditFooter } from '@/components/layout/MadeByCredit';

export default function AccountPage() {
  const { user, signOut, deleteAccountAndData } = useAuth();
  const { locale, setLocale, t } = useApp();
  const router = useRouter();

  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>('Kannada');
  const [eveningReminders, setEveningReminders] = useState(true);
  const [queuePings, setQueuePings] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    await deleteAccountAndData();
    router.push('/');
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof document !== 'undefined') {
      if (nextDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFCF2] text-[#111111] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-[#555555]">Please sign in to view your account.</p>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-2xl bg-[#FFD60A] text-[#111111] font-black text-xs inline-block border-2 border-[#111111]"
          >
            Go to Login
          </Link>
          <MadeByCreditFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFCF2] text-[#111111] pb-16 flex flex-col">
      <Navbar />

      <main className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-[#555555] hover:text-[#111111] flex items-center gap-1.5 transition-colors font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-xl bg-[#F4F0E6] hover:bg-[#EAE6DF] text-xs font-bold text-[#111111] border border-[#E5E0D5] transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111] shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#FFD60A] border-2 border-[#111111] text-[#111111] font-black text-2xl flex items-center justify-center shadow-sm">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-[#111111] font-display truncate">
                  {user.full_name}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E6F5ED] text-[#0B7A4B] border border-[#0B7A4B]/20 uppercase">
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-[#555555] truncate mt-0.5">{user.email}</div>
              {user.phone && <div className="text-[11px] font-mono text-[#777777]">{user.phone}</div>}
            </div>
          </div>
        </div>

        {/* Settings & Language Form */}
        <form onSubmit={handleSavePreferences} className="space-y-4">
          <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 shadow-sm space-y-4">
            <h3 className="text-xs font-mono font-black uppercase text-[#111111] tracking-wider">
              LANGUAGE & PREFERENCES
            </h3>

            {/* App UI Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0B7A4B]" />
                <span>Application Language</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLocale('en')}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all touch-target ${
                    locale === 'en'
                      ? 'bg-[#FFD60A] text-[#111111] border-[#111111]'
                      : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('kn')}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all touch-target ${
                    locale === 'kn'
                      ? 'bg-[#FFD60A] text-[#111111] border-[#111111]'
                      : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5]'
                  }`}
                >
                  ಕನ್ನಡ
                </button>
                <button
                  type="button"
                  onClick={() => setLocale('hi')}
                  className={`py-2 px-3 rounded-xl border-2 font-bold text-xs transition-all touch-target ${
                    locale === 'hi'
                      ? 'bg-[#FFD60A] text-[#111111] border-[#111111]'
                      : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            {/* Optional Dark Mode Switch */}
            <div className="pt-2 border-t border-[#E5E0D5] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">Dark Mode</div>
                <div className="text-[10px] text-[#555555]">Optional setting (Default is Chalk Light)</div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5] text-[#111111] text-xs font-bold flex items-center gap-1.5 touch-target"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#FFD60A]" /> : <Moon className="w-4 h-4" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Notifications */}
            <div className="space-y-2 pt-2 border-t border-[#E5E0D5]">
              <label className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>SMS & WhatsApp Pings</span>
              </label>

              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <div className="font-semibold text-[#111111]">Evening Document Reminder</div>
                  <div className="text-[10px] text-[#555555]">Alerts at 7 PM IST if docs missing</div>
                </div>
                <input
                  type="checkbox"
                  checked={eveningReminders}
                  onChange={(e) => setEveningReminders(e.target.checked)}
                  className="w-4 h-4 accent-[#0B7A4B]"
                />
              </div>

              <div className="flex items-center justify-between text-xs py-1">
                <div>
                  <div className="font-semibold text-[#111111]">Live Queue Call Pings</div>
                  <div className="text-[10px] text-[#555555]">Urgent summon when 3 people ahead</div>
                </div>
                <input
                  type="checkbox"
                  checked={queuePings}
                  onChange={(e) => setQueuePings(e.target.checked)}
                  className="w-4 h-4 accent-[#0B7A4B]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#FFD60A] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-sm active:scale-95 transition-transform touch-target"
            >
              Save Preferences
            </button>

            {saveSuccess && (
              <div className="text-center text-xs font-bold text-[#0B7A4B] animate-in fade-in">
                ✓ Preferences updated successfully
              </div>
            )}
          </div>
        </form>

        {/* DPDP Compliance & Account Erasure */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B7A4B]" />
            <h3 className="text-xs font-black uppercase text-[#111111] tracking-wider font-mono">
              DPDP COMPLIANCE & PRIVACY
            </h3>
          </div>
          <p className="text-[11px] text-[#555555] leading-relaxed">
            Under India&apos;s Digital Personal Data Protection (DPDP) Act, your privacy is protected. QueueBuddy never stores confidential citizen documents. You can erase all personal booking history anytime.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#FFEBE6] text-[#FF5A36] border border-[#FF5A36]/30 text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform touch-target"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account & Stored Data</span>
          </button>
        </div>

        {/* Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-sm p-5 rounded-3xl bg-white border-2 border-[#111111] shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-[#FF5A36] font-black text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Confirm Data Erasure</span>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">
                This will permanently delete your profile, active tokens, and contact details from the local database. This action cannot be undone.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#F4F0E6] text-[#111111] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-2.5 rounded-xl bg-[#FF5A36] text-white font-black text-xs shadow-md"
                >
                  Erase Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <MadeByCreditFooter />
    </div>
  );
}
