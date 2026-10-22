'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { AdminSubRole } from '@/types';
import Link from 'next/link';
import {
  ShieldAlert,
  Server,
  Lock,
  Mail,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  FileText,
  Eye,
  X,
  Send,
} from 'lucide-react';
import { MadeByCreditFooter } from '@/components/layout/MadeByCredit';

export default function AdminPage() {
  const { user, role, adminSubRole, quickDemoLogin } = useAuth();
  const { buddies, verifyBuddy } = useApp();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSubRole, setInviteSubRole] = useState<AdminSubRole>('ops');
  const [invites, setInvites] = useState<
    { id: string; email: string; subRole: AdminSubRole; token: string; date: string }[]
  >([
    {
      id: 'inv-1',
      email: 'operations.lead@queuebuddy.gov',
      subRole: 'ops',
      token: 'tok_blr_ops_9812',
      date: '2026-10-08',
    },
  ]);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inspectBuddyId, setInspectBuddyId] = useState<string | null>(null);

  const inspectedBuddy = buddies.find((b) => b.id === inspectBuddyId);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newInv = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      subRole: inviteSubRole,
      token: `tok_blr_${inviteSubRole}_${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
    };

    setInvites([newInv, ...invites]);
    setInviteEmail('');
    setInviteSuccess(true);
    setTimeout(() => setInviteSuccess(false), 4000);
  };

  // If not logged in as admin, show access denied with quick login options
  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-900/50 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">403 – Admin Clearance Required</h1>
            <p className="text-xs text-slate-400 mt-1">
              This terminal is restricted to verified QueueBuddy operations staff with 2FA clearance.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <Link
              href="/admin/login"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs block transition-colors"
            >
              Sign In via Admin Login Gate
            </Link>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin', 'super_admin')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 block transition-colors"
            >
              Quick Test: Enter as Super Admin
            </button>
          </div>
        </div>
        <MadeByCreditFooter tone="dark" />
      </div>
    );
  }

  const currentSubRole = adminSubRole || 'super_admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Admin Header with Sub-Role Pill */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">QueueBuddy Admin Desk</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                  {currentSubRole.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Operator: <strong className="text-slate-200">{user?.full_name}</strong> • 2FA TOTP: Verified
              </p>
            </div>
          </div>

          {/* Quick Sub-Role Switcher for testing all clearance levels */}
          <div className="flex items-center p-1 rounded-xl bg-slate-800 text-[11px] font-bold border border-slate-700">
            {(['super_admin', 'ops', 'support', 'content'] as AdminSubRole[]).map((sr) => (
              <button
                key={sr}
                onClick={() => quickDemoLogin('admin', sr)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currentSubRole === sr
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sr.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Super Admin Special Section: Invite Staff Admins */}
        {currentSubRole === 'super_admin' && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-900/50 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">
                  Super Admin Desk: Invite Internal Staff
                </h2>
              </div>
              <span className="text-[11px] text-indigo-300 font-mono">
                No Public Admin Signups Allowed
              </span>
            </div>

            {inviteSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Staff invite link generated and token created successfully!
              </div>
            )}

            <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="email"
                required
                placeholder="staff.member@queuebuddy.gov"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={inviteSubRole}
                onChange={(e) => setInviteSubRole(e.target.value as AdminSubRole)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ops">Ops (Dispatch & Jobs)</option>
                <option value="support">Support (Refunds & Disputes)</option>
                <option value="content">Content (Offices & Fees)</option>
                <option value="super_admin">Super Admin (All Access)</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch Invite</span>
              </button>
            </form>

            {/* Recent invites */}
            <div className="text-xs space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-slate-400 font-semibold block text-[11px]">
                Pending Staff Invitations:
              </span>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px]"
                >
                  <span className="text-slate-200">
                    {inv.email} &bull; <strong className="text-indigo-400">{inv.subRole}</strong>
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">{inv.token}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Core Admin Portal (Dispatch, Verification, Content, Disputes) */}
        <AdminPortal />
      </main>
      <MadeByCreditFooter tone="dark" />
    </div>
  );
}
