'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Phone,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';

export default function BuddyLoginPage() {
  const {
    requestPhoneOtp,
    verifyPhoneOtp,
    signInWithEmail,
    quickDemoLogin,
  } = useAuth();

  const [authType, setAuthType] = useState<'otp' | 'email'>('otp');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await requestPhoneOtp(phone);
      if (res.error) {
        setErrorMsg(res.error);
      } else {
        setOtpSent(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await verifyPhoneOtp(phone, otp);
      if (res.error) setErrorMsg(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const res = await signInWithEmail(email, password);
      if (res.error) setErrorMsg(res.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              Q
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-white block">
                QueueBuddy
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Buddy Partner Portal
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white mt-2">Buddy Sign In</h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Access your active queue jobs, update counter numbers, and withdraw UPI earnings.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Quick Demo Logins for Testing */}
          <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Quick Test as Buddy Persona:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('buddy', undefined, 'verified')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 text-left flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Verified Buddy</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('buddy', undefined, 'pending')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 text-left flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Pending Applicant</span>
              </button>
            </div>
          </div>

          {/* Toggle Phone OTP vs Email */}
          <div className="flex p-1 rounded-2xl bg-slate-800 border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => {
                setAuthType('otp');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                authType === 'otp'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthType('email');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                authType === 'email'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Email & Password
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Phone OTP Form */}
          {authType === 'otp' && (
            <>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Registered Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="+91 98450 12345"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send 6-Digit OTP</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Enter 6-Digit OTP sent to {phone}
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-amber-400 hover:underline"
                      >
                        Change number
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono tracking-widest text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      * Test mode hint: Enter <strong>123456</strong>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify & Enter Buddy Cockpit</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Email Login Form */}
          {authType === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Buddy Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="buddy@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pl-9 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to Cockpit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Apply CTA */}
          <div className="pt-2 border-t border-slate-800 text-center text-xs text-slate-400">
            Want to become a Queue Buddy in Bengaluru?{' '}
            <Link
              href="/buddy/apply"
              className="text-amber-400 font-bold hover:underline block mt-1"
            >
              Fill Buddy Onboarding Application &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
