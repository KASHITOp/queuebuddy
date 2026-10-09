'use client';

import React, { useState, useMemo } from 'react';
import { Office, OfficeType } from '@/types';
import { useApp } from '@/context/AppContext';
import { OfficeMap } from '@/components/map/OfficeMap';
import { CrowdStatusCard } from './CrowdStatusCard';
import {
  Search,
  Filter,
  Map,
  List,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Building,
  Bell,
  Sparkles,
} from 'lucide-react';

interface OfficeDirectoryProps {
  onSelectOffice: (office: Office) => void;
  onBookOffice: (office: Office) => void;
}

export const OfficeDirectory: React.FC<OfficeDirectoryProps> = ({
  onSelectOffice,
  onBookOffice,
}) => {
  const { offices, t, locale } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [bookableOnly, setBookableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'map' | 'list'>('both');
  const [activeOfficeForPin, setActiveOfficeForPin] = useState<Office | null>(null);

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

  const officeTypeOptions: { id: string; label: string; icon: string }[] = [
    { id: 'all', label: 'All Offices', icon: '🏛️' },
    { id: 'rto', label: 'RTO', icon: '🚗' },
    { id: 'sub_registrar', label: 'Sub-Registrar', icon: '📜' },
    { id: 'psk', label: 'Passport (PSK)', icon: '🛂' },
    { id: 'ward_civic', label: 'BBMP / Civic', icon: '🏢' },
    { id: 'utility', label: 'Utility (BESCOM/BWSSB)', icon: '⚡' },
    { id: 'taluk', label: 'Taluk Office', icon: '🏛️' },
  ];

  return (
    <div className="space-y-4">
      {/* Search Bar & Filter Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="relative">
          <input
            type="text"
            placeholder={t.common.searchOffice}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Office Type Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {officeTypeOptions.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                selectedType === type.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Filters Row: Area & Bookable toggle & View Switch */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Area Dropdown */}
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="all">All Bengaluru Areas</option>
              {areas
                .filter((a) => a !== 'all')
                .map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
            </select>

            {/* Bookable only switch */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300 font-medium select-none">
              <input
                type="checkbox"
                checked={bookableOnly}
                onChange={(e) => setBookableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
              />
              <span>{t.common.bookableOnly}</span>
            </label>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'both'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Split
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Map + List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Map View Column */}
        {(viewMode === 'both' || viewMode === 'map') && (
          <div
            className={`w-full ${
              viewMode === 'map' ? 'lg:col-span-12 h-[680px]' : 'lg:col-span-5 h-[360px] lg:h-[580px] lg:sticky lg:top-24'
            }`}
          >
            <OfficeMap
              offices={filteredOffices}
              selectedOffice={activeOfficeForPin}
              onSelectOffice={(office) => {
                setActiveOfficeForPin(office);
                onSelectOffice(office);
              }}
            />
          </div>
        )}

        {/* List View Column */}
        {(viewMode === 'both' || viewMode === 'list') && (
          <div
            className={`w-full space-y-3.5 ${
              viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-7'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Found {filteredOffices.length} offices in Bengaluru</span>
              <span className="text-[11px] text-amber-500 font-semibold">
                * Pre-seeded sample data clearly marked
              </span>
            </div>

            {filteredOffices.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
                <Building className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  No matching offices found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try clearing your search query or expanding the area filter.
                </p>
              </div>
            ) : (
              filteredOffices.map((office) => {
                const isComingSoon = office.status === 'coming_soon';

                return (
                  <div
                    key={office.id}
                    onClick={() => {
                      setActiveOfficeForPin(office);
                      onSelectOffice(office);
                    }}
                    className={`cursor-pointer p-4 sm:p-5 rounded-3xl border bg-white dark:bg-slate-900/90 transition-all duration-200 hover:shadow-lg space-y-3.5 ${
                      activeOfficeForPin?.id === office.id
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
                    }`}
                  >
                    {/* Header: Type, Area, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                            {office.office_type.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-bold text-amber-500">{office.area}</span>
                        </div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {locale === 'kn' ? office.name_kn : office.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="line-clamp-1">{office.address}</span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isComingSoon ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {t.common.comingSoon}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t.common.bookableOnly}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Crowd Status Preview (Honest Provenance) */}
                    <div>
                      <CrowdStatusCard officeId={office.id} compact={true} />
                    </div>

                    {/* Timings & Action Footer */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{office.working_hours.mon_fri}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isComingSoon ? (
                          <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                            <Bell className="w-3.5 h-3.5" />
                            <span>Notify Me</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onBookOffice(office);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors flex items-center gap-1"
                          >
                            <span>{t.common.bookBuddy}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
