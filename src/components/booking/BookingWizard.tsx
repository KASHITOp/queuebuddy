'use client';

import React, { useState } from 'react';
import { Office, Service, SupportedLanguage, Booking } from '@/types';
import { useApp } from '@/context/AppContext';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Clock,
  Globe,
  IndianRupee,
  ShieldCheck,
  CreditCard,
  QrCode,
  Sparkles,
  AlertCircle,
  FileText,
  User,
  Phone,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingWizardProps {
  initialOffice?: Office;
  initialService?: Service;
  onBookingComplete: (booking: Booking) => void;
  onCancel: () => void;
}

const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'Kannada',
  'English',
  'Hindi',
  'Tamil',
  'Telugu',
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialOffice,
  initialService,
  onBookingComplete,
  onCancel,
}) => {
  const { offices, services, checklists, createBooking, t, locale } = useApp();

  const [step, setStep] = useState<number>(initialOffice && initialService ? 3 : 1);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(initialOffice || null);
  const [selectedService, setSelectedService] = useState<Service | null>(initialService || null);
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [arrivalTime, setArrivalTime] = useState<string>('10:00 AM');
  const [expectedWaitHours, setExpectedWaitHours] = useState<number>(2.0);
  const [preferredLang, setPreferredLang] = useState<SupportedLanguage>('Kannada');
  const [backupLang, setBackupLang] = useState<SupportedLanguage | ''>('English');
  const [customerName, setCustomerName] = useState<string>('Arjun Mehta');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98451 99887');
  const [paymentMethod, setPaymentMethod] = useState<'upi_gpay' | 'upi_phonepe' | 'upi_qr' | 'card'>('upi_gpay');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const availableOffices = offices.filter((o) => o.status === 'bookable');
  const availableServices = selectedOffice
    ? services.filter((s) => s.office_id === selectedOffice.id)
    : [];

  // Fee calculation
  const buddyBaseFee = selectedService?.queue_buddy_base_fee || 349;
  // Extra hourly fee if wait hours > 2 (₹100/hr)
  const additionalHours = Math.max(0, expectedWaitHours - 2);
  const extraWaitFee = additionalHours * 100;
  const queueBuddyFee = buddyBaseFee + extraWaitFee;
  const govtFee = selectedService?.government_fee || 0;
  const platformFee = 29;
  const totalAmountPayable = queueBuddyFee + platformFee;

  const handleNext = () => {
    if (step === 1 && !selectedOffice) return;
    if (step === 2 && !selectedService) return;
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePayAndConfirm = () => {
    if (!selectedOffice || !selectedService) return;
    setIsProcessingPayment(true);

    // Simulate Razorpay payment verification
    setTimeout(() => {
      const newBooking = createBooking({
        officeId: selectedOffice.id,
        serviceId: selectedService.id,
        bookingDate,
        arrivalTime,
        expectedWaitHours,
        preferredLanguage: preferredLang,
        backupLanguage: backupLang ? (backupLang as SupportedLanguage) : undefined,
        customerName,
        customerPhone,
        totalAmount: totalAmountPayable,
        queueBuddyFee,
        governmentFee: govtFee,
      });

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });

      setIsProcessingPayment(false);
      setConfirmedBooking(newBooking);
      setStep(6);
    }, 1200);
  };

  const stepsList = [
    { num: 1, label: t.bookingWizard.step1 },
    { num: 2, label: t.bookingWizard.step2 },
    { num: 3, label: t.bookingWizard.step3 },
    { num: 4, label: t.bookingWizard.step4 },
    { num: 5, label: t.bookingWizard.step5 },
    { num: 6, label: t.bookingWizard.step6 },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Step Progress Bar */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 sm:pb-0">
          {stepsList.map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.num
                    ? 'bg-emerald-500 text-white'
                    : step === s.num
                    ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:inline ${
                  step === s.num
                    ? 'text-slate-900 dark:text-white font-bold'
                    : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
              {s.num < 6 && (
                <div
                  className={`w-4 sm:w-6 h-0.5 mx-1 ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Body */}
      <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-6">
        {/* Step 1: Office Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.bookingWizard.step1}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select the government office in Bengaluru where you require line assistance.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {availableOffices.map((off) => (
                <div
                  key={off.id}
                  onClick={() => setSelectedOffice(off)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    selectedOffice?.id === off.id
                      ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 ring-2 ring-amber-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                        {off.office_type.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-bold text-amber-500">{off.area}</span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                      {locale === 'kn' ? off.name_kn : off.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{off.address}</p>
                  </div>
                  <div className="shrink-0 pl-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedOffice?.id === off.id
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {selectedOffice?.id === off.id && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.bookingWizard.step2}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Select your required service at {selectedOffice?.name}.
              </p>
            </div>

            <div className="space-y-3">
              {availableServices.map((srv) => {
                const srvDocs = checklists.filter((c) => c.service_id === srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all space-y-2.5 ${
                      selectedService?.id === srv.id
                        ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-500/10 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {locale === 'kn' ? srv.title_kn : srv.title}
                        </h4>
                        <p className="text-xs text-slate-500">{srv.description}</p>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ml-2 ${
                          selectedService?.id === srv.id
                            ? 'border-amber-500 bg-amber-500 text-slate-950'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {selectedService?.id === srv.id && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        Govt Fee: <strong>₹{srv.government_fee}</strong>
                      </span>
                      <span className="font-bold text-amber-500">
                        QueueBuddy Fee: ₹{srv.queue_buddy_base_fee}
                      </span>
                      <span className="text-slate-400">
                        • {srvDocs.length} mandatory checklist items
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Date, Arrival Time & Wait Duration */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.bookingWizard.step3}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Specify when your Queue Buddy should arrive and secure your counter position.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-amber-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.bookingWizard.arrivalTimeLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '02:00 PM'].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setArrivalTime(time)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        arrivalTime === time
                          ? 'border-amber-500 bg-amber-500 text-slate-950 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t.bookingWizard.expectedWaitLabel}
                  </label>
                  <span className="text-xs font-bold text-amber-500">{expectedWaitHours} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={expectedWaitHours}
                  onChange={(e) => setExpectedWaitHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>1 hr (Express)</span>
                  <span>2 hrs (Standard base)</span>
                  <span>3 hrs</span>
                  <span>4 hrs (Heavy queue)</span>
                </div>
              </div>

              {/* Customer Contact Info */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 pl-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs focus:ring-2 focus:ring-amber-500"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Buddy Language Preference */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.bookingWizard.preferredLangTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t.bookingWizard.preferredLangDesc}
              </p>
            </div>

            {/* Primary Language */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {t.bookingWizard.primaryLang} (High Priority Match)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setPreferredLang(lang)}
                    className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                      preferredLang === lang
                        ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{lang}</span>
                    {preferredLang === lang && <Check className="w-4 h-4 text-amber-500" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Backup Language */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                {t.bookingWizard.backupLang}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SUPPORTED_LANGUAGES.filter((l) => l !== preferredLang).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setBackupLang(backupLang === lang ? '' : lang)}
                    className={`p-3 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      backupLang === lang
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{lang}</span>
                    {backupLang === lang && <Check className="w-4 h-4 text-indigo-500" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <Globe className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>Language Matching Guarantee: </strong>
                Our dispatch engine strictly filters available verified Buddies in your area who
                speak <strong>{preferredLang}</strong>. If unavailable, it matches your backup{' '}
                <strong>{backupLang || 'English'}</strong>.
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review & Transparent Price Breakdown */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.bookingWizard.priceBreakdownTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{t.bookingWizard.transparentNote}</p>
            </div>

            {/* Summary card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Office:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedOffice?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedService?.title}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schedule:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {bookingDate} at {arrivalTime} ({expectedWaitHours} hrs)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Language:</span>
                <span className="font-semibold text-amber-500">
                  {preferredLang} {backupLang ? `(Backup: ${backupLang})` : ''}
                </span>
              </div>
            </div>

            {/* Transparent Fees Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                Fee Details
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      QueueBuddy Line Assistance Fee
                    </span>
                    <span className="block text-[11px] text-slate-400">
                      Covers verified buddy arrival, token securing & live updates
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{buddyBaseFee}
                  </span>
                </div>

                {extraWaitFee > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span>Extra wait time ({additionalHours} hrs @ ₹100/hr)</span>
                    <span>₹{extraWaitFee}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Platform & Insurance Fee</span>
                  <span>₹{platformFee}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Payable Now (QueueBuddy)</span>
                  <span className="text-amber-500 text-base">₹{totalAmountPayable}</span>
                </div>

                {/* Government Counter Fee Note */}
                <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
                  <div>
                    <span>Official Govt Fee (Paid at counter by you)</span>
                    <span className="block text-[10px] text-slate-400">
                      Collected directly by government cashier / portal
                    </span>
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    ₹{govtFee}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection (Razorpay Test Mode) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                Pay with Razorpay (TEST MODE)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'upi_gpay', label: 'Google Pay (UPI)', icon: '🟢' },
                  { id: 'upi_phonepe', label: 'PhonePe (UPI)', icon: '🟣' },
                  { id: 'upi_qr', label: 'Scan UPI QR', icon: '📱' },
                  { id: 'card', label: 'Debit / Credit Card', icon: '💳' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      paymentMethod === pm.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{pm.icon}</span>
                    <span>{pm.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Confirmation Screen */}
        {step === 6 && confirmedBooking && (
          <div className="space-y-5 text-center py-4 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-500">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Booking ID: {confirmedBooking.booking_code}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                Queue Buddy Booked Successfully! 🎉
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Your Buddy has been scheduled. Prepare your documents now to avoid delays at the
                counter.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Office:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {confirmedBooking.office.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Buddy:</span>
                <span className="font-bold text-emerald-500">
                  {confirmedBooking.buddy?.full_name} ({confirmedBooking.preferred_language})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Arrival Time:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {confirmedBooking.booking_date} at {confirmedBooking.arrival_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay Ref:</span>
                <span className="font-mono text-slate-500">{confirmedBooking.razorpay_payment_id}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onBookingComplete(confirmedBooking)}
                className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Open Document Checklist & Live Queue</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Buttons */}
      {step < 6 && (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.common.back}</span>
            </button>
          ) : (
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors"
            >
              {t.common.cancel}
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={(step === 1 && !selectedOffice) || (step === 2 && !selectedService)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <span>{t.common.next}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePayAndConfirm}
              disabled={isProcessingPayment}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
            >
              {isProcessingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Razorpay Test Payment...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{totalAmountPayable} & Confirm</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
