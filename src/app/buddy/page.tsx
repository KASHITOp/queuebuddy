'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { BuddyPortal } from '@/components/buddy/BuddyPortal';
import Link from 'next/link';
import {
  Clock,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  FileText,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';

export default function BuddyPage() {
  const { user, buddyApplication, quickDemoLogin } = useAuth();
  const { buddies } = useApp();

  // Check if current user is pending
  const isPending =
    buddyApplication?.status === 'pending' ||
    user?.full_name?.includes('Applicant') ||
    buddies.find((b) => b.phone === user?.phone)?.verification_status === 'pending';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* If pending verification: Block jobs and show pending status */}
        {isPending ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Application Status: Pending Review
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
                Your Buddy Application is Being Processed
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                Thank you for applying to join the QueueBuddy Bengaluru partner fleet. For citizen
                safety, queue jobs are locked until an operations admin verifies your identity documents.
              </p>
            </div>

            {/* Application Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left text-xs space-y-2.5 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Applicant:</span>
                <span className="font-bold text-white">
                  {buddyApplication?.full_name || user?.full_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-200">
                  {buddyApplication?.phone || user?.phone || '+91 97400 98765'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Languages:</span>
                <span className="font-semibold text-amber-400">
                  {buddyApplication?.languages?.join(', ') || 'Kannada, Telugu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Document:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Aadhaar Card Attached</span>
                </span>
              </div>
            </div>

            {/* Demo Helper to switch or approve */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/admin"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <span>Open Admin Verification Desk to Approve</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => quickDemoLogin('buddy', undefined, 'verified')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
              >
                Switch to Verified Buddy Persona
              </button>
            </div>
          </div>
        ) : (
          /* Verified Buddy: Full Cockpit */
          <BuddyPortal />
        )}
      </main>
    </div>
  );
}
