'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Globe, User as UserIcon } from 'lucide-react';
import { MadeByCreditHeader } from '@/components/layout/MadeByCredit';

interface NavbarProps {
  onAccountClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onAccountClick }) => {
  const { locale, setLocale, t } = useApp();
  const { user, isAuthenticated } = useAuth();

  const handleNextLocale = () => {
    if (locale === 'en') setLocale('kn');
    else if (locale === 'kn') setLocale('hi');
    else setLocale('en');
  };

  const localeLabel: Record<Locale, string> = {
    en: 'English',
    kn: 'ಕನ್ನಡ',
    hi: 'हिंदी',
  };

  return (
    <header className="sticky top-0 z-30 w-full glass border-b border-white/10 px-4 pb-2.5 pt-[calc(10px+var(--sat))]">
      {/* Credit sits in the empty gutter beside the 448px content on wide screens only */}
      <MadeByCreditHeader className="absolute right-6 top-1/2 -translate-y-1/2" />
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Mobile Brand Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand border border-white/10 text-night font-black text-lg flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            Q
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-ink">
                QueueBuddy
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-brand text-night border border-white/10">
                BLR
              </span>
            </div>
            <p className="text-[10px] text-ink-mute font-medium leading-none">
              {locale === 'kn' ? 'ಸರ್ಕಾರಿ ಕಚೇರಿ ಸರದಿ' : locale === 'hi' ? 'सरकारी कतार सहायता' : 'Govt Line Assistance'}
            </p>
          </div>
        </Link>

        {/* Right Action: Language Switcher Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextLocale}
            aria-label="Switch Language (English / Kannada / Hindi)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-ink active:scale-95 transition-all touch-target"
          >
            <Globe className="w-3.5 h-3.5 text-mint" />
            <span className="font-semibold">{localeLabel[locale]}</span>
          </button>

          {isAuthenticated ? (
            <Link
              href="/account"
              aria-label="User Account"
              className="w-9 h-9 rounded-xl bg-night-700 border border-white/10 flex items-center justify-center text-ink font-bold text-xs shadow-sm active:scale-95 transition-transform"
            >
              {user?.full_name?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-ink text-night text-xs font-bold active:scale-95 transition-transform shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
