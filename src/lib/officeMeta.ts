import { Car, FileSignature, Plane, Landmark, Zap, Building2, LucideIcon } from 'lucide-react';
import { CrowdReport, Office, OfficeType } from '@/types';

export interface OfficeTypeMeta {
  short: string;
  icon: LucideIcon;
  /** Tile gradient, from → to. */
  tint: [string, string];
}

export const OFFICE_TYPE_META: Record<OfficeType, OfficeTypeMeta> = {
  rto: { short: 'RTO', icon: Car, tint: ['#FFD60A', '#FF9F0A'] },
  sub_registrar: { short: 'Registrar', icon: FileSignature, tint: ['#A78BFA', '#6D28D9'] },
  psk: { short: 'Passport', icon: Plane, tint: ['#60A5FA', '#2563EB'] },
  ward_civic: { short: 'BBMP', icon: Landmark, tint: ['#3DDC97', '#0E9F6E'] },
  utility: { short: 'BESCOM', icon: Zap, tint: ['#FDBA74', '#F97316'] },
  taluk: { short: 'Taluk', icon: Building2, tint: ['#F472B6', '#DB2777'] },
  other: { short: 'Other', icon: Building2, tint: ['#A1A1AA', '#52525B'] },
};

/** Office categories shown as quick filters, in display order. */
export const OFFICE_CATEGORIES: OfficeType[] = ['rto', 'sub_registrar', 'psk', 'ward_civic', 'utility', 'taluk'];

// MG Road, the usual "centre of Bengaluru" reference point.
const CITY_CENTRE = { lat: 12.9756, lng: 77.6067 };

export const distanceKm = (office: Office, from = CITY_CENTRE) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(office.lat - from.lat);
  const dLng = toRad(office.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(from.lat)) * Math.cos(toRad(office.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatKm = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`);

export type CrowdLevel = 'low' | 'moderate' | 'heavy';

export interface CrowdSnapshot {
  people: number;
  waitMins: number;
  level: CrowdLevel;
  /** 1–5 bars for the crowd meter. */
  bars: number;
  source: CrowdReport['source'];
  reportedAt?: string;
  notes?: string;
}

export const CROWD_COLORS: Record<CrowdLevel, string> = {
  low: '#3DDC97',
  moderate: '#FFD60A',
  heavy: '#FF6B4A',
};

export const CROWD_LABEL: Record<CrowdLevel, string> = {
  low: 'Quiet',
  moderate: 'Busy',
  heavy: 'Packed',
};

/** Latest crowd picture for an office: buddy report, then visitor report, then the historical pattern. */
export const getCrowd = (officeId: string, reports: CrowdReport[]): CrowdSnapshot => {
  const forOffice = reports.filter((r) => r.office_id === officeId);
  const report =
    forOffice.find((r) => r.source === 'buddy_report') ||
    forOffice.find((r) => r.source === 'customer_report') ||
    forOffice.find((r) => r.source === 'historical_agg');

  // Offices nobody has reported on yet get a stable estimate from their id.
  const seed = officeId.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const people = report ? report.people_ahead : 4 + (seed % 9);
  const waitMins = report ? report.estimated_wait_minutes : people * 4;
  const level: CrowdLevel = people > 15 ? 'heavy' : people > 7 ? 'moderate' : 'low';
  const bars = Math.max(1, Math.min(5, Math.ceil(people / 5)));

  return {
    people,
    waitMins,
    level,
    bars,
    source: report?.source ?? 'historical_agg',
    reportedAt: report?.reported_at,
    notes: report?.notes,
  };
};
