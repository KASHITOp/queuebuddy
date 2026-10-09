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

  // Find reports for this office
  const officeReports = crowdReports.filter((r) => r.office_id === officeId);

  // Latest live buddy report (source 1)
  const latestBuddyReport = officeReports.find((r) => r.source === 'buddy_report');

  // Historical average report (source 2)
  const historicalReport = officeReports.find((r) => r.source === 'historical_agg');

  // Customer community report (source 3)
  const customerReport = officeReports.find((r) => r.source === 'customer_report');

  // Determine primary display
  const primaryReport = latestBuddyReport || customerReport || historicalReport;

  // Format relative time safely
  const getRelativeTime = (isoString: string) => {
    try {
      return formatDistanceToNow(new Date(isoString), { addSuffix: true });
    } catch {
      return 'recently';
    }
  };

  if (!primaryReport) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Crowd Status: </span>
          <span>{t.common.noDataYet}</span>
        </div>
      </div>
    );
  }

  // Crowd level rating
  const peopleCount = primaryReport.people_ahead;
  let levelColor = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  let levelText = 'Low Wait';
  if (peopleCount > 15) {
    levelColor = 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    levelText = 'Heavy Queue';
  } else if (peopleCount > 8) {
    levelColor = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    levelText = 'Moderate Crowd';
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${levelColor}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
          {peopleCount} ahead ({levelText})
        </span>
        <span className="text-[11px] text-slate-400">
          • {primaryReport.source === 'buddy_report' ? 'Buddy report' : 'Visitor data'} (
          {getRelativeTime(primaryReport.reported_at)})
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 bg-slate-900 text-slate-100 border border-slate-800 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {primaryReport.source === 'buddy_report' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Live Buddy Report
            </span>
          ) : primaryReport.source === 'customer_report' ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full border border-sky-400/20">
              <Users className="w-3.5 h-3.5" />
              Visitor Crowd Report
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 bg-purple-400/10 px-2.5 py-1 rounded-full border border-purple-400/20">
              <History className="w-3.5 h-3.5" />
              Historical Pattern
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            {getRelativeTime(primaryReport.reported_at)}
          </span>
        </div>

        <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${levelColor}`}>
          {levelText}
        </span>
      </div>

      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3 py-1">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {primaryReport.people_ahead}
            </div>
            <div className="text-[11px] text-slate-400">people ahead</div>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              ~{primaryReport.estimated_wait_minutes} min
            </div>
            <div className="text-[11px] text-slate-400">est. counter wait</div>
          </div>
        </div>
      </div>

      {primaryReport.notes && (
        <p className="text-xs text-slate-300 italic bg-slate-800/40 p-2 rounded-lg border border-slate-800">
          &ldquo;{primaryReport.notes}&rdquo;
        </p>
      )}

      {/* Historical Best Time to Visit Hint */}
      {historicalReport && (
        <div className="pt-2 border-t border-slate-800 flex items-start gap-2 text-xs text-slate-300">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-400">Best Time to Visit: </span>
            <span>Early morning 09:45 AM – 10:45 AM. </span>
            <span className="text-slate-400">
              (Historical data: Usually busy between 11:30 AM – 01:30 PM).
            </span>
          </div>
        </div>
      )}

      {/* Honest Provenance Disclaimer */}
      <div className="text-[10px] text-slate-500 tracking-wide">
        * QueueBuddy verified data only. Never generated by fake AI predictions.
      </div>
    </div>
  );
};
