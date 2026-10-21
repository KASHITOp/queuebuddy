'use client';

import React, { useState } from 'react';
import { Office, Service } from '@/types';
import { useApp } from '@/context/AppContext';
import { CrowdStatusCard } from './CrowdStatusCard';
import {
  X,
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  FileText,
  Bell,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

interface OfficeDetailModalProps {
  office: Office | null;
  onClose: () => void;
  onBookService: (office: Office, service: Service) => void;
}

export const OfficeDetailModal: React.FC<OfficeDetailModalProps> = ({
  office,
  onClose,
  onBookService,
}) => {
  const { services, checklists, registerDemand, t, locale } = useApp();
  const [notifyPhone, setNotifyPhone] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  if (!office) return null;

  const officeServices = services.filter((s) => s.office_id === office.id);
  const isComingSoon = office.status === 'coming_soon';

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyPhone) return;
    registerDemand(office.id, notifyPhone, 'General Office Launch');
    setNotifySuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90vh] bg-[#FFFFFF] rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 border-[#111111] shadow-2xl overflow-hidden flex flex-col pb-safe animate-in slide-in-from-bottom duration-300">
        {/* Sheet Top Handle for mobile */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-[#E5E0D5]" />
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b-2 border-[#111111]/10 flex items-start justify-between bg-[#FFFCF2]">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F4F0E6] text-[#111111] border border-[#E5E0D5] uppercase tracking-wider">
                {office.office_type.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#0B7A4B]">
                ● {office.area}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-[#111111] font-display leading-snug">
              {locale === 'kn' ? office.name_kn : office.name}
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-[#555555] mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#0B7A4B] shrink-0" />
              <span className="truncate">{office.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-1.5 rounded-full bg-[#F4F0E6] hover:bg-[#EAE6DF] text-[#111111] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-[#111111]">
          {/* Crowd Status */}
          <div>
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#555555] mb-1.5">
              LIVE CROWD & WAIT METRICS
            </div>
            <CrowdStatusCard officeId={office.id} compact={false} />
          </div>

          {/* Timings & Working Hours */}
          <div className="rounded-2xl p-3.5 bg-[#F4F0E6] border border-[#E5E0D5] space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-[#111111]">
              <Clock className="w-4 h-4 text-[#0B7A4B]" />
              <span>Office Counter Timings</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#555555] pt-1">
              <div>
                <span className="font-semibold text-[#111111]">General: </span>
                {office.working_hours.mon_fri}
              </div>
              <div>
                <span className="font-semibold text-[#111111]">Counter: </span>
                {office.working_hours.counter || '10:00 AM - 01:30 PM'}
              </div>
              <div>
                <span className="font-semibold text-[#111111]">Lunch Break: </span>
                {office.working_hours.lunch || '01:30 PM - 02:15 PM'}
              </div>
              <div>
                <span className="font-semibold text-[#111111]">Holidays: </span>
                2nd & 4th Sat, Sun
              </div>
            </div>
          </div>

          {/* Services Available */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono font-black uppercase tracking-wider text-[#555555]">
              SERVICES & DOCUMENT CHECKLISTS ({officeServices.length})
            </div>

            <div className="space-y-2">
              {officeServices.map((srv) => {
                const isExpanded = expandedServiceId === srv.id;
                const srvChecklist = checklists.filter((c) => c.service_id === srv.id);

                return (
                  <div
                    key={srv.id}
                    className="rounded-2xl border-2 border-[#111111]/15 bg-[#FFFFFF] p-3.5 space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#111111] font-display">
                          {locale === 'kn' ? srv.title_kn : srv.title}
                        </h4>
                        <p className="text-[11px] text-[#555555] line-clamp-2 mt-0.5">
                          {srv.description}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-xs text-[#111111]">
                          ₹{srv.queue_buddy_base_fee}
                        </div>
                        <div className="text-[9px] text-[#555555]">Buddy fee</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#F4F0E6] text-[11px]">
                      <span className="text-[#0B7A4B] font-semibold">
                        Govt Counter Fee: ₹{srv.government_fee}
                      </span>
                      <button
                        onClick={() => setExpandedServiceId(isExpanded ? null : srv.id)}
                        className="text-[#111111] font-bold underline"
                      >
                        {isExpanded ? 'Hide Docs' : `${srvChecklist.length} Docs Required`}
                      </button>
                    </div>

                    {/* Expanded Document Checklist Preview */}
                    {isExpanded && (
                      <div className="p-2.5 rounded-xl bg-[#F4F0E6] space-y-1.5 text-[11px] text-[#333333]">
                        <div className="font-bold text-[#111111]">Required at Counter:</div>
                        <ul className="space-y-1 list-disc pl-4 text-[10px]">
                          {srvChecklist.map((c) => (
                            <li key={c.id}>
                              <strong>{c.item_name}: </strong>
                              {c.copy_type} ({c.copies_count}x)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!isComingSoon && (
                      <button
                        onClick={() => onBookService(office, srv)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#FFD60A] text-[#111111] font-black text-xs flex items-center justify-center gap-1.5 border border-[#111111] active:scale-95 transition-transform touch-target shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Book Buddy for this Service</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coming Soon Notify Option */}
          {isComingSoon && (
            <div className="p-4 rounded-2xl bg-[#FFEBE6] border border-[#FF5A36]/30 space-y-2.5 text-xs text-[#FF5A36]">
              <div className="font-bold">QueueBuddy Launching Here Soon</div>
              <p className="text-[11px] text-[#111111]">
                Leave your mobile number. We will send you an SMS alert as soon as verified buddies are on the ground here.
              </p>
              {!notifySuccess ? (
                <form onSubmit={handleNotifySubmit} className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+91 98450 00000"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E0D5] text-xs text-[#111111] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#FF5A36] text-white font-bold text-xs active:scale-95 transition-transform"
                  >
                    Notify Me
                  </button>
                </form>
              ) : (
                <div className="p-2 rounded-xl bg-[#0B7A4B] text-white font-bold text-center text-xs">
                  ✓ Demand recorded! We will alert you.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
