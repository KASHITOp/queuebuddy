'use client';

import React from 'react';
import { CrowdReport } from '@/types';
import { useApp } from '@/context/AppContext';
import { Clock, Users, ShieldCheck, History, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CrowdStatusCardProps {
  officeId: string;
  compact?: boolean;
}

export const CrowdStatusCard: React.FC<CrowdStatusCardProps> = ({ officeId, compact = false }) => {
  const { crowdReports, t } = useApp();

  const officeReports = crowdReports.filter((r) => r.office_id === officeId);
  const latestBuddyReport = officeReports.find((r) => r.source === 'buddy_report');
  const customerReport = officeReports.find((r) => r.source === 'customer_report');
  const historicalReport = officeReports.find((r) => r.source === 'historical_agg');

  const primaryReport = latestBuddyReport || customerReport || historicalReport;

  const getRelativeTime = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (!primaryReport) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5] text-xs text-[#555555]">
        <AlertCircle className="w-3.5 h-3.5 text-[#888888] shrink-0" />
        <span className="truncate">{t.common.noDataYet}</span>
      </div>
    );
  }

  const peopleCount = primaryReport.people_ahead;
  let filledBars = 2;
  let barColor = 'bg-[#0B7A4B]';
  let badgeColor = 'bg-[#E6F5ED] text-[#0B7A4B] border-[#0B7A4B]/20';
  let crowdLabel = 'Low wait (~15m)';

  if (peopleCount > 15) {
    filledBars = 5;
    barColor = 'bg-[#FF5A36]';
    badgeColor = 'bg-[#FFEBE6] text-[#FF5A36] border-[#FF5A36]/30';
    crowdLabel = 'Heavy queue (~60m+)';
  } else if (peopleCount > 7) {
    filledBars = 3;
    barColor = 'bg-[#F59E0B]';
    badgeColor = 'bg-[#FEF3C7] text-[#B45309] border-[#F59E0B]/30';
    crowdLabel = 'Moderate crowd (~35m)';
  }

  // 5-segment crowd meter
  const meterBars = [1, 2, 3, 4, 5];

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-1 text-[11px]">
          <span className={`px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
            {peopleCount} ahead • {crowdLabel}
          </span>
          <span className="text-[10px] text-[#777777] font-mono">
            {getRelativeTime(primaryReport.reported_at)}
          </span>
        </div>

        {/* 5-segment bar */}
        <div className="flex gap-1 h-1.5 w-full">
          {meterBars.map((b) => (
            <div
              key={b}
              className={`flex-1 rounded-full transition-all ${
                b <= filledBars ? barColor : 'bg-[#E5E0D5]'
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-3.5 bg-[#FFFFFF] border border-[#E5E0D5] shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {primaryReport.source === 'buddy_report' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#0B7A4B] bg-[#E6F5ED] px-2 py-0.5 rounded-md border border-[#0B7A4B]/20">
              <ShieldCheck className="w-3 h-3" />
              Live Buddy Report
            </span>
          ) : primaryReport.source === 'customer_report' ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#111111] bg-[#F4F0E6] px-2 py-0.5 rounded-md border border-[#E5E0D5]">
              <Users className="w-3 h-3 text-[#FFD60A]" />
              Visitor Report
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-[#555555] bg-[#F4F0E6] px-2 py-0.5 rounded-md border border-[#E5E0D5]">
              <History className="w-3 h-3" />
              Historical Pattern
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-[#777777]">
          {getRelativeTime(primaryReport.reported_at)}
        </span>
      </div>

      {/* Meter Bar Display */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
          <span>{crowdLabel}</span>
          <span className="font-mono text-[#0B7A4B]">{peopleCount} in line</span>
        </div>
        <div className="flex gap-1.5 h-2 w-full">
          {meterBars.map((b) => (
            <div
              key={b}
              className={`flex-1 rounded-full transition-all ${
                b <= filledBars ? barColor : 'bg-[#E5E0D5]'
              }`}
            />
          ))}
        </div>
      </div>

      {primaryReport.notes && (
        <p className="text-[11px] text-[#555555] italic bg-[#F4F0E6] p-2 rounded-lg">
          &ldquo;{primaryReport.notes}&rdquo;
        </p>
      )}
    </div>
  );
};
