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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl max-h-[92vh] sm:max-h-[88vh] bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                {office.office_type.replace('_', ' ')}
              </span>
              {isComingSoon ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  {t.common.comingSoon}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {t.common.bookableOnly}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {locale === 'kn' ? office.name_kn : office.name}
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{office.address}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Sample Data Disclaimer Badge */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold">Sample Bengaluru Location: </span>
              Physical counter timings, gazetted holidays, and queue slots are pre-seeded for
              demonstration and must be cross-verified at the office notice board.
            </div>
          </div>

          {/* Crowd Status Section */}
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Live Queue & Crowd Health
            </div>
            <CrowdStatusCard officeId={office.id} />
          </div>

          {/* Working Hours & Holidays */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Office Timings & Lunch Hours
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Working Hours</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {office.working_hours.mon_fri}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[11px]">Lunch Break</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  {office.working_hours.lunch || '01:30 PM - 02:15 PM'}
                </span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
              <span>
                <strong>Closed on: </strong>
                {office.holidays.join(', ')}
              </span>
            </div>
          </div>

          {/* Coming Soon - Demand Capture Form */}
          {isComingSoon ? (
            <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border border-purple-500/30 space-y-3">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-bold">
                <Bell className="w-5 h-5 text-purple-500 animate-bounce" />
                <span>Notify Me When This Office Launches</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                We are actively onboarding verified Buddies for this location. Leave your phone
                number or email to receive priority launch notification!
              </p>

              {notifySuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Your demand has been registered! We will ping you as soon as this office opens.
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter WhatsApp or phone number"
                    value={notifyPhone}
                    onChange={(e) => setNotifyPhone(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors shrink-0"
                  >
                    Notify Me
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Services Offered List */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Available Services & Line Assistance
                </div>
                <span className="text-[11px] text-slate-500">{officeServices.length} services</span>
              </div>

              {officeServices.map((service) => {
                const serviceChecklist = checklists.filter((c) => c.service_id === service.id);
                const isExpanded = expandedServiceId === service.id;

                return (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 space-y-3 hover:border-amber-400/50 transition-colors shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {locale === 'kn' ? service.title_kn : service.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Fees Breakdown Mini Pill */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                        Govt Fee: ₹{service.government_fee}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-bold">
                        Buddy Fee: ₹{service.queue_buddy_base_fee}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        • Est. queue: {service.estimated_wait_minutes} min
                      </span>
                    </div>

                    {/* Document Checklist Accordion Toggle */}
                    {serviceChecklist.length > 0 && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                          className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {isExpanded ? 'Hide required documents' : `View ${serviceChecklist.length} required documents`}
                          </span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transform transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                            <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wide">
                              Document Checklist Preview:
                            </div>
                            {serviceChecklist.map((item, idx) => (
                              <div key={item.id} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-amber-500">{idx + 1}.</span>
                                <div>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">
                                    {locale === 'kn' ? item.item_name_kn : item.item_name}
                                  </span>
                                  <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                    {item.copy_type}
                                  </span>
                                  <p className="text-[11px] text-slate-400 mt-0.5">{item.help_text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Book Action */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                      <button
                        onClick={() => onBookService(office, service)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Book Buddy for this Service</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
