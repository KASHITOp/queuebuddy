'use client';

import React from 'react';

interface SuccessIllustrationProps {
  className?: string;
}

export const SuccessIllustration: React.FC<SuccessIllustrationProps> = ({ className = 'w-44 h-44' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Queue Buddy verified booking success illustration"
      role="img"
    >
      {/* Background Soft Circle */}
      <circle cx="100" cy="100" r="75" fill="#FFFCF2" stroke="#E5E0D5" strokeWidth="2" />
      <circle cx="100" cy="100" r="62" fill="#EBF7F0" />

      {/* Outer Confetti Shapes */}
      <rect x="35" y="45" width="10" height="6" rx="2" fill="#FFD60A" transform="rotate(-25 35 45)" stroke="#111111" strokeWidth="1" />
      <rect x="155" y="40" width="10" height="6" rx="2" fill="#FF5A36" transform="rotate(30 155 40)" stroke="#111111" strokeWidth="1" />
      <circle cx="30" cy="110" r="4" fill="#0B7A4B" />
      <circle cx="170" cy="105" r="5" fill="#FFD60A" stroke="#111111" strokeWidth="1" />
      <rect x="145" y="145" width="8" height="8" rx="2" fill="#0B7A4B" transform="rotate(15 145 145)" />
      <circle cx="50" cy="155" r="4" fill="#FF5A36" />

      {/* Main Shield / Badge */}
      <g transform="translate(55, 45)">
        {/* Yellow Ticket Card */}
        <rect
          x="0"
          y="10"
          width="90"
          height="100"
          rx="16"
          fill="#FFFFFF"
          stroke="#111111"
          strokeWidth="3"
        />
        {/* Ticket Header Bar */}
        <path
          d="M0 26C0 17.1634 7.16344 10 16 10H74C82.8366 10 90 17.1634 90 26V35H0V26Z"
          fill="#FFD60A"
          stroke="#111111"
          strokeWidth="3"
        />
        {/* Ticket Punch Notch */}
        <circle cx="0" cy="65" r="7" fill="#FFFCF2" stroke="#111111" strokeWidth="3" />
        <circle cx="90" cy="65" r="7" fill="#FFFCF2" stroke="#111111" strokeWidth="3" />
        <line x1="12" y1="65" x2="78" y2="65" stroke="#E5E0D5" strokeWidth="2" strokeDasharray="3 3" />

        {/* Big Green Check Circle */}
        <circle cx="45" cy="85" r="18" fill="#0B7A4B" stroke="#111111" strokeWidth="2.5" />
        {/* Checkmark */}
        <path
          d="M38 85L43 90L53 80"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Token Badge */}
        <rect x="18" y="42" width="54" height="16" rx="4" fill="#111111" />
        <text
          x="45"
          y="54"
          fill="#FFD60A"
          fontSize="9"
          fontWeight="bold"
          fontFamily="var(--font-martian-mono)"
          textAnchor="middle"
        >
          CONFIRMED
        </text>
      </g>

      {/* Bengaluru Auto Sparkle */}
      <path d="M100 15L102 21L108 23L102 25L100 31L98 25L92 23L98 21Z" fill="#FFD60A" stroke="#111111" strokeWidth="1" />
    </svg>
  );
};
