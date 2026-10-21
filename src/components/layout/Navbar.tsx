'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Locale } from '@/lib/i18n';
import Link from 'next/link';
import { Globe, User as UserIcon } from 'lucide-react';

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
    <header className="sticky top-0 z-30 w-full bg-[#FFFCF2]/90 backdrop-blur-md border-b border-[#E5E0D5] px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Mobile Brand Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-[#FFD60A] border-2 border-[#111111] text-[#111111] font-black text-lg flex items-center justify-center shadow-sm group-active:scale-95 transition-transform">
            Q
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#111111]">
                QueueBuddy
              </span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-[#FFD60A] text-[#111111] border border-[#111111]/20">
                BLR
              </span>
            </div>
            <p className="text-[10px] text-[#555555] font-medium leading-none">
              {locale === 'kn' ? 'ಸರ್ಕಾರಿ ಕಚೇರಿ ಸರದಿ' : locale === 'hi' ? 'सरकारी कतार सहायता' : 'Govt Line Assistance'}
            </p>
          </div>
        </Link>

        {/* Right Action: Language Switcher Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleNextLocale}
            aria-label="Switch Language (English / Kannada / Hindi)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F0E6] hover:bg-[#EAE6DF] border border-[#E5E0D5] text-xs font-bold text-[#111111] active:scale-95 transition-all touch-target"
          >
            <Globe className="w-3.5 h-3.5 text-[#0B7A4B]" />
            <span className="font-semibold">{localeLabel[locale]}</span>
          </button>

          {isAuthenticated ? (
            <Link
              href="/account"
              aria-label="User Account"
              className="w-9 h-9 rounded-xl bg-[#FFFFFF] border border-[#E5E0D5] flex items-center justify-center text-[#111111] font-bold text-xs shadow-sm active:scale-95 transition-transform"
            >
              {user?.full_name?.charAt(0) || <UserIcon className="w-4 h-4" />}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-xl bg-[#111111] text-[#FFFCF2] text-xs font-bold active:scale-95 transition-transform shadow-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
