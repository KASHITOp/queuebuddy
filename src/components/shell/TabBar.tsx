'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Home, Ticket, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { pickLive } from '@/components/queue/TokenMeter';
import { Pressable } from '@/components/ui/primitives';

export type AppTab = 'home' | 'explore' | 'queue' | 'profile';

const TABS: { id: AppTab; icon: typeof Home; label: (t: ReturnType<typeof useApp>['t']) => string }[] = [
  { id: 'home', icon: Home, label: (t) => t.nav.home },
  { id: 'explore', icon: Compass, label: () => 'Explore' },
  { id: 'queue', icon: Ticket, label: () => 'My queue' },
  { id: 'profile', icon: User, label: () => 'Profile' },
];

export const TabBar: React.FC<{ current: AppTab; onChange: (tab: AppTab) => void }> = ({ current, onChange }) => {
  const { bookings, t } = useApp();
  const live = pickLive(bookings);

  return (
    <nav aria-label="Main" className="shrink-0 glass border-t border-white/[0.06] pb-safe">
      <div className="max-w-md mx-auto h-16 grid grid-cols-4 px-2">
        {TABS.map(({ id, icon: Icon, label }) => {
          const active = current === id;
          return (
            <Pressable
              key={id}
              feedback="selection"
              onClick={() => onChange(id)}
              aria-label={label(t)}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center gap-1"
            >
              <span className="relative w-14 h-8 flex items-center justify-center">
                {active && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-brand/15"
                    transition={{ type: 'spring', damping: 30, stiffness: 420 }}
                  />
                )}
                <Icon className={`relative w-[22px] h-[22px] ${active ? 'text-brand' : 'text-ink-mute'}`} strokeWidth={active ? 2.4 : 2} />
                {id === 'queue' && live && (
                  <span className="absolute top-0.5 right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-coral text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-night-800 meter-digits">
                    {live.people_ahead ?? '•'}
                  </span>
                )}
              </span>
              <span className={`text-[11px] font-semibold ${active ? 'text-ink' : 'text-ink-mute'}`}>{label(t)}</span>
            </Pressable>
          );
        })}
      </div>
    </nav>
  );
};
