'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Globe,
  MapPin,
  Sparkles,
  Users,
  Building,
  UserCheck,
  User,
  LogOut,
  LogIn,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { role, setRole, locale, setLocale, t } = useApp();
  const { user, isAuthenticated, signOut, quickDemoLogin } = useAuth();
  const router = useRouter();

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

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo & Bengaluru Tag */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center shadow-md shadow-amber-500/20">
            Q
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                QueueBuddy
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Bengaluru
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {locale === 'kn' ? 'ಸರ್ಕಾರಿ ಕಚೇರಿ ಸರದಿ ಸಹಾಯ' : 'Govt Office Line Assistance'}
            </p>
          </div>
        </Link>

        {/* Right Controls: Language Toggle, Role Switcher & Auth State */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'kn' : 'en')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5"
            title="Toggle English / Kannada"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>{locale === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
          </button>

          {/* Quick Role Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                user?.role === 'customer'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              User
            </button>
            <button
              onClick={() => handleRoleSwitch('buddy')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                user?.role === 'buddy'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buddy
            </button>
            <button
              onClick={() => handleRoleSwitch('admin')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                user?.role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Account / Auth Buttons */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/account"
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
                title="Account Settings"
              >
                <User className="w-4 h-4 text-amber-400" />
              </Link>
              <button
                onClick={signOut}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors hidden sm:block"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
