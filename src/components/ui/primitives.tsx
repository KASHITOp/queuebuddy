'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { haptic, HapticKind } from '@/lib/capacitor';
import { OFFICE_TYPE_META, CROWD_COLORS, CrowdSnapshot } from '@/lib/officeMeta';
import { OfficeType } from '@/types';

type PressableProps = HTMLMotionProps<'button'> & { feedback?: HapticKind | false };

/** Button with a spring press and haptic tick: the base of every tappable surface. */
export const Pressable = React.forwardRef<HTMLButtonElement, PressableProps>(
  ({ feedback = 'light', onClick, className = '', type = 'button', ...rest }, ref) => (
    <motion.button
      ref={ref}
      type={type}
      whileTap={{ scale: 0.965 }}
      transition={{ type: 'spring', stiffness: 600, damping: 30 }}
      onClick={(e) => {
        if (feedback) haptic(feedback);
        onClick?.(e);
      }}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:opacity-40 disabled:pointer-events-none ${className}`}
      {...rest}
    />
  )
);
Pressable.displayName = 'Pressable';

export const PrimaryButton: React.FC<PressableProps & { tone?: 'brand' | 'mint' | 'coral' | 'ghost' }> = ({
  tone = 'brand',
  className = '',
  ...rest
}) => {
  const tones = {
    brand: 'bg-brand text-night shadow-glow',
    mint: 'bg-mint text-night shadow-[0_12px_40px_-10px_rgba(61,220,151,0.55)]',
    coral: 'bg-coral text-white shadow-[0_12px_40px_-10px_rgba(255,107,74,0.6)]',
    ghost: 'bg-white/[0.06] text-ink hairline',
  };
  return (
    <Pressable
      feedback="medium"
      className={`relative overflow-hidden w-full h-14 rounded-2xl font-display font-extrabold text-[15px] tracking-tight flex items-center justify-center gap-2 ${tones[tone]} ${className}`}
      {...rest}
    />
  );
};

export const SectionHeader: React.FC<{ title: string; action?: string; onAction?: () => void }> = ({
  title,
  action,
  onAction,
}) => (
  <div className="flex items-end justify-between px-5 mb-3">
    <h2 className="text-[17px] font-extrabold text-ink">{title}</h2>
    {action && (
      <Pressable feedback="selection" onClick={onAction} className="text-[13px] font-semibold text-brand -my-2 py-2">
        {action}
      </Pressable>
    )}
  </div>
);

export const OfficeGlyph: React.FC<{ type: OfficeType; size?: number; className?: string }> = ({
  type,
  size = 44,
  className = '',
}) => {
  const meta = OFFICE_TYPE_META[type];
  const Icon = meta.icon;
  return (
    <div
      className={`shrink-0 rounded-[14px] flex items-center justify-center text-night ${className}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(140deg, ${meta.tint[0]}, ${meta.tint[1]})`,
        boxShadow: `0 8px 24px -10px ${meta.tint[1]}`,
      }}
    >
      <Icon style={{ width: size * 0.46, height: size * 0.46 }} strokeWidth={2.2} />
    </div>
  );
};

/** Five-segment crowd meter. */
export const CrowdBars: React.FC<{ crowd: CrowdSnapshot; className?: string }> = ({ crowd, className = '' }) => (
  <div className={`flex items-end gap-[3px] ${className}`} aria-label={`Crowd ${crowd.bars} of 5`}>
    {[1, 2, 3, 4, 5].map((b) => (
      <span
        key={b}
        className="w-[5px] rounded-full"
        style={{
          height: 6 + b * 2.5,
          background: b <= crowd.bars ? CROWD_COLORS[crowd.level] : 'rgba(255,255,255,0.12)',
        }}
      />
    ))}
  </div>
);

export const Avatar: React.FC<{ name: string; size?: number; ring?: boolean }> = ({ name, size = 44, ring }) => {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <div
      className={`shrink-0 rounded-full flex items-center justify-center font-display font-black text-night ${
        ring ? 'ring-2 ring-brand ring-offset-2 ring-offset-night-800' : ''
      }`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: 'linear-gradient(140deg, #FFE45C, #FFB703)',
      }}
    >
      {initials}
    </div>
  );
};
