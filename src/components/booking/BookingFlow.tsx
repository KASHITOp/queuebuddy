'use client';

import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays, format } from 'date-fns';
import confetti from 'canvas-confetti';
import { Booking, Office, Service, SupportedLanguage } from '@/types';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useBackHandler } from '@/components/shell/BackStack';
import { OfficeGlyph, Pressable, PrimaryButton } from '@/components/ui/primitives';
import { CROWD_COLORS, distanceKm, formatKm, getCrowd } from '@/lib/officeMeta';
import { haptic } from '@/lib/capacitor';
import { ArrowLeft, Check, ChevronRight, CreditCard, FileText, Lock, QrCode, ShieldCheck, X, Languages } from 'lucide-react';

type Step = 'office' | 'service' | 'when' | 'language' | 'pay';

const LANGS: SupportedLanguage[] = ['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu'];
const SLOTS = ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM'];
const PLATFORM_FEE = 29;
const EXTRA_HOUR_FEE = 100;

const TITLES: Record<Step, { title: string; sub: string }> = {
  office: { title: 'Which office?', sub: 'Pick where your buddy should stand in line.' },
  service: { title: 'What do you need done?', sub: 'We attach the right document checklist.' },
  when: { title: 'When should we line up?', sub: 'Your buddy arrives early to grab the token.' },
  language: { title: 'Pick a language', sub: 'Your buddy talks to staff and updates you in it.' },
  pay: { title: 'Review & pay', sub: 'Govt fees are paid at the counter, never here.' },
};

