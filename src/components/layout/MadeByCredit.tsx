import React from 'react';

const CREDIT_TEXT = 'Made by Ravi with Love 💖';

type CreditTone = 'light' | 'dark';

const toneClass: Record<CreditTone, string> = {
  light: 'text-[#555555]',
  dark: 'text-slate-400',
};

interface MadeByCreditProps {
  tone?: CreditTone;
  className?: string;
}

/**
 * Page footer credit. Centered, small, Onest (body font), muted colour.
 * Pages with fixed bottom bars must place it inside their padded scroll area so it is never covered.
 */
export const MadeByCreditFooter: React.FC<MadeByCreditProps> = ({ tone = 'light', className = '' }) => (
  <footer className={`w-full py-4 text-center font-sans text-[11px] font-medium ${toneClass[tone]} ${className}`}>
    {CREDIT_TEXT}
  </footer>
);

/**
 * Header credit. Hidden on phones (the header has no spare room at 360–430px); the footer covers mobile.
 */
export const MadeByCreditHeader: React.FC<MadeByCreditProps> = ({ tone = 'light', className = '' }) => (
  <span
    className={`hidden lg:block whitespace-nowrap font-sans text-[11px] font-medium ${toneClass[tone]} ${className}`}
  >
    {CREDIT_TEXT}
  </span>
);
