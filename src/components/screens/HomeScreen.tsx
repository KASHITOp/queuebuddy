'use client';

import React from 'react';
import { Office, OfficeType } from '@/types';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { TokenMeter, pickLive } from '@/components/queue/TokenMeter';
import { OfficeTile } from '@/components/offices/OfficeCard';
import { Avatar, OfficeGlyph, Pressable, SectionHeader } from '@/components/ui/primitives';
import { OFFICE_CATEGORIES, OFFICE_TYPE_META, getCrowd } from '@/lib/officeMeta';
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Ticket, Footprints, Coffee } from 'lucide-react';

interface HomeScreenProps {
  onBook: () => void;
  onOpenOffice: (office: Office) => void;
  onOpenQueue: (bookingId: string) => void;
  onBrowseCategory: (type: OfficeType | 'all') => void;
  onOpenProfile: () => void;
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onBook,
  onOpenOffice,
  onOpenQueue,
  onBrowseCategory,
  onOpenProfile,
}) => {
  const { bookings, offices, crowdReports, t } = useApp();
  const { user } = useAuth();
  const live = pickLive(bookings);
  const firstName = (user?.full_name || 'there').split(' ')[0];

  // Shortest lines first: the reason to open the app.
  const quickest = offices
    .filter((o) => o.status === 'bookable')
    .map((o) => ({ o, crowd: getCrowd(o.id, crowdReports) }))
    .sort((a, b) => a.crowd.waitMins - b.crowd.waitMins)
    .slice(0, 6)
    .map(({ o }) => o);

  return (
    <div className="pb-6">
      {/* Header */}
      <header className="px-5 pt-4 pb-5 flex items-center justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-ink-mute">
            <MapPin className="w-3.5 h-3.5 text-brand" />
            Bengaluru
          </div>
          <h1 className="text-[26px] font-black text-ink mt-1 leading-tight">
            {greeting()}, <span className="text-gradient-brand">{firstName}</span>
          </h1>
        </div>
        <Pressable onClick={onOpenProfile} aria-label="Profile" className="rounded-full">
          <Avatar name={user?.full_name || 'Q B'} size={44} />
        </Pressable>
      </header>

      {/* Hero */}
      <div className="px-4">
        {live ? (
          <TokenMeter booking={live} onOpen={() => onOpenQueue(live.id)} />
        ) : (
          <div
            className="relative overflow-hidden rounded-[28px] p-6 grain"
            style={{
              background:
                'radial-gradient(120% 120% at 100% 0%, rgba(255,214,10,0.35) 0%, transparent 50%), linear-gradient(160deg, #1D1D22 0%, #111114 100%)',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.07)',
            }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/15 text-brand text-[11px] font-bold uppercase tracking-[0.14em] px-2.5 py-1">
              <Sparkles className="w-3 h-3" /> Verified buddies
            </span>
            <h2 className="mt-4 text-[30px] font-black leading-[1.05] text-ink">
              Skip the line.
              <br />
              <span className="text-gradient-brand">Keep your day.</span>
            </h2>
            <p className="mt-3 text-[14px] text-ink-mute leading-relaxed max-w-[280px]">{t.subtitle}</p>
            <Pressable
              feedback="medium"
              onClick={onBook}
              className="mt-5 h-12 pl-5 pr-2 rounded-full bg-brand text-night font-display font-extrabold text-[15px] inline-flex items-center gap-3 shadow-glow"
            >
              Book a buddy
              <span className="w-8 h-8 rounded-full bg-night text-brand flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </span>
            </Pressable>
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="mt-8">
        <SectionHeader title="Where do you need to go?" />
        <div className="grid grid-cols-3 gap-2.5 px-4">
          {OFFICE_CATEGORIES.map((type) => {
            const count = offices.filter((o) => o.office_type === type).length;
            return (
              <Pressable
                key={type}
                feedback="selection"
                onClick={() => onBrowseCategory(type)}
                className="rounded-[22px] bg-night-700 hairline pt-3.5 pb-3 flex flex-col items-center gap-2"
              >
                <OfficeGlyph type={type} size={44} />
                <div className="text-center">
                  <div className="text-[13px] font-bold text-ink">{OFFICE_TYPE_META[type].short}</div>
                  <div className="text-[10.5px] text-ink-faint">{count ? `${count} ${count === 1 ? 'office' : 'offices'}` : 'Soon'}</div>
                </div>
              </Pressable>
            );
          })}
        </div>
      </div>

      {/* Shortest waits */}
      <div className="mt-8">
        <SectionHeader title="Shortest lines right now" action="See all" onAction={() => onBrowseCategory('all')} />
        <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 scroll-px-4 pb-1">
          {quickest.map((o) => (
            <OfficeTile key={o.id} office={o} onPress={onOpenOffice} />
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="mt-8 px-4">
        <div className="rounded-[26px] bg-night-700 hairline p-5">
          <h3 className="text-[17px] font-extrabold text-ink">How it works</h3>
          <div className="mt-4 space-y-4">
            {[
              { icon: Ticket, title: 'Book in 30 seconds', body: 'Pick the office and service. A verified buddy is matched by language.' },
              { icon: Coffee, title: 'Live your morning', body: 'Your buddy grabs the token and holds your place. Watch the meter tick down.' },
              { icon: Footprints, title: 'Walk in at your turn', body: 'We ping you when 3 are left. Swap in at the counter with your documents.' },
            ].map(({ icon: Icon, title, body }, i) => (
              <div key={title} className="flex gap-3.5">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  {i < 2 && <div className="absolute left-1/2 top-11 w-px h-5 bg-white/10" />}
                </div>
                <div className="min-w-0 pt-0.5">
                  <div className="text-[14px] font-bold text-ink">{title}</div>
                  <div className="text-[12.5px] text-ink-mute leading-relaxed mt-0.5">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 mx-4 flex items-center gap-3 rounded-[22px] bg-mint/[0.07] p-4">
        <ShieldCheck className="w-6 h-6 text-mint shrink-0" />
        <p className="text-[12.5px] text-ink-soft leading-relaxed">
          Every buddy is ID-verified in person. They never touch your documents — they only hold your place.
        </p>
      </div>
    </div>
  );
};