interface BookingFlowProps {
  initialOffice?: Office;
  initialService?: Service;
  onDone: (booking: Booking) => void;
  onClose: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ initialOffice, initialService, onDone, onClose }) => {
  const { offices, services, checklists, crowdReports, createBooking, locale } = useApp();
  const { user } = useAuth();

  const steps: Step[] = useMemo(() => {
    const all: Step[] = ['office', 'service', 'when', 'language', 'pay'];
    if (initialOffice && initialService) return all.slice(2);
    if (initialOffice) return all.slice(1);
    return all;
  }, [initialOffice, initialService]);

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [office, setOffice] = useState<Office | null>(initialOffice || null);
  // An office with a single service needs no choice: preselect it.
  const onlyServiceOf = (o: Office | null | undefined) => {
    const list = o ? services.filter((s) => s.office_id === o.id) : [];
    return list.length === 1 ? list[0] : null;
  };
  const [service, setService] = useState<Service | null>(initialService || onlyServiceOf(initialOffice));
  // Default to tomorrow, skipping Sunday when offices are shut.
  const [dayOffset, setDayOffset] = useState(() => (addDays(new Date(), 1).getDay() === 0 ? 2 : 1));
  const [slot, setSlot] = useState('10:00 AM');
  const [hours, setHours] = useState(2);
  const [language, setLanguage] = useState<SupportedLanguage>('Kannada');
  const [pay, setPay] = useState<'upi' | 'card'>('upi');
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const step = steps[stepIndex];
  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(new Date(), i)), []);

  const baseFee = service?.queue_buddy_base_fee ?? 349;
  const extraHours = Math.max(0, hours - 2);
  const buddyFee = baseFee + extraHours * EXTRA_HOUR_FEE;
  const total = buddyFee + PLATFORM_FEE;

  const goBack = () => {
    if (confirmed) return onDone(confirmed);
    if (paying) return;
    if (stepIndex === 0) return onClose();
    setDirection(-1);
    setStepIndex((i) => i - 1);
  };
  useBackHandler(true, goBack);

  const canContinue = (step === 'office' && !!office) || (step === 'service' && !!service) || step === 'when' || step === 'language';

  const next = () => {
    if (step === 'pay') return handlePay();
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const handlePay = () => {
    if (!office || !service) return;
    setPaying(true);
    window.setTimeout(() => {
      const booking = createBooking({
        officeId: office.id,
        serviceId: service.id,
        bookingDate: format(days[dayOffset], 'yyyy-MM-dd'),
        arrivalTime: slot,
        expectedWaitHours: hours,
        preferredLanguage: language,
        backupLanguage: language === 'English' ? 'Kannada' : 'English',
        customerName: user?.full_name || 'Demo Customer',
        customerPhone: user?.phone || '+91 98450 00000',
        totalAmount: total,
        queueBuddyFee: buddyFee,
        governmentFee: service.government_fee,
      });
      haptic('success');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.35 }, colors: ['#FFD60A', '#3DDC97', '#FAFAF7', '#FF6B4A'] });
      setPaying(false);
      setConfirmed(booking);
    }, 1500);
  };

  const bookable = offices.filter((o) => o.status === 'bookable');
  const officeServices = office ? services.filter((s) => s.office_id === office.id) : [];

  return (
    <motion.div
      className="fixed inset-0 z-40 bg-night flex flex-col"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 34, stiffness: 320 }}
    >
      {confirmed ? (
        <Confirmation booking={confirmed} onTrack={() => onDone(confirmed)} />
      ) : (
        <>
          {/* Header */}
          <div className="shrink-0 pt-safe">
            <div className="h-14 px-2 flex items-center justify-between">
              <Pressable onClick={goBack} aria-label={stepIndex === 0 ? 'Close' : 'Back'} className="w-11 h-11 rounded-full flex items-center justify-center text-ink">
                {stepIndex === 0 ? <X className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
              </Pressable>
              <div className="flex gap-1.5">
                {steps.map((s, i) => (
                  <motion.span
                    key={s}
                    className="h-1.5 rounded-full"
                    animate={{ width: i === stepIndex ? 22 : 6, background: i <= stepIndex ? '#FFD60A' : 'rgba(255,255,255,0.15)' }}
                  />
                ))}
              </div>
              <div className="w-11" />
            </div>
          </div>

          <div className="flex-1 min-h-0 relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={step}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? '40%' : '-40%', opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d > 0 ? '-40%' : '40%', opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', damping: 32, stiffness: 300 }}
                className="screen-scroll absolute inset-0 px-5 pb-8"
              >
                <h1 className="text-[28px] font-black text-ink leading-tight mt-2">{TITLES[step].title}</h1>
                <p className="text-[14px] text-ink-mute mt-1.5 mb-6">{TITLES[step].sub}</p>

                {step === 'office' && (
                  <div className="space-y-2.5">
                    {bookable.map((o) => {
                      const crowd = getCrowd(o.id, crowdReports);
                      const selected = office?.id === o.id;
                      return (
                        <Pressable
                          key={o.id}
                          feedback="selection"
                          onClick={() => {
                            setOffice(o);
                            if (service?.office_id !== o.id) setService(onlyServiceOf(o));
                          }}
                          className={`w-full text-left flex items-center gap-3.5 rounded-[22px] p-3.5 ${
                            selected ? 'bg-brand/10 shadow-[inset_0_0_0_1.5px_#FFD60A]' : 'bg-night-700 hairline'
                          }`}
                        >
                          <OfficeGlyph type={o.office_type} size={44} />
                          <div className="min-w-0 flex-1">
                            <div className="text-[14.5px] font-bold text-ink line-clamp-1">{locale === 'kn' ? o.name_kn : o.name}</div>
                            <div className="text-[12px] text-ink-mute mt-0.5">
                              {formatKm(distanceKm(o))} ·{' '}
                              <span style={{ color: CROWD_COLORS[crowd.level] }}>~{crowd.waitMins}m line</span>
                            </div>
                          </div>
                          <Radio on={selected} />
                        </Pressable>
                      );
                    })}
                  </div>
                )}

                {step === 'service' && (
                  <div className="space-y-2.5">
                    {officeServices.length === 0 && (
                      <p className="text-[14px] text-ink-mute">No services listed for this office yet.</p>
                    )}
                    {officeServices.map((s) => {
                      const selected = service?.id === s.id;
                      const docs = checklists.filter((c) => c.service_id === s.id).length;
                      return (
                        <Pressable
                          key={s.id}
                          feedback="selection"
                          onClick={() => setService(s)}
                          className={`w-full text-left rounded-[22px] p-4 ${
                            selected ? 'bg-brand/10 shadow-[inset_0_0_0_1.5px_#FFD60A]' : 'bg-night-700 hairline'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-[15px] font-bold text-ink leading-snug">{locale === 'kn' ? s.title_kn : s.title}</div>
                              <div className="text-[12.5px] text-ink-mute mt-1 line-clamp-2">{s.description}</div>
                            </div>
                            <Radio on={selected} />
                          </div>
                          <div className="mt-3 flex items-center gap-3 text-[12px]">
                            <span className="font-bold text-brand">₹{s.queue_buddy_base_fee}</span>
                            <span className="text-ink-faint">{s.government_fee ? `Govt ₹${s.government_fee} at desk` : 'No govt fee'}</span>
                            {docs > 0 && (
                              <span className="ml-auto flex items-center gap-1 text-ink-mute">
                                <FileText className="w-3.5 h-3.5" />
                                {docs} docs
                              </span>
                            )}
                          </div>
                        </Pressable>
                      );
                    })}
                  </div>
                )}

                {step === 'when' && (
                  <div>
                    <Label>Day</Label>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
                      {days.map((d, i) => {
                        const selected = i === dayOffset;
                        const sunday = d.getDay() === 0;
                        return (
                          <Pressable
                            key={i}
                            feedback="selection"
                            disabled={sunday}
                            onClick={() => setDayOffset(i)}
                            className={`shrink-0 w-[62px] h-[76px] rounded-[20px] flex flex-col items-center justify-center ${
                              selected ? 'bg-brand text-night' : 'bg-night-700 hairline text-ink'
                            }`}
                          >
                            <span className={`text-[11px] font-bold uppercase ${selected ? 'text-night/70' : 'text-ink-faint'}`}>
                              {i === 0 ? 'Today' : format(d, 'EEE')}
                            </span>
                            <span className="meter-digits text-[22px] font-bold mt-0.5">{format(d, 'd')}</span>
                          </Pressable>
                        );
                      })}
                    </div>

                    <Label className="mt-7">Buddy reaches the office at</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {SLOTS.map((s) => (
                        <Pressable
                          key={s}
                          feedback="selection"
                          onClick={() => setSlot(s)}
                          className={`h-11 rounded-xl text-[12.5px] font-bold ${
                            slot === s ? 'bg-ink text-night' : 'bg-night-700 hairline text-ink-soft'
                          }`}
                        >
                          {s.replace(/^0/, '')}
                        </Pressable>
                      ))}
                    </div>

                    <div className="mt-7 rounded-[22px] bg-night-700 hairline p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-bold text-ink">Hold my spot for</span>
                        <span className="meter-digits text-[18px] font-bold text-brand">{hours}h</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={0.5}
                        value={hours}
                        onChange={(e) => {
                          setHours(parseFloat(e.target.value));
                          haptic('selection');
                        }}
                        className="mt-3 w-full accent-[#FFD60A]"
                        aria-label="Hours to hold the spot"
                      />
                      <p className="text-[12px] text-ink-mute mt-1">First 2 hours included. ₹{EXTRA_HOUR_FEE} per extra hour.</p>
                    </div>
                  </div>
                )}

                {step === 'language' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {LANGS.map((l) => {
                      const selected = language === l;
                      return (
                        <Pressable
                          key={l}
                          feedback="selection"
                          onClick={() => setLanguage(l)}
                          className={`h-[72px] rounded-[20px] px-4 flex items-center justify-between ${
                            selected ? 'bg-brand/10 shadow-[inset_0_0_0_1.5px_#FFD60A]' : 'bg-night-700 hairline'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <Languages className={`w-5 h-5 ${selected ? 'text-brand' : 'text-ink-faint'}`} />
                            <span className="text-[15px] font-bold text-ink">{l}</span>
                          </span>
                          <Radio on={selected} />
                        </Pressable>
                      );
                    })}
                  </div>
                )}

                {step === 'pay' && office && service && (
                  <div>
                    <div className="rounded-[24px] bg-night-700 hairline p-4">
                      <div className="flex items-center gap-3">
                        <OfficeGlyph type={office.office_type} size={44} />
                        <div className="min-w-0">
                          <div className="text-[14.5px] font-bold text-ink line-clamp-1">{office.name}</div>
                          <div className="text-[12.5px] text-ink-mute line-clamp-1">{service.title}</div>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        {[
                          ['Day', dayOffset === 0 ? 'Today' : format(days[dayOffset], 'EEE d')],
                          ['Arrive', slot],
                          ['Language', language],
                        ].map(([k, v]) => (
                          <div key={k} className="rounded-xl bg-white/[0.04] py-2">
                            <div className="text-[10px] uppercase tracking-wider text-ink-faint font-bold">{k}</div>
                            <div className="text-[12.5px] font-bold text-ink mt-0.5">{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-[24px] bg-night-700 hairline p-4 space-y-2.5 text-[13.5px]">
                      <Line label="Queue Buddy (2 hrs)" value={`₹${baseFee}`} />
                      {extraHours > 0 && <Line label={`Extra ${extraHours} hr`} value={`₹${extraHours * EXTRA_HOUR_FEE}`} />}
                      <Line label="Safety & platform" value={`₹${PLATFORM_FEE}`} />
                      <div className="border-t border-dashed border-white/10 pt-2.5 flex items-center justify-between">
                        <span className="font-bold text-ink">Pay now</span>
                        <span className="meter-digits text-[20px] font-bold text-brand">₹{total}</span>
                      </div>
                      {service.government_fee > 0 && (
                        <div className="flex items-center justify-between text-[12.5px] text-mint bg-mint/[0.07] rounded-xl px-3 py-2">
                          <span>Govt fee, paid at the counter</span>
                          <span className="font-bold">₹{service.government_fee}</span>
                        </div>
                      )}
                    </div>

                    <Label className="mt-6">Pay with</Label>
                    <div className="space-y-2">
                      {[
                        { id: 'upi' as const, icon: QrCode, label: 'UPI', hint: 'GPay, PhonePe, Paytm' },
                        { id: 'card' as const, icon: CreditCard, label: 'Card', hint: 'Razorpay test card' },
                      ].map(({ id, icon: Icon, label, hint }) => (
                        <Pressable
                          key={id}
                          feedback="selection"
                          onClick={() => setPay(id)}
                          className={`w-full flex items-center gap-3 rounded-[20px] p-3.5 text-left ${
                            pay === id ? 'bg-brand/10 shadow-[inset_0_0_0_1.5px_#FFD60A]' : 'bg-night-700 hairline'
                          }`}
                        >
                          <span className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-ink">
                            <Icon className="w-5 h-5" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-[14.5px] font-bold text-ink">{label}</span>
                            <span className="block text-[12px] text-ink-mute">{hint}</span>
                          </span>
                          <Radio on={pay === id} />
                        </Pressable>
                      ))}
                    </div>
                    <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-faint">
                      <Lock className="w-3 h-3" /> Test mode — no real money moves
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom action */}
          <div className="shrink-0 px-5 pt-3 pb-[calc(14px+var(--sab))] border-t border-white/[0.05] bg-night">
            <PrimaryButton onClick={next} disabled={step !== 'pay' && !canContinue} tone={step === 'pay' ? 'mint' : 'brand'}>
              {step === 'pay' ? (
                <>
                  <Lock className="w-[18px] h-[18px]" /> Pay ₹{total}
                </>
              ) : (
                <>
                  Continue <ChevronRight className="w-5 h-5" />
                </>
              )}
            </PrimaryButton>
          </div>

          {/* Payment processing */}
          <AnimatePresence>
            {paying && (
              <motion.div
                className="absolute inset-0 z-10 bg-night/90 backdrop-blur-md flex flex-col items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full border-[3px] border-white/10 border-t-mint"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                />
                <div className="mt-5 text-[16px] font-bold text-ink">Confirming payment</div>
                <div className="mt-1 text-[13px] text-ink-mute">Matching a {language}-speaking buddy…</div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
};

const Radio: React.FC<{ on: boolean }> = ({ on }) => (
  <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${on ? 'bg-brand text-night' : 'border-2 border-white/15'}`}>
    {on && <Check className="w-4 h-4" strokeWidth={3} />}
  </span>
);

const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`mb-3 text-[12px] font-bold uppercase tracking-[0.14em] text-ink-faint ${className}`}>{children}</div>
);

const Line: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-ink-mute">{label}</span>
    <span className="font-semibold text-ink">{value}</span>
  </div>
);

const Confirmation: React.FC<{ booking: Booking; onTrack: () => void }> = ({ booking, onTrack }) => (
  <div className="flex-1 flex flex-col pt-safe">
    <div className="screen-scroll flex-1 px-5 pb-6">
      <div className="flex flex-col items-center text-center pt-10">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 rounded-full bg-mint text-night flex items-center justify-center shadow-[0_0_60px_rgba(61,220,151,0.5)]"
        >
          <Check className="w-10 h-10" strokeWidth={3} />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-6 text-[30px] font-black text-ink leading-tight"
        >
          Your spot is booked
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-2 text-[14px] text-ink-mute max-w-[280px]">
          {booking.buddy?.full_name || 'Your buddy'} is heading to the office. We’ll ping you when the line moves.
        </motion.p>
      </div>

      {/* Ticket */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, type: 'spring', damping: 20 }}
        className="mt-8 relative rounded-[26px] bg-brand text-night overflow-hidden"
      >
        <div className="p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] opacity-60">Booking</div>
          <div className="meter-digits text-[26px] font-bold mt-0.5">{booking.booking_code}</div>
          <div className="mt-3 text-[15px] font-extrabold leading-snug">{booking.office.name}</div>
          <div className="text-[13px] opacity-70 line-clamp-1">{booking.service.title}</div>
        </div>
        <div className="relative h-0 border-t-2 border-dashed border-night/25 mx-5">
          <span className="absolute -left-8 -top-3 w-6 h-6 rounded-full bg-night" />
          <span className="absolute -right-8 -top-3 w-6 h-6 rounded-full bg-night" />
        </div>
        <div className="p-5 grid grid-cols-3 gap-2">
          {[
            ['Date', format(new Date(booking.booking_date), 'd MMM')],
            ['Arrive', booking.arrival_time],
            ['Paid', `₹${booking.total_amount}`],
          ].map(([k, v]) => (
            <div key={k}>
              <div className="text-[10.5px] font-bold uppercase tracking-wider opacity-55">{k}</div>
              <div className="text-[14px] font-extrabold mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-mint/[0.07] p-3.5">
        <ShieldCheck className="w-5 h-5 text-mint shrink-0" />
        <span className="text-[12.5px] text-ink-soft">Full refund if the office closes before your turn.</span>
      </div>
    </div>
    <div className="shrink-0 px-5 pt-3 pb-[calc(14px+var(--sab))]">
      <PrimaryButton onClick={onTrack}>Track my token</PrimaryButton>
    </div>
  </div>
);
