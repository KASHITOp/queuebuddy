'use client';

import React, { useState, useMemo } from 'react';
import { Office } from '@/types';
import { useApp } from '@/context/AppContext';
import { OfficeMap } from '@/components/map/OfficeMap';
import { CrowdStatusCard } from './CrowdStatusCard';
import { EmptyIllustration } from '@/components/illustrations/EmptyIllustration';
import {
  Search,
  SlidersHorizontal,
  Map,
  List,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  X,
  Bell,
  Check,
} from 'lucide-react';

interface OfficeDirectoryProps {
  onSelectOffice: (office: Office) => void;
  onBookOffice: (office: Office) => void;
}

export const OfficeDirectory: React.FC<OfficeDirectoryProps> = ({
  onSelectOffice,
  onBookOffice,
}) => {
  const { offices, t, locale, registerDemand } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [bookableOnly, setBookableOnly] = useState(false);
  const [crowdFilter, setCrowdFilter] = useState<'all' | 'low'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [notifiedOfficeId, setNotifiedOfficeId] = useState<string | null>(null);

  // Extract unique areas
  const areas = useMemo(() => {
    const list = Array.from(new Set(offices.map((o) => o.area)));
    return ['all', ...list];
  }, [offices]);

  // Filtered offices
  const filteredOffices = useMemo(() => {
    return offices.filter((office) => {
      const matchesSearch =
        office.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.name_kn.includes(searchQuery) ||
        office.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        office.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || office.office_type === selectedType;
      const matchesArea = selectedArea === 'all' || office.area === selectedArea;
      const matchesBookable = !bookableOnly || office.status === 'bookable';

      return matchesSearch && matchesType && matchesArea && matchesBookable;
    });
  }, [offices, searchQuery, selectedType, selectedArea, bookableOnly]);

  const activeFilterCount =
    (selectedType !== 'all' ? 1 : 0) +
    (selectedArea !== 'all' ? 1 : 0) +
    (bookableOnly ? 1 : 0) +
    (crowdFilter !== 'all' ? 1 : 0);

  const officeTypeOptions: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Offices', icon: '🏛️' },
    { id: 'rto', label: 'RTO (Transport)', icon: '🚗' },
    { id: 'sub_registrar', label: 'Sub-Registrar', icon: '📜' },
    { id: 'psk', label: 'Passport (PSK)', icon: '🛂' },
    { id: 'ward_civic', label: 'BBMP / Civic', icon: '🏢' },
    { id: 'utility', label: 'Utility (BESCOM)', icon: '⚡' },
    { id: 'taluk', label: 'Taluk Office', icon: '🏛️' },
  ];

  const handleNotifyMe = (e: React.MouseEvent, officeId: string) => {
    e.stopPropagation();
    registerDemand(officeId, '+91 98450 00000', 'general');
    setNotifiedOfficeId(officeId);
    setTimeout(() => setNotifiedOfficeId(null), 3500);
  };

  return (
    <div className="space-y-3.5 max-w-md mx-auto">
      {/* Top Search & Toggle Control Bar */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t.common.searchOffice}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t.common.searchOffice}
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#111111]/15 text-xs sm:text-sm text-[#111111] placeholder-[#888888] focus:outline-none focus:border-[#111111] transition-all"
            />
            <Search className="w-4 h-4 text-[#777777] absolute left-3 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-2.5 text-xs text-[#777777] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bottom-Sheet Filter Trigger Button */}
          <button
            onClick={() => setIsFilterSheetOpen(true)}
            aria-label="Open filter sheet"
            className={`relative p-2.5 rounded-2xl border-2 flex items-center justify-center touch-target transition-all active:scale-95 ${
              activeFilterCount > 0
                ? 'bg-[#FFD60A] border-[#111111] text-[#111111] font-bold shadow-sm'
                : 'bg-[#FFFFFF] border-[#111111]/15 text-[#111111] hover:bg-[#F4F0E6]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0B7A4B] text-white text-[10px] font-mono font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* View Mode Pill & Category Scroll */}
        <div className="flex items-center justify-between gap-2">
          {/* Map/List Switcher Pill */}
          <div className="flex items-center p-1 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5] text-xs font-bold shrink-0">
            <button
              onClick={() => setViewMode('list')}
              aria-selected={viewMode === 'list'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-sm font-extrabold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{t.common.listView}</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              aria-selected={viewMode === 'map'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'map'
                  ? 'bg-[#FFFFFF] text-[#111111] shadow-sm font-extrabold'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>{t.common.mapView}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono font-bold text-[#666666] shrink-0">
            {filteredOffices.length} offices
          </div>
        </div>
      </div>

      {/* Map View Rendering */}
      {viewMode === 'map' && (
        <div className="rounded-3xl overflow-hidden border-2 border-[#111111] shadow-md">
          <OfficeMap
            offices={filteredOffices}
            onSelectOffice={(office) => onSelectOffice(office)}
          />
        </div>
      )}

      {/* Empty State */}
      {filteredOffices.length === 0 && (
        <div className="p-8 rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/10 text-center space-y-3 flex flex-col items-center">
          <EmptyIllustration className="w-36 h-36" />
          <h3 className="text-base font-black text-[#111111] font-display">
            No matching Bengaluru offices found
          </h3>
          <p className="text-xs text-[#555555] max-w-xs">
            Try resetting your search query or removing the area and category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('all');
              setSelectedArea('all');
              setBookableOnly(false);
              setCrowdFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-[#FFD60A] text-[#111111] font-bold text-xs border border-[#111111] active:scale-95 transition-transform"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Office Cards List (390px Phone First) */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {filteredOffices.map((office) => {
            const isBookable = office.status === 'bookable';

            return (
              <div
                key={office.id}
                onClick={() => onSelectOffice(office)}
                className="cursor-pointer rounded-3xl bg-[#FFFFFF] border-2 border-[#111111]/15 hover:border-[#111111] p-4 sm:p-5 shadow-sm hover:shadow-md transition-all active:scale-[0.99] touch-target space-y-3"
              >
                {/* Office Name, Area & Distance */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F4F0E6] text-[#111111] border border-[#E5E0D5]">
                        {office.area}
                      </span>
                      <span className="text-[10px] font-bold text-[#0B7A4B] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0B7A4B]" />
                        <span>~2.4 km away</span>
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-[#111111] tracking-tight mt-1 font-display leading-snug">
                      {locale === 'kn' ? office.name_kn : office.name}
                    </h3>
                    <p className="text-[11px] text-[#555555] truncate leading-tight mt-0.5">
                      {office.address}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isBookable
                        ? 'bg-[#E6F5ED] text-[#0B7A4B] border border-[#0B7A4B]/30'
                        : 'bg-[#FFEBE6] text-[#FF5A36] border border-[#FF5A36]/30'
                    }`}
                  >
                    {isBookable ? '● Bookable' : 'Coming Soon'}
                  </span>
                </div>

                {/* Crowd Meter Display (5-segment Bar + Text) */}
                <div className="pt-1">
                  <CrowdStatusCard officeId={office.id} compact={true} />
                </div>

                {/* Working Hours & Wait Estimate */}
                <div className="flex items-center justify-between text-[11px] text-[#555555] pt-1 border-t border-[#F4F0E6]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#777777]" />
                    <span>Counter: {office.working_hours.counter || '10:00 AM - 01:30 PM'}</span>
                  </div>
                  <span className="font-mono font-bold text-[#111111]">
                    Avg wait: 20-30m
                  </span>
                </div>

                {/* Card Primary Action Button */}
                <div className="pt-1">
                  {isBookable ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookOffice(office);
                      }}
                      aria-label={`Book buddy for ${office.name}`}
                      className="w-full py-3 px-4 rounded-xl bg-[#FFD60A] text-[#111111] font-black text-xs flex items-center justify-center gap-2 border-2 border-[#111111] active:scale-[0.98] transition-transform shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.common.bookBuddy}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleNotifyMe(e, office.id)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#F4F0E6] hover:bg-[#EAE6DF] text-[#111111] font-bold text-xs flex items-center justify-center gap-2 border border-[#E5E0D5] active:scale-[0.98] transition-transform"
                    >
                      {notifiedOfficeId === office.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#0B7A4B]" />
                          <span className="text-[#0B7A4B]">Demand Registered! We will notify you.</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-3.5 h-3.5 text-[#FF5A36]" />
                          <span>{t.common.notifyMe}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Slide-Up Bottom-Sheet Filter */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-[#FFFFFF] rounded-t-3xl border-t-2 border-x-2 border-[#111111] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto pb-safe animate-in slide-in-from-bottom duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Filter Offices"
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 rounded-full bg-[#E5E0D5] mx-auto -mt-1" />

            <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#111111]" />
                <h3 className="text-base font-black text-[#111111] font-display">
                  {t.common.filterTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#F4F0E6] text-[#555555]"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Office Category Filters */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                {t.common.filterByType}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {officeTypeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedType(opt.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-bold flex items-center gap-2 transition-all ${
                      selectedType === opt.id
                        ? 'bg-[#FFD60A] text-[#111111] border-[#111111] shadow-sm'
                        : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Area Filter */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-[#555555] tracking-wider font-mono">
                {t.common.filterByArea}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {areas.map((a) => (
                  <button
                    key={a}
                    onClick={() => setSelectedArea(a)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedArea === a
                        ? 'bg-[#111111] text-[#FFFCF2] border-[#111111]'
                        : 'bg-[#F4F0E6] text-[#555555] border-[#E5E0D5] hover:text-[#111111]'
                    }`}
                  >
                    {a === 'all' ? 'All Areas' : a}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookable Now Toggle */}
            <div className="p-3.5 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#111111]">
                  {t.common.bookableOnly}
                </div>
                <div className="text-[10px] text-[#555555]">
                  Only show offices ready for live buddy booking
                </div>
              </div>
              <button
                onClick={() => setBookableOnly(!bookableOnly)}
                className={`w-12 h-6 rounded-full transition-colors p-0.5 border ${
                  bookableOnly
                    ? 'bg-[#0B7A4B] border-[#0B7A4B]'
                    : 'bg-[#E5E0D5] border-[#CCCCCC]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    bookableOnly ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Sticky Sheet Actions */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedArea('all');
                  setBookableOnly(false);
                  setCrowdFilter('all');
                }}
                className="py-3 px-4 rounded-xl bg-[#F4F0E6] text-[#111111] font-bold text-xs border border-[#E5E0D5] hover:bg-[#EAE6DF] active:scale-95 transition-all touch-target"
              >
                {t.common.resetFilters}
              </button>
              <button
                onClick={() => setIsFilterSheetOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#FFD60A] text-[#111111] font-black text-xs border-2 border-[#111111] shadow-md active:scale-95 transition-all touch-target flex items-center justify-center gap-1.5"
              >
                <span>{t.common.applyFilters}</span>
                <span className="font-mono">({filteredOffices.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
