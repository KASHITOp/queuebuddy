'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { MadeByCreditFooter } from '@/components/layout/MadeByCredit';

export default function LoginPage() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    resetPassword,
    quickDemoLogin,
    isLoading,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'magic' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'signin') {
        const res = await signInWithEmail(email, password);
        if (res.error) setErrorMsg(res.error);
      } else if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, fullName, phone);
        if (res.error) setErrorMsg(res.error);
      } else if (mode === 'magic') {
        const res = await signInWithMagicLink(email);
        if (res.error) setErrorMsg(res.error);
        if (res.message) setSuccessMsg(res.message);
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.error) setErrorMsg(res.error);
        if (res.message) setSuccessMsg(res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-night text-ink flex flex-col justify-center items-center p-4 pt-[calc(16px+var(--sat))] selection:bg-brand selection:text-night">
      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-mute hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 mx-auto">
            <div className="w-11 h-11 rounded-2xl bg-brand border border-white/10 text-night font-black text-2xl flex items-center justify-center shadow-sm">
              Q
            </div>
            <div className="text-left">
              <span className="font-extrabold text-lg tracking-tight text-ink block font-display">
                QueueBuddy
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand text-night border border-white/10">
                Bengaluru Portal
              </span>
            </div>
          </Link>
          <h1 className="text-xl font-black text-ink mt-2 font-display">
            {mode === 'signup'
              ? 'Create Customer Account'
              : mode === 'magic'
              ? 'Passwordless Magic Link'
              : mode === 'forgot'
              ? 'Reset Your Password'
              : 'Sign in to QueueBuddy'}
          </h1>
          <p className="text-xs text-ink-mute max-w-xs mx-auto">
            Book verified buddies who hold government queue spots in Bengaluru.
          </p>
        </div>

        {/* Auth Mode Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signin'
                ? 'bg-night-700 text-ink shadow-sm font-black'
                : 'text-ink-mute hover:text-ink'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2 rounded-xl transition-all ${
              mode === 'signup'
                ? 'bg-night-700 text-ink shadow-sm font-black'
                : 'text-ink-mute hover:text-ink'
            }`}
          >
            Register
          </button>
        </div>

        {/* Main Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-night-700 border border-white/10 shadow-xl space-y-4">
          {/* Quick Demo 1-Click Login Button */}
          <button
            type="button"
            onClick={() => quickDemoLogin('customer')}
            className="w-full py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-ink font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all touch-target"
          >
            <Sparkles className="w-4 h-4 text-brand" />
            <span>1-Click Demo Login (Arjun Mehta)</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/10" />
            <span className="flex-shrink mx-3 text-[10px] uppercase font-mono text-ink-faint">
              or with email
            </span>
            <div className="flex-grow border-t border-white/10" />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-coral/10 border border-coral/30 text-coral text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-mint/10 border border-mint/30 text-mint text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-ink-mute">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Arjun Mehta"
                    className="w-full p-2.5 rounded-xl bg-night-700 border border-white/10 text-xs text-ink focus:border-white/10 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-ink-mute">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full p-2.5 rounded-xl bg-night-700 border border-white/10 text-xs text-ink focus:border-white/10 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-mute">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full p-2.5 rounded-xl bg-night-700 border border-white/10 text-xs text-ink focus:border-white/10 focus:outline-none"
              />
            </div>

            {mode !== 'magic' && mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-ink-mute">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] text-ink-mute hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl bg-night-700 border border-white/10 text-xs text-ink focus:border-white/10 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-brand text-night font-black text-xs border border-white/10 shadow-md active:scale-95 transition-transform flex items-center justify-center gap-1.5 touch-target"
            >
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'magic'
                  ? 'Send Magic Link'
                  : mode === 'forgot'
                  ? 'Reset Password'
                  : 'Sign In'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick links to buddy / admin */}
          <div className="pt-2 border-t border-white/10 text-center text-xs space-y-1">
            <Link
              href="/buddy/apply"
              className="text-mint font-bold hover:underline block"
            >
              Apply to become a Queue Buddy in Bengaluru →
            </Link>
          </div>
        </div>
      </div>
      <MadeByCreditFooter className="relative z-10" />
    </div>
  );
}
