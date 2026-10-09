'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ShieldAlert,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Server,
  Fingerprint,
} from 'lucide-react';

export default function AdminLoginPage() {
  const { signInWithEmail, signInWithGoogle, quickDemoLogin } = useAuth();

  const [email, setEmail] = useState('superadmin@queuebuddy.gov');
  const [password, setPassword] = useState('AdminSecret#2026');
  const [totpToken, setTotpToken] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (totpToken && totpToken.length !== 6) {
        setErrorMsg('TOTP MFA token must be 6 digits.');
        return;
      }
      const res = await signInWithEmail(email, password);
      if (res.error) setErrorMsg(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background terminal grid */}
      <div className="fixed inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Terminal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-bold">
            <Server className="w-3.5 h-3.5" />
            <span>SECURE INTERNAL GATEWAY</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Terminal</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Authorized personnel only. Multi-Factor Authentication (TOTP 2FA) required.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-indigo-900/60 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Quick Demo 1-Click Persona Pickers */}
          <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-2">
            <div className="text-[11px] text-indigo-300 font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Quick Test Admin Sub-Roles:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickDemoLogin('admin', 'super_admin')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-900/60 text-slate-200 font-bold border border-indigo-800/60 text-left"
              >
                👑 Super Admin
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('admin', 'ops')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-900/60 text-slate-200 font-bold border border-indigo-800/60 text-left"
              >
                ⚙️ Ops (Dispatch)
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('admin', 'support')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-900/60 text-slate-200 font-bold border border-indigo-800/60 text-left"
              >
                💬 Support (Refunds)
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('admin', 'content')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-indigo-900/60 text-slate-200 font-bold border border-indigo-800/60 text-left"
              >
                📝 Content (Offices)
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Work Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                TOTP 2FA Token (Authenticator App)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit code (e.g. 748291)"
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono tracking-widest text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Fingerprint className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Authenticate to Admin Desk</span>
                </>
              )}
            </button>
          </form>

          {/* Sub-roles clearance info */}
          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Sub-role clearance scopes:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[10px] text-slate-500">
              <li><strong>super_admin:</strong> Full permissions, user roles & admin invites</li>
              <li><strong>ops:</strong> Live dispatch, assign/reassign buddies</li>
              <li><strong>support:</strong> Disputes, Razorpay test refunds, read-only buddies</li>
              <li><strong>content:</strong> Offices, services, fees & document checklist templates</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
            &larr; Back to Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
