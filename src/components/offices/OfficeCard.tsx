'use client';

import React from 'react';
import { Office } from '@/types';
import { useApp } from '@/context/AppContext';
import { CROWD_COLORS, CROWD_LABEL, distanceKm, formatKm, getCrowd, OFFICE_TYPE_META } from '@/lib/officeMeta';
import { CrowdBars, OfficeGlyph, Pressable } from '@/components/ui/primitives';
import { ChevronRight, Clock } from 'lucide-react';

interface OfficeCardProps {
  office: Office;
  onPress: (office: Office) => void;
}

/** Full-width row used in Explore. */
export const OfficeRow: React.FC<OfficeCardProps> = ({ office, onPress }) => {
  const { crowdReports, locale } = useApp();
  const crowd = getCrowd(office.id, crowdReports);
  const soon = office.status === 'coming_soon';

  return (
    <Pressable
      feedback="selection"
      onClick={() => onPress(office)}
      className={`w-full text-left flex items-center gap-3.5 rounded-[22px] bg-night-700 hairline p-3.5 ${soon ? 'opacity-60' : ''}`}
    >
      <OfficeGlyph type={office.office_type} size={48} />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-bold text-ink leading-tight line-clamp-2">
          {locale === 'kn' ? office.name_kn : office.name}
        </div>
        <div className="text-[12px] text-ink-mute mt-1 flex items-center gap-1.5">
          <span>{office.area}</span>
          <span className="text-ink-faint">•</span>
          <span>{formatKm(distanceKm(office))}</span>
        </div>
        {soon ? (
          <span className="inline-block mt-1.5 text-[10.5px] font-bold uppercase tracking-wider text-ink-mute bg-white/[0.06] rounded-full px-2 py-0.5">
            Coming soon
          </span>
        ) : (
          <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-semibold" style={{ color: CROWD_COLORS[crowd.level] }}>
            <CrowdBars crowd={crowd} />
            <span className="ml-1">{CROWD_LABEL[crowd.level]}</span>
            <span className="text-ink-faint font-normal">· ~{crowd.waitMins}m wait</span>
          </div>
        )}
      </div>
      <ChevronRight className="w-5 h-5 text-ink-faint shrink-0" />
    </Pressable>
  );
};

/** Compact card for horizontal carousels on Home. */
export const OfficeTile: React.FC<OfficeCardProps> = ({ office, onPress }) => {
  const { crowdReports } = useApp();
  const crowd = getCrowd(office.id, crowdReports);
  const meta = OFFICE_TYPE_META[office.office_type];

  return (
    <Pressable
      feedback="selection"
      onClick={() => onPress(office)}
      className="relative overflow-hidden w-[232px] shrink-0 snap-start text-left rounded-[24px] bg-night-700 hairline p-4"
    >
      <div
        className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-2xl opacity-25"
        style={{ background: meta.tint[0] }}
      />
      <div className="relative flex items-start justify-between">
        <OfficeGlyph type={office.office_type} size={40} />
        <div className="text-right">
          <div className="meter-digits text-[22px] font-bold leading-none" style={{ color: CROWD_COLORS[crowd.level] }}>
            {crowd.people}
          </div>
          <div className="text-[10.5px] text-ink-mute mt-1">in line</div>
        </div>
      </div>
      <div className="relative mt-3.5 text-[14.5px] font-bold text-ink leading-snug line-clamp-2 min-h-[38px]">{office.name}</div>
      <div className="relative mt-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[12px] text-ink-mute">
          <Clock className="w-3.5 h-3.5" />~{crowd.waitMins}m
        </span>
        <span className="text-[12px] text-ink-mute">{formatKm(distanceKm(office))}</span>
      </div>
    </Pressable>
  );
};
