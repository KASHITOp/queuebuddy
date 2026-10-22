'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { Office, OfficeType } from '@/types';
import { useApp } from '@/context/AppContext';
import { OfficeRow } from '@/components/offices/OfficeCard';
import { Pressable } from '@/components/ui/primitives';
import { OFFICE_CATEGORIES, OFFICE_TYPE_META, distanceKm, getCrowd } from '@/lib/officeMeta';
import { List, Map as MapIcon, Search, SearchX, X } from 'lucide-react';

// MapLibre is heavy; load it only when the map tab is opened.
const OfficeMap = dynamic(() => import('@/components/map/OfficeMap').then((m) => m.OfficeMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-night-700 animate-pulse" />,
});

type Sort = 'nearest' | 'quickest';

interface ExploreScreenProps {
  category: OfficeType | 'all';
  onCategory: (c: OfficeType | 'all') => void;
  onOpenOffice: (office: Office) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ category, onCategory, onOpenOffice }) => {
  const { offices, crowdReports, t } = useApp();
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [sort, setSort] = useState<Sort>('quickest');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = offices.filter((o) => {
      const matchesQuery =
        !q ||
        o.name.toLowerCase().includes(q) ||
        o.name_kn.includes(query.trim()) ||
        o.area.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q);
      return matchesQuery && (category === 'all' || o.office_type === category);
    });
    return filtered.sort((a, b) => {
      // Coming-soon offices always sink to the bottom.
      if (a.status !== b.status) return a.status === 'bookable' ? -1 : 1;
      return sort === 'nearest'
        ? distanceKm(a) - distanceKm(b)
        : getCrowd(a.id, crowdReports).waitMins - getCrowd(b.id, crowdReports).waitMins;
    });
  }, [offices, crowdReports, query, category, sort]);

  const chips: (OfficeType | 'all')[] = ['all', ...OFFICE_CATEGORIES];

  return (
    <div className="h-full flex flex-col">
      {/* Fixed header */}
      <div className="shrink-0 px-4 pt-4 pb-3 space-y-3 bg-night">
        <div className="flex items-center justify-between px-1">
          <h1 className="text-[28px] font-black text-ink">Explore</h1>
          <div className="flex p-1 rounded-full bg-night-700 hairline">
            {(['list', 'map'] as const).map((v) => (
              <Pressable
                key={v}
                feedback="selection"
                onClick={() => setView(v)}
                aria-label={v === 'list' ? t.common.listView : t.common.mapView}
                className={`w-10 h-8 rounded-full flex items-center justify-center transition-colors ${
                  view === v ? 'bg-brand text-night' : 'text-ink-mute'
                }`}
              >
                {v === 'list' ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              </Pressable>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 h-12 rounded-2xl bg-night-700 hairline px-4 focus-within:shadow-[inset_0_0_0_1.5px_#FFD60A]">
          <Search className="w-[18px] h-[18px] text-ink-faint shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search office or area"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-ink placeholder:text-ink-faint"
            enterKeyHint="search"
          />
          {query && (
            <Pressable feedback="selection" onClick={() => setQuery('')} aria-label="Clear search" className="text-ink-mute -mr-1 p-1">
              <X className="w-4 h-4" />
            </Pressable>
          )}
        </label>

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
          {chips.map((c) => {
            const active = category === c;
            return (
              <Pressable
                key={c}
                feedback="selection"
                onClick={() => onCategory(c)}
                className={`h-9 px-4 rounded-full shrink-0 text-[13px] font-semibold transition-colors ${
                  active ? 'bg-ink text-night' : 'bg-night-700 hairline text-ink-soft'
                }`}
              >
                {c === 'all' ? 'All' : OFFICE_TYPE_META[c].short}
              </Pressable>
            );
          })}
        </div>
      </div>

      {view === 'map' ? (
        <div className="flex-1 min-h-0 relative">
          <OfficeMap offices={results} onSelectOffice={onOpenOffice} />
        </div>
      ) : (
        <div className="screen-scroll flex-1 min-h-0 px-4 pb-6">
          <div className="flex items-center justify-between px-1 pt-1 pb-2.5">
            <span className="text-[12.5px] text-ink-mute">
              {results.length} {results.length === 1 ? 'office' : 'offices'}
            </span>
            <div className="flex gap-1">
              {(['quickest', 'nearest'] as Sort[]).map((s) => (
                <Pressable
                  key={s}
                  feedback="selection"
                  onClick={() => setSort(s)}
                  className={`h-7 px-3 rounded-full text-[12px] font-semibold ${
                    sort === s ? 'bg-brand/15 text-brand' : 'text-ink-mute'
                  }`}
                >
                  {s === 'quickest' ? 'Shortest wait' : 'Nearest'}
                </Pressable>
              ))}
            </div>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center text-center pt-16 px-8">
              <div className="w-16 h-16 rounded-full bg-night-700 hairline flex items-center justify-center">
                <SearchX className="w-7 h-7 text-ink-faint" />
              </div>
              <h3 className="mt-4 text-[17px] font-bold text-ink">No offices match</h3>
              <p className="mt-1 text-[13px] text-ink-mute">Try another area or clear the filters.</p>
              <Pressable
                onClick={() => {
                  setQuery('');
                  onCategory('all');
                }}
                className="mt-5 h-10 px-5 rounded-full bg-night-700 hairline text-[13px] font-semibold text-ink"
              >
                Clear filters
              </Pressable>
            </div>
          ) : (
            <div className="space-y-2.5">
              {results.map((o) => (
                <OfficeRow key={o.id} office={o} onPress={onOpenOffice} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
