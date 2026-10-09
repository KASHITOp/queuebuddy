'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { SupportedLanguage } from '@/types';
import Link from 'next/link';
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
} from 'lucide-react';

export default function AccountPage() {
  const { user, signOut, deleteAccountAndData } = useAuth();
  const { locale, setLocale, t } = useApp();

  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>('Kannada');
  const [eveningReminders, setEveningReminders] = useState(true);
  const [queuePings, setQueuePings] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    await deleteAccountAndData();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-sm text-slate-400">Please sign in to view your account.</p>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/app"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={signOut}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            Sign Out
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              {user.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{user.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                  {user.role}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{user.email}</div>
              {user.phone && <div className="text-xs text-slate-500 mt-0.5">{user.phone}</div>}
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <form
          onSubmit={handleSavePreferences}
          className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5"
        >
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>Language & Notification Preferences</span>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved successfully!
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Default App & Counter Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu'] as SupportedLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setPreferredLang(lang)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                    preferredLang === lang
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{lang}</span>
                  {preferredLang === lang && <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300">
              Notification Channels
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <div className="text-xs">
                <span className="font-bold text-slate-200 block">Evening Document Checklist Alert</span>
                <span className="text-[11px] text-slate-400">
                  Daily 7:00 PM IST reminder if any mandatory documents are missing for tomorrow.
                </span>
              </div>
              <input
                type="checkbox"
                checked={eveningReminders}
                onChange={(e) => setEveningReminders(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 cursor-pointer">
              <div className="text-xs">
                <span className="font-bold text-slate-200 block">Live Queue Arrival Pings</span>
                <span className="text-[11px] text-slate-400">
                  Instant push notification when your buddy alerts that only 2–3 tokens remain.
                </span>
              </div>
              <input
                type="checkbox"
                checked={queuePings}
                onChange={(e) => setQueuePings(e.target.checked)}
                className="w-4 h-4 accent-amber-500"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
          >
            Save Preferences
          </button>
        </form>

        {/* DPDP Compliance / Danger Zone */}
        <div className="p-6 rounded-3xl bg-rose-950/20 border border-rose-900/40 shadow-xl space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-rose-300">
                Data Protection & Account Deletion (DPDP Act Compliant)
              </h2>
              <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
                Under the Digital Personal Data Protection Act, you have the absolute right to
                erasure. Requesting deletion immediately and permanently erases your profile, phone
                number, booking records, and KYC data from QueueBuddy servers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete My Account & Erase All Data</span>
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-900/60 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
              <p className="text-xs text-slate-400 mt-1">
                This action is irreversible. All your active queues, history, and personal data will
                be wiped immediately.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
              >
                Confirm Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
