'use client';

import React from 'react';

interface EmptyIllustrationProps {
  className?: string;
}

export const EmptyIllustration: React.FC<EmptyIllustrationProps> = ({ className = 'w-48 h-48' }) => {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Empty queue illustration with Bengaluru auto-rickshaw"
      role="img"
    >
      {/* Ground line */}
      <path
        d="M20 170H220"
        stroke="#E5E0D5"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />

      {/* Office Counter Backing */}
      <rect x="145" y="65" width="70" height="105" rx="10" fill="#F4F0E6" stroke="#111111" strokeWidth="2.5" />
      <rect x="155" y="75" width="50" height="28" rx="6" fill="#FFFFFF" stroke="#E5E0D5" strokeWidth="1.5" />
      <text x="180" y="93" fill="#111111" fontSize="10" fontWeight="bold" fontFamily="var(--font-archivo)" textAnchor="middle">
        COUNTER 1
      </text>
      <rect x="160" y="115" width="40" height="8" rx="4" fill="#E5E0D5" />
      <rect x="160" y="130" width="30" height="6" rx="3" fill="#E5E0D5" />

      {/* Queue Stanchions */}
      <path d="M125 105V170" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
      <circle cx="125" cy="103" r="5" fill="#FFD60A" stroke="#111111" strokeWidth="2" />
      <path d="M90 115V170" stroke="#111111" strokeWidth="3" strokeLinecap="round" />
      <circle cx="90" cy="113" r="5" fill="#FFD60A" stroke="#111111" strokeWidth="2" />
      {/* Velvet rope */}
      <path d="M90 120Q108 135 125 110" stroke="#FF5A36" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Bengaluru Auto-Rickshaw Holding Spot */}
      <g transform="translate(10, 60)">
        {/* Auto Cabin Roof (Yellow) */}
        <path
          d="M25 45 C28 20, 50 15, 78 15 C88 15, 96 22, 98 45 Z"
          fill="#FFD60A"
          stroke="#111111"
          strokeWidth="2.5"
        />
        {/* Windshield */}
        <path d="M30 45 L70 45 L65 24 L38 24 Z" fill="#FFFFFF" stroke="#111111" strokeWidth="2" />
        {/* Lower Body (Auto Green) */}
        <path
          d="M20 45 L98 45 L102 75 C102 82, 96 85, 88 85 L26 85 C18 85, 14 80, 15 72 Z"
          fill="#0B7A4B"
          stroke="#111111"
          strokeWidth="2.5"
        />
        {/* Yellow racing stripe */}
        <path d="M16 60 H101" stroke="#FFD60A" strokeWidth="4" />
        {/* Front Wheel */}
        <circle cx="34" cy="88" r="14" fill="#111111" />
        <circle cx="34" cy="88" r="6" fill="#F4F0E6" stroke="#111111" strokeWidth="2" />
        {/* Back Wheel */}
        <circle cx="85" cy="88" r="14" fill="#111111" />
        <circle cx="85" cy="88" r="6" fill="#F4F0E6" stroke="#111111" strokeWidth="2" />
        {/* Headlight */}
        <circle cx="20" cy="55" r="4" fill="#FFD60A" stroke="#111111" strokeWidth="1.5" />
      </g>

      {/* Floating Sparkles & Coffee/Spot Token */}
      <g transform="translate(120, 30)">
        <rect x="0" y="0" width="38" height="24" rx="6" fill="#FFD60A" stroke="#111111" strokeWidth="2" />
        <text x="19" y="16" fill="#111111" fontSize="10" fontWeight="900" fontFamily="var(--font-martian-mono)" textAnchor="middle">
          #01
        </text>
      </g>

      {/* Little floating stars */}
      <path d="M60 25L62 30L67 32L62 34L60 39L58 34L53 32L58 30Z" fill="#FFD60A" stroke="#111111" strokeWidth="1" />
      <path d="M195 40L196 43L199 44L196 45L195 48L194 45L191 44L194 43Z" fill="#0B7A4B" />
    </svg>
  );
};
