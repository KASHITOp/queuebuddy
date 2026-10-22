'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { BellRing, Hourglass, Sparkles } from 'lucide-react';
import { PrimaryButton, Pressable } from '@/components/ui/primitives';
import { haptic } from '@/lib/capacitor';

const SLIDES = [
  {
    icon: Hourglass,
    kicker: 'RTO · Registrar · Passport · BBMP',
    title: ['Lines are long.', 'Your day isn’t.'],
    body: 'A verified Queue Buddy stands in line at Bengaluru’s government offices while you get on with life.',
    tint: '#FFD60A',
  },
  {
    icon: Sparkles,
    kicker: 'Live token meter',
    title: ['Watch the line', 'move in real time.'],
    body: 'Your buddy reports every token called. The meter ticks down, so you always know how long is left.',
    tint: '#3DDC97',
  },
  {
    icon: BellRing,
    kicker: 'Perfect timing',
    title: ['Walk in right', 'at your turn.'],
    body: 'We ping you when three people are left. Swap in at the counter with your documents ready.',
    tint: '#FF6B4A',
  },
];

export const Onboarding: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const Icon = slide.icon;
  const last = index === SLIDES.length - 1;

  const go = (next: number) => {
    if (next < 0 || next >= SLIDES.length) return;
    haptic('selection');
    setIndex(next);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) go(index + 1);
    else if (info.offset.x > 60) go(index - 1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-night flex flex-col pt-safe overflow-hidden"
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.35 }}
    >
      {/* Ambient glow follows the slide colour */}
      <motion.div
        className="absolute -top-56 left-1/2 -translate-x-1/2 w-[640px] h-[640px] pointer-events-none"
        animate={{ background: `radial-gradient(circle, ${slide.tint}40 0%, transparent 65%)` }}
        transition={{ duration: 0.6 }}
      />

      <div className="relative h-14 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-brand text-night font-display font-black flex items-center justify-center">Q</div>
          <span className="font-display font-extrabold text-ink">QueueBuddy</span>
        </div>
        {!last && (
          <Pressable feedback="selection" onClick={onDone} className="text-[14px] font-semibold text-ink-mute px-2 py-2">
            Skip
          </Pressable>
        )}
      </div>

      <motion.div className="relative flex-1 flex flex-col justify-end px-7" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25} onDragEnd={onDragEnd}>
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', damping: 26, stiffness: 260 }}
            className="pb-10"
          >
            <motion.div
              initial={{ scale: 0.6, rotate: -12 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 180 }}
              className="w-[88px] h-[88px] rounded-[28px] flex items-center justify-center mb-10"
              style={{ background: `${slide.tint}1F`, color: slide.tint, boxShadow: `0 20px 60px -20px ${slide.tint}` }}
            >
              <Icon className="w-11 h-11" strokeWidth={1.8} />
            </motion.div>
            <div className="text-[12px] font-bold uppercase tracking-[0.18em]" style={{ color: slide.tint }}>
              {slide.kicker}
            </div>
            <h1 className="mt-3 text-[40px] font-black leading-[1.02] text-ink">
              {slide.title[0]}
              <br />
              <span className="text-ink-mute">{slide.title[1]}</span>
            </h1>
            <p className="mt-4 text-[15.5px] text-ink-mute leading-relaxed">{slide.body}</p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="relative px-7 pb-[calc(24px+var(--sab))]">
        <div className="flex gap-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <motion.span
              key={i}
              className="h-1.5 rounded-full"
              animate={{ width: i === index ? 28 : 6, background: i === index ? slide.tint : 'rgba(255,255,255,0.18)' }}
            />
          ))}
        </div>
        <PrimaryButton onClick={() => (last ? onDone() : go(index + 1))}>{last ? 'Get started' : 'Next'}</PrimaryButton>
      </div>
    </motion.div>
  );
};
