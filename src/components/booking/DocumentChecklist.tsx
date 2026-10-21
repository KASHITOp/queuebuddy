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

  useEffect(() => {
    if (isAllMandatoryReady && !hasCelebrated && !printable) {
      confetti({
        particleCount: 65,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FFD60A', '#0B7A4B', '#FF5A36', '#111111'],
      });
      setHasCelebrated(true);
    }
  }, [isAllMandatoryReady, hasCelebrated, printable]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`space-y-4 max-w-md mx-auto ${printable ? 'print:p-6 bg-white text-black' : ''}`}>
      {/* Progress Header Card */}
      <div className="flex items-center justify-between gap-3 bg-[#111111] p-4 sm:p-5 rounded-3xl text-[#FFFCF2] shadow-xl border-2 border-black">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-[#FFD60A] shrink-0" />
            <h3 className="text-sm sm:text-base font-black font-display truncate">
              {t.checklist.title}
            </h3>
          </div>
          <p className="text-[11px] text-[#E5E0D5] mt-0.5 line-clamp-1">
            {t.checklist.subtitle}
          </p>
        </div>

        {/* Circular Progress Meter */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="3.5"
                className="text-white/20"
                fill="transparent"
              />
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="currentColor"
                strokeWidth="3.5"
                className={isAllMandatoryReady ? 'text-[#0B7A4B]' : 'text-[#FFD60A]'}
                fill="transparent"
                strokeDasharray={2 * Math.PI * 18}
                strokeDashoffset={2 * Math.PI * 18 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-[10px] font-mono font-black text-white">
              {progressPercent}%
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-mono font-bold text-[#FFD60A]">
              {totalCompleted}/{totalItems}
            </div>
            <div className="text-[9px] text-[#E5E0D5] uppercase font-mono">Ready</div>
          </div>
        </div>
      </div>

      {/* Celebration State Banner */}
      {isAllMandatoryReady && (
        <div className="p-3.5 rounded-2xl bg-[#E6F5ED] border-2 border-[#0B7A4B] text-[#0B7A4B] flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[#0B7A4B] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-[#0B7A4B] font-display">
              {t.checklist.allSetTitle}
            </h4>
            <p className="text-[11px] text-[#0B7A4B]/80 mt-0.5 leading-tight">
              {t.checklist.allSetDesc}
            </p>
          </div>
        </div>
      )}

      {/* Checklist Items Interactive List */}
      <div className="space-y-2.5">
        {items.map((item, index) => {
          const isChecked = checkedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`group cursor-pointer p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 touch-target active:scale-[0.99] ${
                isChecked
                  ? 'bg-[#E6F5ED]/40 border-[#0B7A4B]/40'
                  : 'bg-[#FFFFFF] border-[#E5E0D5] hover:border-[#111111]/40'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0B7A4B]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#888888] group-hover:text-[#111111]" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono text-[#777777]">#{index + 1}</span>
                    <h4
                      className={`text-xs sm:text-sm font-bold font-display truncate ${
                        isChecked ? 'line-through text-[#777777]' : 'text-[#111111]'
                      }`}
                    >
                      {locale === 'kn' ? item.item_name_kn : item.item_name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F0E6] text-[#111111] border border-[#E5E0D5]">
                      {item.copy_type === 'original'
                        ? t.checklist.original
                        : item.copy_type === 'photocopy'
                        ? `${item.copies_count} ${t.checklist.photocopy}`
                        : `${t.checklist.both} (${item.copies_count}x)`}
                    </span>

                    {item.is_mandatory && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFEBE6] text-[#FF5A36] border border-[#FF5A36]/30">
                        Mandatory
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-[#555555] leading-snug">{item.help_text}</p>

                <div className="flex items-center gap-1 text-[10px] text-[#0B7A4B] font-semibold pt-0.5">
                  <HelpCircle className="w-3 h-3 shrink-0" />
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

      {/* Reminder & Actions */}
      <div className="pt-1 flex items-center justify-between gap-2 text-xs flex-wrap">
        <button
          type="button"
          onClick={() => setReminderActive(!reminderActive)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4F0E6] border border-[#E5E0D5] text-[11px] font-bold text-[#111111]"
        >
          <Bell className={`w-3.5 h-3.5 ${reminderActive ? 'text-[#0B7A4B]' : 'text-[#888888]'}`} />
          <span>Reminder: {reminderActive ? '7 PM IST' : 'Off'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111111] text-[#FFFCF2] text-[11px] font-bold print:hidden active:scale-95 transition-transform"
        >
          <Printer className="w-3.5 h-3.5 text-[#FFD60A]" />
          <span>{t.common.printChecklist}</span>
        </button>
      </div>

      {/* Strict Privacy Guarantee Box */}
      <div className="p-3 rounded-2xl bg-[#F4F0E6] border border-[#E5E0D5] text-[10px] text-[#555555] flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#0B7A4B] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#111111]">Privacy Guarantee:</strong> {t.common.privacyNote}
        </div>
      </div>
    </div>
  );
};
