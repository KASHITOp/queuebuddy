'use client';

import React, { useState, useEffect } from 'react';
import { Booking, DocumentChecklistItem } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  CheckCircle2,
  Circle,
  Printer,
  Bell,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DocumentChecklistProps {
  booking: Booking;
  items: DocumentChecklistItem[];
  onToggleItem: (itemId: string) => void;
  printable?: boolean;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  booking,
  items,
  onToggleItem,
  printable = false,
}) => {
  const { t, locale } = useApp();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [reminderActive, setReminderActive] = useState(true);

  const checkedIds = booking.checklist_progress || [];
  const mandatoryItems = items.filter((i) => i.is_mandatory);
  const totalMandatory = mandatoryItems.length;
  const completedMandatory = mandatoryItems.filter((i) => checkedIds.includes(i.id)).length;
  const totalItems = items.length;
  const totalCompleted = checkedIds.length;

  const isAllMandatoryReady = totalMandatory > 0 && completedMandatory === totalMandatory;
  const progressPercent = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  // Fire celebratory confetti when customer completes all mandatory docs
  useEffect(() => {
    if (isAllMandatoryReady && !hasCelebrated && !printable) {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
      setHasCelebrated(true);
    }
  }, [isAllMandatoryReady, hasCelebrated, printable]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 ${printable ? 'print:p-6 bg-white text-slate-900' : ''}`}>
      {/* Printable / View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-800 text-slate-100 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base sm:text-lg font-bold">{t.checklist.title}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-md">{t.checklist.subtitle}</p>
        </div>

        {/* Progress Circular Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="currentColor"
                strokeWidth="4"
                className={isAllMandatoryReady ? 'text-emerald-400' : 'text-amber-400'}
                fill="transparent"
                strokeDasharray={2 * Math.PI * 22}
                strokeDashoffset={2 * Math.PI * 22 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-[11px] font-extrabold text-white">
              {progressPercent}%
            </div>
          </div>

          <div className="text-right sm:text-left">
            <div className="text-sm font-bold text-white">
              {totalCompleted} of {totalItems}
            </div>
            <div className="text-[11px] text-slate-400">{t.checklist.progressReady}</div>
          </div>
        </div>
      </div>

      {/* Celebration State Banner */}
      {isAllMandatoryReady && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-600/10 to-transparent border border-emerald-500/40 text-emerald-300 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-emerald-200">{t.checklist.allSetTitle}</h4>
            <p className="text-xs text-emerald-300/80 mt-0.5">{t.checklist.allSetDesc}</p>
          </div>
        </div>
      )}

      {/* Checklist Items Interactive List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const isChecked = checkedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-200 flex items-start gap-3.5 ${
                isChecked
                  ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-400/50'
              }`}
            >
              {/* Checkbox Icon */}
              <div className="mt-0.5 shrink-0 transition-transform group-hover:scale-110">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-400 group-hover:text-amber-500" />
                )}
              </div>

              {/* Item Details */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isChecked
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {locale === 'kn' ? item.item_name_kn : item.item_name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Copy Type Badge */}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {item.copy_type === 'original'
                        ? t.checklist.original
                        : item.copy_type === 'photocopy'
                        ? `${item.copies_count} ${t.checklist.photocopy}`
                        : `${t.checklist.both} (${item.copies_count}x)`}
                    </span>

                    {/* Mandatory vs Optional */}
                    {item.is_mandatory ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        {t.checklist.mandatory}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-500/10 text-slate-400">
                        {t.checklist.optional}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">{item.help_text}</p>

                {/* Where to get hint */}
                <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 pt-1">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    <strong>{t.checklist.whereToGet} </strong>
                    {item.where_to_get}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Evening Reminder & Actions Row */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <button
            type="button"
            onClick={() => setReminderActive(!reminderActive)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Bell className={`w-3.5 h-3.5 ${reminderActive ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>
              Evening reminder: <strong>{reminderActive ? 'Enabled (7 PM IST)' : 'Disabled'}</strong>
            </span>
          </button>
          {!isAllMandatoryReady && (
            <span className="text-[11px] text-amber-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {totalMandatory - completedMandatory} missing mandatory docs
            </span>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium text-xs transition-colors border border-slate-700 shadow-sm print:hidden"
        >
          <Printer className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.common.printChecklist}</span>
        </button>
      </div>

      {/* Strict Privacy Guarantee Box */}
      <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Strict Privacy Guarantee:
          </span>{' '}
          {t.common.privacyNote}
        </div>
      </div>
    </div>
  );
};
