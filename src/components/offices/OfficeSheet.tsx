'use client';

import React, { useEffect, useState } from 'react';
import { Office, Service } from '@/types';
import { useApp } from '@/context/AppContext';
import { Sheet } from '@/components/ui/Sheet';
import { CrowdBars, OfficeGlyph, Pressable, PrimaryButton } from '@/components/ui/primitives';
import {
  CROWD_COLORS,
  CROWD_LABEL,
  distanceKm,
  formatKm,
  getCrowd,
  OFFICE_TYPE_META,
} from '@/lib/officeMeta';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, ChevronDown, Clock, Coffee, FileText, MapPin, Navigation, ShieldCheck, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/capacitor';

interface OfficeSheetProps {
  office: Office | null;
  onClose: () => void;
  onBook: (office: Office, service?: Service) => void;
}

export const OfficeSheet: React.FC<OfficeSheetProps> = ({ office, onClose, onBook }) => {
  const { services, checklists, crowdReports, registerDemand, locale } = useApp();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notified, setNotified] = useState(false);

  // Keep the last office while the sheet animates out.
  const [shown, setShown] = useState<Office | null>(office);
  useEffect(() => {
    if (office) {
      setShown(office);
      setSelectedServiceId(null);
      setExpandedId(null);
      setNotified(false);
    }
  }, [office]);

  const current = office || shown;
  const officeServices = current ? services.filter((s) => s.office_id === current.id) : [];
  const crowd = current ? getCrowd(current.id, crowdReports) : null;
  const soon = current?.status === 'coming_soon';
  const selectedService = officeServices.find((s) => s.id === selectedServiceId);

  const footer = current ? (
    soon ? (
      <PrimaryButton
        tone={notified ? 'ghost' : 'brand'}
        onClick={() => {
          registerDemand(current.id, 'in-app', 'General Office Launch');
          setNotified(true);
          haptic('success');
        }}
        disabled={notified}
      >
        {notified ? <Check className="w-5 h-5 text-mint" /> : <Bell className="w-5 h-5" />}
        <span>{notified ? "We'll ping you at launch" : 'Notify me when live'}</span>
      </PrimaryButton>
    ) : (
      <PrimaryButton onClick={() => onBook(current, selectedService)}>
        <Sparkles className="w-[18px] h-[18px]" />
        <span>{selectedService ? `Book buddy · ₹${selectedService.queue_buddy_base_fee + 29}` : 'Book a buddy here'}</span>
      </PrimaryButton>
    )
  ) : null;

  return (
    <Sheet open={!!office} onClose={onClose} footer={footer} label={current?.name || 'Office'}>
      {current && crowd && (
        <div className="px-5 pb-4">
          {/* Header */}
          <div className="flex items-start gap-3.5 pt-2">
            <OfficeGlyph type={current.office_type} size={52} />
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-mute">
                {OFFICE_TYPE_META[current.office_type].short} · {current.area}
              </div>
              <h2 className="text-[21px] font-black text-ink leading-tight mt-1">
                {locale === 'kn' ? current.name_kn : current.name}
              </h2>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 text-[12.5px] text-ink-mute">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-ink-faint" />
            <span className="leading-snug">{current.address}</span>
          </div>

          {/* Live crowd */}
          <div className="mt-4 rounded-[22px] bg-night-700 hairline p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-ink-mute">
                {crowd.source === 'buddy_report' ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-mint live-dot" />
                    Live from a buddy
                  </>
                ) : crowd.source === 'customer_report' ? (
                  'Visitor report'
                ) : (
                  'Usual pattern at this hour'
                )}
              </div>
              {crowd.reportedAt && (
                <span className="text-[11px] text-ink-faint">
                  {formatDistanceToNow(new Date(crowd.reportedAt), { addSuffix: true })}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="meter-digits text-[40px] font-bold leading-none" style={{ color: CROWD_COLORS[crowd.level] }}>
                    {crowd.people}
                  </span>
                  <span className="text-[13px] text-ink-mute">people in line</span>
                </div>
                <div className="text-[13px] font-semibold mt-1.5" style={{ color: CROWD_COLORS[crowd.level] }}>
                  {CROWD_LABEL[crowd.level]} · about {crowd.waitMins} min
                </div>
              </div>
              <CrowdBars crowd={crowd} className="scale-[1.6] origin-bottom-right" />
            </div>
            {crowd.notes && <p className="mt-3 text-[12px] text-ink-soft leading-relaxed border-t border-white/5 pt-3">“{crowd.notes}”</p>}
          </div>

          {/* Quick facts */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { icon: Clock, label: 'Counter', value: (current.working_hours.counter || current.working_hours.token_issue || current.working_hours.mon_fri).split(' - ')[0] },
              { icon: Coffee, label: 'Lunch', value: (current.working_hours.lunch || '1:30 PM').split(' - ')[0] },
              { icon: Navigation, label: 'Distance', value: formatKm(distanceKm(current)) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-night-700 hairline px-3 py-2.5">
                <Icon className="w-4 h-4 text-ink-faint" />
                <div className="text-[10.5px] uppercase tracking-wider text-ink-faint font-bold mt-1.5">{label}</div>
                <div className="text-[13px] font-bold text-ink mt-0.5 truncate">{value}</div>
              </div>
            ))}
          </div>

          {/* Services */}
          {officeServices.length > 0 && (
            <>
              <div className="mt-6 mb-2.5 flex items-center justify-between">
                <h3 className="text-[16px] font-extrabold text-ink">Services</h3>
                {!soon && <span className="text-[12px] text-ink-mute">Tap to choose</span>}
              </div>
              <div className="space-y-2">
                {officeServices.map((srv) => {
                  const docs = checklists.filter((c) => c.service_id === srv.id);
                  const isSelected = selectedServiceId === srv.id;
                  const isExpanded = expandedId === srv.id;
                  return (
                    <div
                      key={srv.id}
                      className={`rounded-[20px] p-3.5 transition-colors ${
                        isSelected ? 'bg-brand/10 shadow-[inset_0_0_0_1.5px_#FFD60A]' : 'bg-night-700 hairline'
                      }`}
                    >
                      <Pressable
                        feedback="selection"
                        disabled={soon}
                        onClick={() => setSelectedServiceId(isSelected ? null : srv.id)}
                        className="w-full text-left flex items-start gap-3 disabled:!opacity-100"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[14px] font-bold text-ink leading-snug">
                            {locale === 'kn' ? srv.title_kn : srv.title}
                          </div>
                          <div className="mt-1.5 flex items-center gap-2 text-[12px] text-ink-mute">
                            <span>Buddy ₹{srv.queue_buddy_base_fee}</span>
                            <span className="text-ink-faint">•</span>
                            <span>{srv.government_fee ? `Govt ₹${srv.government_fee} at desk` : 'No govt fee'}</span>
                          </div>
                        </div>
                        {!soon && (
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? 'bg-brand text-night' : 'border-2 border-white/15'
                            }`}
                          >
                            {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
                          </span>
                        )}
                      </Pressable>
                      {docs.length > 0 && (
                        <>
                          <Pressable
                            feedback="selection"
                            onClick={() => setExpandedId(isExpanded ? null : srv.id)}
                            className="mt-2.5 flex items-center gap-1.5 text-[12px] font-semibold text-ink-soft"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {docs.length} documents needed
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </Pressable>
                          {isExpanded && (
                            <ul className="mt-2 space-y-1.5">
                              {docs.map((d) => (
                                <li key={d.id} className="flex items-start gap-2 text-[12px] text-ink-mute">
                                  <span className="w-1 h-1 rounded-full bg-brand mt-[7px] shrink-0" />
                                  <span>
                                    <span className="text-ink-soft font-medium">{d.item_name}</span> ·{' '}
                                    {d.copy_type === 'both' ? 'original + copy' : d.copy_type}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-mint/[0.07] p-3.5">
            <ShieldCheck className="w-4 h-4 text-mint shrink-0 mt-0.5" />
            <p className="text-[12px] text-ink-soft leading-relaxed">
              Hours verified {formatDistanceToNow(new Date(current.last_verified_date), { addSuffix: true })}. Closed{' '}
              {current.holidays.slice(0, 2).join(', ').toLowerCase()}.
            </p>
          </div>
        </div>
      )}
    </Sheet>
  );
};
